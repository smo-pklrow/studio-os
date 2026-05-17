import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Anthropic from 'npm:@anthropic-ai/sdk'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { clientId } = await req.json()
    if (!clientId) throw new Error('clientId is required')

    // Use caller's auth token so RLS applies
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const [{ data: client }, { data: cards }] = await Promise.all([
      supabase.from('clients').select('name, project_name').eq('id', clientId).single(),
      supabase.from('brain_dump_cards').select('content, type').eq('client_id', clientId).order('created_at'),
    ])

    const textCards = (cards ?? []).filter(c => c.type !== 'image')
    if (!textCards.length) {
      return new Response(
        JSON.stringify({ error: 'Add some text notes to your brain dump first.' }),
        { headers: { ...CORS, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const notes = textCards
      .map((c, i) => `Note ${i + 1}: ${stripHtml(c.content)}`)
      .filter(t => t.length > 10)
      .join('\n\n')

    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are a creative brief writer for a solo creative studio owner. Based on these brain dump notes, write a structured client brief. Be specific and concrete — extract real insights from the notes, not generic filler.

Client: ${client?.name ?? 'Unknown'}
Project: ${client?.project_name ?? 'Not specified'}

Brain dump notes:
${notes}

Return ONLY a JSON object with exactly these keys (no other text):
{
  "overview": "2-3 sentence project overview based on the notes",
  "design_direction": "Key aesthetic and strategic directions mentioned (use • bullet points)",
  "key_decisions": "Important choices or constraints already established (use • bullets, or 'Nothing captured yet' if none)",
  "open_questions": "Things that still need to be resolved (use • bullets, or 'None identified yet' if none)",
  "next_steps": "3-5 concrete actions based on the notes (use • bullet points)"
}`,
      }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : '{}'
    // Strip any markdown code fences Claude might add
    const clean = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    const brief = JSON.parse(clean)

    return new Response(
      JSON.stringify({ brief, clientName: client?.name, projectName: client?.project_name }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...CORS, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

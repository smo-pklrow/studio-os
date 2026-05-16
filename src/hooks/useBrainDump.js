import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useBrainDump(clientId) {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!clientId) return
    supabase
      .from('brain_dump_cards')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at')
      .then(({ data, error }) => {
        if (error) setError(error)
        else setCards(data ?? [])
        setLoading(false)
      })
  }, [clientId])

  async function createCard(content, color = 'amber', type = 'sticky') {
    const { data, error } = await supabase
      .from('brain_dump_cards')
      .insert({ client_id: clientId, content, color, type })
      .select()
      .single()
    if (!error) setCards(prev => [...prev, data])
    return { data, error }
  }

  // Requires brain-dump-images bucket to be set as Public in Supabase Storage dashboard
  async function createImageCard(file, color = 'amber') {
    const ext = (file.name?.split('.').pop() ?? 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png'
    const path = `${clientId}/${crypto.randomUUID()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('brain-dump-images')
      .upload(path, file, { contentType: file.type })
    if (uploadError) return { error: uploadError }
    const { data: { publicUrl } } = supabase.storage
      .from('brain-dump-images')
      .getPublicUrl(path)
    return createCard(publicUrl, color, 'image')
  }

  async function updateCard(cardId, fields) {
    const { data, error } = await supabase
      .from('brain_dump_cards')
      .update(fields)
      .eq('id', cardId)
      .select()
      .single()
    if (!error) setCards(prev => prev.map(c => c.id === cardId ? data : c))
    return { data, error }
  }

  async function deleteCard(cardId) {
    const { error } = await supabase.from('brain_dump_cards').delete().eq('id', cardId)
    if (!error) setCards(prev => prev.filter(c => c.id !== cardId))
    return { error }
  }

  return { cards, loading, error, createCard, createImageCard, updateCard, deleteCard }
}

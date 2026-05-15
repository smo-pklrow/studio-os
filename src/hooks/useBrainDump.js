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

  async function createCard(content, color = 'amber') {
    const { data, error } = await supabase
      .from('brain_dump_cards')
      .insert({ client_id: clientId, content, color, type: 'sticky' })
      .select()
      .single()
    if (!error) setCards(prev => [...prev, data])
    return { data, error }
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

  return { cards, loading, error, createCard, updateCard, deleteCard }
}

import { createClient } from '@/lib/supabase/server'
import { WeeklyReset } from '@/components/reset/weekly-reset'

export default async function ResetPage() {
  const supabase = await createClient()

  const [tradesResult, submissionsResult] = await Promise.all([
    supabase.from('trades').select('*').order('created_at', { ascending: false }),
    supabase.from('submissions').select('*', { count: 'exact' }),
  ])

  const activeTrade = tradesResult.data?.find(t => t.is_active === true) || null
  const lastTradeNumber = tradesResult.data?.[0]?.trade_number || ''

  return (
    <WeeklyReset 
      activeTrade={activeTrade}
      trades={tradesResult.data || []}
      submissionCount={submissionsResult.count || 0}
      lastTradeNumber={lastTradeNumber}
    />
  )
}

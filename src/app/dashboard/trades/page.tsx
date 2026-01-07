import { createClient } from '@/lib/supabase/server'
import { TradesTable } from '@/components/trades/trades-table'

export default async function TradesPage() {
  const supabase = await createClient()

  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .order('created_at', { ascending: false })

  return <TradesTable initialTrades={trades || []} />
}

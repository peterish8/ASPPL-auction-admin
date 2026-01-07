import { createClient } from '@/lib/supabase/server'
import { PoolingTable } from '@/components/pooling/pooling-table'

export default async function PoolingPage() {
  const supabase = await createClient()

  const [scheduleResult, tradesResult] = await Promise.all([
    supabase.from('pooling_schedule').select('*').order('pooling_date', { ascending: true }),
    supabase.from('trades').select('*').order('created_at', { ascending: false }),
  ])

  return (
    <PoolingTable 
      initialSchedule={scheduleResult.data || []} 
      trades={tradesResult.data || []}
    />
  )
}

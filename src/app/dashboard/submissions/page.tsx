import { createClient } from '@/lib/supabase/server'
import { SubmissionsViewer } from '@/components/submissions/submissions-viewer'

export default async function SubmissionsPage() {
  const supabase = await createClient()

  const [submissionsResult, tradesResult, dropdownsResult] = await Promise.all([
    supabase.from('submissions').select('*').order('submitted_at', { ascending: false }),
    supabase.from('trades').select('*').order('trade_number', { ascending: false }),
    supabase.from('dropdowns').select('*').order('order', { ascending: true }),
  ])

  // Get unique depots and types from dropdowns
  const depots = dropdownsResult.data?.filter(d => d.category === 'depot') || []
  const types = dropdownsResult.data?.filter(d => d.category === 'type') || []

  return (
    <SubmissionsViewer 
      initialSubmissions={submissionsResult.data || []} 
      trades={tradesResult.data || []}
      depots={depots}
      types={types}
    />
  )
}

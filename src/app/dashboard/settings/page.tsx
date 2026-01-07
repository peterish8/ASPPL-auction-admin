import { createClient } from '@/lib/supabase/server'
import { SettingsManager } from '@/components/settings/settings-manager'

export default async function SettingsPage() {
  const supabase = await createClient()

  // Fetch the next opening date setting
  const { data: nextOpeningDate } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('key', 'next_opening_date')
    .single()

  return (
    <SettingsManager 
      initialNextOpeningDate={nextOpeningDate?.value || ''} 
    />
  )
}

import { createClient } from '@/lib/supabase/server'
import { DropdownManager } from '@/components/dropdowns/dropdown-manager'

export default async function DropdownsPage() {
  const supabase = await createClient()

  const { data: options } = await supabase
    .from('dropdowns')
    .select('*')
    .order('order', { ascending: true })

  return <DropdownManager initialOptions={options || []} />
}

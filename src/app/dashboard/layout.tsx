import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Toaster } from '@/components/ui/sonner'

import { TourProvider } from '@/components/tour/tour-context'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <TourProvider>
      <div className="flex min-h-screen bg-zinc-950">
        <Sidebar />
        <main className="flex-1 lg:ml-0 overflow-auto">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
        <Toaster position="top-right" richColors duration={2000} />
      </div>
    </TourProvider>
  )
}

'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Settings, 
  HelpCircle
} from 'lucide-react'
import { useTour } from '@/components/tour/tour-context'

interface SettingsManagerProps {
  initialNextOpeningDate: string
}

export function SettingsManager({}: SettingsManagerProps) {
   const { startTour } = useTour()
   
   // const [nextOpeningDate, setNextOpeningDate] = useState(initialNextOpeningDate)
   // const [loading, setLoading] = useState(false)
   // const [saved, setSaved] = useState(false)
   
   // Logic for next opening date paused for now
   /* 
   const handleSave = async () => { ... }
   */
 
   return (
     <div className="space-y-6">
       {/* Header */}
       <div className="mr-14 lg:mr-0">
         <h1 id="settings-title" className="text-3xl font-bold text-white flex items-center gap-3">
           <Settings className="h-8 w-8" />
           Settings
         </h1>
         <p className="text-zinc-400 mt-1">Configure system settings and public display options</p>
       </div>
 
       {/* Next Booking Opening Date Card - Hidden for now
       <Card ...>
       </Card>
       */}

      {/* Website Tour Card */}
      <Card className="bg-zinc-900/50 border-zinc-800 max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <HelpCircle className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-white">About Admin Website</CardTitle>
              <CardDescription className="text-zinc-400">
                Take a quick tour to understand how the dashboard works
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 gap-4 sm:gap-0">
            <div>
              <p className="font-medium text-white mb-1">New to the dashboard?</p>
              <p className="text-sm text-zinc-400">
                Start an interactive tour to learn about all the features and controls available to you.
              </p>
            </div>
            <Button 
              onClick={startTour}
              className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto sm:ml-4 shrink-0"
            >
              Start Tour
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Settings Placeholder */}
      <Card className="bg-zinc-900/50 border-zinc-800 border-dashed max-w-2xl opacity-50">
        <CardContent className="py-8 text-center">
          <p className="text-zinc-500 text-sm">
            More settings can be added here in the future
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

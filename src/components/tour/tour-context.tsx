'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

export type TourStep = {
  targetId: string
  title: string
  content: string
  position?: 'top' | 'right' | 'bottom' | 'left'
  route?: string // Route to navigate to before showing this step
}

interface TourContextType {
  startTour: () => void
  stopTour: () => void
  nextStep: () => void
  prevStep: () => void
  isActive: boolean
  currentStepIndex: number
  steps: TourStep[]
}

const TourContext = createContext<TourContextType | undefined>(undefined)

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'nav-dashboard',
    title: 'Dashboard Overview',
    content: 'Get a quick glance at your active trades, total revenue, and recent submissions here.',
    position: 'right',
    route: '/dashboard'
  },
  {
    targetId: 'nav-trades',
    title: 'Manage Trades',
    content: 'Create, edit, and close trades. This is where you define the ACTIVE trade for the week.',
    position: 'right',
    route: '/dashboard/trades'
  },
  {
    targetId: 'nav-pooling-schedule',
    title: 'Pooling Schedule',
    content: 'Set up collection points and dates. Link them to specific trades so farmers know where to go.',
    position: 'right',
    route: '/dashboard/pooling'
  },
  {
    targetId: 'nav-dropdowns',
    title: 'Dropdown Options',
    content: 'Manage the options available in forms (like Depot locations, Types, etc.) without touching code.',
    position: 'right',
    route: '/dashboard/dropdowns'
  },
  {
    targetId: 'nav-submissions',
    title: 'View Submissions',
    content: 'See all booking requests from farmers. You can filter, export to CSV/JSON, and detect duplicates.',
    position: 'right',
    route: '/dashboard/submissions'
  },
  {
    targetId: 'nav-weekly-reset',
    title: 'Weekly Reset',
    content: 'One-click system to close the current trade and start a new one. Handles all the cleanup for you.',
    position: 'right',
    route: '/dashboard/reset'
  },
  {
    targetId: 'nav-settings',
    title: 'Global Settings',
    content: 'Configure system-wide settings like the "Next Booking Date" displayed to users.',
    position: 'right',
    route: '/dashboard/settings'
  }
]

export function TourProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const router = useRouter()

  // Handle step changes (navigation)
  useEffect(() => {
    if (isActive) {
      const step = TOUR_STEPS[currentStepIndex]
      if (step.route && window.location.pathname !== step.route) {
        router.push(step.route)
      }
    }
  }, [isActive, currentStepIndex, router])

  const startTour = () => {
    setCurrentStepIndex(0)
    setIsActive(true)
    // Ensure we start at the right place
    if (TOUR_STEPS[0].route) {
      router.push(TOUR_STEPS[0].route)
    }
  }

  const stopTour = () => {
    setIsActive(false)
    setCurrentStepIndex(0)
  }

  const nextStep = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
    } else {
      stopTour() // End tour
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }

  return (
    <TourContext.Provider value={{
      startTour,
      stopTour,
      nextStep,
      prevStep,
      isActive,
      currentStepIndex,
      steps: TOUR_STEPS
    }}>
      {children}
      {isActive && <TourOverlay />}
    </TourContext.Provider>
  )
}

export const useTour = () => {
  const context = useContext(TourContext)
  if (!context) {
    throw new Error('useTour must be used within a TourProvider')
  }
  return context
}

// --- Internal Overlay Component ---
import { createPortal } from 'react-dom'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

function TourOverlay() {
  const { steps, currentStepIndex, nextStep, prevStep, stopTour } = useTour()
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const currentStep = steps[currentStepIndex]

  // Update target rect when step changes or window resizes
  useEffect(() => {
    const updateRect = () => {
      const element = document.getElementById(currentStep.targetId)
      if (element) {
        setTargetRect(element.getBoundingClientRect())
        // Scroll element into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        // Retry shortly if element not found (might be loading)
        setTimeout(() => {
          const el = document.getElementById(currentStep.targetId)
          if (el) setTargetRect(el.getBoundingClientRect())
        }, 500)
      }
    }

    // Wait a bit for navigation to complete
    const timer = setTimeout(updateRect, 300)
    window.addEventListener('resize', updateRect)
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateRect)
    }
  }, [currentStepIndex, currentStep.targetId])

  if (!targetRect) return null

  // Ensure we render on client side only (portal)
  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-50 isolate">
      {/* Background Mask */}
      <div 
        className="absolute bg-black/70 transition-all duration-300 ease-in-out"
        style={{ top: 0, left: 0, right: 0, height: targetRect.top - 4 }}
      />
      <div 
        className="absolute bg-black/70 transition-all duration-300 ease-in-out"
        style={{ top: targetRect.bottom + 4, left: 0, right: 0, bottom: 0 }}
      />
      <div 
        className="absolute bg-black/70 transition-all duration-300 ease-in-out"
        style={{ top: targetRect.top - 4, left: 0, width: targetRect.left - 4, height: targetRect.height + 8 }}
      />
      <div 
        className="absolute bg-black/70 transition-all duration-300 ease-in-out"
        style={{ top: targetRect.top - 4, left: targetRect.right + 4, right: 0, height: targetRect.height + 8 }}
      />

      {/* Spotlight Border */}
      <div 
        className="absolute border-2 border-blue-500 rounded-lg shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-300 ease-in-out pointer-events-none"
        style={{
          top: targetRect.top - 4,
          left: targetRect.left - 4,
          width: targetRect.width + 8,
          height: targetRect.height + 8
        }}
      />

      {/* Tooltip Card */}
      <div 
        className="absolute transition-all duration-300 ease-in-out z-50"
        style={{
          top: currentStep.position === 'bottom' ? targetRect.bottom + 12 : undefined,
          left: currentStep.position === 'right' ? targetRect.right + 12 : 
                currentStep.position === 'bottom' ? targetRect.left : undefined,
          right: currentStep.position === 'right' && targetRect.right + 320 > window.innerWidth ? 12 : undefined
        }}
      >
        <div className="w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-white text-lg">{currentStep.title}</h3>
            <button onClick={stopTour} className="text-zinc-500 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            {currentStep.content}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-600 font-mono">
              {currentStepIndex + 1} / {steps.length}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={currentStepIndex === 0}
                className="h-8 w-8 p-0 border-zinc-700 hover:bg-zinc-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={nextStep}
                className="h-8 gap-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

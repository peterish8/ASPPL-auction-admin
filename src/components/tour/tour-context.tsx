'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

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
    content: 'Access general admin settings and view system information.',
    position: 'right',
    route: '/dashboard/settings'
  }
]

export function TourProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const router = useRouter()

  // Prefetch all tour routes for instant navigation
  useEffect(() => {
    TOUR_STEPS.forEach(step => {
      if (step.route) {
        router.prefetch(step.route)
      }
    })
  }, [router])

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
    let checkInterval: NodeJS.Timeout

    const updateRect = () => {
      const element = document.getElementById(currentStep.targetId)
      if (element) {
        const rect = element.getBoundingClientRect()
        // Only ensure visible once, or if significantly off-screen
        // element.scrollIntoView({ behavior: 'smooth', block: 'center' }) 
        
        setTargetRect(prev => {
          // Simple equality check to prevent excessive re-renders
          if (prev && 
              Math.abs(prev.top - rect.top) < 1 && 
              Math.abs(prev.left - rect.left) < 1 &&
              Math.abs(prev.width - rect.width) < 1 &&
              Math.abs(prev.height - rect.height) < 1) {
            return prev
          }
          return rect
        })
      }
    }

    // Scroll into view initially
    const element = document.getElementById(currentStep.targetId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    // Check frequently (every 50ms) to handle animations smoothly
    updateRect()
    checkInterval = setInterval(updateRect, 50)

    const handleResize = () => {
      updateRect()
    }

    window.addEventListener('resize', handleResize)
    
    return () => {
      if (checkInterval) clearInterval(checkInterval)
      window.removeEventListener('resize', handleResize)
    }
  }, [currentStepIndex, currentStep.targetId])

  if (!targetRect) return null

  // Ensure we render on client side only (portal)
  if (typeof document === 'undefined') return null

  const isMobile = window.innerWidth < 768
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
  
  // On mobile (<768), sidebar is Right, but 'bottom' with clamp works best (shifts left).
  // On tablet (768-1024), sidebar is Right, so we force 'left'.
  const effectivePosition = isMobile ? 'bottom' : (isTablet ? 'left' : currentStep.position)

  return createPortal(
    <div className="fixed inset-0 z-[100] isolate">
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
        className="absolute transition-all duration-300 ease-in-out z-[101]"
        style={{
          top: effectivePosition === 'bottom' ? targetRect.bottom + 12 : targetRect.top,
          left: effectivePosition === 'right' ? targetRect.right + 12 : 
                effectivePosition === 'left' ? targetRect.left - 332 : // 320 width + 12 gap
                effectivePosition === 'bottom' ? Math.min(Math.max(12, targetRect.left), window.innerWidth - 332) : undefined,
          right: effectivePosition === 'right' && targetRect.right + 320 > window.innerWidth ? 12 : undefined
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

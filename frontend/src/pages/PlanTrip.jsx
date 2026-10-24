import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, AlertCircle, CheckCircle } from 'lucide-react'
import { tripApi } from '../services/api'
import TripForm from '../components/TripForm'
import LoadingSpinner from '../components/LoadingSpinner'
import { toast } from 'react-hot-toast'

export default function PlanTrip() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isGenerating, setIsGenerating] = useState(false)
  const [initialData, setInitialData] = useState({})
  const [demoMode, setDemoMode] = useState(false)

  // Parse URL params for pre-filling form
  useEffect(() => {
    const params = {}
    searchParams.forEach((value, key) => {
      if (key !== '_demo') {
        // Convert numeric values
        if (['travelers', 'budget'].includes(key)) {
          params[key] = parseFloat(value) || (key === 'travelers' ? 1 : 0)
        } else {
          params[key] = value
        }
      }
    })

    if (searchParams.has('_demo')) {
      setDemoMode(true)
    }

    if (Object.keys(params).length > 0) {
      setInitialData(params)
    }
  }, [searchParams])

  const handleSubmit = async (formData) => {
    const isDemo = formData._demo === true
    const submitData = { ...formData }
    delete submitData._demo

    setIsGenerating(true)
    
    try {
      const response = await tripApi.create(submitData)
      toast.success(isDemo ? 'Demo itinerary generated!' : 'Trip created successfully!')
      navigate(`/itinerary/${response.data.id}`)
    } catch (error) {
      console.error('Trip creation failed:', error)
      toast.error(error.message || 'Failed to create trip. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="section-container py-4">
          <div className="flex items-center justify-between">
            <button onClick={handleBack} className="btn-ghost p-2 md:hidden" aria-label="Go back">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-display font-bold text-gray-900">Plan Your Trip</h1>
              <p className="text-gray-600 text-sm mt-1">Fill in your preferences and let AI create your perfect itinerary</p>
            </div>
            <div className="w-10 md:w-auto" />
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="bg-white border-b border-gray-100">
        <div className="section-container">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <StepIndicator step={1} active={true} label="Details" />
              <StepConnector />
              <StepIndicator step={2} active={false} label="AI Generation" />
              <StepConnector />
              <StepIndicator step={3} active={false} label="Review" />
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <main className="section-container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            {demoMode && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-amber-800 font-medium">Demo Mode Active</p>
                  <p className="text-amber-700 text-sm">Using sample data - no AI calls will be made</p>
                </div>
              </div>
            )}

            <TripForm 
              onSubmit={handleSubmit} 
              initialData={initialData}
              isLoading={isGenerating}
              isDemoMode={demoMode}
            />
          </div>

          {/* Info Cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoCard 
              icon={Sparkles} 
              title="AI-Powered" 
              desc="Granite 4.2B creates personalized day-by-day itineraries" 
            />
            <InfoCard 
              icon={CheckCircle} 
              title="Smart Budgeting" 
              desc="Detailed cost breakdowns with remaining budget tracking" 
            />
            <InfoCard 
              icon={ArrowLeft} 
              title="Fully Editable" 
              desc="Regenerate, modify, or fine-tune any part of your trip" 
            />
          </div>
        </div>
      </main>
    </div>
  )
}

function StepIndicator({ step, active, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
        active 
          ? 'bg-travel-600 text-white shadow-lg shadow-travel-500/25' 
          : 'bg-gray-100 text-gray-400'
      }`}>
        {step}
      </div>
      <span className={`mt-2 text-sm font-medium ${active ? 'text-travel-600' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  )
}

function StepConnector() {
  return (
    <div className="hidden md:block w-16 h-1 bg-gray-200" aria-hidden="true" />
  )
}

function InfoCard({ icon: Icon, title, desc }) {
  return (
    <div className="card p-5 text-center">
      <div className="w-12 h-12 rounded-xl bg-travel-100 text-travel-600 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  )
}
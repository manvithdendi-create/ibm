import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Calendar, Users, DollarSign, MapPin, 
  Trash2, Edit, Loader2, AlertCircle, CheckCircle,
  Download, Printer, Copy, Sparkles
} from 'lucide-react'
import { tripApi } from '../services/api'
import { formatCurrency, formatDate, getTripDuration } from '../services/utils'
import LoadingSpinner from '../components/LoadingSpinner'
import { toast } from 'react-hot-toast'

export default function TripDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadTrip()
  }, [id])

  const loadTrip = async () => {
    try {
      const response = await tripApi.get(id)
      setTrip(response.data)
    } catch (error) {
      toast.error('Failed to load trip')
      navigate('/trips')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this trip? This cannot be undone.')) return
    
    setDeleting(true)
    try {
      await tripApi.delete(id)
      toast.success('Trip deleted')
      navigate('/trips')
    } catch (error) {
      toast.error('Failed to delete trip')
    } finally {
      setDeleting(false)
    }
  }

  const handleRegenerate = async () => {
    try {
      const response = await tripApi.regenerate(id)
      toast.success('Itinerary regenerated!')
      navigate(`/itinerary/${response.data.id}`)
    } catch (error) {
      toast.error('Failed to regenerate itinerary')
    }
  }

  if (loading) {
    return <LoadingSpinner fullscreen message="Loading trip details..." />
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Trip not found</h2>
          <button onClick={() => navigate('/trips')} className="btn-primary">Back to Trips</button>
        </div>
      </div>
    )
  }

  const duration = getTripDuration(trip.start_date, trip.end_date)
  const isDemo = trip.is_demo

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="section-container py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <button onClick={() => navigate(-1)} className="btn-ghost p-2 md:hidden" aria-label="Go back">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold text-gray-900">{trip.destination}</h1>
              <p className="text-gray-600 text-sm mt-1">{trip.title}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => navigate(`/itinerary/${trip.id}`)} className="btn-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                View Itinerary
              </button>
              <button onClick={handleRegenerate} disabled={deleting} className="btn-secondary flex items-center gap-2">
                <Loader2 className="w-4 h-4" aria-hidden="true" />
                Regenerate
              </button>
              <button onClick={handleDelete} disabled={deleting} className="btn-ghost text-red-600 hover:bg-red-50 flex items-center gap-2">
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Trip Overview */}
      <main className="section-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Card */}
            <div className="card p-6">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-travel-500 to-travel-700 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-gray-900">{trip.destination}</h2>
                  <p className="text-gray-600">{trip.title}</p>
                </div>
                {isDemo && (
                  <span className="badge bg-amber-100 text-amber-800 flex items-center gap-1 ml-auto">
                    <AlertCircle className="w-3 h-3" aria-hidden="true" />
                    Demo Itinerary
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoItem icon={Calendar} label="Dates" value={`${formatDate(trip.start_date)} - ${formatDate(trip.end_date)}`} />
                <InfoItem icon={Calendar} label="Duration" value={`${duration} days`} />
                <InfoItem icon={Users} label="Travelers" value={trip.travelers.toString()} />
                <InfoItem icon={DollarSign} label="Budget" value={formatCurrency(trip.budget, trip.currency)} />
              </div>
            </div>

            {/* Preferences */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-travel-600" aria-hidden="true" />
                Trip Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PreferenceItem label="Travel Style" value={trip.travel_style} />
                <PreferenceItem label="Transportation" value={trip.preferences?.transportation || 'Not specified'} />
                <PreferenceItem label="Accommodation" value={trip.preferences?.accommodation || 'Not specified'} />
                <PreferenceItem label="Currency" value={trip.currency} />
              </div>
              {(trip.interests?.length || 0) > 0 && (
                <div className="mt-4">
                  <span className="text-sm font-medium text-gray-700">Interests: </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {trip.interests.map((interest) => (
                      <span key={interest} className="badge bg-travel-100 text-travel-800">{interest}</span>
                    ))}
                  </div>
                </div>
              )}
              {trip.special_requirements && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">Special Requirements: </span>
                  <p className="text-gray-600 mt-1">{trip.special_requirements}</p>
                </div>
              )}
            </div>

            {/* Budget Breakdown Preview */}
            {trip.budget_breakdown && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-travel-600" aria-hidden="true" />
                  Budget Overview
                </h3>
                <BudgetBreakdownPreview breakdown={trip.budget_breakdown} currency={trip.currency} />
              </div>
            )}

            {/* Weather Preview */}
            {trip.weather_data && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🌤️</span>
                  Weather Forecast
                </h3>
                <WeatherPreview weather={trip.weather_data} />
              </div>
            )}
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-4">
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button onClick={() => navigate(`/itinerary/${trip.id}`)} className="btn-primary w-full justify-center gap-2">
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  View Full Itinerary
                </button>
                <button onClick={handleRegenerate} className="btn-secondary w-full justify-center gap-2">
                  <Loader2 className="w-4 h-4" aria-hidden="true" />
                  Regenerate with AI
                </button>
                <button onClick={() => navigate(`/plan?tripId=${trip.id}`)} className="btn-ghost w-full justify-center gap-2 text-travel-600 hover:bg-travel-50">
                  <Edit className="w-4 h-4" aria-hidden="true" />
                  Edit Trip Details
                </button>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Export Options</h3>
              <div className="space-y-2">
                <button className="btn-ghost w-full justify-start gap-3 text-left" onClick={() => exportPDF(trip)}>
                  <Download className="w-4 h-4" aria-hidden="true" />
                  <span>Download as PDF</span>
                </button>
                <button className="btn-ghost w-full justify-start gap-3 text-left" onClick={() => window.print()}>
                  <Printer className="w-4 h-4" aria-hidden="true" />
                  <span>Print Itinerary</span>
                </button>
                <button className="btn-ghost w-full justify-start gap-3 text-left" onClick={() => copyItinerary(trip)}>
                  <Copy className="w-4 h-4" aria-hidden="true" />
                  <span>Copy to Clipboard</span>
                </button>
              </div>
            </div>

            <div className="card p-6 bg-gray-50">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> This trip is stored locally in your browser. 
                {isDemo ? ' It was generated in demo mode using sample data.' : ' It was generated using Granite 4.2B AI.'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
        <Icon className="w-4 h-4" aria-hidden="true" />
        <span>{label}</span>
      </div>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  )
}

function PreferenceItem({ label, value }) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  )
}

function BudgetBreakdownPreview({ breakdown, currency }) {
  const categories = [
    { key: 'transportation', label: 'Transportation', icon: '✈️' },
    { key: 'accommodation', label: 'Accommodation', icon: '🏨' },
    { key: 'food', label: 'Food', icon: '🍽️' },
    { key: 'activities', label: 'Activities', icon: '🎯' },
    { key: 'local_transport', label: 'Local Transport', icon: '🚌' },
    { key: 'miscellaneous', label: 'Miscellaneous', icon: '📦' },
  ]

  return (
    <div className="space-y-3">
      {categories.map((cat) => {
        const amount = breakdown[cat.key] || 0
        const percentage = breakdown.total > 0 ? (amount / breakdown.total) * 100 : 0
        return (
          <div key={cat.key} className="flex items-center gap-3">
            <span className="text-lg">{cat.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 truncate">{cat.label}</span>
                <span className="font-medium text-gray-900">{formatCurrency(amount, currency)}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-travel-500 rounded-full transition-all duration-500" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        )
      })}
      <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-semibold">
        <span>Total</span>
        <span>{formatCurrency(breakdown.total, currency)}</span>
      </div>
      <div className="flex justify-between text-sm text-gray-600">
        <span>Per Person</span>
        <span>{formatCurrency(breakdown.per_person, currency)}</span>
      </div>
      <div className="flex justify-between text-sm text-gray-600">
        <span>Daily Average</span>
        <span>{formatCurrency(breakdown.daily_average, currency)}</span>
      </div>
      <div className={`flex justify-between text-sm font-medium ${breakdown.remaining_budget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        <span>Remaining Budget</span>
        <span>{formatCurrency(breakdown.remaining_budget, currency)}</span>
      </div>
    </div>
  )
}

function WeatherPreview({ weather }) {
  if (!weather.forecast?.length) {
    return (
      <p className="text-gray-500 text-sm">
        {weather.note || 'Weather data not available for this destination.'}
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {weather.forecast.slice(0, 5).map((day, i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getWeatherIcon(day.condition)}</span>
            <div>
              <p className="font-medium text-gray-900">{formatDate(day.date, 'EEE, MMM d')}</p>
              <p className="text-sm text-gray-500 capitalize">{day.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-900">{day.temp_min}° - {day.temp_max}°C</p>
            <p className="text-xs text-gray-500">{day.condition}</p>
          </div>
        </div>
      ))}
      {weather.note && (
        <p className="text-xs text-gray-500 mt-2">{weather.note}</p>
      )}
    </div>
  )
}

function getWeatherIcon(condition) {
  const icons = {
    Clear: '☀️',
    Clouds: '☁️',
    Rain: '🌧️',
    Drizzle: '🌦️',
    Thunderstorm: '⛈️',
    Snow: '❄️',
    Mist: '🌫️',
    Fog: '🌫️',
  }
  return icons[condition] || '🌤️'
}

function exportPDF(trip) {
  // This would integrate with a PDF generation library
  toast.success('PDF export coming soon!')
}

function copyItinerary(trip) {
  const text = `
${trip.title} - ${trip.destination}
${formatDate(trip.start_date)} - ${formatDate(trip.end_date)} (${getTripDuration(trip.start_date, trip.end_date)} days)
Budget: ${formatCurrency(trip.budget, trip.currency)}
Travelers: ${trip.travelers}
Style: ${trip.travel_style}

Generated by TravelMate AI
  `.trim()
  
  navigator.clipboard.writeText(text).then(() => {
    toast.success('Itinerary copied to clipboard!')
  }).catch(() => {
    toast.error('Failed to copy')
  })
}
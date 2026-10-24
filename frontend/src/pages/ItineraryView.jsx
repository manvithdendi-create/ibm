import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Calendar, Users, DollarSign, MapPin, 
  Download, Printer, Copy, Share2, Sparkles,
  ChevronDown, ChevronUp, AlertCircle, CheckCircle,
  MapPin as MapPinIcon, Clock, CreditCard, Trash2,
  Loader2, Edit, X
} from 'lucide-react'
import { tripApi } from '../services/api'
import { formatCurrency, formatDate, getTripDuration, getCategoryColor } from '../services/utils'
import LoadingSpinner from '../components/LoadingSpinner'
import { MapView } from '../components/MapView'
import { BudgetChart } from '../components/BudgetChart'
import { toast } from 'react-hot-toast'

export default function ItineraryView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [itinerary, setItinerary] = useState(null)
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeDay, setActiveDay] = useState(0)
  const [showMap, setShowMap] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    loadItinerary()
  }, [id])

  const loadItinerary = async () => {
    try {
      const response = await tripApi.get(id)
      const tripData = response.data
      setTrip(tripData)
      setItinerary(tripData.itinerary)
      if (tripData.itinerary?.days?.length) {
        setActiveDay(0)
      }
    } catch (error) {
      toast.error('Failed to load itinerary')
      navigate('/trips')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner fullscreen message="Loading your itinerary..." />
  }

  if (!itinerary || !itinerary.days?.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No itinerary found</h2>
          <p className="text-gray-600 mb-6">This trip doesn't have a generated itinerary yet.</p>
          <button onClick={() => navigate(`/trips/${id}`)} className="btn-primary">
            Back to Trip Details
          </button>
        </div>
      </div>
    )
  }

  const duration = getTripDuration(trip.start_date, trip.end_date)
  const isDemo = trip.is_demo
  const currentDay = itinerary.days[activeDay]

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      // In a real app, this would call a backend endpoint to generate PDF
      // For now, we'll use the browser's print to PDF functionality
      const printWindow = window.open('', '_blank')
      printWindow.document.write(generatePrintHTML(trip, itinerary))
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => printWindow.print(), 500)
      toast.success('Print dialog opened - save as PDF')
    } catch (error) {
      toast.error('Failed to generate PDF')
    } finally {
      setExporting(false)
    }
  }

  const handleCopy = () => {
    const text = generateItineraryText(trip, itinerary)
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Itinerary copied to clipboard!')
    }).catch(() => {
      toast.error('Failed to copy')
    })
  }

  const handleShare = async () => {
    const text = `Check out my trip to ${trip.destination} planned with TravelMate AI!`
    if (navigator.share) {
      try {
        await navigator.share({ title: `Trip to ${trip.destination}`, text })
      } catch (e) {
        // User cancelled
      }
    } else {
      await handleCopy()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="section-container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3">
            <button onClick={() => navigate(-1)} className="btn-ghost p-2 md:hidden" aria-label="Go back">
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-travel-500 to-travel-700 flex items-center justify-center">
                  <MapPinIcon className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h1 className="text-xl font-display font-bold text-gray-900">{trip.destination}</h1>
                  <p className="text-sm text-gray-500">{trip.title}</p>
                </div>
                {isDemo && (
                  <span className="badge bg-amber-100 text-amber-800 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" aria-hidden="true" />
                    Demo
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button onClick={handleExportPDF} disabled={exporting} className="btn-secondary flex items-center gap-2">
                  <Download className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Export PDF</span>
                </button>
                <button onClick={() => window.print()} className="btn-ghost p-2" aria-label="Print">
                  <Printer className="w-4 h-4" />
                </button>
                <button onClick={handleCopy} className="btn-ghost p-2" aria-label="Copy">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={handleShare} className="btn-ghost p-2" aria-label="Share">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Trip Meta Bar */}
          <div className="flex flex-wrap gap-4 md:gap-6 py-3 border-t border-gray-100 text-sm text-gray-600">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {duration} days</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {trip.travelers} traveler{trip.travelers !== 1 ? 's' : ''}</span>
            <span className="flex items-center gap-1"><CreditCard className="w-4 h-4" /> {formatCurrency(trip.budget, trip.currency)} budget</span>
            <span className="flex items-center gap-1"><Sparkles className="w-4 h-4" /> {trip.travel_style} style</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="section-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Day Navigation & Map */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Day Navigator */}
            <div className="card p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Days</h3>
                <button 
                  onClick={() => setShowMap(!showMap)}
                  className="btn-ghost p-2 text-sm"
                  aria-expanded={showMap}
                >
                  {showMap ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <span className="hidden sm:inline ml-1">Map</span>
                </button>
              </div>

              <nav className="space-y-1" aria-label="Day navigation">
                {itinerary.days.map((day, index) => (
                  <button
                    key={day.day}
                    onClick={() => setActiveDay(index)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      activeDay === index
                        ? 'bg-travel-50 text-travel-700 border border-travel-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    aria-current={activeDay === index ? 'true' : 'false'}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Day {day.day}</span>
                      <span className="text-xs text-gray-500">{formatDateShort(day.date)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {day.activities.slice(0, 2).map(a => a.activity).join(', ')}
                      {day.activities.length > 2 && ` +${day.activities.length - 2} more`}
                    </p>
                  </button>
                ))}
              </nav>
            </div>

            {/* Map View */}
            {showMap && trip.map_data && (
              <div className="card overflow-hidden sticky top-24" style={{ top: '300px' }}>
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Trip Map</h3>
                </div>
                <div className="h-80">
                  <MapView mapData={trip.map_data} />
                </div>
              </div>
            )}

            {/* Budget Summary */}
            {trip.budget_breakdown && (
              <div className="card p-4 sticky top-24" style={{ top: showMap ? '550px' : '300px' }}>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-travel-600" />
                  Budget Summary
                </h3>
                <BudgetChart breakdown={trip.budget_breakdown} currency={trip.currency} />
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="font-bold text-gray-900">{formatCurrency(trip.budget_breakdown.total, trip.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Per Person</span>
                    <span className="font-medium text-gray-900">{formatCurrency(trip.budget_breakdown.per_person, trip.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily Avg</span>
                    <span className="font-medium text-gray-900">{formatCurrency(trip.budget_breakdown.daily_average, trip.currency)}</span>
                  </div>
                  <div className={`flex justify-between font-medium ${trip.budget_breakdown.remaining_budget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <span>Remaining</span>
                    <span>{formatCurrency(trip.budget_breakdown.remaining_budget, trip.currency)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            {itinerary.tips?.length && (
              <div className="card p-4 sticky top-24" style={{ top: '650px' }}>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Travel Tips
                </h3>
                <ul className="space-y-2">
                  {itinerary.tips.slice(0, 5).map((tip, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          {/* Main Itinerary Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Overview */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-travel-600" />
                Trip Overview
              </h2>
              <p className="text-gray-600 leading-relaxed">{itinerary.overview}</p>
            </div>

            {/* Day Content */}
            <div className="space-y-4">
              {itinerary.days.map((day, dayIndex) => (
                <DayView 
                  key={day.day}
                  day={day}
                  isActive={activeDay === dayIndex}
                  onActivate={() => setActiveDay(dayIndex)}
                  currency={trip.currency}
                />
              ))}
            </div>

            {/* Budget Chart */}
            {trip.budget_breakdown && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-travel-600" />
                  Detailed Budget Breakdown
                </h2>
                <BudgetChart breakdown={trip.budget_breakdown} currency={trip.currency} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function DayView({ day, isActive, onActivate, currency }) {
  const [expanded, setExpanded] = useState(isActive)

  return (
    <div className={`card overflow-hidden transition-all ${isActive ? 'ring-2 ring-travel-500' : ''}`}>
      <button
        onClick={() => { setExpanded(!expanded); onActivate() }}
        className="w-full p-5 flex items-center gap-4 text-left"
        aria-expanded={expanded}
      >
        <div className="w-12 h-12 rounded-xl bg-travel-100 text-travel-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
          {day.day}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">Day {day.day}</h3>
            <span className="text-sm text-gray-500">{formatDate(day.date, 'EEEE, MMM d')}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {day.activities.length} activities · {formatCurrency(day.total_estimated_cost, currency)}
          </p>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {expanded && (
        <div className="border-t border-gray-100 p-5 animate-slide-up">
          <div className="space-y-4">
            {day.activities.map((activity, index) => (
              <ActivityItem key={index} activity={activity} currency={currency} index={index} />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-gray-600">Day Total</span>
            <span className="text-xl font-bold text-travel-600">{formatCurrency(day.total_estimated_cost, currency)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function ActivityItem({ activity, currency, index }) {
  const categoryColors = {
    transportation: 'bg-blue-100 text-blue-800',
    accommodation: 'bg-purple-100 text-purple-800',
    food: 'bg-orange-100 text-orange-800',
    activities: 'bg-green-100 text-green-800',
    local_transport: 'bg-pink-100 text-pink-800',
    miscellaneous: 'bg-gray-100 text-gray-800',
  }

  const categoryLabels = {
    transportation: 'Transport',
    accommodation: 'Stay',
    food: 'Food',
    activities: 'Activity',
    local_transport: 'Local',
    miscellaneous: 'Other',
  }

  return (
    <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
        {getActivityIcon(activity.category)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h4 className="font-medium text-gray-900">{activity.activity}</h4>
          <span className={`badge ${categoryColors[activity.category] || 'bg-gray-100 text-gray-800'}`}>
            {categoryLabels[activity.category] || activity.category}
          </span>
          <span className="text-sm text-gray-500">{activity.time}</span>
          <span className="text-sm text-gray-500">{activity.duration_hours}h</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1"><MapPinIcon className="w-3 h-3" /> {activity.location}</span>
          {activity.transportation && (
            <span className="flex items-center gap-1">🚌 {activity.transportation}</span>
          )}
          {activity.notes && (
            <span className="flex items-center gap-1">💡 {activity.notes}</span>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-semibold text-gray-900">{formatCurrency(activity.estimated_cost, currency)}</p>
        <p className="text-xs text-gray-500">estimated</p>
      </div>
    </div>
  )
}

function getActivityIcon(category) {
  const icons = {
    transportation: '✈️',
    accommodation: '🏨',
    food: '🍽️',
    activities: '🎯',
    local_transport: '🚌',
    miscellaneous: '📦',
  }
  return icons[category] || '✨'
}

function formatDateShort(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

function generateItineraryText(trip, itinerary) {
  let text = `${trip.title} - ${trip.destination}\n`
  text += `${formatDate(trip.start_date)} - ${formatDate(trip.end_date)} (${getTripDuration(trip.start_date, trip.end_date)} days)\n`
  text += `Budget: ${formatCurrency(trip.budget, trip.currency)} | Travelers: ${trip.travelers} | Style: ${trip.travel_style}\n\n`
  text += `${itinerary.overview}\n\n`

  itinerary.days.forEach(day => {
    text += `=== Day ${day.day} (${formatDate(day.date)}) ===\n`
    day.activities.forEach(activity => {
      text += `${activity.time} - ${activity.activity} (${activity.duration_hours}h) - ${formatCurrency(activity.estimated_cost, trip.currency)}\n`
      text += `  ${activity.description} @ ${activity.location}\n`
      if (activity.notes) text += `  Note: ${activity.notes}\n`
    })
    text += `Day Total: ${formatCurrency(day.total_estimated_cost, trip.currency)}\n\n`
  })

  if (itinerary.budget_breakdown) {
    text += `BUDGET BREAKDOWN:\n`
    Object.entries(itinerary.budget_breakdown).forEach(([key, value]) => {
      if (typeof value === 'number') {
        text += `${key}: ${formatCurrency(value, trip.currency)}\n`
      }
    })
  }

  if (itinerary.tips?.length) {
    text += `\nTRAVEL TIPS:\n`
    itinerary.tips.forEach(tip => text += `• ${tip}\n`)
  }

  text += `\nGenerated by TravelMate AI (Granite 4.2B)`
  return text
}

function generatePrintHTML(trip, itinerary) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>${trip.title} - ${trip.destination} Itinerary</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #1f2937; line-height: 1.6; }
    h1, h2, h3 { color: #0c4a6e; }
    .header { border-bottom: 2px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 30px; }
    .meta { display: flex; gap: 20px; flex-wrap: wrap; margin: 20px 0; font-size: 14px; color: #6b7280; }
    .day { margin-bottom: 30px; page-break-inside: avoid; }
    .day-header { background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
    .activity { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #0ea5e9; }
    .activity-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .activity-title { font-weight: 600; }
    .activity-meta { display: flex; gap: 15px; font-size: 12px; color: #6b7280; flex-wrap: wrap; }
    .budget-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .budget-table th, .budget-table td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    .tips { margin-top: 30px; padding: 20px; background: #f0fdf4; border-radius: 8px; }
    .tips ul { margin: 0; padding-left: 20px; }
    .tips li { margin-bottom: 8px; }
    @media print { body { padding: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${trip.title}</h1>
    <h2>${trip.destination}</h2>
    <div class="meta">
      <span>${formatDate(trip.start_date)} - ${formatDate(trip.end_date)}</span>
      <span>${getTripDuration(trip.start_date, trip.end_date)} days</span>
      <span>${trip.travelers} travelers</span>
      <span>${formatCurrency(trip.budget, trip.currency)}</span>
      <span>${trip.travel_style}</span>
    </div>
  </div>

  <div class="overview">
    <h2>Overview</h2>
    <p>${itinerary.overview}</p>
  </div>

  ${itinerary.days.map(day => `
    <div class="day">
      <div class="day-header">
        <h3>Day ${day.day} - ${formatDate(day.date, 'EEEE, MMMM d, yyyy')}</h3>
        <p>Estimated cost: ${formatCurrency(day.total_estimated_cost, trip.currency)}</p>
      </div>
      ${day.activities.map(activity => `
        <div class="activity">
          <div class="activity-header">
            <span class="activity-title">${activity.time} - ${activity.activity}</span>
            <span>${formatCurrency(activity.estimated_cost, trip.currency)}</span>
          </div>
          <div class="activity-meta">
            <span>${activity.duration_hours}h</span>
            <span>📍 ${activity.location}</span>
            <span>${activity.category}</span>
            ${activity.transportation ? `<span>🚌 ${activity.transportation}</span>` : ''}
          </div>
          <p>${activity.description}</p>
          ${activity.notes ? `<p><em>Note: ${activity.notes}</em></p>` : ''}
        </div>
      `).join('')}
      <p><strong>Day Total: ${formatCurrency(day.total_estimated_cost, trip.currency)}</strong></p>
    </div>
  `).join('')}

  ${itinerary.budget_breakdown ? `
    <h2>Budget Breakdown</h2>
    <table class="budget-table">
      <thead><tr><th>Category</th><th>Amount</th></tr></thead>
      <tbody>
        ${Object.entries(itinerary.budget_breakdown).filter(([k]) => typeof itinerary.budget_breakdown[k] === 'number').map(([key, value]) => `
          <tr><td>${key.replace('_', ' ')}</td><td>${formatCurrency(value, trip.currency)}</td></tr>
        `).join('')}
      </tbody>
    </table>
  ` : ''}

  ${itinerary.tips?.length ? `
    <div class="tips">
      <h2>Travel Tips</h2>
      <ul>
        ${itinerary.tips.map(tip => `<li>${tip}</li>`).join('')}
      </ul>
    </div>
  ` : ''}

  <p style="margin-top: 40px; text-align: center; color: #9ca3af; font-size: 12px;">
    Generated by TravelMate AI powered by Granite 4.2B
  </p>
</body>
</html>
  `
}
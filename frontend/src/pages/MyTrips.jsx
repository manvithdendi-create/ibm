import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Plus, Trash2, Edit, Search, Filter, 
  Calendar, Users, DollarSign, MapPin,
  ChevronDown, Loader2, AlertCircle
} from 'lucide-react'
import { tripApi } from '../services/api'
import { formatCurrency, formatDate, getTripDuration } from '../services/utils'
import LoadingSpinner, { Skeleton } from '../components/LoadingSpinner'
import { toast } from 'react-hot-toast'

export default function MyTrips() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const loadTrips = async () => {
    setLoading(true)
    try {
      const response = await tripApi.list({ limit: 100 })
      setTrips(response.data)
    } catch (error) {
      console.error('Failed to load trips:', error)
      toast.error('Failed to load trips')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrips()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trip? This cannot be undone.')) return
    
    setDeletingId(id)
    try {
      await tripApi.delete(id)
      setTrips(prev => prev.filter(t => t.id !== id))
      toast.success('Trip deleted')
    } catch (error) {
      toast.error('Failed to delete trip')
    } finally {
      setDeletingId(null)
    }
  }

  const handleRegenerate = async (id) => {
    try {
      const response = await tripApi.regenerate(id)
      toast.success('Itinerary regenerated!')
      navigate(`/itinerary/${response.data.id}`)
    } catch (error) {
      toast.error('Failed to regenerate itinerary')
    }
  }

  const sortedTrips = [...trips].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at)
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at)
      case 'budget-high':
        return b.budget - a.budget
      case 'budget-low':
        return a.budget - b.budget
      case 'destination':
        return a.destination.localeCompare(b.destination)
      default:
        return 0
    }
  })

  const filteredTrips = sortedTrips.filter(trip =>
    trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="section-container py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">My Trips</h1>
              <p className="text-gray-600 text-sm mt-1">{trips.length} trip{trips.length !== 1 ? 's' : ''} saved</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search trips..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10"
                  aria-label="Search trips"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field w-full md:w-40"
                aria-label="Sort trips"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="destination">Destination A-Z</option>
                <option value="budget-high">Budget: High to Low</option>
                <option value="budget-low">Budget: Low to High</option>
              </select>
              <Link to="/plan" className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap">
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Plan New Trip</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Trips List */}
      <main className="section-container py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="status" aria-label="Loading trips">
            {[1, 2, 3].map(i => (
              <article key={i} className="card">
                <Skeleton variant="image" className="aspect-video" />
                <div className="p-6 space-y-3">
                  <Skeleton variant="title" />
                  <Skeleton variant="text" className="w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton variant="text" className="w-20 h-5" />
                    <Skeleton variant="text" className="w-20 h-5" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : filteredTrips.length === 0 ? (
          <EmptyState 
            hasSearch={!!searchQuery}
            onClearSearch={() => setSearchQuery('')}
            onCreateTrip={() => navigate('/plan')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
            {filteredTrips.map((trip, index) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onView={() => navigate(`/itinerary/${trip.id}`)}
                onEdit={() => navigate(`/plan?tripId=${trip.id}`)}
                onRegenerate={() => handleRegenerate(trip.id)}
                onDelete={() => handleDelete(trip.id)}
                deleting={deletingId === trip.id}
                index={index}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function TripCard({ trip, onView, onEdit, onRegenerate, onDelete, deleting, index }) {
  const duration = getTripDuration(trip.start_date, trip.end_date)
  const isDemo = trip.is_demo

  return (
    <article 
      className="card-hover group"
      role="listitem"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Link to={`/itinerary/${trip.id}`} onClick={(e) => { e.preventDefault(); onView() }} className="block">
        <div className="relative aspect-video overflow-hidden">
          {/* Try to get a destination image, fallback to gradient */}
          <div className="w-full h-full bg-gradient-to-br from-travel-400 to-travel-600 flex items-center justify-center">
            <MapPin className="w-16 h-16 text-white/30" aria-hidden="true" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" aria-hidden="true" />
          
          <div className="absolute top-3 left-3 right-3 flex justify-between">
            <span className="badge bg-travel-500/90 text-white">{trip.travel_style}</span>
            {isDemo && (
              <span className="badge bg-amber-500/90 text-white flex items-center gap-1">
                <AlertCircle className="w-3 h-3" aria-hidden="true" />
                Demo
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-3 right-3 text-white">
            <h3 className="text-lg font-semibold">{trip.destination}</h3>
            <p className="text-sm opacity-90">{trip.title}</p>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" aria-hidden="true" />
              {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" aria-hidden="true" />
              {trip.travelers} traveler{trip.travelers !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-xl font-bold text-travel-600">
              {formatCurrency(trip.budget, trip.currency)}
            </span>
            <span className="text-sm text-gray-500">{duration} days</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
              <DollarSign className="w-3 h-3" aria-hidden="true" />
              Budget
            </span>
            {trip.updated_at && (
              <span>Updated {formatDate(trip.updated_at)}</span>
            )}
          </div>
        </div>
      </Link>

      <div className="border-t border-gray-100 p-4 flex items-center gap-2">
        <button
          onClick={onView}
          className="btn-secondary flex-1 justify-center text-sm py-2"
        >
          View Itinerary
        </button>
        <button
          onClick={onRegenerate}
          disabled={deleting}
          className="btn-ghost p-2 text-gray-600 hover:text-travel-600 hover:bg-travel-50"
          aria-label="Regenerate itinerary"
        >
          <Loader2 className="w-5 h-5" aria-hidden="true" />
        </button>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="btn-ghost p-2 text-gray-600 hover:text-red-600 hover:bg-red-50"
          aria-label="Delete trip"
        >
          <Trash2 className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}

function EmptyState({ hasSearch, onClearSearch, onCreateTrip }) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
        <MapPin className="w-10 h-10 text-gray-400" aria-hidden="true" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {hasSearch ? 'No matching trips' : 'No trips yet'}
      </h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        {hasSearch 
          ? 'Try adjusting your search terms to find your trips.'
          : 'Start planning your first adventure with TravelMate AI!'
        }
      </p>
      {hasSearch && (
        <button onClick={onClearSearch} className="btn-ghost mb-4">
          Clear Search
        </button>
      )}
      <Link to="/plan" onClick={onCreateTrip} className="btn-primary inline-flex">
        <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
        {hasSearch ? 'Plan a New Trip' : 'Plan Your First Trip'}
      </Link>
    </div>
  )
}
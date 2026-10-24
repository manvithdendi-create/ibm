import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  Search, Filter, X, SlidersHorizontal, 
  MapPin, Clock, TrendingUp, Tag, 
  ChevronDown, Globe
} from 'lucide-react'
import { destinationApi } from '../services/api'
import { formatCurrency, getCategoryColor } from '../services/utils'
import { DESTINATION_CATEGORIES } from '../constants/tripOptions'
import LoadingSpinner, { Skeleton } from '../components/LoadingSpinner'

const BUDGET_RANGES = [
  { label: 'Under $1,000', min: 0, max: 1000 },
  { label: '$1,000 - $2,000', min: 1000, max: 2000 },
  { label: '$2,000 - $5,000', min: 2000, max: 5000 },
  { label: '$5,000+', min: 5000, max: null },
]

const DURATION_RANGES = [
  { label: 'Weekend (1-3 days)', min: 1, max: 3 },
  { label: 'Short (4-6 days)', min: 4, max: 6 },
  { label: 'Week (7-10 days)', min: 7, max: 10 },
  { label: 'Extended (10+ days)', min: 11, max: null },
]

export default function ExploreDestinations() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    budget: searchParams.get('budget') || '',
    duration: searchParams.get('duration') || '',
  })
  const [showFilters, setShowFilters] = useState(false)

  // Initialize filters from URL
  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      budget: searchParams.get('budget') || '',
      duration: searchParams.get('duration') || '',
    })
  }, [searchParams])

  const loadDestinations = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.category) params.category = filters.category
      if (filters.budget) params.budget_range = filters.budget
      if (filters.duration) params.duration = filters.duration
      if (filters.search) params.search = filters.search

      const response = await destinationApi.list(params)
      setDestinations(response.data)
    } catch (error) {
      console.error('Failed to load destinations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDestinations()
  }, [filters])

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    setSearchParams(params)
  }

  const clearFilters = () => {
    setFilters({ search: '', category: '', budget: '', duration: '' })
    setSearchParams({})
  }

  const hasActiveFilters = Object.values(filters).some(v => v)

  const filteredDestinations = useMemo(() => {
    if (!filters.search) return destinations
    const searchLower = filters.search.toLowerCase()
    return destinations.filter(d => 
      d.name.toLowerCase().includes(searchLower) ||
      d.country.toLowerCase().includes(searchLower) ||
      d.description?.toLowerCase().includes(searchLower)
    )
  }, [destinations, filters.search])

  const handleSearch = (e) => {
    e.preventDefault()
    updateFilter('search', e.currentTarget.search.value)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <header className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="section-container py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">Explore Destinations</h1>
              <p className="text-gray-600 mt-1">Discover your next adventure from our curated collection</p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
              <input
                name="search"
                type="search"
                placeholder="Search destinations..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="input-field pl-12 pr-4"
                aria-label="Search destinations"
              />
              {filters.search && (
                <button
                  type="button"
                  onClick={() => updateFilter('search', '')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </form>
          </div>

          {/* Active Filters Bar */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-3" role="group" aria-label="Active filters">
              <span className="text-sm text-gray-500">Filters:</span>
              {filters.category && (
                <span className={`badge ${getCategoryColor(filters.category.toLowerCase())} flex items-center gap-1`}>
                  <Tag className="w-3 h-3" aria-hidden="true" />
                  {filters.category}
                  <button onClick={() => updateFilter('category', '')} className="ml-1" aria-label="Remove category filter">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.budget && (
                <span className="badge bg-blue-100 text-blue-800 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" aria-hidden="true" />
                  {BUDGET_RANGES.find(b => `${b.min}-${b.max}` === filters.budget)?.label || filters.budget}
                  <button onClick={() => updateFilter('budget', '')} className="ml-1" aria-label="Remove budget filter">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.duration && (
                <span className="badge bg-green-100 text-green-800 flex items-center gap-1">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  {DURATION_RANGES.find(d => `${d.min}-${d.max}` === filters.duration)?.label || filters.duration}
                  <button onClick={() => updateFilter('duration', '')} className="ml-1" aria-label="Remove duration filter">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700">
                Clear all
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="section-container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0" aria-label="Filters">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                  aria-expanded={showFilters}
                  aria-controls="filter-content"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              </div>

              <div id="filter-content" className={showFilters || 'lg:block' ? 'block' : 'hidden'}>
                {/* Category Filter */}
                <div className="mb-6">
                  <label className="input-label">Category</label>
                  <div className="space-y-2">
                    {DESTINATION_CATEGORIES.map((category) => (
                      <label key={category} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value={category}
                          checked={filters.category === category}
                          onChange={(e) => updateFilter('category', e.target.value)}
                          className="w-4 h-4 text-travel-600 border-gray-300 focus:ring-travel-500"
                        />
                        <span className="text-gray-700">{category}</span>
                      </label>
                    ))}
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value=""
                        checked={!filters.category}
                        onChange={(e) => updateFilter('category', '')}
                        className="w-4 h-4 text-travel-600 border-gray-300 focus:ring-travel-500"
                      />
                      <span className="text-gray-700">All Categories</span>
                    </label>
                  </div>
                </div>

                {/* Budget Filter */}
                <div className="mb-6">
                  <label className="input-label">Budget Range</label>
                  <div className="space-y-2">
                    {BUDGET_RANGES.map((range) => (
                      <label key={`${range.min}-${range.max}`} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="budget"
                          value={`${range.min}-${range.max}`}
                          checked={filters.budget === `${range.min}-${range.max}`}
                          onChange={(e) => updateFilter('budget', e.target.value)}
                          className="w-4 h-4 text-travel-600 border-gray-300 focus:ring-travel-500"
                        />
                        <span className="text-gray-700">{range.label}</span>
                      </label>
                    ))}
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="budget"
                        value=""
                        checked={!filters.budget}
                        onChange={(e) => updateFilter('budget', '')}
                        className="w-4 h-4 text-travel-600 border-gray-300 focus:ring-travel-500"
                      />
                      <span className="text-gray-700">Any Budget</span>
                    </label>
                  </div>
                </div>

                {/* Duration Filter */}
                <div className="mb-6">
                  <label className="input-label">Trip Duration</label>
                  <div className="space-y-2">
                    {DURATION_RANGES.map((range) => (
                      <label key={`${range.min}-${range.max}`} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="duration"
                          value={`${range.min}-${range.max}`}
                          checked={filters.duration === `${range.min}-${range.max}`}
                          onChange={(e) => updateFilter('duration', e.target.value)}
                          className="w-4 h-4 text-travel-600 border-gray-300 focus:ring-travel-500"
                        />
                        <span className="text-gray-700">{range.label}</span>
                      </label>
                    ))}
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="duration"
                        value=""
                        checked={!filters.duration}
                        onChange={(e) => updateFilter('duration', '')}
                        className="w-4 h-4 text-travel-600 border-gray-300 focus:ring-travel-500"
                      />
                      <span className="text-gray-700">Any Duration</span>
                    </label>
                  </div>
                </div>

                {hasActiveFilters && (
                  <button onClick={clearFilters} className="btn-secondary w-full">
                    <X className="w-4 h-4 mr-2" />
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Destinations Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {loading ? 'Loading...' : `${filteredDestinations.length} destination${filteredDestinations.length !== 1 ? 's' : ''} found`}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="status" aria-label="Loading destinations">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <article key={i} className="card">
                    <Skeleton variant="image" className="aspect-video" />
                    <div className="p-6 space-y-4">
                      <Skeleton variant="title" />
                      <Skeleton variant="text" />
                      <Skeleton variant="text" className="w-1/2" />
                      <div className="flex gap-2">
                        <Skeleton variant="text" className="w-20 h-6" />
                        <Skeleton variant="text" className="w-24 h-6" />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : filteredDestinations.length === 0 ? (
              <div className="text-center py-16">
                <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No destinations found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
                <button onClick={clearFilters} className="btn-secondary">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
                {filteredDestinations.map((dest, index) => (
                  <article 
                    key={dest.id} 
                    className="card-hover group"
                    role="listitem"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Link to={`/plan?destination=${encodeURIComponent(dest.name)}`} className="block">
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={dest.image_url || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80`}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80' }}
                        />
                        <div className="absolute top-3 left-3">
                          <span className={`${getCategoryColor((dest.category || '').toLowerCase())} px-3 py-1`}>
                            {dest.category || 'Destination'}
                          </span>
                        </div>
                        {dest.is_sample && (
                          <div className="absolute top-3 right-3">
                            <span className="badge bg-amber-100 text-amber-800 flex items-center gap-1">
                              <Tag className="w-3 h-3" aria-hidden="true" />
                              Sample Data
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <MapPin className="w-4 h-4" aria-hidden="true" />
                          <span>{dest.country}</span>
                          {dest.region && <span>· {dest.region}</span>}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-travel-600 transition-colors">
                          {dest.name}
                        </h3>
                        {dest.description && (
                          <p className="text-gray-600 mb-4 line-clamp-2">{dest.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" aria-hidden="true" />
                            {dest.recommended_duration} days
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" aria-hidden="true" />
                            {formatCurrency(dest.estimated_budget, dest.currency)}
                          </span>
                        </div>
                        {dest.best_time_to_visit && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-travel-100 text-travel-600 flex items-center justify-center">
                              <span className="text-[10px]">★</span>
                            </span>
                            Best: {dest.best_time_to_visit}
                          </p>
                        )}
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
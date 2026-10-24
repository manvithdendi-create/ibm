import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, MapPin, TrendingUp, Heart, 
  ArrowRight, Sparkles, Shield, Clock, 
  Users, Globe, Star 
} from 'lucide-react'
import { destinationApi } from '../services/api'
import { formatCurrency } from '../services/utils'
import LoadingSpinner, { Skeleton } from '../components/LoadingSpinner'
import TripForm from '../components/TripForm'

// Popular destinations fallback data
const popularDestinations = [
  { id: 1, name: 'Paris', country: 'France', category: 'Culture', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', budget: 1500, currency: 'EUR', duration: 5, rating: 4.9 },
  { id: 2, name: 'Tokyo', country: 'Japan', category: 'City Break', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80', budget: 2000, currency: 'JPY', duration: 7, rating: 4.8 },
  { id: 3, name: 'Bali', country: 'Indonesia', category: 'Beaches', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80', budget: 1200, currency: 'IDR', duration: 7, rating: 4.7 },
  { id: 4, name: 'Swiss Alps', country: 'Switzerland', category: 'Mountains', image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80', budget: 3000, currency: 'CHF', duration: 7, rating: 4.9 },
  { id: 5, name: 'New York', country: 'USA', category: 'City Break', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80', budget: 2500, currency: 'USD', duration: 5, rating: 4.6 },
  { id: 6, name: 'Santorini', country: 'Greece', category: 'Beaches', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80', budget: 1500, currency: 'EUR', duration: 4, rating: 4.8 },
]

const categories = [
  { name: 'Beaches', icon: '🏖️', description: 'Sun, sand, and crystal waters', color: 'from-blue-400 to-cyan-500' },
  { name: 'Mountains', icon: '🏔️', description: 'Peaks, trails, and alpine air', color: 'from-green-500 to-emerald-600' },
  { name: 'Adventure', icon: '🎯', description: 'Thrills, challenges, and discovery', color: 'from-orange-500 to-red-500' },
  { name: 'Culture', icon: '🏛️', description: 'History, art, and traditions', color: 'from-purple-500 to-violet-600' },
  { name: 'Nature', icon: '🌲', description: 'Wildlife, forests, and landscapes', color: 'from-green-600 to-teal-600' },
  { name: 'City Breaks', icon: '🏙️', description: 'Urban energy and hidden gems', color: 'from-blue-600 to-indigo-600' },
]

const features = [
  { icon: Sparkles, title: 'AI-Powered Planning', description: 'Granite 4.2B generates personalized itineraries tailored to your preferences' },
  { icon: Shield, title: 'Smart Budgeting', description: 'Detailed cost breakdowns with real-time estimates and remaining budget tracking' },
  { icon: Globe, title: 'Interactive Maps', description: 'Explore destinations with Leaflet maps and OpenStreetMap integration' },
  { icon: Clock, title: 'Weather Insights', description: 'Get forecasts and activity recommendations based on weather conditions' },
  { icon: Users, title: 'Trip Management', description: 'Save, edit, and organize all your trips in one place with SQLite persistence' },
  { icon: Star, title: 'Export & Share', description: 'Download PDF itineraries, print, or copy to share with travel companions' },
]

export default function Home() {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => {
    loadDestinations()
  }, [])

  const loadDestinations = async () => {
    try {
      const response = await destinationApi.list({ limit: 6 })
      setDestinations(response.data)
    } catch (error) {
      console.warn('Using fallback destinations:', error)
      setDestinations(popularDestinations)
    } finally {
      setLoading(false)
    }
  }

  const handleTripSubmit = async (formData) => {
    setIsGenerating(true)
    try {
      // Navigate to plan page with form data
      // In a real app, you'd call the API here
      window.location.href = `/plan?${new URLSearchParams(formData).toString()}`
    } catch (error) {
      console.error('Failed to start trip planning:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-travel-50 via-white to-sand-50">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-travel-200/50 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sand-200/50 rounded-full blur-3xl" />
        </div>

        <div className="section-container relative z-10 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-travel-100 text-travel-700 text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              Powered by Granite 4.2B • Local AI • Privacy First
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-display font-bold text-gray-900 mb-6 animate-slide-up leading-tight">
              Your Next Adventure{' '}
              <span className="text-travel-600">Starts Here</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto animate-slide-up delay-200">
              Plan personalized trips with AI-powered itineraries, smart budgets, 
              interactive maps, and weather insights. Your perfect journey awaits.
            </p>

            {/* Search / CTA */}
            <div className="animate-slide-up delay-300">
              <TripForm onSubmit={handleTripSubmit} isLoading={isGenerating} isDemoMode={demoMode} />
            </div>

            {/* Trust indicators */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-12 animate-slide-up delay-400">
              <div className="flex items-center gap-2 text-gray-500">
                <Shield className="w-5 h-5 text-travel-500" aria-hidden="true" />
                <span className="font-medium">Private & Local</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="w-5 h-5 text-travel-500" aria-hidden="true" />
                <span className="font-medium">Instant Results</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Heart className="w-5 h-5 text-red-500" aria-hidden="true" />
                <span className="font-medium">Free Forever</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V4" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white" aria-labelledby="features-heading">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 id="features-heading" className="section-title">Why Choose TravelMate AI?</h2>
            <p className="section-subtitle mx-auto">
              Built for modern travelers who want intelligent planning without the hassle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <article 
                key={feature.title} 
                className="card-hover p-6 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-travel-100 text-travel-600 flex items-center justify-center mb-4 group-hover:bg-travel-500 group-hover:text-white transition-colors">
                  <feature.icon className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-gray-50" aria-labelledby="categories-heading">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 id="categories-heading" className="section-title">Explore by Travel Style</h2>
            <p className="section-subtitle mx-auto">
              Discover destinations that match your perfect vacation vibe.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                to={`/explore?category=${encodeURIComponent(category.name)}`}
                className="group card-hover p-6 text-center relative overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-10 group-hover:opacity-20 transition-opacity`} aria-hidden="true" />
                <div className="relative z-10">
                  <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">{category.icon}</span>
                  <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.description}</p>
                  <ArrowRight className="w-5 h-5 text-travel-500 mx-auto mt-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-24 bg-white" aria-labelledby="destinations-heading">
        <div className="section-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <h2 id="destinations-heading" className="section-title">Popular Destinations</h2>
              <p className="section-subtitle">Trending spots loved by travelers worldwide</p>
            </div>
            <Link 
              to="/explore" 
              className="btn-secondary whitespace-nowrap self-end mb-2 md:mb-0"
            >
              View All Destinations
              <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="status" aria-label="Loading destinations">
              {[1, 2, 3].map(i => (
                <article key={i} className="card">
                  <Skeleton variant="image" className="aspect-video" />
                  <div className="p-6 space-y-4">
                    <Skeleton variant="title" />
                    <Skeleton variant="text" />
                    <Skeleton variant="text" className="w-1/2" />
                    <Skeleton variant="button" />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
              {destinations.map((dest, index) => (
                <article 
                  key={dest.id} 
                  className="card-hover group"
                  role="listitem"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Link to={`/explore?search=${encodeURIComponent(dest.name)}`} className="block">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={dest.image_url || dest.image}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
                        <span className="badge-primary">{dest.category}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <MapPin className="w-4 h-4" aria-hidden="true" />
                        <span>{dest.country}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-travel-600 transition-colors">
                        {dest.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" aria-hidden="true" />
                          {dest.duration || dest.recommended_duration} days
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" aria-hidden="true" />
                          {formatCurrency(dest.estimated_budget || dest.budget, dest.currency)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-travel-600 font-semibold">
                          {formatCurrency(dest.estimated_budget || dest.budget, dest.currency)}
                        </span>
                        <span className="text-sm text-gray-500">Est. per person</span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-travel-700 via-travel-600 to-travel-800" aria-labelledby="cta-heading">
        <div className="section-container text-center">
          <div className="max-w-3xl mx-auto">
            <h2 id="cta-heading" className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Ready to Plan Your Dream Trip?
            </h2>
            <p className="text-travel-100 text-lg mb-8">
              Let our AI create a personalized itinerary tailored to your interests, budget, and travel style.
            </p>
            <Link to="/plan" className="btn bg-white text-travel-700 hover:bg-travel-50 text-lg px-8 py-4">
              <Sparkles className="w-5 h-5 mr-2" aria-hidden="true" />
              Start Planning Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
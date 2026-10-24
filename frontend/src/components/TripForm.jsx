import { useState, useEffect } from 'react'
import { MapPin, Calendar, Users, DollarSign, Luggage, Hotel, Car, Plane, Train, Bus, Ship, Sparkles, X } from 'lucide-react'
import { format, addDays, parseISO } from 'date-fns'
import { TRAVEL_STYLES, INTERESTS, TRANSPORTATION_TYPES, ACCOMMODATION_TYPES, CURRENCIES } from '../constants/tripOptions'

export default function TripForm({ onSubmit, initialData, isLoading, isDemoMode }) {
  const [formData, setFormData] = useState({
    starting_city: '',
    destination: '',
    start_date: '',
    end_date: '',
    travelers: 1,
    budget: 2000,
    currency: 'USD',
    travel_style: 'Standard',
    interests: [],
    transportation: 'Flight',
    accommodation: 'Hotel',
    special_requirements: '',
    ...initialData,
  })

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [minStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [minEndDate, setMinEndDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'))

  // Update min end date when start date changes
  useEffect(() => {
    if (formData.start_date) {
      setMinEndDate(format(addDays(parseISO(formData.start_date), 1), 'yyyy-MM-dd'))
      if (formData.end_date && formData.end_date <= formData.start_date) {
        setFormData(prev => ({ ...prev, end_date: minEndDate }))
      }
    }
  }, [formData.start_date])

  // Validate field
  const validateField = (name, value) => {
    switch (name) {
      case 'starting_city':
        return value.trim() ? '' : 'Starting city is required'
      case 'destination':
        return value.trim() ? '' : 'Destination is required'
      case 'start_date':
        return value ? '' : 'Departure date is required'
      case 'end_date':
        return value ? '' : 'Return date is required'
      case 'travelers':
        return value >= 1 ? '' : 'At least 1 traveler required'
      case 'budget':
        return value > 0 ? '' : 'Budget must be greater than 0'
      default:
        return ''
    }
  }

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    const error = validateField(name, formData[name])
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate all fields
    const newErrors = {}
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key])
      if (error) newErrors[key] = error
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
      return
    }

    onSubmit(formData)
  }

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const inputIcons = {
    starting_city: MapPin,
    destination: Sparkles,
    start_date: Calendar,
    end_date: Calendar,
    travelers: Users,
    budget: DollarSign,
  }

  const InputIcon = inputIcons[Object.keys(formData)[0]] || MapPin

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Starting City & Destination */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="starting_city" className="input-label">
            Starting City <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              id="starting_city"
              name="starting_city"
              value={formData.starting_city}
              onChange={(e) => handleChange('starting_city', e.target.value)}
              onBlur={() => handleBlur('starting_city')}
              className={`input-field pl-12 ${errors.starting_city && touched.starting_city ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="e.g., New York, London, Tokyo"
              disabled={isLoading}
              required
              aria-invalid={errors.starting_city && touched.starting_city}
              aria-describedby={errors.starting_city && touched.starting_city ? 'starting_city-error' : undefined}
            />
          </div>
          {errors.starting_city && touched.starting_city && (
            <p id="starting_city-error" className="mt-1.5 text-sm text-red-600" role="alert">{errors.starting_city}</p>
          )}
        </div>

        <div>
          <label htmlFor="destination" className="input-label">
            Destination <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              id="destination"
              name="destination"
              value={formData.destination}
              onChange={(e) => handleChange('destination', e.target.value)}
              onBlur={() => handleBlur('destination')}
              className={`input-field pl-12 ${errors.destination && touched.destination ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="e.g., Paris, Bali, Tokyo"
              disabled={isLoading}
              required
              aria-invalid={errors.destination && touched.destination}
              aria-describedby={errors.destination && touched.destination ? 'destination-error' : undefined}
            />
          </div>
          {errors.destination && touched.destination && (
            <p id="destination-error" className="mt-1.5 text-sm text-red-600" role="alert">{errors.destination}</p>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="start_date" className="input-label">
            Departure Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={(e) => handleChange('start_date', e.target.value)}
              onBlur={() => handleBlur('start_date')}
              min={minStartDate}
              max={formData.end_date || undefined}
              className={`input-field pl-12 ${errors.start_date && touched.start_date ? 'border-red-500 focus:ring-red-500' : ''}`}
              disabled={isLoading}
              required
              aria-invalid={errors.start_date && touched.start_date}
            />
          </div>
          {errors.start_date && touched.start_date && (
            <p className="mt-1.5 text-sm text-red-600" role="alert">{errors.start_date}</p>
          )}
        </div>

        <div>
          <label htmlFor="end_date" className="input-label">
            Return Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={(e) => handleChange('end_date', e.target.value)}
              onBlur={() => handleBlur('end_date')}
              min={minEndDate}
              className={`input-field pl-12 ${errors.end_date && touched.end_date ? 'border-red-500 focus:ring-red-500' : ''}`}
              disabled={isLoading}
              required
              aria-invalid={errors.end_date && touched.end_date}
            />
          </div>
          {errors.end_date && touched.end_date && (
            <p className="mt-1.5 text-sm text-red-600" role="alert">{errors.end_date}</p>
          )}
        </div>
      </div>

      {/* Travelers, Budget, Currency */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="travelers" className="input-label">
            Number of Travelers <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
            <input
              type="number"
              id="travelers"
              name="travelers"
              value={formData.travelers}
              onChange={(e) => handleChange('travelers', parseInt(e.target.value) || 1)}
              onBlur={() => handleBlur('travelers')}
              min="1"
              max="20"
              className={`input-field pl-12 ${errors.travelers && touched.travelers ? 'border-red-500 focus:ring-red-500' : ''}`}
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="budget" className="input-label">
            Total Budget <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
            <input
              type="number"
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={(e) => handleChange('budget', parseFloat(e.target.value) || 0)}
              onBlur={() => handleBlur('budget')}
              min="0"
              step="100"
              className={`input-field pl-12 ${errors.budget && touched.budget ? 'border-red-500 focus:ring-red-500' : ''}`}
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="currency" className="input-label">Currency</label>
          <div className="relative">
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="input-field appearance-none pr-10"
              disabled={isLoading}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <DollarSign className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {/* Travel Style */}
      <div>
        <label className="input-label">Travel Style <span className="text-red-500">*</span></label>
        <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Travel style">
          {TRAVEL_STYLES.map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => handleChange('travel_style', style.value)}
              className={`px-5 py-3 rounded-xl border-2 transition-all duration-200 font-medium text-sm flex items-center gap-2 ${
                formData.travel_style === style.value
                  ? 'border-travel-500 bg-travel-50 text-travel-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
              disabled={isLoading}
              role="radio"
              aria-checked={formData.travel_style === style.value}
            >
              <span className="text-xl">{style.icon}</span>
              <span>{style.label}</span>
              <span className="text-xs opacity-70">{style.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div>
        <label className="input-label">Interests (select all that apply)</label>
        <div className="flex flex-wrap gap-3" role="group" aria-label="Travel interests">
          {INTERESTS.map((interest) => (
            <button
              key={interest.value}
              type="button"
              onClick={() => handleInterestToggle(interest.value)}
              className={`px-4 py-2.5 rounded-xl border-2 transition-all duration-200 font-medium text-sm flex items-center gap-2 ${
                formData.interests.includes(interest.value)
                  ? 'border-travel-500 bg-travel-50 text-travel-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
              disabled={isLoading}
              role="checkbox"
              aria-checked={formData.interests.includes(interest.value)}
            >
              <span className="text-lg">{interest.icon}</span>
              {interest.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transportation & Accommodation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="transportation" className="input-label">Preferred Transportation</label>
          <select
            id="transportation"
            name="transportation"
            value={formData.transportation}
            onChange={(e) => handleChange('transportation', e.target.value)}
            className="input-field"
            disabled={isLoading}
          >
            {TRANSPORTATION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.icon} {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="accommodation" className="input-label">Accommodation Preference</label>
          <select
            id="accommodation"
            name="accommodation"
            value={formData.accommodation}
            onChange={(e) => handleChange('accommodation', e.target.value)}
            className="input-field"
            disabled={isLoading}
          >
            {ACCOMMODATION_TYPES.map((a) => (
              <option key={a.value} value={a.value}>
                {a.icon} {a.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Special Requirements */}
      <div>
        <label htmlFor="special_requirements" className="input-label">Special Requirements (optional)</label>
        <textarea
          id="special_requirements"
          name="special_requirements"
          value={formData.special_requirements}
          onChange={(e) => handleChange('special_requirements', e.target.value)}
          rows={3}
          className="input-field resize-none"
          placeholder="Dietary restrictions, accessibility needs, preferred pace, etc."
          disabled={isLoading}
        />
      </div>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex-1 justify-center gap-2 text-lg py-4"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating Itinerary...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              Generate My Trip
            </>
          )}
        </button>

        {isDemoMode && (
          <button
            type="button"
            onClick={() => onSubmit({ ...formData, _demo: true })}
            disabled={isLoading}
            className="btn-secondary flex-1 justify-center"
          >
            Try Demo Mode
          </button>
        )}
      </div>
    </form>
  )
}
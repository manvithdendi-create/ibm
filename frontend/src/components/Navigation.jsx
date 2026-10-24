import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Menu, X, MapPin, Sparkles, Compass, 
  Luggage, Info, Sun, Moon 
} from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

const navLinks = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/explore', label: 'Explore', icon: '🌍' },
  { path: '/plan', label: 'Plan Trip', icon: '✨' },
  { path: '/trips', label: 'My Trips', icon: '🧳' },
  { path: '/about', label: 'About', icon: 'ℹ️' },
]

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  // Track scroll for backdrop effect
  // In a real app, you'd use useEffect with window scroll listener
  // Simplified here for brevity

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
    }`}>
      <nav className="section-container" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-display font-bold text-gray-900 hover:opacity-80 transition-opacity" aria-label="TravelMate AI Home">
            <span className="relative p-2 bg-gradient-to-br from-travel-500 to-travel-700 rounded-xl text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <span className="hidden sm:block">TravelMate AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path))
                    ? 'bg-travel-50 text-travel-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span aria-hidden="true">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Primary CTA */}
            <Link
              to="/plan"
              className="hidden sm:flex btn-primary text-sm"
            >
              <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
              Plan My Trip
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-slide-up">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path))
                      ? 'bg-travel-50 text-travel-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="text-2xl" aria-hidden="true">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
              <Link
                to="/plan"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary text-center mt-2"
              >
                <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
                Plan My Trip
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
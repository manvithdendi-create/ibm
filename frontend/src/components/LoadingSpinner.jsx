import { Loader2, MapPin, Plane, Luggage, Camera } from 'lucide-react'

const travelIcons = [MapPin, Plane, Luggage, Camera]

export default function LoadingSpinner({ 
  size = 'md', 
  fullscreen = false, 
  message = 'Loading...',
  showIcon = true 
}) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  }

  const containerClasses = fullscreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm'
    : 'flex flex-col items-center justify-center py-12'

  return (
    <div className={containerClasses} role="status" aria-live="polite" aria-label={message}>
      <div className="relative mb-4">
        {/* Rotating travel icons */}
        <div className="absolute inset-0 animate-spin" aria-hidden="true">
          {travelIcons.map((Icon, i) => (
            <Icon
              key={i}
              className={`${sizeClasses[size]} text-travel-500/20 absolute`}
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 90}deg) translateY(-40px) rotate(${-i * 90}deg)`
              }}
              aria-hidden="true"
            />
          ))}
        </div>
        
        {/* Main spinner */}
        <Loader2 className={`${sizeClasses[size]} text-travel-600 animate-spin relative`} aria-hidden="true" />
      </div>
      
      {showIcon && (
        <div className="flex items-center gap-2 animate-pulse" aria-hidden="true">
          {travelIcons.map((Icon, i) => (
            <Icon key={i} className="w-5 h-5 text-travel-400" style={{ animationDelay: `${i * 100}ms` }} />
          ))}
        </div>
      )}
      
      <p className="mt-4 text-gray-600 text-center max-w-sm">{message}</p>
    </div>
  )
}

export function LoadingOverlay({ children, isLoading, message }) {
  if (!isLoading) return <>{children}</>
  
  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
        <LoadingSpinner message={message} />
      </div>
    </div>
  )
}

export function Skeleton({ className = '', variant = 'text' }) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded'
  
  const variantClasses = {
    text: 'h-4 w-full',
    title: 'h-8 w-3/4',
    avatar: 'h-12 w-12 rounded-full',
    card: 'h-48 w-full rounded-xl',
    button: 'h-12 w-32 rounded-xl',
    image: 'aspect-video w-full rounded-xl',
  }

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ animation: 'shimmer 1.5s infinite' }}
      aria-hidden="true"
    />
  )
}
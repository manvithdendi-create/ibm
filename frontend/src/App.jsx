import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'))
const ExploreDestinations = lazy(() => import('./pages/ExploreDestinations'))
const PlanTrip = lazy(() => import('./pages/PlanTrip'))
const MyTrips = lazy(() => import('./pages/MyTrips'))
const TripDetail = lazy(() => import('./pages/TripDetail'))
const ItineraryView = lazy(() => import('./pages/ItineraryView'))
const About = lazy(() => import('./pages/About'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner fullscreen />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<ExploreDestinations />} />
          <Route path="plan" element={<PlanTrip />} />
          <Route path="trips" element={<MyTrips />} />
          <Route path="trips/:id" element={<TripDetail />} />
          <Route path="itinerary/:id" element={<ItineraryView />} />
          <Route path="about" element={<About />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
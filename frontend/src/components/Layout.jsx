import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'
import Footer from './Footer'

const FadeWrapper = ({ children }) => (
  <div className="animate-fade-in">{children}</div>
)

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      <main className="flex-1">
        <FadeWrapper>
          <Outlet />
        </FadeWrapper>
      </main>
      <Footer />
    </div>
  )
}
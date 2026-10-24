import { 
  Brain, Server, Database, Globe, Shield, 
  Code, Coffee, Heart, Users, Zap, 
  CheckCircle, ArrowRight, Github, Twitter
} from 'lucide-react'
import { Link } from 'react-router-dom'

const techStack = [
  { icon: Brain, name: 'Granite 4.2B', description: 'IBM\'s open-source LLM for intelligent itinerary generation', category: 'AI' },
  { icon: Server, name: 'Ollama', description: 'Local LLM inference server for privacy-first AI', category: 'AI' },
  { icon: Code, name: 'FastAPI', description: 'Modern, fast Python web framework for the backend API', category: 'Backend' },
  { icon: Database, name: 'SQLite', description: 'Lightweight database for trip persistence', category: 'Backend' },
  { icon: Globe, name: 'React + Vite', description: 'Fast frontend framework with hot module replacement', category: 'Frontend' },
  { icon: Shield, name: 'Tailwind CSS', description: 'Utility-first CSS framework for responsive design', category: 'Frontend' },
  { icon: Zap, name: 'Leaflet', description: 'Interactive maps with OpenStreetMap tiles', category: 'Maps' },
  { icon: Coffee, name: 'Recharts', description: 'Composable charting library for budget visualization', category: 'Charts' },
]

const features = [
  { icon: Brain, title: 'AI-Powered Itineraries', description: 'Granite 4.2B generates personalized day-by-day plans based on your preferences, budget, and interests.' },
  { icon: Shield, title: 'Privacy First', description: 'All AI processing runs locally via Ollama. Your travel data never leaves your machine.' },
  { icon: Database, title: 'Persistent Storage', description: 'Trips saved in SQLite database - available after restarts, no cloud account needed.' },
  { icon: Globe, title: 'Interactive Maps', description: 'Explore destinations and activities on OpenStreetMap with Leaflet integration.' },
  { icon: Zap, title: 'Smart Budgeting', description: 'Detailed cost breakdowns with charts, per-person costs, and remaining budget tracking.' },
  { icon: Coffee, title: 'Weather Insights', description: 'OpenWeather integration for forecasts and activity recommendations based on conditions.' },
  { icon: Heart, title: 'Export & Share', description: 'Download PDF itineraries, print, copy to clipboard, or share with travel companions.' },
  { icon: Users, title: 'Multi-Traveler Support', description: 'Plan for solo trips, couples, families, or groups up to 20 travelers.' },
]

const principles = [
  { title: 'Local-First', description: 'Runs entirely on your hardware. No API keys required for core functionality. Optional weather API only.' },
  { title: 'Open Source', description: 'MIT licensed. Built transparently with community contributions welcome.' },
  { title: 'Accessible', description: 'WCAG 2.1 AA compliant. Semantic HTML, keyboard navigation, screen reader support.' },
  { title: 'Performant', description: 'Vite + React 18 with code splitting. Lazy-loaded pages. Optimized bundle size.' },
  { title: 'Extensible', description: 'Modular architecture. Easy to add new AI models, map providers, or export formats.' },
  { title: 'Reliable', description: 'Graceful degradation. Demo mode works without AI. Clear error messages for all failure modes.' },
]

const team = [
  { name: 'TravelMate AI', role: 'Open Source Project', avatar: '🤖' },
]

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-travel-700 via-travel-600 to-travel-800 text-white py-24 md:py-32">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="section-container relative z-10 text-center max-w-4xl mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Brain className="w-10 h-10" aria-hidden="true" />
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">About TravelMate AI</h1>
          <p className="text-xl md:text-2xl text-travel-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Your intelligent travel companion powered by Granite 4.2B. 
            Plan smarter, travel better, create memories that last forever.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/plan" className="btn bg-white text-travel-700 hover:bg-travel-50 text-lg px-8 py-4">
              Start Planning
              <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
            </Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn border-2 border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4">
              <Github className="w-5 h-5 mr-2" aria-hidden="true" />
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 bg-white" aria-labelledby="mission-heading">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 id="mission-heading" className="section-title">Our Mission</h2>
            <p className="section-subtitle mx-auto mt-4 text-lg">
              Making intelligent travel planning accessible to everyone, without compromising privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {principles.map((principle, index) => (
              <article key={principle.title} className="card-hover p-6 text-center" style={{ animationDelay: `${index * 100}ms` }}>
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-4" aria-hidden="true" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{principle.title}</h3>
                <p className="text-gray-600 leading-relaxed">{principle.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gray-50" aria-labelledby="features-heading">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 id="features-heading" className="section-title">Key Features</h2>
            <p className="section-subtitle mx-auto">Everything you need for perfect trip planning</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <article key={feature.title} className="card-hover p-6" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="w-12 h-12 rounded-xl bg-travel-100 text-travel-600 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-24 bg-white" aria-labelledby="tech-heading">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 id="tech-heading" className="section-title">Technology Stack</h2>
            <p className="section-subtitle mx-auto">Built with modern, reliable technologies</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((tech, index) => (
              <article key={tech.name} className="card p-6" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-travel-100 text-travel-600 flex items-center justify-center flex-shrink-0">
                    <tech.icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{tech.name}</h3>
                      <span className="badge bg-travel-100 text-travel-800 text-xs">{tech.category}</span>
                    </div>
                    <p className="text-sm text-gray-600">{tech.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="py-24 bg-gray-50" aria-labelledby="architecture-heading">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 id="architecture-heading" className="section-title">Architecture Overview</h2>
            <p className="section-subtitle mx-auto">How the pieces fit together</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ArchitectureColumn 
                  title="Frontend" 
                  icon={Globe}
                  color="travel"
                  items={[
                    'React 18 + Vite',
                    'Tailwind CSS',
                    'React Router v6',
                    'React Leaflet',
                    'Recharts',
                    'Axios',
                  ]}
                />
                <ArchitectureColumn 
                  title="Backend" 
                  icon={Server}
                  color="purple"
                  items={[
                    'FastAPI (Python)',
                    'SQLAlchemy + SQLite',
                    'Pydantic v2',
                    'Ollama Client',
                    'Geopy',
                    'Uvicorn',
                  ]}
                />
                <ArchitectureColumn 
                  title="AI & Services" 
                  icon={Brain}
                  color="green"
                  items={[
                    'Granite 4.2B (Ollama)',
                    'OpenWeatherMap API',
                    'Nominatim Geocoding',
                    'OpenStreetMap',
                    'PDF Generation',
                    'Demo Mode Fallback',
                  ]}
                />
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Data Flow</h3>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
                  <FlowStep number={1} label="User Input" description="Trip preferences via form" />
                  <ArrowRight className="w-6 h-6 text-gray-300 mx-2 md:mx-0 rotate-90 md:rotate-0" aria-hidden="true" />
                  <FlowStep number={2} label="Backend API" description="Validates & stores in SQLite" />
                  <ArrowRight className="w-6 h-6 text-gray-300 mx-2 md:mx-0 rotate-90 md:rotate-0" aria-hidden="true" />
                  <FlowStep number={3} label="Granite 4.2B" description="Generates JSON itinerary" />
                  <ArrowRight className="w-6 h-6 text-gray-300 mx-2 md:mx-0 rotate-90 md:rotate-0" aria-hidden="true" />
                  <FlowStep number={4} label="Frontend" description="Renders interactive UI" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="py-24 bg-travel-900 text-white" aria-labelledby="community-heading">
        <div className="section-container text-center">
          <h2 id="community-heading" className="text-3xl md:text-4xl font-display font-bold mb-4">Open Source & Community</h2>
          <p className="text-travel-200 text-lg mb-10 max-w-2xl mx-auto">
            TravelMate AI is built in the open. Contributions, issues, and feedback are welcome!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn bg-white text-travel-700 hover:bg-travel-50 flex items-center gap-2">
              <Github className="w-5 h-5" aria-hidden="true" />
              Star on GitHub
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="btn border-2 border-white/30 text-white hover:bg-white/10 flex items-center gap-2">
              <Twitter className="w-5 h-5" aria-hidden="true" />
              Follow Updates
            </a>
            <button className="btn border-2 border-white/30 text-white hover:bg-white/10 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" aria-hidden="true" />
              Sponsor
            </button>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 bg-white" aria-labelledby="cta-heading">
        <div className="section-container text-center">
          <h2 id="cta-heading" className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Ready to Travel Smarter?</h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of travelers using AI to plan better trips. Free, private, and powerful.
          </p>
          <Link to="/plan" className="btn-primary text-lg px-10 py-4">
            <Brain className="w-5 h-5 mr-2" aria-hidden="true" />
            Plan Your First Trip
          </Link>
        </div>
      </section>
    </div>
  )
}

function ArchitectureColumn({ title, icon: Icon, color, items }) {
  const colorClasses = {
    travel: 'bg-travel-100 text-travel-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
  }

  return (
    <div className="text-center">
      <div className={`w-14 h-14 rounded-xl ${colorClasses[color]} flex items-center justify-center mx-auto mb-4`}>
        <Icon className="w-7 h-7" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ul className="space-y-2 text-left">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FlowStep({ number, label, description }) {
  return (
    <div className="flex flex-col items-center p-4 min-w-[140px]">
      <div className="w-10 h-10 rounded-full bg-travel-600 text-white flex items-center justify-center font-bold mb-2">
        {number}
      </div>
      <p className="font-semibold text-gray-900">{label}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  )
}
import { Link } from 'react-router-dom'
import { 
  Github, Twitter, Mail, MapPin, 
  Heart, Coffee, Code, Globe 
} from 'lucide-react'

const footerLinks = {
  product: [
    { label: 'Explore Destinations', path: '/explore' },
    { label: 'Plan a Trip', path: '/plan' },
    { label: 'My Trips', path: '/trips' },
    { label: 'Travel Guides', path: '#' },
  ],
  company: [
    { label: 'About Us', path: '/about' },
    { label: 'Blog', path: '#' },
    { label: 'Careers', path: '#' },
    { label: 'Press', path: '#' },
  ],
  support: [
    { label: 'Help Center', path: '#' },
    { label: 'Contact Us', path: '#' },
    { label: 'Privacy Policy', path: '#' },
    { label: 'Terms of Service', path: '#' },
  ],
  legal: [
    { label: 'Cookie Policy', path: '#' },
    { label: 'Accessibility', path: '#' },
    { label: 'Data Protection', path: '#' },
  ],
}

const socialLinks = [
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Mail, href: 'mailto:hello@travelmate.ai', label: 'Email' },
  { icon: Globe, href: 'https://travelmate.ai', label: 'Website' },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300" role="contentinfo">
      <div className="section-container py-16 md:py-24">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-xl font-display font-bold text-white mb-6" aria-label="TravelMate AI Home">
              <span className="relative p-2 bg-gradient-to-br from-travel-500 to-travel-700 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              TravelMate AI
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm leading-relaxed">
              Your intelligent travel companion powered by Granite 4.2B. 
              Plan smarter, travel better, create memories that last forever.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <nav aria-label="Product links">
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company links">
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Support */}
          <nav aria-label="Support links">
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Legal links">
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © {currentYear} TravelMate AI. Built with ❤️ for travelers everywhere.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-red-500" aria-hidden="true" />
                Made with Granite 4.2B
              </span>
              <span className="flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-amber-500" aria-hidden="true" />
                Powered by Ollama
              </span>
              <span className="flex items-center gap-1.5">
                <Code className="w-4 h-4 text-green-500" aria-hidden="true" />
                Open Source
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
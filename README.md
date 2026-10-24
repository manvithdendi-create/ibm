# TravelMate AI — Smart Travel Planner

A fully functional AI-powered travel planning website built with React, FastAPI, and Granite 4.2B (via Ollama).

## Features

- **AI-Powered Itineraries**: Granite 4.2B generates personalized day-by-day travel plans
- **Smart Budgeting**: Detailed cost breakdowns with charts and remaining budget tracking
- **Interactive Maps**: Leaflet + OpenStreetMap for destination and activity visualization
- **Weather Integration**: OpenWeatherMap forecasts with activity recommendations
- **Trip Management**: Save, edit, regenerate, and export trips (PDF/print/copy)
- **Privacy First**: Runs entirely locally - no data leaves your machine
- **Demo Mode**: Works without AI for testing and development
- **Responsive Design**: Beautiful UI that works on mobile, tablet, and desktop

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router v6
- React Leaflet (maps)
- Recharts (budget visualization)
- Axios (API client)
- React Hot Toast (notifications)
- Lucide React (icons)
- date-fns (date utilities)

### Backend
- FastAPI (Python)
- SQLAlchemy + SQLite
- Pydantic v2
- Ollama Python client
- Geopy (geocoding)
- httpx (async HTTP)
- Uvicorn (ASGI server)

### AI
- Granite 4.2B via Ollama
- Structured JSON output with Pydantic validation
- Retry logic for invalid model outputs
- Demo mode fallback

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **Ollama** (for AI features): [Install Ollama](https://ollama.ai/)
- **Git** (optional)

## Quick Start

### 1. Clone and Setup

```bash
cd travelmate-ai
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your settings (see Configuration below)
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### 4. Start Ollama (for AI features)

```bash
# Install and start Ollama
ollama serve

# In another terminal, pull the Granite model
ollama pull granite3.2:4b
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
# Activate venv if not already active
python -m app.main
```
Backend runs at: http://localhost:8000
API Docs at: http://localhost:8000/docs

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs at: http://localhost:5173

## Configuration

### Backend (.env)

```env
# Server
HOST=0.0.0.0
PORT=8000
DEBUG=true

# Database
DATABASE_URL=sqlite:///./travelmate.db

# AI Model (Ollama)
OLLAMA_BASE_URL=http://localhost:11434
GRANITE_MODEL=granite3.2:4b
OLLAMA_TIMEOUT=120

# Weather API (Optional - get key from openweathermap.org)
OPENWEATHER_API_KEY=your_api_key_here

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Demo Mode (true = use mock data when AI unavailable)
DEMO_MODE=false
```

### Frontend (.env)

```env
VITE_API_URL=/api
```

## Project Structure

```
travelmate-ai/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry
│   │   ├── config.py            # Settings management
│   │   ├── database.py          # SQLAlchemy setup
│   │   ├── models.py            # Database models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── routers/
│   │   │   └── trips.py         # API routes
│   │   └── services/
│   │       ├── granite_service.py      # AI integration
│   │       ├── itinerary_service.py    # Trip CRUD + generation
│   │       ├── budget_service.py       # Cost calculations
│   │       ├── maps_service.py         # Geocoding & maps
│   │       └── weather_service.py      # Weather forecasts
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API client & utilities
│   │   ├── hooks/               # Custom React hooks
│   │   ├── constants/           # Static data
│   │   ├── App.jsx              # Main app with routing
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles (Tailwind)
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
└── README.md
```

## API Endpoints

### Trips
- `POST /api/trips` - Create new trip with AI itinerary
- `GET /api/trips` - List all trips (with search, pagination)
- `GET /api/trips/{id}` - Get trip details
- `PUT /api/trips/{id}` - Update trip
- `DELETE /api/trips/{id}` - Delete trip
- `POST /api/trips/{id}/regenerate` - Regenerate itinerary

### Destinations
- `GET /api/destinations` - List destinations (with filters)
- `GET /api/destinations/{id}` - Get destination details
- `POST /api/destinations/init-sample` - Initialize sample data

### Weather
- `GET /api/weather/{destination}?start_date=&end_date=` - Get forecast

### Health
- `GET /api/health` - Service health check

## Usage Guide

### Planning a Trip

1. Navigate to **Plan Trip** or click "Plan My Trip" on home page
2. Fill in:
   - Starting city
   - Destination
   - Dates
   - Number of travelers
   - Budget & currency
   - Travel style (Budget/Standard/Luxury)
   - Interests (multi-select)
   - Transportation & accommodation preferences
   - Special requirements (optional)
3. Click **Generate My Trip**
4. View the generated itinerary with day-by-day schedule, budget, map, and weather

### Managing Trips

- **My Trips**: View all saved trips with search and sort
- **Trip Details**: See overview, preferences, budget, weather
- **Itinerary View**: Full day-by-day schedule with interactive map
- **Actions**: Regenerate, edit, export PDF, print, copy, delete

### Exploring Destinations

- Browse curated destinations with images, budgets, categories
- Filter by category, budget range, trip duration
- Search by name, country, or description
- Click to start planning a trip to that destination

## Demo Mode

Set `DEMO_MODE=true` in backend `.env` to use mock itineraries without Ollama:

```env
DEMO_MODE=true
```

This is useful for:
- Development without GPU
- Testing UI/UX
- Demonstrations
- CI/CD pipelines

Demo itineraries are clearly marked with a "Demo" badge.

## Testing

### Backend Tests

```bash
cd backend
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

### Frontend Tests

```bash
cd frontend
# Run tests
npm test
```

### Manual API Testing

```bash
# Health check
curl http://localhost:8000/api/health

# Create trip
curl -X POST http://localhost:8000/api/trips \
  -H "Content-Type: application/json" \
  -d '{
    "starting_city": "New York",
    "destination": "Paris",
    "start_date": "2024-06-01",
    "end_date": "2024-06-07",
    "travelers": 2,
    "budget": 3000,
    "currency": "USD",
    "travel_style": "Standard",
    "interests": ["Culture", "Food"],
    "transportation": "Flight",
    "accommodation": "Hotel"
  }'

# List trips
curl http://localhost:8000/api/trips

# Get weather
curl "http://localhost:8000/api/weather/Paris?start_date=2024-06-01&end_date=2024-06-07"
```

## Troubleshooting

### Backend won't start
- Check Python version (3.10+ required)
- Ensure virtual environment is activated
- Verify all dependencies installed: `pip install -r requirements.txt`
- Check port 8000 is available

### Ollama connection failed
- Ensure Ollama is running: `ollama serve`
- Check model is pulled: `ollama list | grep granite`
- Verify OLLAMA_BASE_URL in .env matches Ollama server
- Check firewall/antivirus isn't blocking port 11434

### Frontend build errors
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version (18+ required)
- Verify Vite config is correct

### Database issues
- Delete `travelmate.db` and restart backend to reinitialize
- Check file permissions in backend directory

### Map not loading
- Check browser console for CORS errors
- Verify Leaflet CSS is loaded (imported in MapView)
- OpenStreetMap tiles may be slow in some regions

### Weather not showing
- Add OPENWEATHER_API_KEY to backend .env
- Get free key from [OpenWeatherMap](https://openweathermap.org/api)
- Free tier: 1000 calls/day, 5-day forecast

## Development

### Adding New AI Models

1. Update `granite_service.py` with new model configuration
2. Modify prompt in `build_itinerary_prompt()` if needed
3. Update JSON schema validation in `validate_itinerary_json()`
4. Add model to `check_ollama_health()`

### Adding Map Providers

1. Extend `maps_service.py` with new geocoding/routing functions
2. Update `MapView.jsx` for new tile layers or markers
3. Add provider API keys to backend config

### Customizing Budget Calculations

Modify `budget_service.py`:
- `DAILY_COSTS`: Per-style daily estimates
- `TRANSPORT_COSTS`: Transportation estimates
- `CURRENCY_RATES`: Exchange rates (use live API in production)

## Production Deployment

### Backend
```bash
# Use production ASGI server
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app

# Or with Docker
docker build -t travelmate-backend ./backend
docker run -p 8000:8000 --env-file .env travelmate-backend
```

### Frontend
```bash
npm run build
# Serve dist/ with nginx, Vercel, Netlify, etc.
```

### Environment Variables for Production
- Set `DEBUG=false`
- Use strong `SECRET_KEY` if adding auth
- Configure proper `ALLOWED_ORIGINS`
- Use PostgreSQL instead of SQLite for production
- Set up reverse proxy (nginx) with SSL

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- **IBM Granite Team** for the open-source Granite 4.2B model
- **Ollama** for local LLM inference
- **OpenStreetMap** contributors for map data
- **OpenWeatherMap** for weather API
- **Unsplash** for destination photography
- **Tailwind CSS** for the design system
- **FastAPI** and **React** communities

## Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Security**: Report vulnerabilities privately to security@travelmate.ai

---

Built with ❤️ for travelers everywhere. Happy travels! 🌍
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import TripForm from '../components/TripForm'

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('TripForm', () => {
  const mockSubmit = jest.fn()
  
  beforeEach(() => {
    mockSubmit.mockClear()
  })

  it('renders all required fields', () => {
    renderWithRouter(<TripForm onSubmit={mockSubmit} />)
    
    expect(screen.getByLabelText(/starting city/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/destination/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/departure date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/return date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/number of travelers/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/total budget/i)).toBeInTheDocument()
  })

  it('shows validation errors for empty required fields', () => {
    renderWithRouter(<TripForm onSubmit={mockSubmit} />)
    
    fireEvent.click(screen.getByRole('button', { name: /generate my trip/i }))
    
    expect(screen.getByText(/starting city is required/i)).toBeInTheDocument()
    expect(screen.getByText(/destination is required/i)).toBeInTheDocument()
    expect(screen.getByText(/departure date is required/i)).toBeInTheDocument()
    expect(screen.getByText(/return date is required/i)).toBeInTheDocument()
  })

  it('shows travel style options', () => {
    renderWithRouter(<TripForm onSubmit={mockSubmit} />)
    
    expect(screen.getByRole('radio', { name: /budget/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /standard/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /luxury/i })).toBeInTheDocument()
  })

  it('shows interest checkboxes', () => {
    renderWithRouter(<TripForm onSubmit={mockSubmit} />)
    
    expect(screen.getByRole('checkbox', { name: /adventure/i })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /food/i })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /nature/i })).toBeInTheDocument()
  })
})
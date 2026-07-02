import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Badge } from '../Badge'

describe('Badge', () => {
  it('renders label correctly', () => {
    render(<Badge label="Active" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('applies green variant', () => {
    render(<Badge label="Active" variant="green" />)
    expect(screen.getByText('Active')).toHaveClass('text-brand')
  })

  it('applies muted variant by default', () => {
    render(<Badge label="Muted" />)
    expect(screen.getByText('Muted')).toHaveClass('text-text-muted')
  })
})

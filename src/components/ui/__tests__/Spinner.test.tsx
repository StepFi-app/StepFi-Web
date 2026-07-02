import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Spinner } from '../Spinner'

describe('Spinner', () => {
  it('renders without crashing', () => {
    const { container } = render(<Spinner />)
    expect(container.firstChild).toBeTruthy()
  })

  it('applies custom size', () => {
    const { container } = render(<Spinner size={32} />)
    const el = container.firstChild as HTMLElement
    expect(el.style.width).toBe('32px')
    expect(el.style.height).toBe('32px')
  })
})

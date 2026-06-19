import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function NotFound() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24 text-center">
      <h1 className="font-display font-bold text-6xl
        text-brand mb-4">404</h1>
      <p className="text-text-secondary mb-8" role="alert">
        Page not found.
      </p>
      <Link to="/"><Button>Go Home</Button></Link>
    </section>
  )
}

import { BookOpen, Rocket, DollarSign, Store, Award, Binary, Code } from 'lucide-react'

export interface DocSection {
  slug: string
  title: string
  icon: typeof BookOpen
}

export const DOC_SECTIONS: DocSection[] = [
  { slug: 'introduction', title: 'Introduction', icon: BookOpen },
  { slug: 'getting-started', title: 'Getting Started', icon: Rocket },
  { slug: 'for-sponsors', title: 'For Sponsors', icon: DollarSign },
  { slug: 'for-vendors', title: 'For Vendors', icon: Store },
  { slug: 'for-mentors', title: 'For Mentors', icon: Award },
  { slug: 'smart-contracts', title: 'Smart Contracts', icon: Binary },
  { slug: 'api-reference', title: 'API Reference', icon: Code },
]

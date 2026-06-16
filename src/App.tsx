import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import BrandVoiceArchaeology from './pages/BrandVoiceArchaeology'

type Page = 'landing' | 'archaeology'

export default function App() {
  const [page, setPage] = useState<Page>('landing')

  if (page === 'archaeology') {
    return <BrandVoiceArchaeology onBack={() => setPage('landing')} />
  }

  return <LandingPage onNavigate={() => setPage('archaeology')} />
}

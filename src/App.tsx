import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import BrandVoiceArchaeology from './pages/BrandVoiceArchaeology'
import BriefTranslator from './pages/BriefTranslator'
import RejectionPreventionStudio from './pages/RejectionPreventionStudio'

type Page = 'landing' | 'archaeology' | 'translator' | 'studio'

export default function App() {
  const [page, setPage] = useState<Page>('landing')

  if (page === 'archaeology') {
    return <BrandVoiceArchaeology onBack={() => setPage('landing')} />
  }

  if (page === 'translator') {
    return <BriefTranslator onBack={() => setPage('landing')} />
  }

  if (page === 'studio') {
    return <RejectionPreventionStudio onBack={() => setPage('landing')} />
  }

  return <LandingPage onNavigate={(dest) => setPage(dest as Page)} />
}

import Nav from '../components/Nav'
import Hero from '../components/Hero'
import Problem from '../components/Problem'
import FeatureArchaeology from '../components/FeatureArchaeology'
import FeatureTranslator from '../components/FeatureTranslator'
import FeatureMatch from '../components/FeatureMatch'
import FeatureStudio from '../components/FeatureStudio'
import Outcomes from '../components/Outcomes'
import Pricing from '../components/Pricing'
import FinalCTA from '../components/FinalCTA'
import Footer from '../components/Footer'

export default function LandingPage({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="min-h-screen bg-surface-0">
      <Nav />
      <main>
        <Hero />
        <Problem />
        <FeatureArchaeology onExplore={onNavigate} />
        <FeatureTranslator />
        <FeatureMatch />
        <FeatureStudio />
        <Outcomes />
        <Pricing />
        <FinalCTA onExplore={onNavigate} />
      </main>
      <Footer />
    </div>
  )
}

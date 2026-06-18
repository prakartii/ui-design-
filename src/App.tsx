import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './routes/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'

// Public pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

// Creator pages
import CreatorDashboard from './pages/creator/CreatorDashboard'
import VoiceArchaeologyPage from './pages/creator/VoiceArchaeologyPage'
import BriefTranslatorPage from './pages/creator/BriefTranslatorPage'
import CreatorMatchPage from './pages/creator/CreatorMatchPage'
import RejectionPreventionPage from './pages/creator/RejectionPreventionPage'
import LivingBriefPage from './pages/creator/LivingBriefPage'
import PixelPactPage from './pages/creator/PixelPactPage'
import BrandDiscoveryPage from './pages/creator/BrandDiscoveryPage'

// Brand pages
import BrandDashboard from './pages/brand/BrandDashboard'
import CampaignsPage from './pages/brand/CampaignsPage'
import CreatorsPage from './pages/brand/CreatorsPage'
import AnalyticsPage from './pages/brand/AnalyticsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public ─────────────────────────────────────────── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* ── Creator portal ──────────────────────────────────── */}
          <Route
            path="/creator"
            element={
              <ProtectedRoute allowedRole="creator">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CreatorDashboard />} />
            <Route path="voice-archaeology" element={<VoiceArchaeologyPage />} />
            <Route path="brief-translator" element={<BriefTranslatorPage />} />
            <Route path="creator-match" element={<CreatorMatchPage />} />
            <Route path="rejection-prevention" element={<RejectionPreventionPage />} />
            <Route path="living-brief" element={<LivingBriefPage />} />
            <Route path="pixel-pact" element={<PixelPactPage />} />
            <Route path="brand-discovery" element={<BrandDiscoveryPage />} />
          </Route>

          {/* ── Brand portal ────────────────────────────────────── */}
          <Route
            path="/brand"
            element={
              <ProtectedRoute allowedRole="brand">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<BrandDashboard />} />
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="creators" element={<CreatorsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>

          {/* ── Fallback ────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

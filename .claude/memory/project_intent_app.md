---
name: project-intent-app
description: Project structure and architecture for the Intent creator intelligence platform app
metadata:
  type: project
---

The project is a Vite + React 19 + TypeScript + Tailwind SPA called "Intent" — a creator intelligence platform.

**Phase 1 completed (2026-06-18):**
- React Router (react-router-dom) added
- Auth: localStorage-based with `signup`/`login`/`logout` in `src/services/auth.ts`
- Auth context: `src/context/AuthContext.tsx` with `AuthProvider`
- Hook: `src/hooks/useAuth.ts` (re-exports `useAuthContext`)
- Protected routes: `src/routes/ProtectedRoute.tsx`
- DashboardLayout: `src/layouts/DashboardLayout.tsx` (sidebar + topbar + Outlet)
- Login: `src/pages/LoginPage.tsx`
- Signup: `src/pages/SignupPage.tsx` (role picker: creator | brand)
- Creator pages: 8 pages in `src/pages/creator/`
- Brand pages: 4 pages in `src/pages/brand/`
- Mock data: `src/mock/data.ts`
- Types: `src/types/index.ts`

**Why:** Do not implement AI or backend yet.
**How to apply:** Keep routing through react-router-dom; do not go back to useState-based page switching.

Routes:
- `/` → LandingPage (public)
- `/login` → LoginPage (public)
- `/signup` → SignupPage (public)
- `/creator/*` → ProtectedRoute(role=creator) > DashboardLayout > creator pages
- `/brand/*` → ProtectedRoute(role=brand) > DashboardLayout > brand pages

LandingPage CTA buttons now navigate to `/signup`. Feature deep-links navigate to creator tool routes (auth guard redirects to login if unauthenticated).

Tailwind colors: `studio-bg/card/ele/brd`, `ember-50/100/200/400/600/800`, `surface-0/1/2`, `ink-primary/secondary/tertiary`.

import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import '@styles/tokens.css'
import { AuthProvider } from '@features/auth'
import { MainLayout } from '@/layouts'
import Home from '@pages/Home'
import { ProtectedRoute, GuestRoute, LoadingFallback } from '@shared/components'

// Lazy load - ładuj komponenty tylko gdy są potrzebne (code splitting)
const Login = lazy(() => import('@features/auth/components/Login'))
const Register = lazy(() => import('@features/auth/components/Register'))
const Rules = lazy(() => import('@pages/Rules'))
const GameBlitz = lazy(() => import('@features/game/components/GameBlitz'))
const GameResult = lazy(() => import('@features/game/components/GameResult'))
const GameHistory = lazy(() => import('@features/game/components/GameHistory'))
const Profile = lazy(() => import('@features/profile/components/Profile'))
const Shop = lazy(() => import('@features/shop/components/Shop'))
const Friends = lazy(() => import('@features/social/components/Friends'))
const FriendSearch = lazy(() => import('@features/social/components/FriendSearch'))
const Chat = lazy(() => import('@features/social/components/Chat'))
const AddQuestion = lazy(() => import('@features/admin/components/AddQuestion'))
const AdminPanel = lazy(() => import('@features/admin/components/AdminPanel'))
const Ranking = lazy(() => import('@pages/Ranking'))
const TopPlayers = lazy(() => import('@pages/TopPlayers'))
const Settings = lazy(() => import('@pages/Settings'))
const DuelLobby = lazy(() => import('@features/game/components/DuelLobby'))
const DuelChallenge = lazy(() => import('@features/game/components/DuelChallenge'))
const DuelGame = lazy(() => import('@features/game/components/DuelGame'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <MainLayout>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Strona główna - dostępna dla wszystkich (guest widzi wersję demo) */}
              <Route path="/" element={<Home />} />
              
              {/* Strony dostępne dla wszystkich */}
              <Route path="/rules" element={<Rules />} />
              
              {/* Gry */}
              <Route path="/game-blitz" element={<GameBlitz />} />
              <Route path="/game-result" element={<GameResult />} />
              
              {/* Duel */}
              <Route path="/duel" element={<ProtectedRoute><DuelLobby /></ProtectedRoute>} />
              <Route path="/duel/challenge" element={<ProtectedRoute><DuelChallenge /></ProtectedRoute>} />
              <Route path="/duel/:matchId" element={<ProtectedRoute><DuelGame /></ProtectedRoute>} />
              
              {/* Strony tylko dla gości (niezalogowanych) */}
              <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
              
              {/* Strony dla zalogowanych użytkowników (user + admin) */}
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/ranking" element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><GameHistory /></ProtectedRoute>} />
              <Route path="/shop" element={<ProtectedRoute><Shop /></ProtectedRoute>} />
              <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
              <Route path="/find-friends" element={<ProtectedRoute><FriendSearch /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/top-players" element={<ProtectedRoute><TopPlayers /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/add-question" element={<ProtectedRoute><AddQuestion /></ProtectedRoute>} />
              
              {/* Strony tylko dla adminów */}
              <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPanel /></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </MainLayout>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)

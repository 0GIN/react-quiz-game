import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/tokens.css'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'

// Lazy load - ładuj komponenty tylko gdy są potrzebne (code splitting)
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Rules = lazy(() => import('./pages/Rules'))
const GameBlitz = lazy(() => import('./pages/GameBlitz'))
const GameResult = lazy(() => import('./pages/GameResult'))
const Profile = lazy(() => import('./pages/Profile'))
const Ranking = lazy(() => import('./pages/Ranking'))
const GameHistory = lazy(() => import('./pages/GameHistory'))
const Shop = lazy(() => import('./pages/Shop'))
const Friends = lazy(() => import('./pages/Friends'))
const FriendSearch = lazy(() => import('./pages/FriendSearch'))
const Chat = lazy(() => import('./pages/Chat'))
const TopPlayers = lazy(() => import('./pages/TopPlayers'))
const Settings = lazy(() => import('./pages/Settings'))
const AddQuestion = lazy(() => import('./pages/AddQuestion'))
const AdminPanel = lazy(() => import('./pages/AdminPanel'))

// Loading fallback component
function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      color: '#00E5FF',
      fontSize: '18px',
      fontWeight: 600
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
        <div>Ładowanie...</div>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Strona główna - dostępna dla wszystkich (guest widzi wersję demo) */}
              <Route path="/" element={<Home />} />
              
              {/* Strony dostępne dla wszystkich */}
              <Route path="/rules" element={<Rules />} />
              
              {/* Gry */}
              <Route path="/game-blitz" element={<GameBlitz />} />
              <Route path="/game-result" element={<GameResult />} />
              
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
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)

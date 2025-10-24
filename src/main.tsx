import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/tokens.css'
import { AuthProvider } from './contexts/AuthContext'
import { 
  Layout,
  Home,
  Ranking,
  DailyMissions,
  GameHistory,
  Shop,
  Friends,
  FriendSearch,
  Chat,
  TopPlayers,
  Settings,
  AddQuestion,
  AdminPanel
} from './components'
import Login from './pages/Login'
import Register from './pages/Register'
import Rules from './pages/Rules'
import GameBlitz from './pages/GameBlitz'
import GameResult from './pages/GameResult'
import TestQuestions from './pages/TestQuestions'
import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Strona główna - dostępna dla wszystkich (guest widzi wersję demo) */}
            <Route path="/" element={<Home />} />
            
            {/* Strony dostępne dla wszystkich */}
            <Route path="/rules" element={<Rules />} />
            <Route path="/test-questions" element={<TestQuestions />} />
            
            {/* Gry */}
            <Route path="/game-blitz" element={<GameBlitz />} />
            <Route path="/game-result" element={<GameResult />} />
            
            {/* Strony tylko dla gości (niezalogowanych) */}
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            
            {/* Strony dla zalogowanych użytkowników (user + admin) */}
            <Route path="/ranking" element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
            <Route path="/missions" element={<ProtectedRoute><DailyMissions /></ProtectedRoute>} />
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
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/tokens.css'
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/missions" element={<DailyMissions />} />
          <Route path="/history" element={<GameHistory />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/find-friends" element={<FriendSearch />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/top-players" element={<TopPlayers />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/add-question" element={<AddQuestion />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </StrictMode>,
)

/**
 * @fileoverview Konfiguracja routingu aplikacji
 */

import { lazy } from 'react';
import { ROUTES } from '@/constants';
import type { RouteObject } from 'react-router-dom';

// Lazy loaded pages
const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/features/auth/components/Login'));
const Register = lazy(() => import('@/features/auth/components/Register'));
const Rules = lazy(() => import('@/pages/Rules'));
const GameBlitz = lazy(() => import('@/features/game/components/GameBlitz'));
const GameResult = lazy(() => import('@/features/game/components/GameResult'));
// Profile page wrapper (allows future expansion without touching feature component)
const Profile = lazy(() => import('@/pages/Profile'));
const Ranking = lazy(() => import('@/pages/Ranking'));
const GameHistory = lazy(() => import('@/features/game/components/GameHistory'));
const Shop = lazy(() => import('@/features/shop/components/Shop'));
const Friends = lazy(() => import('@/features/social/components/Friends'));
const FriendSearch = lazy(() => import('@/features/social/components/FriendSearch'));
const Chat = lazy(() => import('@/features/social/components/Chat'));
// const TopPlayers = lazy(() => import('@/pages/TopPlayers')); // Zintegrowane w Ranking
const Settings = lazy(() => import('@/pages/Settings'));
const AddQuestion = lazy(() => import('@/features/admin/components/AddQuestion'));
const AdminPanel = lazy(() => import('@/features/admin/components/AdminPanel'));
const DuelLobby = lazy(() => import('@/features/game/components/DuelLobby'));
const DuelChallenge = lazy(() => import('@/features/game/components/DuelChallenge'));
const DuelGame = lazy(() => import('@/features/game/components/DuelGame'));
const SquadLobby = lazy(() => import('@/features/game/components/SquadLobby'));
const SquadGame = lazy(() => import('@/features/game/components/SquadGame'));
const MasterMode = lazy(() => import('@/pages/MasterMode'));
const Achievements = lazy(() => import('@/pages/Achievements'));

// Route guards
import ProtectedRoute from '@/shared/components/ProtectedRoute';
import GuestRoute from '@/shared/components/GuestRoute';

/**
 * Konfiguracja tras aplikacji
 */
export const routes: RouteObject[] = [
  {
    path: ROUTES.HOME,
    element: <Home />,
  },
  {
    path: ROUTES.RULES,
    element: <Rules />,
  },
  {
    path: ROUTES.GAME_BLITZ,
    element: <GameBlitz />,
  },
  {
    path: ROUTES.GAME_RESULT,
    element: <GameResult />,
  },
  // Auth routes (guest only)
  {
    path: ROUTES.LOGIN,
    element: (
      <GuestRoute>
        <Login />
      </GuestRoute>
    ),
  },
  {
    path: ROUTES.REGISTER,
    element: (
      <GuestRoute>
        <Register />
      </GuestRoute>
    ),
  },
  // Protected routes (authenticated users)
  {
    path: ROUTES.PROFILE,
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.PROFILE_USER,
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.RANKING,
    element: (
      <ProtectedRoute>
        <Ranking />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.ACHIEVEMENTS,
    element: (
      <ProtectedRoute>
        <Achievements />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.HISTORY,
    element: (
      <ProtectedRoute>
        <GameHistory />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.SHOP,
    element: (
      <ProtectedRoute>
        <Shop />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.FRIENDS,
    element: (
      <ProtectedRoute>
        <Friends />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.FIND_FRIENDS,
    element: (
      <ProtectedRoute>
        <FriendSearch />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.CHAT,
    element: (
      <ProtectedRoute>
        <Chat />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.DUEL,
    element: (
      <ProtectedRoute>
        <DuelLobby />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.DUEL_CHALLENGE,
    element: (
      <ProtectedRoute>
        <DuelChallenge />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.DUEL_GAME,
    element: (
      <ProtectedRoute>
        <DuelGame />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.SQUAD,
    element: (
      <ProtectedRoute>
        <SquadLobby />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.SQUAD_GAME,
    element: (
      <ProtectedRoute>
        <SquadGame />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.MASTER,
    element: (
      <ProtectedRoute>
        <MasterMode />
      </ProtectedRoute>
    ),
  },
  // {
  //   path: ROUTES.TOP_PLAYERS,
  //   element: (
  //     <ProtectedRoute>
  //       <TopPlayers />
  //     </ProtectedRoute>
  //   ),
  // },
  {
    path: ROUTES.SETTINGS,
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.ADD_QUESTION,
    element: (
      <ProtectedRoute>
        <AddQuestion />
      </ProtectedRoute>
    ),
  },
  // Admin routes
  {
    path: ROUTES.ADMIN,
    element: (
      <ProtectedRoute requireAdmin>
        <AdminPanel />
      </ProtectedRoute>
    ),
  },
];

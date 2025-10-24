/**
 * @fileoverview Główny layout aplikacji
 * 
 * Komponent zarządzający strukturą wizualną aplikacji.
 * Zawiera górny navbar, boczny sidebar i obszar na treść stron.
 * 
 * Struktura:
 * - Navbar (górny pasek z logo, avatarem, punktami)
 * - Sidebar (menu nawigacyjne, dostosowane do roli użytkownika)
 * - Children (dynamiczna treść strony)
 * 
 * @component
 */

import type { ReactNode } from 'react'
import { Navbar, Sidebar } from '../components'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="home-root">
      <Navbar />
      <div className="app-frame">
        <Sidebar />
        {children}
      </div>
    </div>
  )
}

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

/**
 * @fileoverview Simple layout wrapper component
 */

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return <>{children}</>;
}

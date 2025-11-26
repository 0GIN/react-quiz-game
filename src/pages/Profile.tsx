/**
 * Strona profilu (alias do istniejącego komponentu feature).
 * Jeśli w przyszłości potrzebny będzie osobny layout albo loader,
 * można rozbudować ten plik zamiast modyfikować komponent funkcjonalny.
 */
import ProfileFeature from '@/features/profile/components/Profile';

export default function ProfilePage() {
  return <ProfileFeature />;
}

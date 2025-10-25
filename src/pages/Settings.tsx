import { Card, MaterialIcon } from '@shared/ui';
import '@/styles/ui.css';

export default function Settings() {
  return (
    <main className="main" role="main">
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <MaterialIcon icon="settings" size={64} style={{ color: '#00E5FF', marginBottom: '20px' }} />
          <h2 style={{ marginBottom: '10px' }}>Ustawienia</h2>
          <p style={{ color: '#888', marginBottom: '30px' }}>
            Ustawienia aplikacji będą dostępne wkrótce.
          </p>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Możesz edytować swój profil w zakładce <strong style={{ color: '#00E5FF' }}>Mój Profil</strong>
          </p>
          
          <div style={{ 
            marginTop: '40px', 
            padding: '20px', 
            background: 'rgba(0, 229, 255, 0.05)', 
            borderRadius: '8px',
            border: '1px solid rgba(0, 229, 255, 0.1)'
          }}>
            <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Planowane funkcje:</h3>
            <ul style={{ 
              textAlign: 'left', 
              color: '#888', 
              lineHeight: '1.8',
              listStyle: 'none',
              padding: 0
            }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MaterialIcon icon="palette" size={18} />
                Motywy kolorystyczne
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MaterialIcon icon="notifications" size={18} />
                Powiadomienia
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MaterialIcon icon="language" size={18} />
                Język aplikacji
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MaterialIcon icon="volume_up" size={18} />
                Dźwięki i efekty
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MaterialIcon icon="security" size={18} />
                Prywatność i bezpieczeństwo
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </main>
  );
}

import { Card } from '@shared/ui';

export default function Rules() {
  return (
    <main className="main">
      <div style={{ gridColumn: 'span 12' }}>
        <Card className="rules-page">
          <h2 style={{ fontSize: '32px', marginBottom: '8px', color: '#00E5FF' }}>📜 Regulamin QuizRush</h2>
          <p className="page-subtitle" style={{ marginBottom: '32px' }}>
            Zasady gry, punktacja i przydatne informacje
          </p>

          {/* Ogólne Zasady */}
          <section style={{ marginBottom: '32px' }}>
            <h3 style={{ color: '#E0E0E0', fontSize: '24px', marginBottom: '16px', borderBottom: '2px solid rgba(0,229,255,0.3)', paddingBottom: '8px' }}>
              🎮 Ogólne Zasady
            </h3>
            <ul style={{ color: '#B8B8D0', fontSize: '15px', lineHeight: 1.8, paddingLeft: '24px' }}>
              <li>QuizRush to gra quizowa dla jednego lub wielu graczy</li>
              <li>Rejestracja jest darmowa i zajmuje mniej niż minutę</li>
              <li>Graj uczciwie - oszukiwanie skutkuje banem</li>
              <li>Szanuj innych graczy w czacie i grach multiplayer</li>
              <li>Zgłaszaj błędne pytania przez formularz kontaktowy</li>
            </ul>
          </section>

          {/* Tryby Gry */}
          <section style={{ marginBottom: '32px' }}>
            <h3 style={{ color: '#E0E0E0', fontSize: '24px', marginBottom: '16px', borderBottom: '2px solid rgba(0,229,255,0.3)', paddingBottom: '8px' }}>
              ⚔️ Tryby Gry
            </h3>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ padding: '16px', background: 'rgba(0,229,255,0.05)', borderRadius: '12px', border: '1px solid rgba(0,229,255,0.2)' }}>
                <h4 style={{ color: '#00E5FF', fontSize: '18px', marginBottom: '8px' }}>🥊 Duel (1v1)</h4>
                <p style={{ color: '#B8B8D0', fontSize: '14px', lineHeight: 1.6 }}>
                  Klasyczny pojedynek jeden na jeden. 10 pytań z różnych kategorii. Kto odpowie poprawnie na więcej pytań - wygrywa!
                </p>
              </div>

              <div style={{ padding: '16px', background: 'rgba(0,229,255,0.05)', borderRadius: '12px', border: '1px solid rgba(0,229,255,0.2)' }}>
                <h4 style={{ color: '#00E5FF', fontSize: '18px', marginBottom: '8px' }}>👥 Squad (2v2)</h4>
                <p style={{ color: '#B8B8D0', fontSize: '14px', lineHeight: 1.6 }}>
                  Drużynowa rywalizacja. Stwórz team z przyjacielem i zmierz się z inną drużyną. Współpraca jest kluczem do zwycięstwa!
                </p>
              </div>

              <div style={{ padding: '16px', background: 'rgba(0,229,255,0.05)', borderRadius: '12px', border: '1px solid rgba(0,229,255,0.2)' }}>
                <h4 style={{ color: '#00E5FF', fontSize: '18px', marginBottom: '8px' }}>⚡ Blitz (Solo)</h4>
                <p style={{ color: '#B8B8D0', fontSize: '14px', lineHeight: 1.6 }}>
                  Szybka gra na czas. Masz 3 życia i 3 minuty. Odpowiadaj szybko i poprawnie, aby zdobyć jak najwięcej punktów!
                </p>
              </div>

              <div style={{ padding: '16px', background: 'rgba(0,229,255,0.05)', borderRadius: '12px', border: '1px solid rgba(0,229,255,0.2)' }}>
                <h4 style={{ color: '#00E5FF', fontSize: '18px', marginBottom: '8px' }}>🏆 Master (1v1 Kategoria)</h4>
                <p style={{ color: '#B8B8D0', fontSize: '14px', lineHeight: 1.6 }}>
                  Pojedynek w wybranej kategorii. Pokaż swoją wiedzę w konkretnej dziedzinie. Tylko dla prawdziwych ekspertów!
                </p>
              </div>
            </div>
          </section>

          {/* System Punktacji */}
          <section style={{ marginBottom: '32px' }}>
            <h3 style={{ color: '#E0E0E0', fontSize: '24px', marginBottom: '16px', borderBottom: '2px solid rgba(0,229,255,0.3)', paddingBottom: '8px' }}>
              ⚡ FlashPoints - System Punktacji
            </h3>
            <div style={{ background: 'rgba(255,215,0,0.1)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,215,0,0.3)', marginBottom: '16px' }}>
              <p style={{ color: '#FFD700', fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
                💰 Jak zdobywać FlashPoints?
              </p>
              <ul style={{ color: '#B8B8D0', fontSize: '14px', lineHeight: 1.8, paddingLeft: '24px' }}>
                <li><strong style={{ color: '#00E5FF' }}>+100 FP</strong> - Wygrana w Duel</li>
                <li><strong style={{ color: '#00E5FF' }}>+150 FP</strong> - Wygrana w Squad</li>
                <li><strong style={{ color: '#00E5FF' }}>+50-200 FP</strong> - Wynik w Blitz (zależny od punktów)</li>
                <li><strong style={{ color: '#00E5FF' }}>+200 FP</strong> - Wygrana w Master</li>
                <li><strong style={{ color: '#00E5FF' }}>+50 FP</strong> - Ukończenie Codziennej Misji</li>
                <li><strong style={{ color: '#00E5FF' }}>+500 FP</strong> - Odblokowanie Osiągnięcia</li>
              </ul>
            </div>
            <p style={{ color: '#B8B8D0', fontSize: '14px', lineHeight: 1.6 }}>
              FlashPoints możesz wydać w Sklepie na awatary, odznaki, motywy i inne ulepszenia!
            </p>
          </section>

          {/* System Poziomów */}
          <section style={{ marginBottom: '32px' }}>
            <h3 style={{ color: '#E0E0E0', fontSize: '24px', marginBottom: '16px', borderBottom: '2px solid rgba(0,229,255,0.3)', paddingBottom: '8px' }}>
              📈 System Poziomów (XP)
            </h3>
            <ul style={{ color: '#B8B8D0', fontSize: '15px', lineHeight: 1.8, paddingLeft: '24px' }}>
              <li>Każde pytanie: <strong style={{ color: '#00E5FF' }}>+10 XP</strong></li>
              <li>Poprawna odpowiedź: <strong style={{ color: '#00E5FF' }}>+25 XP</strong></li>
              <li>Wygrana gra: <strong style={{ color: '#00E5FF' }}>+100 XP</strong></li>
              <li>Bezbłędna gra: <strong style={{ color: '#00E5FF' }}>+200 XP BONUS</strong></li>
              <li>Formuła XP na poziom: <code style={{ color: '#00E5FF', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '4px' }}>100 + (poziom - 1) × 50</code></li>
            </ul>
          </section>

          {/* Ranking */}
          <section style={{ marginBottom: '32px' }}>
            <h3 style={{ color: '#E0E0E0', fontSize: '24px', marginBottom: '16px', borderBottom: '2px solid rgba(0,229,255,0.3)', paddingBottom: '8px' }}>
              🏆 Ranking
            </h3>
            <p style={{ color: '#B8B8D0', fontSize: '15px', lineHeight: 1.8, marginBottom: '12px' }}>
              Ranking jest aktualizowany na żywo i bazuje na liczbie FlashPoints. Wspinaj się na szczyt i zostań najlepszym graczem QuizRush!
            </p>
            <div style={{ background: 'rgba(0,229,255,0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(0,229,255,0.2)' }}>
              <p style={{ color: '#00E5FF', fontSize: '14px', fontWeight: 600 }}>
                🥇 TOP 3 otrzymują specjalne odznaki na profilu!
              </p>
            </div>
          </section>

          {/* Kontakt */}
          <section style={{ marginBottom: '16px' }}>
            <h3 style={{ color: '#E0E0E0', fontSize: '24px', marginBottom: '16px', borderBottom: '2px solid rgba(0,229,255,0.3)', paddingBottom: '8px' }}>
              📧 Kontakt
            </h3>
            <p style={{ color: '#B8B8D0', fontSize: '15px', lineHeight: 1.8 }}>
              Masz pytania? Znalazłeś błąd? Skontaktuj się z nami:<br />
              Email: <a href="mailto:support@quizrush.com" style={{ color: '#00E5FF', textDecoration: 'none' }}>support@quizrush.com</a>
            </p>
          </section>

          <div style={{ 
            marginTop: '32px', 
            padding: '20px', 
            background: 'rgba(0,229,255,0.1)', 
            borderRadius: '12px',
            border: '1px solid rgba(0,229,255,0.3)',
            textAlign: 'center'
          }}>
            <p style={{ color: '#00E5FF', fontSize: '14px' }}>
              Ostatnia aktualizacja: 24 października 2025
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}

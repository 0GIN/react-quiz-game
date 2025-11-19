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
              ⚔️ Tryby Gry - Szczegółowa Mechanika
            </h3>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              {/* BLITZ MODE */}
              <div style={{ padding: '20px', background: 'rgba(0,229,255,0.05)', borderRadius: '12px', border: '2px solid rgba(0,229,255,0.3)' }}>
                <h4 style={{ color: '#00E5FF', fontSize: '20px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ⚡ Blitz (Solo)
                  <span style={{ fontSize: '12px', background: 'rgba(255,215,0,0.2)', padding: '4px 8px', borderRadius: '6px', color: '#FFD700' }}>SOLO</span>
                </h4>
                
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ color: '#B8B8D0', fontSize: '14px', lineHeight: 1.6, marginBottom: '12px' }}>
                    Tryb treningowy bez limitu czasowego - masz 3 życia i odpowiadasz na pytania dopóki nie stracisz wszystkich żyć lub nie zdecydujesz się zakończyć grę.
                  </p>
                  
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', marginTop: '12px' }}>
                    <p style={{ color: '#FFD700', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>📊 System Doświadczenia (XP):</p>
                    <ul style={{ color: '#B8B8D0', fontSize: '13px', lineHeight: 1.8, paddingLeft: '20px', margin: 0 }}>
                      <li><strong style={{ color: '#ef4444' }}>0-3 poprawne</strong>: -50 do -20 XP (kara za słabą grę)</li>
                      <li><strong style={{ color: '#f97316' }}>4-7 poprawne</strong>: -15 do 0 XP (bez zysków)</li>
                      <li><strong style={{ color: '#eab308' }}>8-12 poprawne</strong>: 0 do +30 XP (średni wynik)</li>
                      <li><strong style={{ color: '#22c55e' }}>13-20 poprawne</strong>: +40 do +100 XP (dobry wynik)</li>
                      <li><strong style={{ color: '#00E5FF' }}>21+ poprawne</strong>: +110 do +200 XP (max cap!)</li>
                    </ul>
                    <p style={{ color: '#B8B8D0', fontSize: '12px', marginTop: '12px', fontStyle: 'italic' }}>
                      💡 Bonusy: Accuracy 80%+ (+20 XP), 90%+ (+30 XP), Perfekcja (+50 XP), Pozostałe życia (+10 XP każde)
                    </p>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,215,0,0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,215,0,0.3)' }}>
                  <p style={{ color: '#FFD700', fontSize: '13px', margin: 0 }}>
                    <strong>💰 FlashPoints:</strong> 50-200 FP w zależności od wyniku
                  </p>
                </div>
              </div>

              {/* DUEL MODE */}
              <div style={{ padding: '20px', background: 'rgba(138,43,226,0.05)', borderRadius: '12px', border: '2px solid rgba(138,43,226,0.3)' }}>
                <h4 style={{ color: '#8A2BE2', fontSize: '20px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🥊 Duel (1v1)
                  <span style={{ fontSize: '12px', background: 'rgba(239,68,68,0.2)', padding: '4px 8px', borderRadius: '6px', color: '#ef4444' }}>PVP</span>
                </h4>
                
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ color: '#B8B8D0', fontSize: '14px', lineHeight: 1.6, marginBottom: '12px' }}>
                    Pojedynek 1 na 1 składający się z <strong style={{ color: '#8A2BE2' }}>5 rund po 3 pytania</strong> (łącznie 15 pytań). Gracze na zmianę wybierają kategorie. Turowa rozgrywka - każdy odpowiada w swoim czasie.
                  </p>
                  
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', marginTop: '12px' }}>
                    <p style={{ color: '#8A2BE2', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>🎯 Mechanika Gry:</p>
                    <ul style={{ color: '#B8B8D0', fontSize: '13px', lineHeight: 1.8, paddingLeft: '20px', margin: 0 }}>
                      <li>Runda 1, 3, 5: Gracz 1 wybiera kategorię</li>
                      <li>Runda 2, 4: Gracz 2 wybiera kategorię</li>
                      <li>Po wyborze kategorii generują się 3 losowe pytania</li>
                      <li>Obaj gracze odpowiadają na te same pytania (w różnym czasie)</li>
                      <li>Zwycięzca: gracz z większą liczbą poprawnych odpowiedzi</li>
                    </ul>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', marginTop: '12px' }}>
                    <p style={{ color: '#FFD700', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>📊 Dynamiczny System Nagród:</p>
                    <p style={{ color: '#B8B8D0', fontSize: '12px', marginBottom: '12px' }}>
                      Nagrody i kary zależą od różnicy w wyniku - im bardziej wyrównany mecz, tym łagodniejsze konsekwencje!
                    </p>
                    <ul style={{ color: '#B8B8D0', fontSize: '13px', lineHeight: 1.8, paddingLeft: '20px', margin: 0 }}>
                      <li><strong style={{ color: '#eab308' }}>Zaciąty pojedynek (różnica 1-2 pkt)</strong>:<br/>
                        <span style={{ marginLeft: '20px', fontSize: '12px' }}>Zwycięzca: +70 FP, +90 XP | Przegrany: +30 FP, -10 XP</span>
                      </li>
                      <li><strong style={{ color: '#22c55e' }}>Standardowa wygrana (różnica 3-5 pkt)</strong>:<br/>
                        <span style={{ marginLeft: '20px', fontSize: '12px' }}>Zwycięzca: +100 FP, +150 XP | Przegrany: +0 FP, -30 XP</span>
                      </li>
                      <li><strong style={{ color: '#00E5FF' }}>Dominacja (różnica 6+ pkt)</strong>:<br/>
                        <span style={{ marginLeft: '20px', fontSize: '12px' }}>Zwycięzca: +130 FP, +200 XP | Przegrany: +0 FP, <span style={{ color: '#ef4444', fontWeight: 700 }}>-50 XP</span></span>
                      </li>
                      <li><strong style={{ color: '#eab308' }}>Remis (równy wynik)</strong>: +50 FP, +75 XP (obaj gracze)</li>
                    </ul>
                  </div>
                </div>

                <div style={{ background: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>
                    ⚠️ <strong>UWAGA:</strong> Przegrana w Duel zabiera XP! Im większa różnica w wyniku, tym większa kara (do -50 XP przy dominacji przeciwnika). Graj mądrze!
                  </p>
                </div>
              </div>

              {/* SQUAD MODE */}
              <div style={{ padding: '16px', background: 'rgba(0,229,255,0.05)', borderRadius: '12px', border: '1px solid rgba(0,229,255,0.2)', opacity: 0.6 }}>
                <h4 style={{ color: '#00E5FF', fontSize: '18px', marginBottom: '8px' }}>
                  👥 Squad (2v2) <span style={{ fontSize: '12px', color: '#B8B8D0' }}>[Wkrótce]</span>
                </h4>
                <p style={{ color: '#B8B8D0', fontSize: '14px', lineHeight: 1.6 }}>
                  Drużynowa rywalizacja. Stwórz team z przyjacielem i zmierz się z inną drużyną. Współpraca jest kluczem do zwycięstwa!
                </p>
              </div>

              {/* MASTER MODE */}
              <div style={{ padding: '16px', background: 'rgba(0,229,255,0.05)', borderRadius: '12px', border: '1px solid rgba(0,229,255,0.2)', opacity: 0.6 }}>
                <h4 style={{ color: '#00E5FF', fontSize: '18px', marginBottom: '8px' }}>
                  🏆 Master (1v1 Kategoria) <span style={{ fontSize: '12px', color: '#B8B8D0' }}>[Wkrótce]</span>
                </h4>
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
              📈 System Poziomów i Doświadczenia
            </h3>
            
            <div style={{ background: 'rgba(0,229,255,0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(0,229,255,0.2)', marginBottom: '16px' }}>
              <p style={{ color: '#00E5FF', fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
                🎯 Czym jest Level?
              </p>
              <p style={{ color: '#B8B8D0', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
                Poziom (Level) to główny wskaźnik Twojego zaawansowania w grze. Im wyższy poziom, tym lepszy jesteś jako gracz. 
                Poziom wpływa na matchmaking w trybach PVP - system stara się dobierać przeciwników o podobnym poziomie.
              </p>
              
              <p style={{ color: '#FFD700', fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>
                💎 Jak zdobywać Experience (XP)?
              </p>
              <ul style={{ color: '#B8B8D0', fontSize: '14px', lineHeight: 1.8, paddingLeft: '24px', marginBottom: '16px' }}>
                <li><strong style={{ color: '#22c55e' }}>Blitz</strong>: od -50 do +200 XP (zależy od wyniku)</li>
                <li><strong style={{ color: '#22c55e' }}>Duel - Wygrana</strong>: +90 do +200 XP (zależy od różnicy wyników)</li>
                <li><strong style={{ color: '#ef4444' }}>Duel - Przegrana</strong>: -10 do -50 XP (im większa różnica, tym większa kara!)</li>
                <li><strong style={{ color: '#eab308' }}>Duel - Remis</strong>: +75 XP</li>
              </ul>

              <p style={{ color: '#ef4444', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                ⚠️ Możesz stracić poziom!
              </p>
              <p style={{ color: '#B8B8D0', fontSize: '13px', lineHeight: 1.6 }}>
                Jeśli Twoje XP spadnie poniżej 0, cofniesz się o poziom (ale nie niżej niż Level 1). 
                Przegrywając w Duel możesz stracić od -10 do -50 XP (zależy od różnicy wyników), więc uważaj przed wyzywaniem silniejszych przeciwników!
              </p>
            </div>

            <div style={{ background: 'rgba(138,43,226,0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(138,43,226,0.2)' }}>
              <p style={{ color: '#8A2BE2', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                📊 Formuła wymaganego XP do awansu:
              </p>
              <code style={{ 
                color: '#00E5FF', 
                background: 'rgba(0,0,0,0.4)', 
                padding: '8px 16px', 
                borderRadius: '6px', 
                display: 'inline-block',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}>
                XP_required = 100 × (1.5 ^ (level - 1))
              </code>
              <p style={{ color: '#B8B8D0', fontSize: '12px', marginTop: '8px' }}>
                Przykłady: Lvl 1→2 = 100 XP | Lvl 5→6 = 506 XP | Lvl 10→11 = 3,844 XP
              </p>
            </div>
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
              Ostatnia aktualizacja: 19 listopada 2025
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}

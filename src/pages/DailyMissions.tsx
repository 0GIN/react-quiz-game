import '../styles/ui.css'
import { Card, ProgressBar } from '../components'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ACHIEVEMENT_CATEGORIES, getUserAchievements, checkAndUnlockAchievements, synchronizeAchievementsProgress } from '../services/achievementService'

export default function Achievements() {
  const { user } = useAuth();
  const [unlockedAchievements, setUnlockedAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    if (!user) return;
    setLoading(true);
  // Najpierw nadrób milestone'y osiągnięć na podstawie aktualnych statystyk
  await synchronizeAchievementsProgress(user.id);
  // Następnie sprawdź i odblokuj osiągnięcia (jeśli coś się zmieniło)
  await checkAndUnlockAchievements(user.id);
    // Następnie pobierz aktualną listę osiągnięć
    const achievements = await getUserAchievements(user.id);
    setUnlockedAchievements(achievements);
    setLoading(false);
  };

  const isUnlocked = (categoryId: string, level: string) => {
    return unlockedAchievements.some(
      a => a.achievement_id === categoryId && a.milestone_level === level
    );
  };

  const getMilestoneColor = (level: string) => {
    const colors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2',
      diamond: '#B9F2FF'
    };
    return colors[level as keyof typeof colors] || '#888';
  };

  if (!user) {
    return (
      <main className="main" role="main">
        <Card title="🎖️ Osiągnięcia" className="missions-page">
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#B8B8D0' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>Zaloguj się, aby zobaczyć osiągnięcia</div>
          </div>
        </Card>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="main" role="main">
        <Card title="🎖️ Osiągnięcia" className="missions-page">
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#B8B8D0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <div>Ładowanie osiągnięć...</div>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="main" role="main">
      <Card title="�️ Osiągnięcia" className="missions-page">
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <p style={{ color: '#B8B8D0', fontSize: '14px' }}>
            Zdobywaj osiągnięcia i odblokowuj nagrody! Każdy kamień milowy daje FP i XP.
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ padding: '8px 16px', background: 'rgba(205,127,50,0.2)', borderRadius: '8px', fontSize: '13px' }}>
              🥉 Brąz
            </div>
            <div style={{ padding: '8px 16px', background: 'rgba(192,192,192,0.2)', borderRadius: '8px', fontSize: '13px' }}>
              🥈 Srebro
            </div>
            <div style={{ padding: '8px 16px', background: 'rgba(255,215,0,0.2)', borderRadius: '8px', fontSize: '13px' }}>
              🥇 Złoto
            </div>
            <div style={{ padding: '8px 16px', background: 'rgba(229,228,226,0.2)', borderRadius: '8px', fontSize: '13px' }}>
              💎 Platyna
            </div>
            <div style={{ padding: '8px 16px', background: 'rgba(185,242,255,0.2)', borderRadius: '8px', fontSize: '13px' }}>
              💠 Diament
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '16px', maxHeight: 'calc(100vh - 300px)', overflowY: 'auto', paddingRight: '8px' }}>
          {ACHIEVEMENT_CATEGORIES.map(category => {
            const currentProgress = category.getCurrentProgress(user);
            
            // Znajdź następny milestone do zdobycia
            let nextMilestone = null;
            let completedMilestones = 0;
            
            for (const milestone of category.milestones) {
              if (isUnlocked(category.id, milestone.level)) {
                completedMilestones++;
              } else if (!nextMilestone) {
                nextMilestone = milestone;
              }
            }

            const allCompleted = completedMilestones === category.milestones.length;
            const progressToNext = nextMilestone 
              ? Math.min((currentProgress / nextMilestone.target) * 100, 100)
              : 100;

            return (
              <div key={category.id} style={{
                padding: '20px',
                background: 'rgba(18,18,30,0.6)',
                borderRadius: '12px',
                border: allCompleted 
                  ? '2px solid rgba(185,242,255,0.5)'
                  : '2px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div style={{ fontSize: '28px' }}>{category.icon}</div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ color: '#E0E0E0', fontSize: '16px', fontWeight: 700, marginBottom: '2px' }}>
                        {category.title}
                      </h3>
                      <p style={{ color: '#B8B8D0', fontSize: '12px' }}>
                        {category.description}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    fontSize: '20px'
                  }}>
                    {category.milestones.map(milestone => (
                      <div key={milestone.level} style={{
                        fontSize: '20px',
                        opacity: isUnlocked(category.id, milestone.level) ? 1 : 0.3,
                        filter: isUnlocked(category.id, milestone.level) ? 'none' : 'grayscale(100%)',
                        transition: 'all 0.3s ease'
                      }}>
                        {milestone.icon}
                      </div>
                    ))}
                  </div>
                </div>

                {allCompleted ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '16px',
                    background: 'linear-gradient(135deg, rgba(185,242,255,0.2) 0%, rgba(0,229,255,0.2) 100%)',
                    borderRadius: '8px',
                    border: '2px solid rgba(185,242,255,0.5)'
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
                    <div style={{ color: '#00E5FF', fontSize: '16px', fontWeight: 700 }}>
                      Wszystkie poziomy ukończone!
                    </div>
                    <div style={{ color: '#B8B8D0', fontSize: '13px', marginTop: '4px' }}>
                      {completedMilestones}/{category.milestones.length} milestone'ów zdobytych
                    </div>
                  </div>
                ) : nextMilestone ? (
                  <div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '20px' }}>{nextMilestone.icon}</span>
                        <div>
                          <div style={{ 
                            fontSize: '14px', 
                            fontWeight: 700, 
                            color: getMilestoneColor(nextMilestone.level)
                          }}>
                            {nextMilestone.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#B8B8D0' }}>
                            {currentProgress.toLocaleString()} / {nextMilestone.target.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', fontSize: '11px', fontWeight: 600 }}>
                        <div style={{ 
                          padding: '4px 10px', 
                          background: 'rgba(255,215,0,0.2)', 
                          borderRadius: '6px',
                          color: '#FFD700'
                        }}>
                          +{nextMilestone.reward_fp} FP
                        </div>
                        <div style={{ 
                          padding: '4px 10px', 
                          background: 'rgba(0,229,255,0.2)', 
                          borderRadius: '6px',
                          color: '#00E5FF'
                        }}>
                          +{nextMilestone.reward_xp} XP
                        </div>
                      </div>
                    </div>

                    <ProgressBar value={currentProgress} max={nextMilestone.target} />
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      marginTop: '6px',
                      fontSize: '11px',
                      color: '#B8B8D0'
                    }}>
                      <span>{Math.round(progressToNext)}% ukończone</span>
                      <span>Brakuje: {(nextMilestone.target - currentProgress).toLocaleString()}</span>
                    </div>

                    <div style={{ 
                      marginTop: '8px',
                      fontSize: '11px',
                      color: '#888',
                      textAlign: 'center'
                    }}>
                      {completedMilestones}/{category.milestones.length} milestone'ów zdobytych
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </Card>
    </main>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '@features/auth';
import { Card, MaterialIcon, Spinner } from '@shared/ui';
import { 
  getAllSuggestions, 
  approveSuggestion, 
  rejectSuggestion,
  type SuggestedQuestion 
} from '@/services/suggestionService';

export default function AdminPanel() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<SuggestedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      console.log('🔄 AdminPanel: Loading suggestions...');
      const result = await getAllSuggestions('pending');
      console.log('📦 AdminPanel: Result from getAllSuggestions:', result);
      
      if (result.success && result.data) {
        console.log('✅ AdminPanel: Setting suggestions:', result.data.length, 'items');
        setSuggestions(result.data);
      } else {
        console.error('❌ AdminPanel: Failed to load suggestions:', result.error);
      }
    } catch (error) {
      console.error('❌ AdminPanel: Exception loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (suggestionId: string) => {
    if (!user) return;
    
    setProcessingId(suggestionId);
    try {
      const result = await approveSuggestion(suggestionId, user.id, 50, 100);
      if (result.success) {
        setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
      } else {
        alert(`Błąd: ${result.error}`);
      }
    } catch (error) {
      console.error('Error approving:', error);
      alert('Nie udało się zatwierdzić pytania');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (suggestionId: string) => {
    if (!user) return;

    setProcessingId(suggestionId);
    try {
      const result = await rejectSuggestion(suggestionId, user.id, rejectComment || undefined);
      if (result.success) {
        setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
        setShowRejectModal(null);
        setRejectComment('');
      } else {
        alert(`Błąd: ${result.error}`);
      }
    } catch (error) {
      console.error('Error rejecting:', error);
      alert('Nie udało się odrzucić pytania');
    } finally {
      setProcessingId(null);
    }
  };

  const getDifficultyBadge = (level: string) => {
    switch (level) {
      case 'easy':
        return <span style={{ color: '#4CAF50' }}>🟢 Łatwy (10 pkt)</span>;
      case 'medium':
        return <span style={{ color: '#FFC107' }}>🟡 Średni (20 pkt)</span>;
      case 'hard':
        return <span style={{ color: '#f44336' }}>🔴 Trudny (30 pkt)</span>;
      default:
        return null;
    }
  };

  return (
    <main className="main">
      <Card className="admin-page">
        <h2>🛡️ Panel Admina</h2>
        <p className="page-subtitle">Zarządzanie platformą QuizGame</p>

        <div className="admin-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 className="admin-section-title">Moderacja pytań</h3>
              <p className="section-desc">Pytania oczekujące na zatwierdzenie ({suggestions.length})</p>
            </div>
            <button 
              onClick={loadSuggestions}
              style={{
                padding: '10px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#E0E0E0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <MaterialIcon icon="refresh" size={18} />
              Odśwież
            </button>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Spinner />
              <p style={{ color: '#B0B0B0', marginTop: '16px' }}>Ładowanie propozycji...</p>
            </div>
          ) : suggestions.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
            }}>
              <MaterialIcon icon="check_circle" size={48} style={{ color: '#4CAF50', marginBottom: '12px' }} />
              <p style={{ color: '#E0E0E0', fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                Brak oczekujących propozycji
              </p>
              <p style={{ color: '#808080', fontSize: '14px' }}>
                Wszystkie pytania zostały rozpatrzone
              </p>
            </div>
          ) : (
            <div className="pending-questions">
              {suggestions.map(suggestion => (
                <div key={suggestion.id} className="pending-question-item">
                  <div className="pending-question-header">
                    <div className="pending-author">
                      <span className="author-avatar">👤</span>
                      <span className="author-name">{suggestion.author?.username || 'Nieznany'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="pending-category">{suggestion.category?.name || 'Bez kategorii'}</div>
                      <div style={{ fontSize: '13px' }}>
                        {getDifficultyBadge(suggestion.difficulty_level)}
                      </div>
                    </div>
                  </div>
                  <div className="pending-question-text">
                    {suggestion.question_text}
                  </div>
                  <div className="pending-answers">
                    <div className="pending-answer correct">{suggestion.correct_answer} ✓</div>
                    <div className="pending-answer">{suggestion.wrong_answer_1}</div>
                    <div className="pending-answer">{suggestion.wrong_answer_2}</div>
                    <div className="pending-answer">{suggestion.wrong_answer_3}</div>
                  </div>
                  <div className="pending-actions">
                    <button 
                      className="btn-small primary"
                      onClick={() => handleApprove(suggestion.id)}
                      disabled={processingId === suggestion.id}
                      style={{
                        opacity: processingId === suggestion.id ? 0.5 : 1,
                        cursor: processingId === suggestion.id ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {processingId === suggestion.id ? <Spinner /> : '✓ Zatwierdź'}
                    </button>
                    <button 
                      className="btn-small"
                      onClick={() => setShowRejectModal(suggestion.id)}
                      disabled={processingId === suggestion.id}
                      style={{
                        opacity: processingId === suggestion.id ? 0.5 : 1,
                        cursor: processingId === suggestion.id ? 'not-allowed' : 'pointer',
                      }}
                    >
                      ✗ Odrzuć
                    </button>
                  </div>

                  {/* Modal odrzucenia */}
                  {showRejectModal === suggestion.id && (
                    <div style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0,0,0,0.8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1000,
                    }}>
                      <div style={{
                        background: '#1A1A2E',
                        padding: '24px',
                        borderRadius: '16px',
                        maxWidth: '500px',
                        width: '90%',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}>
                        <h3 style={{ color: '#E0E0E0', marginBottom: '16px' }}>
                          Odrzuć pytanie
                        </h3>
                        <p style={{ color: '#B0B0B0', marginBottom: '16px', fontSize: '14px' }}>
                          Możesz dodać komentarz dla autora (opcjonalnie):
                        </p>
                        <textarea
                          value={rejectComment}
                          onChange={(e) => setRejectComment(e.target.value)}
                          placeholder="Np. Pytanie jest zbyt proste / Błędna odpowiedź / Duplikat..."
                          maxLength={500}
                          rows={4}
                          style={{
                            width: '100%',
                            padding: '12px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#E0E0E0',
                            fontSize: '14px',
                            marginBottom: '16px',
                            resize: 'vertical',
                          }}
                        />
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button
                            onClick={() => handleReject(suggestion.id)}
                            disabled={processingId === suggestion.id}
                            style={{
                              flex: 1,
                              padding: '12px',
                              background: '#f44336',
                              border: 'none',
                              borderRadius: '8px',
                              color: 'white',
                              fontWeight: 600,
                              cursor: processingId === suggestion.id ? 'not-allowed' : 'pointer',
                              opacity: processingId === suggestion.id ? 0.5 : 1,
                            }}
                          >
                            {processingId === suggestion.id ? <Spinner /> : 'Odrzuć pytanie'}
                          </button>
                          <button
                            onClick={() => {
                              setShowRejectModal(null);
                              setRejectComment('');
                            }}
                            disabled={processingId === suggestion.id}
                            style={{
                              flex: 1,
                              padding: '12px',
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px',
                              color: '#E0E0E0',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Anuluj
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </main>
  );
}

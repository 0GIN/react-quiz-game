import { useState, useEffect } from 'react';
import { useAuth } from '@features/auth';
import { Card, MaterialIcon, Spinner } from '@shared/ui';
import { getCategories } from '@/services/questionService';
import { createSuggestion, getUserSuggestions, type SuggestedQuestion } from '@/services/suggestionService';
import type { Category } from '@/types';
import '@/styles/ui.css';

export default function AddQuestion() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [mySuggestions, setMySuggestions] = useState<SuggestedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [historyOpenId, setHistoryOpenId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    category_id: '',
    difficulty_level: '' as 'easy' | 'medium' | 'hard' | '',
    question_text: '',
    correct_answer: '',
    wrong_answer_1: '',
    wrong_answer_2: '',
    wrong_answer_3: '',
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [cats, suggestions] = await Promise.all([
        getCategories(),
        getUserSuggestions(user.id),
      ]);

      setCategories(cats);
      // Uzupełnij nick moderatora gdy relacja nie jest dostępna przez RLS
      const enriched = await Promise.all(
        (suggestions || []).map(async (s) => {
          if (!s.reviewer && s.reviewed_by) {
            try {
              const { username } = await fetchReviewerUsername(s.reviewed_by);
              return { ...s, reviewer: { id: s.reviewed_by, username } } as any;
            } catch {
              return s;
            }
          }
          return s;
        })
      );
      setMySuggestions(enriched);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return;

    // Walidacja
    if (!formData.category_id || !formData.difficulty_level) {
      alert('Wybierz kategorię i poziom trudności');
      return;
    }

    if (formData.question_text.length < 10) {
      alert('Pytanie musi mieć co najmniej 10 znaków');
      return;
    }

    const answers = [
      formData.correct_answer,
      formData.wrong_answer_1,
      formData.wrong_answer_2,
      formData.wrong_answer_3,
    ];

    if (answers.some(a => !a.trim())) {
      alert('Wszystkie odpowiedzi są wymagane');
      return;
    }

    setSubmitting(true);

    try {
      const result = await createSuggestion(user.id, {
        category_id: parseInt(formData.category_id),
        difficulty_level: formData.difficulty_level as 'easy' | 'medium' | 'hard',
        question_text: formData.question_text,
        correct_answer: formData.correct_answer,
        wrong_answer_1: formData.wrong_answer_1,
        wrong_answer_2: formData.wrong_answer_2,
        wrong_answer_3: formData.wrong_answer_3,
      });

      if (result.success) {
        setShowSuccess(true);
        // Reset form
        setFormData({
          category_id: '',
          difficulty_level: '',
          question_text: '',
          correct_answer: '',
          wrong_answer_1: '',
          wrong_answer_2: '',
          wrong_answer_3: '',
        });
        // Odśwież listę
        loadData();

        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        alert(`Błąd: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      alert('Nie udało się wysłać propozycji');
    } finally {
      setSubmitting(false);
    }
  };

  // Pomocnicza funkcja: pobierz nick moderatora po ID
  async function fetchReviewerUsername(userId: string): Promise<{ username: string }> {
    const { supabase } = await import('@/lib/supabase');
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .single();
    if (error || !data) throw error || new Error('Brak danych użytkownika');
    return { username: data.username as string };
  }

  const handleReset = () => {
    setFormData({
      category_id: '',
      difficulty_level: '',
      question_text: '',
      correct_answer: '',
      wrong_answer_1: '',
      wrong_answer_2: '',
      wrong_answer_3: '',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span style={{ padding: '4px 12px', background: 'rgba(255,193,7,0.2)', color: '#FFC107', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>⏳ Oczekuje</span>;
      case 'approved':
        return <span style={{ padding: '4px 12px', background: 'rgba(76,175,80,0.2)', color: '#4CAF50', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>✅ Zaakceptowano</span>;
      case 'rejected':
        return <span style={{ padding: '4px 12px', background: 'rgba(244,67,54,0.2)', color: '#f44336', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>❌ Odrzucono</span>;
      case 'edited':
        return <span style={{ padding: '4px 12px', background: 'rgba(33,150,243,0.2)', color: '#2196F3', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>✏️ Edytowano</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <main className="main">
        <div style={{ gridColumn: 'span 12' }}>
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Spinner />
              <p style={{ color: '#B0B0B0', marginTop: '16px' }}>Ładowanie...</p>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="main" role="main">
      <div style={{ gridColumn: 'span 12' }}>
        <Card>
          <div style={{ padding: '24px' }}>
            <h1 style={{ fontSize: '28px', color: '#E0E0E0', marginBottom: '8px' }}>
              ➕ Dodaj Pytanie
            </h1>
            <p style={{ color: '#B0B0B0', marginBottom: '24px' }}>
              Pomóż nam rozwijać bazę pytań! Twoje pytania po zatwierdzeniu będą dostępne dla wszystkich graczy.
            </p>

            {showSuccess && (
              <div style={{
                padding: '16px',
                background: 'rgba(76,175,80,0.1)',
                border: '1px solid rgba(76,175,80,0.3)',
                borderRadius: '12px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <MaterialIcon icon="check_circle" size={24} style={{ color: '#4CAF50' }} />
                <div>
                  <div style={{ color: '#4CAF50', fontWeight: 600, marginBottom: '4px' }}>
                    Propozycja wysłana!
                  </div>
                  <div style={{ color: '#B0B0B0', fontSize: '14px' }}>
                    Otrzymasz 50 FP i 100 XP po zatwierdzeniu przez admina
                  </div>
                </div>
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!user || submitting) return;
                if (editId) {
                  // Ponowne zgłoszenie odrzuconej propozycji po edycji
                  setSubmitting(true);
                  try {
                    const { resubmitSuggestion } = await import('@/services/suggestionService');
                    const result = await resubmitSuggestion(editId, {
                      category_id: parseInt(formData.category_id),
                      difficulty_level: formData.difficulty_level as 'easy' | 'medium' | 'hard',
                      question_text: formData.question_text,
                      correct_answer: formData.correct_answer,
                      wrong_answer_1: formData.wrong_answer_1,
                      wrong_answer_2: formData.wrong_answer_2,
                      wrong_answer_3: formData.wrong_answer_3,
                    });
                    if (result.success) {
                      setShowSuccess(true);
                      setEditId(null);
                      setFormData({
                        category_id: '',
                        difficulty_level: '',
                        question_text: '',
                        correct_answer: '',
                        wrong_answer_1: '',
                        wrong_answer_2: '',
                        wrong_answer_3: '',
                      });
                      loadData();
                      setTimeout(() => setShowSuccess(false), 5000);
                    } else {
                      alert(`Błąd: ${result.error}`);
                    }
                  } catch (err) {
                    console.error('Resubmit error:', err);
                    alert('Nie udało się wysłać ponownie propozycji');
                  } finally {
                    setSubmitting(false);
                  }
                  return;
                }
                await handleSubmit(e as any);
              }}
            >
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: '#E0E0E0', marginBottom: '8px', fontWeight: 600 }}>
                    Kategoria *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#E0E0E0',
                      fontSize: '14px',
                    }}
                  >
                    <option value="">Wybierz kategorię...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#E0E0E0', marginBottom: '8px', fontWeight: 600 }}>
                    Poziom trudności *
                  </label>
                  <select
                    value={formData.difficulty_level}
                    onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value as any })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#E0E0E0',
                      fontSize: '14px',
                    }}
                  >
                    <option value="">Wybierz poziom...</option>
                    <option value="easy">🟢 Łatwy (10 pkt)</option>
                    <option value="medium">🟡 Średni (20 pkt)</option>
                    <option value="hard">🔴 Trudny (30 pkt)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#E0E0E0', marginBottom: '8px', fontWeight: 600 }}>
                    Treść pytania * <span style={{ color: '#808080', fontSize: '13px' }}>({formData.question_text.length}/500)</span>
                  </label>
                  <textarea
                    value={formData.question_text}
                    onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                    required
                    maxLength={500}
                    rows={3}
                    placeholder="Wpisz treść pytania..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#E0E0E0',
                      fontSize: '14px',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#4CAF50', marginBottom: '8px', fontWeight: 600 }}>
                    ✓ Poprawna odpowiedź *
                  </label>
                  <input
                    type="text"
                    value={formData.correct_answer}
                    onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                    required
                    maxLength={200}
                    placeholder="Wpisz poprawną odpowiedź..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(76,175,80,0.1)',
                      border: '1px solid rgba(76,175,80,0.3)',
                      borderRadius: '8px',
                      color: '#E0E0E0',
                      fontSize: '14px',
                    }}
                  />
                </div>

                {[1, 2, 3].map(num => (
                  <div key={num}>
                    <label style={{ display: 'block', color: '#E0E0E0', marginBottom: '8px', fontWeight: 600 }}>
                      Błędna odpowiedź #{num} *
                    </label>
                    <input
                      type="text"
                      value={formData[`wrong_answer_${num}` as keyof typeof formData] as string}
                      onChange={(e) => setFormData({ ...formData, [`wrong_answer_${num}`]: e.target.value })}
                      required
                      maxLength={200}
                      placeholder="Wpisz błędną odpowiedź..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#E0E0E0',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                ))}

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      flex: 1,
                      padding: '14px 24px',
                      background: submitting ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #00E5FF 0%, #00B8D4 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      color: submitting ? '#808080' : '#0A0A1A',
                      fontWeight: 600,
                      fontSize: '15px',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    {submitting ? (
                      <>
                        <Spinner />
                        Wysyłanie...
                      </>
                    ) : (
                      <>
                        <MaterialIcon icon="send" size={20} />
                        {editId ? 'Wyślij ponownie' : 'Wyślij pytanie'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    style={{
                      padding: '14px 24px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#B0B0B0',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Wyczyść
                  </button>
                </div>

                <div style={{
                  padding: '16px',
                  background: 'rgba(33,150,243,0.1)',
                  border: '1px solid rgba(33,150,243,0.3)',
                  borderRadius: '12px',
                  marginTop: '8px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <MaterialIcon icon="info" size={20} style={{ color: '#2196F3' }} />
                    <strong style={{ color: '#2196F3' }}>Uwaga</strong>
                  </div>
                  <p style={{ color: '#B0B0B0', fontSize: '14px', margin: 0 }}>
                    Wszystkie pytania przechodzą proces weryfikacji. Za zatwierdzone pytania otrzymasz <strong style={{ color: '#00E5FF' }}>50 FP</strong> i <strong style={{ color: '#FFC107' }}>100 XP</strong>!
                  </p>
                </div>
              </div>
            </form>

            {/* Moje propozycje */}
            {mySuggestions.length > 0 && (
              <div style={{ marginTop: '40px' }}>
                <h2 style={{ fontSize: '20px', color: '#E0E0E0', marginBottom: '16px' }}>
                  📋 Twoje propozycje ({mySuggestions.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {mySuggestions.map(suggestion => (
                    <div
                      key={suggestion.id}
                      style={{
                        padding: '16px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: '#E0E0E0', fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>
                            {suggestion.question_text}
                          </div>
                          <div style={{ color: '#808080', fontSize: '13px' }}>
                            {suggestion.category?.name} • {suggestion.difficulty_level === 'easy' ? '🟢 Łatwy' : suggestion.difficulty_level === 'medium' ? '🟡 Średni' : '🔴 Trudny'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {getStatusBadge(suggestion.status)}
                          {suggestion.status === 'approved' && (
                            <span style={{ color: '#A0A0A0', fontSize: '12px' }}>
                              Zaakceptowano przez {suggestion.reviewer?.username || 'moderatora'}{suggestion.reviewed_at ? `, ${new Date(suggestion.reviewed_at).toLocaleDateString()}` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Komentarz admina widoczny tylko gdy odrzucono */}
                      {suggestion.admin_comment && suggestion.status === 'rejected' && (
                        <div style={{
                          marginTop: '12px',
                          padding: '12px',
                          background: 'rgba(255,193,7,0.1)',
                          border: '1px solid rgba(255,193,7,0.3)',
                          borderRadius: '8px',
                        }}>
                          <div style={{ color: '#FFC107', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                            💬 Komentarz admina:
                          </div>
                          <div style={{ color: '#B0B0B0', fontSize: '13px' }}>
                            {suggestion.admin_comment}
                          </div>
                        </div>
                      )}

                      {/* Historia pytania (toggle) — ukryta dla zaakceptowanych */}
                      {suggestion.status !== 'approved' && (
                        <div style={{ marginTop: '10px' }}>
                          <button
                            type="button"
                            onClick={() => setHistoryOpenId(prev => (prev === suggestion.id ? null : suggestion.id))}
                            style={{
                              padding: '8px 12px',
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px',
                              color: '#E0E0E0',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            {historyOpenId === suggestion.id ? 'Ukryj historię' : 'Pokaż historię'}
                          </button>

                          {historyOpenId === suggestion.id && (
                            <div style={{
                              marginTop: '10px',
                              padding: '12px',
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: '8px',
                              color: '#C0C0C0',
                              fontSize: '13px',
                            }}>
                              <div style={{ marginBottom: '6px' }}>
                                <strong>Status:</strong> {suggestion.status}
                              </div>
                              {suggestion.reviewed_by && (
                                <div style={{ marginBottom: '6px' }}>
                                  <strong>Moderator:</strong> {suggestion.reviewer?.username || suggestion.reviewed_by}
                                </div>
                              )}
                              {suggestion.reviewed_at && (
                                <div style={{ marginBottom: '6px' }}>
                                  <strong>Zweryfikowano:</strong> {new Date(suggestion.reviewed_at).toLocaleString()}
                                </div>
                              )}
                              {suggestion.admin_comment && suggestion.status !== 'rejected' && (
                                <div style={{ marginTop: '8px' }}>
                                  <strong>Poprzedni komentarz:</strong>
                                  <div style={{ marginTop: '4px', color: '#A0A0A0' }}>{suggestion.admin_comment}</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      {suggestion.status === 'rejected' && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditId(suggestion.id);
                              setFormData({
                                category_id: String(suggestion.category_id),
                                difficulty_level: suggestion.difficulty_level,
                                question_text: suggestion.question_text,
                                correct_answer: suggestion.correct_answer,
                                wrong_answer_1: suggestion.wrong_answer_1,
                                wrong_answer_2: suggestion.wrong_answer_2,
                                wrong_answer_3: suggestion.wrong_answer_3,
                              });
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            style={{
                              padding: '10px 14px',
                              background: 'rgba(33,150,243,0.15)',
                              border: '1px solid rgba(33,150,243,0.35)',
                              borderRadius: '10px',
                              color: '#E0E0E0',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            ✏️ Edytuj i wyślij ponownie
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}

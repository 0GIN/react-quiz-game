import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function TestQuestions() {
  const [status, setStatus] = useState('Testowanie połączenia...');
  const [questions, setQuestions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        console.log('🧪 Testing Supabase connection...');
        setStatus('Łączenie z bazą danych...');

        // Test 1: Podstawowe zapytanie
        const { data, error, count } = await supabase
          .from('questions')
          .select('*', { count: 'exact' });

        if (error) {
          console.error('❌ Supabase Error:', error);
          setError(`Błąd Supabase: ${error.message}`);
          setStatus('❌ Błąd połączenia');
          return;
        }

        console.log('✅ Total questions in database:', count);
        console.log('📦 Sample data:', data?.slice(0, 3));

        setStatus(`✅ Połączono! Znaleziono ${count} pytań`);
        setQuestions(data || []);

        // Test 2: Pytania z filtrem
        const { data: activeQuestions } = await supabase
          .from('questions')
          .select('*')
          .eq('is_approved', true)
          .eq('is_active', true);

        console.log('✅ Active & approved questions:', activeQuestions?.length);

      } catch (err) {
        console.error('❌ Exception:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('❌ Wyjątek JavaScript');
      }
    }

    testConnection();
  }, []);

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', background: '#0A0E27', minHeight: '100vh', color: 'white' }}>
      <h1>🧪 Test Połączenia z Bazą Danych</h1>
      
      <div style={{ background: 'rgba(0,229,255,0.1)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
        <h2>Status:</h2>
        <p style={{ fontSize: '1.2rem' }}>{status}</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(255,0,0,0.2)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
          <h2>❌ Błąd:</h2>
          <pre>{error}</pre>
        </div>
      )}

      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px' }}>
        <h2>📊 Pytania ({questions.length}):</h2>
        {questions.slice(0, 5).map((q, i) => (
          <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '10px 0' }}>
            <strong>ID:</strong> {q.id}<br />
            <strong>Pytanie:</strong> {q.question_text}<br />
            <strong>Kategoria:</strong> {q.category_id} | <strong>Poziom:</strong> {q.difficulty_level}<br />
            <strong>Aktywne:</strong> {q.is_active ? '✅' : '❌'} | <strong>Zatwierdzone:</strong> {q.is_approved ? '✅' : '❌'}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button 
          onClick={() => window.location.href = '/'}
          style={{ padding: '12px 24px', background: '#00E5FF', color: '#0A0E27', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ← Powrót do Home
        </button>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:3000';

export default function QuizPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const cvScore = location.state?.cvScore || 0;

  const [quiz, setQuiz] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.post(`${API}/quizzes/generate/${jobId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setQuiz(res.data);
      setSessionId(res.data.sessionId);
    })
    .catch(err => setError(err.response?.data?.message || 'Erreur chargement quiz'))
    .finally(() => setLoading(false));
  }, [jobId]);

  const handleNext = () => {
    const currentSelection = selected;
    if (currentSelection === null || currentSelection === undefined) return;

    const newAnswer = { questionIndex: currentQ, answerIndex: Number(currentSelection) };
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    setSelected(null);

    if (currentQ < quiz.questions.length - 1) {
      setTimeout(() => setCurrentQ(prev => prev + 1), 50);
    } else {
      handleSubmit(updatedAnswers);
    }
  };

  const handleSubmit = async (finalAnswers) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(`${API}/quizzes/submit`, {
        sessionId,
        answers: finalAnswers
      }, { headers: { Authorization: `Bearer ${token}` } });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur soumission');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !result) return (
    <div style={styles.loadingWrap}>
      <div style={styles.spinner} />
      <span style={styles.loadingText}>Génération du quiz IA...</span>
    </div>
  );

  if (error) return (
    <div style={styles.errorWrap}>
      <div style={styles.errorIcon}>!</div>
      <p style={styles.errorText}>{error}</p>
    </div>
  );

  /* ── RESULT SCREEN ── */
  if (result) {
    const finalScore = Math.round((cvScore + result.score) / 2);
    const passed = finalScore >= 70;
    return (
      <div style={styles.pageWrap}>
        <div style={styles.resultCard}>
          <div style={{ ...styles.resultBadge, background: passed ? '#EAF3DE' : '#FAEEDA', color: passed ? '#3B6D11' : '#854F0B' }}>
            {passed ? 'Profil recommandé' : 'En cours d\'évaluation'}
          </div>

          <h2 style={styles.resultTitle}>
            {passed ? 'Félicitations !' : 'Résultat du quiz'}
          </h2>
          <p style={styles.resultSub}>
            {passed
              ? 'Votre profil correspond aux exigences du poste.'
              : 'Votre dossier sera examiné par l\'équipe RH.'}
          </p>

          <div style={styles.scoreGrid}>
            <div style={styles.scoreCard}>
              <span style={styles.scoreLabel}>Score CV</span>
              <span style={{ ...styles.scoreValue, color: '#378ADD' }}>{cvScore}%</span>
            </div>
            <div style={styles.scoreDivider} />
            <div style={styles.scoreCard}>
              <span style={styles.scoreLabel}>Score Quiz</span>
              <span style={{ ...styles.scoreValue, color: '#1D9E75' }}>{result.score}%</span>
            </div>
          </div>

          <div style={{ ...styles.finalBand, background: passed ? '#EAF3DE' : '#FAEEDA', color: passed ? '#3B6D11' : '#854F0B', border: `1px solid ${passed ? '#97C459' : '#EF9F27'}` }}>
            <span style={styles.finalLabel}>Score final</span>
            <span style={styles.finalScore}>{finalScore}%</span>
          </div>

          <button style={styles.btnPrimary} onClick={() => navigate('/candidate/my-applications')}>
            Voir mes candidatures
          </button>
        </div>
      </div>
    );
  }

  /* ── QUIZ SCREEN ── */
  const question = quiz.questions[currentQ];
  const progress = ((currentQ + 1) / quiz.questions.length) * 100;
  const isLast = currentQ === quiz.questions.length - 1;

  return (
    <div style={styles.pageWrap}>
      <div style={styles.quizWrap}>

        {/* Header */}
        <div style={styles.quizHeader}>
          <span style={styles.metaBadge}>Question {currentQ + 1} / {quiz.questions.length}</span>
          <span style={styles.metaBadge}>{quiz.durationMinutes} min</span>
        </div>

        {/* Progress bar */}
        <div style={styles.progressBg}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>

        {/* Question card */}
        <div style={styles.card}>
          <p style={styles.questionText}>{question.question}</p>

          <div style={styles.optionsList}>
            {question.options.map((opt, i) => {
              const isSelected = selected === i;
              return (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  style={{
                    ...styles.optBtn,
                    border: isSelected ? '1.5px solid #378ADD' : '1px solid rgba(0,0,0,0.1)',
                    background: isSelected ? '#EBF4FD' : '#fff',
                  }}
                >
                  <span style={{
                    ...styles.optLabel,
                    background: isSelected ? '#378ADD' : 'transparent',
                    border: isSelected ? '1.5px solid #378ADD' : '1px solid rgba(0,0,0,0.18)',
                    color: isSelected ? '#fff' : '#888',
                  }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span style={styles.optText}>{opt}</span>
                </button>
              );
            })}
          </div>

          <div style={styles.btnRow}>
            <button
              onClick={handleNext}
              disabled={selected === null || selected === undefined || loading}
              style={{
                ...styles.btnNext,
                opacity: (selected !== null && !loading) ? 1 : 0.4,
                cursor: (selected !== null && !loading) ? 'pointer' : 'not-allowed',
              }}
            >
              {loading ? 'Chargement...' : isLast ? 'Terminer' : 'Suivant'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── STYLES ── */
const styles = {
  pageWrap: {
    minHeight: '100vh',
    background: '#F7F8FA',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '40px 16px',
  },
  quizWrap: {
    width: '100%',
    maxWidth: 640,
  },
  quizHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaBadge: {
    fontSize: 13,
    color: '#666',
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.09)',
    borderRadius: 8,
    padding: '4px 12px',
    fontWeight: 500,
  },
  progressBg: {
    height: 5,
    background: '#E4E7EC',
    borderRadius: 99,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#378ADD',
    borderRadius: 99,
    transition: 'width 0.35s cubic-bezier(.4,0,.2,1)',
  },
  card: {
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: 16,
    padding: '28px 28px 24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  questionText: {
    fontSize: 17,
    fontWeight: 600,
    color: '#1a1a1a',
    lineHeight: 1.55,
    marginBottom: 20,
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  optBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '13px 16px',
    borderRadius: 10,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s',
    width: '100%',
  },
  optLabel: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
    transition: 'all 0.15s',
  },
  optText: {
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 1.4,
    flex: 1,
  },
  btnRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  btnNext: {
    background: '#378ADD',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '12px 28px',
    fontSize: 14,
    fontWeight: 600,
    transition: 'background 0.15s, opacity 0.15s',
  },
  /* Result */
  resultCard: {
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: 20,
    padding: '36px 32px',
    maxWidth: 480,
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  resultBadge: {
    display: 'inline-block',
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 99,
    padding: '4px 14px',
    marginBottom: 16,
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#1a1a1a',
    marginBottom: 6,
  },
  resultSub: {
    fontSize: 14,
    color: '#666',
    marginBottom: 28,
    lineHeight: 1.5,
  },
  scoreGrid: {
    display: 'flex',
    alignItems: 'center',
    background: '#F7F8FA',
    border: '1px solid rgba(0,0,0,0.07)',
    borderRadius: 12,
    padding: '20px 24px',
    marginBottom: 16,
  },
  scoreCard: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  scoreDivider: {
    width: 1,
    height: 40,
    background: 'rgba(0,0,0,0.1)',
    margin: '0 16px',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  scoreValue: {
    fontSize: 34,
    fontWeight: 700,
  },
  finalBand: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    padding: '14px 20px',
    marginBottom: 24,
  },
  finalLabel: {
    fontSize: 14,
    fontWeight: 500,
  },
  finalScore: {
    fontSize: 22,
    fontWeight: 700,
  },
  btnPrimary: {
    width: '100%',
    background: '#378ADD',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '13px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  /* Loading */
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: 14,
  },
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid #E4E7EC',
    borderTop: '3px solid #378ADD',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    fontSize: 14,
    color: '#888',
  },
  /* Error */
  errorWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '40vh',
    gap: 12,
  },
  errorIcon: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: '#FCEBEB',
    color: '#A32D2D',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    fontWeight: 700,
  },
  errorText: {
    fontSize: 14,
    color: '#A32D2D',
  },
};
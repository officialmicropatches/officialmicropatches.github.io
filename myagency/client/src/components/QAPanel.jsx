import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { api } from '../lib/api';
import QuestionThread from './QuestionThread';

export default function QAPanel({ agencyId, slug }) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [questionText, setQuestionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.getQuestions(slug, 1)
      .then((data) => { setQuestions(data.questions); setTotal(data.total); setPage(1); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  async function submitQuestion() {
    if (!questionText.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const q = await api.postQuestion({ agency_id: agencyId, body: questionText.trim() });
      setQuestions((prev) => [{ ...q, question_replies: [] }, ...prev]);
      setTotal((t) => t + 1);
      setQuestionText('');
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function loadMore() {
    const next = page + 1;
    const data = await api.getQuestions(slug, next);
    setQuestions((prev) => [...prev, ...data.questions]);
    setPage(next);
  }

  function handleReplyAdded(questionId, reply) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, question_replies: [...(q.question_replies || []), reply] }
          : q
      )
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-text-primary">Community Q&A</h3>
        {total > 0 && <span className="text-xs text-text-secondary">{total} question{total !== 1 ? 's' : ''}</span>}
      </div>

      {user ? (
        <div className="mb-6">
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Ask anonymously about this agency — morale, specialties, lateral culture, schedules..."
            rows={3}
            className="w-full px-4 py-3 text-sm border border-border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy/40 shadow-card"
          />
          {error && <p className="text-xs text-grade-f mt-1">{error}</p>}
          <button
            onClick={submitQuestion}
            disabled={submitting || !questionText.trim()}
            className="mt-2.5 bg-navy text-white text-sm px-5 py-2.5 rounded-full disabled:opacity-50 hover:bg-navy-hover transition-colors"
          >
            {submitting ? 'Posting...' : 'Post Question'}
          </button>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-bg border border-border rounded-2xl text-sm text-text-secondary">
          <Link to="/login" className="text-navy hover:underline font-medium">Log in</Link> or{' '}
          <Link to="/signup" className="text-navy hover:underline font-medium">sign up</Link> to ask a question anonymously.
        </div>
      )}

      {loading ? (
        <div className="py-10 flex justify-center">
          <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin" />
        </div>
      ) : questions.length === 0 ? (
        <p className="text-text-secondary text-sm text-center py-10">No questions yet. Be the first to ask one.</p>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <QuestionThread key={q.id} question={q} onReplyAdded={handleReplyAdded} />
          ))}
          {questions.length < total && (
            <button
              onClick={loadMore}
              className="w-full py-3 text-sm text-navy border border-border rounded-2xl hover:bg-bg transition-colors"
            >
              Load more questions
            </button>
          )}
        </div>
      )}
    </div>
  );
}

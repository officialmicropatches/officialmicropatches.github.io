import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { api } from '../lib/api';

const CATEGORIES = [
  { key: 'grade_communication', label: 'Leadership Communication', desc: 'How well does command communicate direction and decisions?' },
  { key: 'grade_fairness', label: 'Fairness', desc: 'Are discipline and policies applied consistently across the department?' },
  { key: 'grade_accountability', label: 'Accountability', desc: 'Does leadership hold itself to the same standards it expects from officers?' },
  { key: 'grade_backing_officers', label: 'Backs Officers', desc: 'Does command back officers who act in good faith during critical incidents?' },
  { key: 'grade_morale', label: 'Morale', desc: 'Overall effect of leadership decisions on department morale and culture.' },
  { key: 'grade_promotion_fairness', label: 'Promotion Fairness', desc: 'Are promotions merit-based and free of favoritism or political influence?' },
  { key: 'grade_work_life', label: 'Work/Life Balance', desc: 'Does leadership support reasonable schedules, days off, and wellness?' },
  { key: 'grade_toxic_leadership', label: 'Toxic Leadership', desc: 'Is the command climate free of retaliation, bullying, and manipulation?' },
];

const GRADES = ['A', 'B', 'C', 'D', 'F'];

const GRADE_ACTIVE = {
  A: 'bg-green-100 text-grade-a border-grade-a',
  B: 'bg-lime-100 text-grade-b border-lime-500',
  C: 'bg-amber-100 text-grade-c border-amber-500',
  D: 'bg-orange-100 text-grade-d border-orange-500',
  F: 'bg-red-100 text-grade-f border-grade-f',
};

export default function RateAgencyModal({ agencyId, agencyName, onClose, onSuccess }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [grades, setGrades] = useState({});
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const allGraded = CATEGORIES.every((c) => grades[c.key]);
  const progress = CATEGORIES.filter((c) => grades[c.key]).length;

  if (!user) {
    return (
      <ModalShell onClose={onClose} title="Rate This Agency">
        <p className="text-sm text-text-secondary mb-5">You must be logged in to submit a review. Your identity is always anonymous.</p>
        <div className="flex gap-2">
          <Link to="/login" onClick={onClose} className="flex-1 text-center bg-navy text-white text-sm py-3 rounded-full hover:bg-navy-hover transition-colors">Log in</Link>
          <Link to="/signup" onClick={onClose} className="flex-1 text-center border border-navy text-navy text-sm py-3 rounded-full hover:bg-bg transition-colors">Sign up</Link>
        </div>
      </ModalShell>
    );
  }

  if (success) {
    return (
      <ModalShell onClose={onClose} title="Review Submitted">
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4,10 8,14 16,6" />
            </svg>
          </div>
          <p className="text-sm text-text-secondary mb-5">Your anonymous review has been submitted. Thank you for helping officers make informed decisions.</p>
          <button onClick={onClose} className="w-full bg-navy text-white text-sm py-3 rounded-full hover:bg-navy-hover transition-colors">Done</button>
        </div>
      </ModalShell>
    );
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      await api.submitAgencyReview({ agency_id: agencyId, ...grades, review_text: reviewText.trim() || undefined });
      setSuccess(true);
      onSuccess?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalShell onClose={onClose} title={step === 0 ? `Rate ${agencyName}` : step === 1 ? 'Rate categories' : 'Add your experience'}>
      {step === 0 && (
        <div>
          <div className="bg-bg border border-border rounded-xl p-4 mb-6 text-sm text-text-secondary leading-relaxed">
            <strong className="text-text-primary">Anonymity guaranteed.</strong> No badge number, department email, or identifying information is collected. Rate only what leadership controls — not equipment, facilities, or pay.
          </div>
          <button onClick={() => setStep(1)} className="w-full bg-navy text-white text-sm py-3.5 rounded-full hover:bg-navy-hover transition-colors font-medium">
            Start Rating
          </button>
        </div>
      )}

      {step === 1 && (
        <div>
          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex-1 h-1.5 bg-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-navy rounded-full transition-all"
                style={{ width: `${(progress / CATEGORIES.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-text-secondary shrink-0">{progress}/{CATEGORIES.length}</span>
          </div>

          <div className="space-y-5 mb-6 max-h-[52vh] overflow-y-auto scrollbar-hide pr-1">
            {CATEGORIES.map(({ key, label, desc }) => (
              <div key={key}>
                <p className="text-sm font-semibold text-text-primary mb-0.5">{label}</p>
                <p className="text-xs text-text-secondary mb-2">{desc}</p>
                <div className="flex gap-1.5">
                  {GRADES.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGrades((prev) => ({ ...prev, [key]: g }))}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-colors ${
                        grades[key] === g ? GRADE_ACTIVE[g] : 'border-border text-text-secondary hover:border-navy/30 hover:bg-bg'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={!allGraded}
            className="w-full bg-navy text-white text-sm py-3.5 rounded-full disabled:opacity-40 hover:bg-navy-hover transition-colors font-medium"
          >
            {allGraded ? 'Continue' : `Rate all ${CATEGORIES.length} categories to continue`}
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="text-sm text-text-secondary mb-3">Share more about your experience (optional)</p>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="What would current officers or laterals want to know about this agency's leadership culture?"
            rows={5}
            className="w-full px-4 py-3 text-sm border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy/40 mb-4"
          />
          {error && <p className="text-xs text-grade-f mb-3">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-navy text-white text-sm py-3.5 rounded-full disabled:opacity-50 hover:bg-navy-hover transition-colors font-medium"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              onClick={() => setStep(1)}
              className="flex-1 border border-border text-text-primary text-sm py-3.5 rounded-full hover:bg-bg transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/25" onClick={onClose}>
      <div
        className="bg-surface rounded-t-2xl sm:rounded-2xl shadow-modal w-full sm:max-w-md p-6 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg text-text-primary leading-tight pr-4">{title}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-2xl leading-none shrink-0">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

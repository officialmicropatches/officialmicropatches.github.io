import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { api } from '../lib/api';

const RANKS = ['Sergeant', 'Lieutenant', 'Captain', 'Commander', 'Deputy Chief', 'Chief'];

const CATEGORIES = [
  { key: 'grade_communication', label: 'Communication', desc: 'How well does this rank communicate with officers?' },
  { key: 'grade_fairness', label: 'Fairness', desc: 'Are discipline and decisions applied consistently at this rank?' },
  { key: 'grade_accountability', label: 'Accountability', desc: 'Does this rank hold itself accountable?' },
  { key: 'grade_backing_officers', label: 'Backing Officers', desc: 'Does this rank back officers acting in good faith?' },
  { key: 'grade_toxic_behavior', label: 'Toxic Behavior', desc: 'Is this rank free from bullying, retaliation, and manipulation?' },
  { key: 'grade_promotion_fairness', label: 'Promotion Fairness', desc: 'Are decisions made at this rank merit-based?' },
  { key: 'grade_work_life', label: 'Work/Life Balance', desc: 'Does this rank support reasonable schedules?' },
  { key: 'grade_morale_impact', label: 'Morale Impact', desc: 'Does this rank positively or negatively affect morale?' },
];

const GRADES = ['A', 'B', 'C', 'D', 'F'];

const GRADE_COLORS = {
  A: 'bg-green-100 text-grade-a border-grade-a',
  B: 'bg-lime-100 text-grade-b border-grade-b',
  C: 'bg-amber-100 text-grade-c border-grade-c',
  D: 'bg-orange-100 text-grade-d border-grade-d',
  F: 'bg-red-100 text-grade-f border-grade-f',
};

export default function RateSupervisorModal({ agencyId, agencyName, onClose, onSuccess }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedRank, setSelectedRank] = useState('');
  const [grades, setGrades] = useState({});
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const allGraded = CATEGORIES.every((c) => grades[c.key]);

  if (!user) {
    return (
      <ModalShell onClose={onClose} title="Rate a Supervisor">
        <p className="text-sm text-text-secondary mb-4">You must be logged in to submit a review.</p>
        <div className="flex gap-2">
          <Link to="/login" onClick={onClose} className="flex-1 text-center bg-navy text-white text-sm py-2.5 rounded-full hover:bg-navy-hover transition-colors">Log in</Link>
          <Link to="/signup" onClick={onClose} className="flex-1 text-center border border-navy text-navy text-sm py-2.5 rounded-full hover:bg-bg transition-colors">Sign up</Link>
        </div>
      </ModalShell>
    );
  }

  if (success) {
    return (
      <ModalShell onClose={onClose} title="Review Submitted">
        <p className="text-sm text-text-secondary mb-4">Your anonymous supervisor review has been submitted. Thank you.</p>
        <button onClick={onClose} className="w-full bg-navy text-white text-sm py-2.5 rounded-full hover:bg-navy-hover transition-colors">Done</button>
      </ModalShell>
    );
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      await api.submitSupervisorReview({
        agency_id: agencyId,
        rank: selectedRank,
        ...grades,
        review_text: reviewText.trim() || undefined,
      });
      setSuccess(true);
      onSuccess?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalShell onClose={onClose} title={`Rate a Supervisor — ${agencyName}`}>
      {step === 0 && (
        <div>
          <p className="text-sm font-medium text-text-primary mb-1">Which rank are you reviewing?</p>
          <p className="text-xs text-text-secondary mb-4">You are rating the rank, not an individual. No names will be collected.</p>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {RANKS.map((rank) => (
              <button
                key={rank}
                onClick={() => setSelectedRank(rank)}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-colors ${
                  selectedRank === rank
                    ? 'border-navy bg-navy/5 text-navy'
                    : 'border-border text-text-primary hover:bg-bg'
                }`}
              >
                {rank}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(1)}
            disabled={!selectedRank}
            className="w-full bg-navy text-white text-sm py-3 rounded-full disabled:opacity-50 hover:bg-navy-hover transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {step === 1 && (
        <div>
          <div className="p-4 bg-bg border border-border rounded-xl mb-5 text-sm text-text-secondary leading-relaxed">
            Ratings are anonymous. Rate only what leadership controls — not equipment, pay, or facilities.
          </div>
          <div className="space-y-5 mb-6 max-h-[55vh] overflow-y-auto pr-1">
            {CATEGORIES.map(({ key, label, desc }) => (
              <div key={key}>
                <p className="text-sm font-medium text-text-primary mb-0.5">{label}</p>
                <p className="text-xs text-text-secondary mb-2">{desc}</p>
                <div className="flex gap-2">
                  {GRADES.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGrades((prev) => ({ ...prev, [key]: g }))}
                      className={`flex-1 py-2 rounded-lg border-2 text-sm font-bold transition-colors ${
                        grades[key] === g
                          ? GRADE_COLORS[g]
                          : 'border-border text-text-secondary hover:border-navy/30 hover:bg-bg'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep(2)}
              disabled={!allGraded}
              className="flex-1 bg-navy text-white text-sm py-3 rounded-full disabled:opacity-50 hover:bg-navy-hover transition-colors"
            >
              Next
            </button>
            <button
              onClick={() => setStep(0)}
              className="flex-1 border border-border text-text-primary text-sm py-3 rounded-full hover:bg-bg transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="text-sm text-text-secondary mb-3">Share more about your experience with {selectedRank}s (optional)</p>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="What would officers want to know about this rank's leadership culture?"
            rows={5}
            className="w-full px-4 py-3 text-sm border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent mb-4"
          />
          {error && <p className="text-xs text-grade-f mb-3">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-navy text-white text-sm py-3 rounded-full disabled:opacity-50 hover:bg-navy-hover transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              onClick={() => setStep(1)}
              className="flex-1 border border-border text-text-primary text-sm py-3 rounded-full hover:bg-bg transition-colors"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30" onClick={onClose}>
      <div
        className="bg-surface rounded-2xl shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg text-text-primary">{title}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

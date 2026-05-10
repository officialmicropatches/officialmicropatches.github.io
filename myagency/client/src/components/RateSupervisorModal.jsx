import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { api } from '../lib/api';

const CATEGORIES = [
  { key: 'grade_communication', label: 'Communication', desc: 'How clearly and directly does this supervisor communicate with officers?' },
  { key: 'grade_fairness', label: 'Fairness', desc: 'Are decisions, discipline, and treatment applied consistently and equitably?' },
  { key: 'grade_accountability', label: 'Accountability', desc: 'Does this supervisor hold themselves to the same standards they demand?' },
  { key: 'grade_professionalism', label: 'Professionalism', desc: 'Does this supervisor conduct themselves with integrity and appropriate conduct?' },
  { key: 'grade_retaliation', label: 'No Retaliation', desc: 'Is this supervisor free from retaliatory behavior toward officers who speak up or make complaints?' },
  { key: 'grade_morale_impact', label: 'Morale Impact', desc: 'Overall effect of this supervisor on unit and department morale.' },
  { key: 'grade_backing_officers', label: 'Backs Officers', desc: 'Does this supervisor stand behind officers who act in good faith?' },
  { key: 'grade_promotion_fairness', label: 'Promotion Fairness', desc: 'Are promotion recommendations from this supervisor merit-based?' },
  { key: 'grade_assignment_fairness', label: 'Assignment Fairness', desc: 'Are assignments distributed fairly without favoritism or punishment?' },
];

const GRADES = ['A', 'B', 'C', 'D', 'F'];

const GRADE_ACTIVE = {
  A: 'bg-green-100 text-grade-a border-grade-a',
  B: 'bg-lime-100 text-grade-b border-lime-500',
  C: 'bg-amber-100 text-grade-c border-amber-500',
  D: 'bg-orange-100 text-grade-d border-orange-500',
  F: 'bg-red-100 text-grade-f border-grade-f',
};

export default function RateSupervisorModal({ agencyId, agencyName, agencySlug, initialSupervisor = null, onClose, onSuccess }) {
  const { user } = useAuth();
  const [step, setStep] = useState(initialSupervisor ? 1 : 0);
  const [supervisors, setSupervisors] = useState([]);
  const [loadingSupervisors, setLoadingSupervisors] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState(initialSupervisor);
  const [grades, setGrades] = useState({});
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const allGraded = CATEGORIES.every((c) => grades[c.key]);
  const progress = CATEGORIES.filter((c) => grades[c.key]).length;

  useEffect(() => {
    if (step === 0 && !initialSupervisor) {
      setLoadingSupervisors(true);
      api.getAgencySupervisors(agencySlug)
        .then(setSupervisors)
        .catch(() => setSupervisors([]))
        .finally(() => setLoadingSupervisors(false));
    }
  }, [step, agencySlug, initialSupervisor]);

  if (!user) {
    return (
      <ModalShell onClose={onClose} title="Rate a Supervisor">
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
          <p className="text-sm text-text-secondary mb-5">Your anonymous supervisor review has been submitted. Thank you for helping officers make informed decisions.</p>
          <button onClick={onClose} className="w-full bg-navy text-white text-sm py-3 rounded-full hover:bg-navy-hover transition-colors">Done</button>
        </div>
      </ModalShell>
    );
  }

  async function handleSubmit() {
    if (!selectedSupervisor) return;
    setSubmitting(true);
    setError('');
    try {
      await api.submitSupervisorReview({
        supervisor_id: selectedSupervisor.id,
        agency_id: agencyId,
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

  const title =
    step === 0 ? `Rate a Supervisor — ${agencyName}` :
    step === 1 ? `Rating ${selectedSupervisor?.display_name ?? 'Supervisor'}` :
    'Add your experience';

  return (
    <ModalShell onClose={onClose} title={title}>
      {/* Step 0: Select supervisor */}
      {step === 0 && (
        <div>
          <p className="text-sm text-text-secondary mb-4">
            Select the supervisor you want to review. Only their first and last name will be visible — no badge number or personal details.
          </p>

          {loadingSupervisors ? (
            <div className="py-8 flex justify-center">
              <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin" />
            </div>
          ) : supervisors.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-8">No supervisors found for this agency yet.</p>
          ) : (
            <div className="space-y-2 max-h-[50vh] overflow-y-auto scrollbar-hide mb-4 pr-1">
              {supervisors.map((sup) => (
                <button
                  key={sup.id}
                  onClick={() => { setSelectedSupervisor(sup); setStep(1); }}
                  className="w-full text-left px-4 py-3 rounded-xl border border-border hover:border-navy/30 hover:bg-bg transition-colors"
                >
                  <p className="text-sm font-medium text-text-primary">{sup.display_name}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{sup.rank}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 1: Rate categories */}
      {step === 1 && (
        <div>
          <div className="bg-bg border border-border rounded-xl p-3 mb-5 text-sm text-text-secondary leading-relaxed">
            Ratings are anonymous. Rate only what this supervisor controls — not department-wide policies.
          </div>

          <div className="flex items-center gap-2 mb-5">
            <div className="flex-1 h-1.5 bg-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-navy rounded-full transition-all"
                style={{ width: `${(progress / CATEGORIES.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-text-secondary shrink-0">{progress}/{CATEGORIES.length}</span>
          </div>

          <div className="space-y-5 mb-6 max-h-[48vh] overflow-y-auto scrollbar-hide pr-1">
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

          <div className="flex gap-2">
            <button
              onClick={() => setStep(2)}
              disabled={!allGraded}
              className="flex-1 bg-navy text-white text-sm py-3.5 rounded-full disabled:opacity-40 hover:bg-navy-hover transition-colors font-medium"
            >
              {allGraded ? 'Continue' : `Complete all ${CATEGORIES.length} categories`}
            </button>
            {!initialSupervisor && (
              <button
                onClick={() => { setStep(0); setGrades({}); }}
                className="flex-1 border border-border text-text-primary text-sm py-3.5 rounded-full hover:bg-bg transition-colors"
              >
                Back
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Write review */}
      {step === 2 && (
        <div>
          <p className="text-sm text-text-secondary mb-3">
            Share more about your experience with {selectedSupervisor?.display_name ?? 'this supervisor'} (optional)
          </p>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="What would officers want to know about working under this supervisor?"
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

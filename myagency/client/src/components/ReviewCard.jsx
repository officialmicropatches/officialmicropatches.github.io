import React, { useState } from 'react';
import GradeBadge from './GradeBadge';
import FlagModal from './FlagModal';

const CATEGORIES = [
  { key: 'grade_communication', label: 'Communication' },
  { key: 'grade_fairness', label: 'Fairness' },
  { key: 'grade_accountability', label: 'Accountability' },
  { key: 'grade_backing_officers', label: 'Backing Officers' },
  { key: 'grade_toxic_behavior', label: 'Toxic Behavior' },
  { key: 'grade_promotion_fairness', label: 'Promotions' },
  { key: 'grade_work_life', label: 'Work/Life' },
  { key: 'grade_morale_impact', label: 'Morale' },
];

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ReviewCard({ review }) {
  const [flagging, setFlagging] = useState(false);

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <GradeBadge grade={review.overall_grade} size="lg" />
          <div>
            <p className="text-sm font-medium text-text-primary">@{review.users?.username ?? 'anonymous'}</p>
            <p className="text-xs text-text-secondary">{formatDate(review.created_at)}</p>
          </div>
        </div>
        <button
          onClick={() => setFlagging(true)}
          className="text-xs text-text-secondary hover:text-text-primary transition-colors mt-0.5"
        >
          Flag
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {CATEGORIES.map(({ key, label }) => (
          <span key={key} className="inline-flex items-center gap-1 text-xs bg-bg border border-border rounded-full px-2.5 py-1">
            <span className="text-text-secondary">{label}</span>
            <GradeBadge grade={review[key]} size="sm" />
          </span>
        ))}
      </div>

      {review.review_text && (
        <p className="text-sm text-text-primary leading-relaxed">{review.review_text}</p>
      )}

      {flagging && (
        <FlagModal
          contentType="agency_review"
          contentId={review.id}
          onClose={() => setFlagging(false)}
        />
      )}
    </div>
  );
}

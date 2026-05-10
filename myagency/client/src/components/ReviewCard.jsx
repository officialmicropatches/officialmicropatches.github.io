import React, { useState } from 'react';
import GradeBadge from './GradeBadge';
import FlagModal from './FlagModal';

const AGENCY_CATEGORIES = [
  { key: 'grade_communication', label: 'Leadership Comm.' },
  { key: 'grade_fairness', label: 'Fairness' },
  { key: 'grade_accountability', label: 'Accountability' },
  { key: 'grade_backing_officers', label: 'Backs Officers' },
  { key: 'grade_morale', label: 'Morale' },
  { key: 'grade_promotion_fairness', label: 'Promotions' },
  { key: 'grade_work_life', label: 'Work/Life' },
  { key: 'grade_toxic_leadership', label: 'Toxic Leadership' },
];

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 30) return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

export default function ReviewCard({ review }) {
  const [flagging, setFlagging] = useState(false);

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-card">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <GradeBadge grade={review.overall_grade} size="lg" />
          <div>
            <p className="text-sm font-semibold text-text-primary">@{review.users?.username ?? 'anonymous'}</p>
            <p className="text-xs text-text-secondary mt-0.5">{timeAgo(review.created_at)}</p>
          </div>
        </div>
        <button
          onClick={() => setFlagging(true)}
          className="text-xs text-text-secondary hover:text-text-primary transition-colors shrink-0 mt-0.5 px-1 py-0.5"
        >
          Flag
        </button>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {AGENCY_CATEGORIES.map(({ key, label }) => review[key] && (
          <span
            key={key}
            className="inline-flex items-center gap-1.5 text-xs bg-bg border border-border rounded-full px-2.5 py-1"
          >
            <span className="text-text-secondary">{label}</span>
            <GradeBadge grade={review[key]} size="sm" />
          </span>
        ))}
      </div>

      {/* Review text */}
      {review.review_text && (
        <p className="text-sm text-text-primary leading-relaxed">{review.review_text}</p>
      )}

      {flagging && (
        <FlagModal contentType="agency_review" contentId={review.id} onClose={() => setFlagging(false)} />
      )}
    </div>
  );
}

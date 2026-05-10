import React from 'react';
import { Link } from 'react-router-dom';
import GradeBadge from './GradeBadge';

const RANK_COLORS = {
  'Chief of Police / Sheriff': 'bg-navy/10 text-navy',
  'Assistant Chief / Undersheriff': 'bg-navy/8 text-navy',
  'Deputy Chief': 'bg-slate-blue/10 text-slate-blue',
  'Commander': 'bg-slate-blue/8 text-slate-blue',
  'Captain': 'bg-blue-50 text-blue-700',
  'Lieutenant': 'bg-sky-50 text-sky-700',
  'Sergeant': 'bg-gray-100 text-gray-600',
  'Corporal': 'bg-gray-50 text-gray-500',
};

export default function SupervisorCard({ supervisor }) {
  const rankColor = RANK_COLORS[supervisor.rank] || 'bg-gray-100 text-gray-600';

  return (
    <Link
      to={`/supervisor/${supervisor.slug}`}
      className="block bg-surface border border-border rounded-2xl p-5 shadow-card hover:shadow-md hover:border-navy/20 transition-all group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-text-primary group-hover:text-navy transition-colors truncate">
            {supervisor.display_name}
          </p>
          <span className={`inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${rankColor}`}>
            {supervisor.rank}
          </span>
        </div>
        <div className="shrink-0 text-right">
          {supervisor.overall_grade ? (
            <GradeBadge grade={supervisor.overall_grade} size="lg" />
          ) : (
            <span className="text-xs text-text-secondary">No reviews</span>
          )}
          {supervisor.review_count > 0 && (
            <p className="text-xs text-text-secondary mt-1">
              {supervisor.review_count} review{supervisor.review_count !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {supervisor.preview && (
        <p className="text-sm text-text-secondary leading-relaxed line-clamp-2 mt-2">
          "{supervisor.preview}"
        </p>
      )}

      <div className="mt-3 flex items-center gap-1 text-xs text-navy font-medium">
        <span>View reviews</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-px">
          <line x1="2" y1="6" x2="10" y2="6" />
          <polyline points="7,3 10,6 7,9" />
        </svg>
      </div>
    </Link>
  );
}

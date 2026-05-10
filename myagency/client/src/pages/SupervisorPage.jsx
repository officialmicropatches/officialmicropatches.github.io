import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import GradeBadge from '../components/GradeBadge';
import SupervisorReviewCard from '../components/SupervisorReviewCard';
import RateSupervisorModal from '../components/RateSupervisorModal';
import { api } from '../lib/api';

const SUPERVISOR_CATEGORIES = [
  { key: 'grade_communication', label: 'Communication' },
  { key: 'grade_fairness', label: 'Fairness' },
  { key: 'grade_accountability', label: 'Accountability' },
  { key: 'grade_professionalism', label: 'Professionalism' },
  { key: 'grade_retaliation', label: 'No Retaliation' },
  { key: 'grade_morale_impact', label: 'Morale Impact' },
  { key: 'grade_backing_officers', label: 'Backs Officers' },
  { key: 'grade_promotion_fairness', label: 'Promotions' },
  { key: 'grade_assignment_fairness', label: 'Assignments' },
];

const RANK_ORDER = {
  'Chief of Police / Sheriff': 1,
  'Assistant Chief / Undersheriff': 2,
  'Deputy Chief': 3,
  'Commander': 4,
  'Captain': 5,
  'Lieutenant': 6,
  'Sergeant': 7,
  'Corporal': 8,
};

function computeCategoryAverages(reviews) {
  if (!reviews || reviews.length === 0) return {};
  const totals = {};
  const counts = {};
  for (const r of reviews) {
    for (const { key } of SUPERVISOR_CATEGORIES) {
      if (r[key]) {
        const val = { A: 4, B: 3, C: 2, D: 1, F: 0 }[r[key]];
        totals[key] = (totals[key] || 0) + val;
        counts[key] = (counts[key] || 0) + 1;
      }
    }
  }
  const result = {};
  for (const { key } of SUPERVISOR_CATEGORIES) {
    if (counts[key]) {
      const avg = totals[key] / counts[key];
      result[key] = avg >= 3.5 ? 'A' : avg >= 2.5 ? 'B' : avg >= 1.5 ? 'C' : avg >= 0.5 ? 'D' : 'F';
    }
  }
  return result;
}

export default function SupervisorPage() {
  const { slug } = useParams();
  const [supervisor, setSupervisor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [reviews, setReviews] = useState([]);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [showRateModal, setShowRateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleReviewSuccess() {
    setRefreshKey((k) => k + 1);
    api.getSupervisor(slug).then(setSupervisor).catch(() => {});
  }

  useEffect(() => {
    setLoading(true);
    setReviews([]);

    Promise.all([
      api.getSupervisor(slug),
      api.getSupervisorReviews(slug, 1),
    ])
      .then(([sup, reviewData]) => {
        setSupervisor(sup);
        setReviews(reviewData.reviews);
        setReviewTotal(reviewData.total);
        setReviewPage(1);
        document.title = `${sup.display_name} Reviews | RateMyAgency`;
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    return () => { document.title = 'RateMyAgency'; };
  }, [slug]);

  useEffect(() => {
    if (refreshKey === 0 || !supervisor) return;
    setReviewsLoading(true);
    api.getSupervisorReviews(slug, 1)
      .then((data) => { setReviews(data.reviews); setReviewTotal(data.total); setReviewPage(1); })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [refreshKey, slug]);

  async function loadMoreReviews() {
    const next = reviewPage + 1;
    const data = await api.getSupervisorReviews(slug, next);
    setReviews((prev) => [...prev, ...data.reviews]);
    setReviewPage(next);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-navy border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !supervisor) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <p className="text-text-secondary text-sm">{error || 'Supervisor not found.'}</p>
          <Link to="/" className="text-sm text-navy hover:underline">← Back to search</Link>
        </div>
      </div>
    );
  }

  const agency = supervisor.agencies;
  const categoryAverages = computeCategoryAverages(reviews);

  return (
    <>
      <div className="min-h-screen bg-bg flex flex-col">
        <Navbar />

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
          {/* Back to agency */}
          {agency && (
            <Link
              to={`/agency/${agency.slug}`}
              className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors mb-6"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="10" y1="7" x2="2" y2="7" /><polyline points="5,4 2,7 5,10" />
              </svg>
              {agency.name}
            </Link>
          )}

          {/* Supervisor header */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-card mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight leading-tight mb-2">
                  {supervisor.display_name}
                </h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-secondary">
                  <span className="font-medium text-text-primary">{supervisor.rank}</span>
                  {agency && (
                    <>
                      <span className="text-border">·</span>
                      <Link to={`/agency/${agency.slug}`} className="hover:text-navy transition-colors">
                        {agency.name}
                      </Link>
                    </>
                  )}
                </div>
                {supervisor.review_count > 0 && (
                  <p className="text-xs text-text-secondary mt-2">
                    {supervisor.review_count} review{supervisor.review_count !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {supervisor.overall_grade && (
                <div className="text-center shrink-0">
                  <GradeBadge grade={supervisor.overall_grade} size="xl" />
                  <p className="text-xs text-text-secondary mt-1">Overall</p>
                </div>
              )}
            </div>

            <div className="mt-5 pt-5 border-t border-border">
              <button
                onClick={() => setShowRateModal(true)}
                className="w-full sm:w-auto bg-navy text-white text-sm px-6 py-3 rounded-full hover:bg-navy-hover transition-colors font-medium"
              >
                Rate This Supervisor
              </button>
            </div>
          </div>

          {/* Category averages */}
          {reviews.length > 0 && Object.keys(categoryAverages).length > 0 && (
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-card mb-6">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
                Average Ratings
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SUPERVISOR_CATEGORIES.map(({ key, label }) => categoryAverages[key] && (
                  <div key={key} className="flex items-center justify-between gap-2 bg-bg rounded-xl px-3 py-2.5">
                    <span className="text-xs text-text-secondary">{label}</span>
                    <GradeBadge grade={categoryAverages[key]} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-text-primary">
                Reviews
                {reviewTotal > 0 && <span className="text-text-secondary font-normal ml-2 text-sm">({reviewTotal})</span>}
              </h2>
            </div>

            {reviewsLoading ? (
              <div className="py-12 flex justify-center">
                <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-text-secondary text-sm mb-4">No reviews yet for {supervisor.display_name}.</p>
                <button
                  onClick={() => setShowRateModal(true)}
                  className="text-sm text-navy hover:underline font-medium"
                >
                  Be the first to leave a review →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => <SupervisorReviewCard key={r.id} review={r} />)}
                {reviews.length < reviewTotal && (
                  <button
                    onClick={loadMoreReviews}
                    className="w-full py-3.5 text-sm text-navy border border-border rounded-2xl hover:bg-bg transition-colors"
                  >
                    Load more reviews
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {showRateModal && supervisor && agency && (
        <RateSupervisorModal
          agencyId={agency.id}
          agencyName={agency.name}
          agencySlug={agency.slug}
          initialSupervisor={supervisor}
          onClose={() => setShowRateModal(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </>
  );
}

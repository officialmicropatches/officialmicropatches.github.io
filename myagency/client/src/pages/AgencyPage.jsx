import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import GradeBadge from '../components/GradeBadge';
import ReviewCard from '../components/ReviewCard';
import SupervisorCard from '../components/SupervisorCard';
import QAPanel from '../components/QAPanel';
import RateAgencyModal from '../components/RateAgencyModal';
import RateSupervisorModal from '../components/RateSupervisorModal';
import { api } from '../lib/api';

const PAGE_SIZE = 10;

export default function AgencyPage() {
  const { slug } = useParams();
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('reviews');

  // Reviews tab state
  const [reviews, setReviews] = useState([]);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);

  // Supervisors tab state
  const [supervisors, setSupervisors] = useState([]);
  const [supervisorsLoading, setSupervisorsLoading] = useState(false);
  const [supervisorsLoaded, setSupervisorsLoaded] = useState(false);

  // Command staff
  const [staffExpanded, setStaffExpanded] = useState(false);

  // Modals
  const [showRateAgency, setShowRateAgency] = useState(false);
  const [showRateSupervisor, setShowRateSupervisor] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleReviewSuccess() {
    setRefreshKey((k) => k + 1);
    api.getAgency(slug).then(setAgency).catch(() => {});
  }

  useEffect(() => {
    setLoading(true);
    setReviewsLoaded(false);
    setSupervisorsLoaded(false);
    setReviews([]);
    setSupervisors([]);
    setActiveTab('reviews');

    api.getAgency(slug)
      .then((data) => {
        setAgency(data);
        document.title = `${data.name} Reviews | RateMyAgency`;
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    return () => { document.title = 'RateMyAgency'; };
  }, [slug]);

  // Load reviews when tab is active
  useEffect(() => {
    if (activeTab !== 'reviews' || reviewsLoaded) return;
    setReviewsLoading(true);
    api.getAgencyReviews(slug, 1)
      .then((data) => { setReviews(data.reviews); setReviewTotal(data.total); setReviewPage(1); setReviewsLoaded(true); })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [activeTab, slug, reviewsLoaded]);

  // Reload reviews on refresh
  useEffect(() => {
    if (refreshKey === 0) return;
    setReviewsLoading(true);
    api.getAgencyReviews(slug, 1)
      .then((data) => { setReviews(data.reviews); setReviewTotal(data.total); setReviewPage(1); })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [refreshKey, slug]);

  // Load supervisors when tab is active
  useEffect(() => {
    if (activeTab !== 'supervisors' || supervisorsLoaded) return;
    setSupervisorsLoading(true);
    api.getAgencySupervisors(slug)
      .then((data) => { setSupervisors(data); setSupervisorsLoaded(true); })
      .catch(() => {})
      .finally(() => setSupervisorsLoading(false));
  }, [activeTab, slug, supervisorsLoaded]);

  async function loadMoreReviews() {
    const next = reviewPage + 1;
    const data = await api.getAgencyReviews(slug, next);
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

  if (error || !agency) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <p className="text-text-secondary text-sm">{error || 'Agency not found.'}</p>
          <Link to="/" className="text-sm text-navy hover:underline">← Back to search</Link>
        </div>
      </div>
    );
  }

  const visibleStaff = staffExpanded ? agency.command_staff : agency.command_staff?.slice(0, 5);

  return (
    <>
      <div className="min-h-screen bg-bg flex flex-col">
        <Navbar />

        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
          {/* Back link */}
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors mb-6">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="10" y1="7" x2="2" y2="7" /><polyline points="5,4 2,7 5,10" />
            </svg>
            Search agencies
          </Link>

          {/* Agency header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-start gap-x-4 gap-y-2 mb-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight leading-tight">
                {agency.name}
              </h1>
              {agency.overall_grade && <GradeBadge grade={agency.overall_grade} size="lg" />}
            </div>
            <p className="text-text-secondary text-sm">
              {agency.city ? `${agency.city}, ` : ''}{agency.state}
              <span className="mx-2 text-border">·</span>
              {agency.type}
            </p>
            {agency.review_count > 0 && (
              <p className="text-text-secondary text-xs mt-1">
                {agency.review_count} review{agency.review_count !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() => setShowRateAgency(true)}
              className="bg-navy text-white text-sm px-6 py-2.5 rounded-full hover:bg-navy-hover transition-colors font-medium"
            >
              Rate This Agency
            </button>
            <button
              onClick={() => setShowRateSupervisor(true)}
              className="border border-navy text-navy text-sm px-6 py-2.5 rounded-full hover:bg-navy/5 transition-colors font-medium"
            >
              Rate a Supervisor
            </button>
            <button
              disabled
              className="border border-border text-text-secondary text-sm px-6 py-2.5 rounded-full opacity-50 cursor-not-allowed"
            >
              Compare
            </button>
          </div>

          {/* Main layout: tabs + sidebar */}
          <div className="lg:grid lg:grid-cols-3 lg:gap-8 mb-10">
            {/* Main content — tabs */}
            <div className="lg:col-span-2">
              {/* Tab bar */}
              <div className="flex border-b border-border mb-6">
                {[['reviews', 'Agency Reviews'], ['supervisors', 'Supervisors']].map(([tab, label]) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                      activeTab === tab
                        ? 'border-navy text-navy'
                        : 'border-transparent text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Agency reviews tab */}
              {activeTab === 'reviews' && (
                <div>
                  {reviewsLoading ? (
                    <div className="py-12 flex justify-center">
                      <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-text-secondary text-sm mb-4">No reviews yet.</p>
                      <button
                        onClick={() => setShowRateAgency(true)}
                        className="text-sm text-navy hover:underline font-medium"
                      >
                        Be the first to rate this agency →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
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
              )}

              {/* Supervisors tab */}
              {activeTab === 'supervisors' && (
                <div>
                  {supervisorsLoading ? (
                    <div className="py-12 flex justify-center">
                      <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : supervisors.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-text-secondary text-sm mb-4">No supervisors have been reviewed yet.</p>
                      <button
                        onClick={() => setShowRateSupervisor(true)}
                        className="text-sm text-navy hover:underline font-medium"
                      >
                        Rate a supervisor →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {supervisors.map((sup) => <SupervisorCard key={sup.id} supervisor={sup} />)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="mt-8 lg:mt-0">
              {/* Command staff */}
              {agency.command_staff?.length > 0 && (
                <div className="bg-surface border border-border rounded-2xl p-5 shadow-card">
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
                    Command Staff (Public Record)
                  </p>
                  <ul className="space-y-2.5">
                    {visibleStaff.map((member) => (
                      <li key={member.id} className="text-sm">
                        <p className="font-medium text-text-primary">{member.name}</p>
                        <p className="text-text-secondary text-xs mt-0.5">{member.title}</p>
                      </li>
                    ))}
                  </ul>
                  {agency.command_staff.length > 5 && (
                    <button
                      onClick={() => setStaffExpanded((v) => !v)}
                      className="mt-4 text-xs text-navy hover:underline font-medium"
                    >
                      {staffExpanded ? 'Show less' : `Show ${agency.command_staff.length - 5} more`}
                    </button>
                  )}
                </div>
              )}

              {/* Anonymous note */}
              <div className="mt-4 bg-navy/5 border border-navy/10 rounded-2xl p-4">
                <p className="text-xs text-navy leading-relaxed">
                  <strong>Your identity is protected.</strong> No badge numbers, employee IDs, or department emails are collected. Reviews are permanently anonymous.
                </p>
              </div>
            </div>
          </div>

          {/* Q&A — full width */}
          <div className="border-t border-border pt-10">
            <QAPanel agencyId={agency.id} slug={slug} />
          </div>
        </main>
      </div>

      {showRateAgency && (
        <RateAgencyModal
          agencyId={agency.id}
          agencyName={agency.name}
          onClose={() => setShowRateAgency(false)}
          onSuccess={handleReviewSuccess}
        />
      )}

      {showRateSupervisor && (
        <RateSupervisorModal
          agencyId={agency.id}
          agencyName={agency.name}
          agencySlug={slug}
          onClose={() => setShowRateSupervisor(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </>
  );
}

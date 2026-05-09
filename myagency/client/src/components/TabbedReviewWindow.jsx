import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import ReviewCard from './ReviewCard';
import SupervisorReviewCard from './SupervisorReviewCard';

const PAGE_SIZE = 10;

export default function TabbedReviewWindow({ slug, refreshKey = 0 }) {
  const [activeTab, setActiveTab] = useState('agency');

  const [agencyReviews, setAgencyReviews] = useState([]);
  const [agencyTotal, setAgencyTotal] = useState(0);
  const [agencyPage, setAgencyPage] = useState(1);
  const [agencyLoading, setAgencyLoading] = useState(true);

  const [supervisorReviews, setSupervisorReviews] = useState([]);
  const [supervisorTotal, setSupervisorTotal] = useState(0);
  const [supervisorPage, setSupervisorPage] = useState(1);
  const [supervisorLoading, setSupervisorLoading] = useState(false);
  const [supervisorLoaded, setSupervisorLoaded] = useState(false);

  useEffect(() => {
    setAgencyLoading(true);
    setSupervisorLoaded(false);
    api.getAgencyReviews(slug, 1)
      .then((data) => {
        setAgencyReviews(data.reviews);
        setAgencyTotal(data.total);
        setAgencyPage(1);
      })
      .catch(() => {})
      .finally(() => setAgencyLoading(false));
  }, [slug, refreshKey]);

  function handleTabSwitch(tab) {
    setActiveTab(tab);
    if (tab === 'supervisor' && !supervisorLoaded) {
      setSupervisorLoading(true);
      api.getSupervisorReviews(slug, 1)
        .then((data) => {
          setSupervisorReviews(data.reviews);
          setSupervisorTotal(data.total);
          setSupervisorPage(1);
          setSupervisorLoaded(true);
        })
        .catch(() => {})
        .finally(() => setSupervisorLoading(false));
    }
  }

  async function loadMoreAgency() {
    const next = agencyPage + 1;
    const data = await api.getAgencyReviews(slug, next);
    setAgencyReviews((prev) => [...prev, ...data.reviews]);
    setAgencyPage(next);
  }

  async function loadMoreSupervisor() {
    const next = supervisorPage + 1;
    const data = await api.getSupervisorReviews(slug, next);
    setSupervisorReviews((prev) => [...prev, ...data.reviews]);
    setSupervisorPage(next);
  }

  return (
    <div>
      <div className="flex border-b border-border mb-5">
        {[['agency', 'Agency Reviews'], ['supervisor', 'Supervisor Reviews']].map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => handleTabSwitch(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab
                ? 'border-navy text-navy'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'agency' && (
        <ReviewList
          reviews={agencyReviews}
          total={agencyTotal}
          loading={agencyLoading}
          onLoadMore={loadMoreAgency}
          CardComponent={ReviewCard}
        />
      )}

      {activeTab === 'supervisor' && (
        <ReviewList
          reviews={supervisorReviews}
          total={supervisorTotal}
          loading={supervisorLoading}
          onLoadMore={loadMoreSupervisor}
          CardComponent={SupervisorReviewCard}
        />
      )}
    </div>
  );
}

function ReviewList({ reviews, total, loading, onLoadMore, CardComponent }) {
  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <p className="text-text-secondary text-sm py-10 text-center">
        No reviews yet. Be the first to rate this agency.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => <CardComponent key={r.id} review={r} />)}
      {reviews.length < total && (
        <button
          onClick={onLoadMore}
          className="w-full py-3 text-sm text-navy border border-border rounded-xl hover:bg-bg transition-colors"
        >
          Load more
        </button>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import GradeBadge from '../components/GradeBadge';
import TabbedReviewWindow from '../components/TabbedReviewWindow';
import QAPanel from '../components/QAPanel';
import RateAgencyModal from '../components/RateAgencyModal';
import RateSupervisorModal from '../components/RateSupervisorModal';
import { api } from '../lib/api';

export default function AgencyPage() {
  const { slug } = useParams();
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [staffExpanded, setStaffExpanded] = useState(false);
  const [showRateAgency, setShowRateAgency] = useState(false);
  const [showRateSupervisor, setShowRateSupervisor] = useState(false);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);

  function handleReviewSuccess() {
    setReviewRefreshKey((k) => k + 1);
    api.getAgency(slug).then(setAgency).catch(() => {});
  }

  useEffect(() => {
    setLoading(true);
    api.getAgency(slug)
      .then((data) => {
        setAgency(data);
        document.title = `${data.name} Reviews | MyAgency`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', `Anonymous leadership reviews for ${data.name} in ${data.state}. See ratings from current officers and laterals on MyAgency.`);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    return () => { document.title = 'MyAgency'; };
  }, [slug]);

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
        <div className="flex-1 flex items-center justify-center text-text-secondary text-sm">
          {error || 'Agency not found.'}
        </div>
      </div>
    );
  }

  const visibleStaff = staffExpanded ? agency.command_staff : agency.command_staff?.slice(0, 5);

  return (
    <>
    <div className="min-h-screen bg-bg flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">

          {/* Agency header */}
          <div className="mb-8">
            <div className="flex items-start gap-4 mb-1">
              <h1 className="text-3xl font-bold text-navy tracking-tight leading-tight">{agency.name}</h1>
              {agency.overall_grade && <GradeBadge grade={agency.overall_grade} size="lg" />}
            </div>
            <p className="text-text-secondary text-sm mb-1">{agency.state} · {agency.type}</p>
            {agency.review_count > 0 && (
              <p className="text-text-secondary text-xs">{agency.review_count} review{agency.review_count !== 1 ? 's' : ''}</p>
            )}
          </div>

          {/* Command staff */}
          {agency.command_staff?.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-5 mb-8">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
                Command Staff (Public Record)
              </p>
              <ul className="space-y-2">
                {visibleStaff.map((member) => (
                  <li key={member.id} className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-text-primary">{member.name}</span>
                    <span className="text-text-secondary">—</span>
                    <span className="text-text-secondary">{member.title}</span>
                  </li>
                ))}
              </ul>
              {agency.command_staff.length > 5 && (
                <button
                  onClick={() => setStaffExpanded((v) => !v)}
                  className="mt-3 text-xs text-navy hover:underline"
                >
                  {staffExpanded ? 'Show less' : `Show ${agency.command_staff.length - 5} more`}
                </button>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setShowRateAgency(true)}
              className="bg-navy text-white text-sm px-6 py-2.5 rounded-full hover:bg-navy-hover transition-colors font-medium"
            >
              Rate My Agency
            </button>
            <button
              onClick={() => setShowRateSupervisor(true)}
              className="border border-navy text-navy text-sm px-6 py-2.5 rounded-full hover:bg-bg transition-colors font-medium"
            >
              Rate a Supervisor
            </button>
          </div>

          {/* Main content: reviews + Q&A */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <TabbedReviewWindow slug={slug} refreshKey={reviewRefreshKey} />
            </div>
            <div>
              <QAPanel agencyId={agency.id} slug={slug} />
            </div>
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
          onClose={() => setShowRateSupervisor(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </>
  );
}

import React, { useState } from 'react';
import { api } from '../lib/api';

const REASONS = [
  'Doxxing / Personal Info',
  'Harassment',
  'Spam',
  'Inaccurate / Fake',
  'Other',
];

export default function FlagModal({ contentType, contentId, onClose }) {
  const [selected, setSelected] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!selected) return;
    setSubmitting(true);
    setError('');
    try {
      await api.flagContent({ content_type: contentType, content_id: contentId, reason: selected });
      setDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/25" onClick={onClose}>
      <div
        className="bg-surface rounded-t-2xl sm:rounded-2xl shadow-modal w-full sm:max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="text-center py-2">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3,9 7,13 15,5" />
              </svg>
            </div>
            <p className="font-semibold text-text-primary mb-1">Flagged for review</p>
            <p className="text-sm text-text-secondary mb-4">Thank you. Our moderation team will review this.</p>
            <button onClick={onClose} className="bg-navy text-white text-sm px-6 py-2.5 rounded-full hover:bg-navy-hover transition-colors">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">Flag this content</h3>
              <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-xl leading-none p-1">×</button>
            </div>
            <p className="text-sm text-text-secondary mb-4">Why are you flagging this?</p>
            <div className="space-y-2 mb-4">
              {REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelected(reason)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ${
                    selected === reason
                      ? 'border-navy bg-navy/5 text-navy font-medium'
                      : 'border-border text-text-primary hover:bg-bg'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            {error && <p className="text-xs text-grade-f mb-3">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={submit}
                disabled={submitting || !selected}
                className="flex-1 bg-navy text-white text-sm py-3 rounded-full disabled:opacity-50 hover:bg-navy-hover transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Flag'}
              </button>
              <button
                onClick={onClose}
                className="flex-1 border border-border text-text-primary text-sm py-3 rounded-full hover:bg-bg transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

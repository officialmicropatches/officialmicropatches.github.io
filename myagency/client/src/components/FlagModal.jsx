import React, { useState } from 'react';
import { api } from '../lib/api';

const REASONS = ['Doxxing / Personal Info', 'Harassment', 'Spam', 'Inaccurate / Fake', 'Other'];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30" onClick={onClose}>
      <div
        className="bg-surface rounded-2xl shadow-lg w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="text-center">
            <p className="font-semibold text-text-primary mb-1">Thank you</p>
            <p className="text-sm text-text-secondary mb-4">This content has been flagged for review.</p>
            <button onClick={onClose} className="bg-navy text-white text-sm px-5 py-2 rounded-full hover:bg-navy-hover transition-colors">
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="font-semibold text-text-primary mb-1">Flag this content</h3>
            <p className="text-sm text-text-secondary mb-4">Why are you flagging this?</p>
            <div className="space-y-2 mb-4">
              {REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelected(reason)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-colors ${
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
                className="flex-1 bg-navy text-white text-sm py-2.5 rounded-full disabled:opacity-50 hover:bg-navy-hover transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
              <button
                onClick={onClose}
                className="flex-1 border border-border text-text-primary text-sm py-2.5 rounded-full hover:bg-bg transition-colors"
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

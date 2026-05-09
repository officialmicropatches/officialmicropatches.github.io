import React, { useState } from 'react';
import { useAuth } from '../App';
import { api } from '../lib/api';
import FlagModal from './FlagModal';

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function QuestionThread({ question, onReplyAdded }) {
  const { user } = useAuth();
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [flagging, setFlagging] = useState(null);

  async function submitReply() {
    if (!replyText.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const reply = await api.postReply(question.id, { body: replyText.trim() });
      onReplyAdded(question.id, reply);
      setReplyText('');
      setReplyOpen(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className="text-sm font-medium text-text-primary">@{question.users?.username ?? 'anonymous'}</span>
          <span className="text-text-secondary text-xs ml-2">{formatDate(question.created_at)}</span>
        </div>
        <button
          onClick={() => setFlagging({ type: 'question', id: question.id })}
          className="text-xs text-text-secondary hover:text-text-primary transition-colors"
        >
          Flag
        </button>
      </div>
      <p className="text-sm text-text-primary leading-relaxed mb-3">{question.body}</p>

      {question.question_replies?.map((reply) => (
        <div key={reply.id} className="ml-5 pl-4 border-l-2 border-border mt-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <span className="text-sm font-medium text-text-primary">@{reply.users?.username ?? 'anonymous'}</span>
              <span className="text-text-secondary text-xs ml-2">{formatDate(reply.created_at)}</span>
            </div>
            <button
              onClick={() => setFlagging({ type: 'reply', id: reply.id })}
              className="text-xs text-text-secondary hover:text-text-primary transition-colors"
            >
              Flag
            </button>
          </div>
          <p className="text-sm text-text-primary leading-relaxed">{reply.body}</p>
        </div>
      ))}

      <div className="mt-3 flex items-center gap-3">
        {user ? (
          !replyOpen ? (
            <button
              onClick={() => setReplyOpen(true)}
              className="text-xs text-navy hover:text-navy-hover transition-colors"
            >
              Reply
            </button>
          ) : (
            <div className="w-full">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
              />
              {error && <p className="text-xs text-grade-f mt-1">{error}</p>}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={submitReply}
                  disabled={submitting || !replyText.trim()}
                  className="text-xs bg-navy text-white px-3 py-1.5 rounded-full disabled:opacity-50 hover:bg-navy-hover transition-colors"
                >
                  {submitting ? 'Posting...' : 'Post Reply'}
                </button>
                <button
                  onClick={() => { setReplyOpen(false); setReplyText(''); setError(''); }}
                  className="text-xs text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )
        ) : null}
      </div>

      {flagging && (
        <FlagModal
          contentType={flagging.type}
          contentId={flagging.id}
          onClose={() => setFlagging(null)}
        />
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { api } from '../lib/api';
import FlagModal from './FlagModal';

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 30) return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
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
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-card">
      {/* Question */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <span className="text-xs font-semibold text-navy">@{question.users?.username ?? 'anonymous'}</span>
          <span className="text-text-secondary text-xs ml-2">{timeAgo(question.created_at)}</span>
        </div>
        <button
          onClick={() => setFlagging({ type: 'question', id: question.id })}
          className="text-xs text-text-secondary hover:text-text-primary transition-colors shrink-0"
        >
          Flag
        </button>
      </div>
      <p className="text-sm text-text-primary leading-relaxed mb-4">{question.body}</p>

      {/* Replies */}
      {question.question_replies?.length > 0 && (
        <div className="space-y-3 mb-4">
          {question.question_replies.map((reply) => (
            <div key={reply.id} className="ml-4 pl-4 border-l-2 border-border">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <span className="text-xs font-medium text-text-primary">@{reply.users?.username ?? 'anonymous'}</span>
                  <span className="text-text-secondary text-xs ml-2">{timeAgo(reply.created_at)}</span>
                </div>
                <button
                  onClick={() => setFlagging({ type: 'reply', id: reply.id })}
                  className="text-xs text-text-secondary hover:text-text-primary transition-colors shrink-0"
                >
                  Flag
                </button>
              </div>
              <p className="text-sm text-text-primary leading-relaxed">{reply.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reply action */}
      {user ? (
        !replyOpen ? (
          <button
            onClick={() => setReplyOpen(true)}
            className="text-xs text-navy hover:text-navy-hover font-medium transition-colors"
          >
            Reply
          </button>
        ) : (
          <div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write an anonymous reply..."
              rows={2}
              className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy/40"
            />
            {error && <p className="text-xs text-grade-f mt-1">{error}</p>}
            <div className="flex gap-2 mt-2">
              <button
                onClick={submitReply}
                disabled={submitting || !replyText.trim()}
                className="text-xs bg-navy text-white px-4 py-1.5 rounded-full disabled:opacity-50 hover:bg-navy-hover transition-colors"
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
      ) : (
        <p className="text-xs text-text-secondary">
          <Link to="/login" className="text-navy hover:underline font-medium">Log in</Link> to reply
        </p>
      )}

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

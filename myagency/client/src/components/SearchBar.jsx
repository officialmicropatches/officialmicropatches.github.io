import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import GradeBadge from './GradeBadge';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function SearchBar({ autoFocus = false }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 280);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    setLoading(true);
    api.searchAgencies(debouncedQuery)
      .then((data) => { setResults(data); setOpen(true); setActiveIndex(-1); })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(slug) {
    setOpen(false);
    setQuery('');
    setActiveIndex(-1);
    navigate(`/agency/${slug}`);
  }

  function handleKeyDown(e) {
    if (!open || !results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0) handleSelect(results[activeIndex].slug);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="9" r="6" />
            <line x1="14" y1="14" x2="19" y2="19" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search police departments and sheriff's offices nationwide"
          autoFocus={autoFocus}
          autoComplete="off"
          className="w-full pl-11 pr-5 py-4 sm:py-4.5 rounded-2xl border border-border bg-surface shadow-card text-text-primary placeholder-text-secondary text-base focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy/40 transition"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-surface border border-border rounded-2xl shadow-modal z-50 overflow-hidden">
          {results.map((agency, idx) => (
            <button
              key={agency.id}
              onMouseDown={() => handleSelect(agency.slug)}
              className={`w-full px-5 py-3.5 text-left flex items-center justify-between gap-4 border-b border-border last:border-0 transition-colors ${
                activeIndex === idx ? 'bg-bg' : 'hover:bg-bg'
              }`}
            >
              <div className="min-w-0">
                <p className="text-text-primary font-medium text-sm leading-tight truncate">{agency.name}</p>
                <p className="text-text-secondary text-xs mt-0.5">
                  {agency.city ? `${agency.city}, ` : ''}{agency.state} · {agency.type}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {agency.overall_grade && <GradeBadge grade={agency.overall_grade} size="sm" />}
                {agency.review_count > 0 && (
                  <span className="text-xs text-text-secondary whitespace-nowrap">{agency.review_count} reviews</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {open && query.trim() && results.length === 0 && !loading && (
        <div className="absolute top-full mt-2 w-full bg-surface border border-border rounded-2xl shadow-modal z-50 px-5 py-5 text-text-secondary text-sm">
          No agencies found for "<span className="text-text-primary font-medium">{query}</span>". Try a city name or state abbreviation.
        </div>
      )}
    </div>
  );
}

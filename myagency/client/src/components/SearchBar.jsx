import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    api.searchAgencies(debouncedQuery)
      .then((data) => { setResults(data); setOpen(true); })
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
    navigate(`/agency/${slug}`);
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a police department or sheriff's office..."
          className="w-full px-5 py-4 rounded-xl border border-border bg-surface shadow-sm text-text-primary placeholder-text-secondary text-base focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition"
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-1.5 w-full bg-surface border border-border rounded-xl shadow-sm z-50 overflow-hidden">
          {results.map((agency) => (
            <button
              key={agency.id}
              onClick={() => handleSelect(agency.slug)}
              className="w-full px-5 py-3.5 text-left hover:bg-bg transition-colors flex items-center justify-between gap-4 border-b border-border last:border-0"
            >
              <div>
                <p className="text-text-primary font-medium text-sm">{agency.name}</p>
                <p className="text-text-secondary text-xs mt-0.5">{agency.city ? `${agency.city}, ` : ''}{agency.state} · {agency.type}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {agency.overall_grade && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gradeClass(agency.overall_grade)}`}>
                    {agency.overall_grade}
                  </span>
                )}
                {agency.review_count > 0 && (
                  <span className="text-xs text-text-secondary">{agency.review_count} reviews</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {open && query && results.length === 0 && !loading && (
        <div className="absolute top-full mt-1.5 w-full bg-surface border border-border rounded-xl shadow-sm z-50 px-5 py-4 text-text-secondary text-sm">
          No agencies found for "{query}"
        </div>
      )}
    </div>
  );
}

function gradeClass(grade) {
  const map = { A: 'bg-green-100 text-grade-a', B: 'bg-lime-100 text-grade-b', C: 'bg-amber-100 text-grade-c', D: 'bg-orange-100 text-grade-d', F: 'bg-red-100 text-grade-f' };
  return map[grade] || 'bg-gray-100 text-gray-600';
}

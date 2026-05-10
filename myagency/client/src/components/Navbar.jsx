import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { supabase } from '../lib/supabase';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export default function Navbar() {
  const { user, username, setUser, setUsername } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    if (!USE_MOCK) await supabase.auth.signOut();
    setUser(null);
    setUsername(null);
    navigate('/');
    setMenuOpen(false);
  }

  return (
    <>
      <nav className="w-full border-b border-border bg-surface sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center">
          {/* Left: hamburger */}
          <div className="w-10 flex items-center">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1.5 -ml-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors"
              aria-label="Menu"
            >
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <line x1="0" y1="1" x2="18" y2="1" />
                <line x1="0" y1="7" x2="18" y2="7" />
                <line x1="0" y1="13" x2="18" y2="13" />
              </svg>
            </button>
          </div>

          {/* Center: logo */}
          <div className="flex-1 flex justify-center">
            <Link to="/" className="text-navy font-bold text-base tracking-tight select-none">
              RateMyAgency
            </Link>
          </div>

          {/* Right: auth */}
          <div className="w-10 flex items-center justify-end">
            {user ? (
              <div className="relative group">
                <button className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors">
                  @{username}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Slide-out menu overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="w-72 max-w-[80vw] bg-surface h-full shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <Link to="/" onClick={() => setMenuOpen(false)} className="text-navy font-bold text-base tracking-tight">
                RateMyAgency
              </Link>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-1 rounded-lg text-text-secondary hover:text-text-primary transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <line x1="1" y1="1" x2="15" y2="15" />
                  <line x1="15" y1="1" x2="1" y2="15" />
                </svg>
              </button>
            </div>

            <div className="flex-1 px-5 py-6 space-y-1">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-primary hover:bg-bg transition-colors"
              >
                Search Agencies
              </Link>
              {user ? (
                <>
                  <div className="px-3 py-2 text-xs text-text-secondary font-medium uppercase tracking-wide mt-4 mb-1">
                    Account
                  </div>
                  <div className="px-3 py-2 text-sm text-text-secondary">
                    @{username}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-primary hover:bg-bg transition-colors"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <div className="px-3 py-2 text-xs text-text-secondary font-medium uppercase tracking-wide mt-4 mb-1">
                    Account
                  </div>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-primary hover:bg-bg transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-navy hover:bg-bg transition-colors"
                  >
                    Create anonymous account
                  </Link>
                </>
              )}
            </div>

            <div className="px-5 py-4 border-t border-border">
              <p className="text-xs text-text-secondary leading-relaxed">
                RateMyAgency is an anonymous platform for law enforcement professionals. No badge numbers. No department emails. No real names.
              </p>
            </div>
          </div>

          {/* Backdrop */}
          <div className="flex-1 bg-black/20" />
        </div>
      )}
    </>
  );
}

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';

export default function Navbar() {
  const { user, username, setUser, setUsername } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await api.logout().catch(() => {});
    await supabase.auth.signOut();
    setUser(null);
    setUsername(null);
    navigate('/');
  }

  return (
    <nav className="w-full border-b border-border bg-surface">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="text-navy font-bold text-lg tracking-tight">
          MyAgency
        </Link>
        <div className="flex items-center gap-5 text-sm">
          {user ? (
            <>
              <span className="text-text-secondary">@{username}</span>
              <button
                onClick={handleLogout}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="bg-navy text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-navy-hover transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

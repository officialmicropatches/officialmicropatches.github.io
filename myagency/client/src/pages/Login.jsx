import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { useAuth } from '../App';
import Navbar from '../components/Navbar';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export default function Login() {
  const { setUser, setUsername } = useAuth();
  const navigate = useNavigate();
  const [username, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.login({ username, password });
      if (USE_MOCK) {
        setUser(data.session.user);
        setUsername(data.user.username);
      } else {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        setUser(data.session.user);
        setUsername(data.user.username);
      }
      navigate(-1);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-navy mb-1.5">Welcome back</h1>
            <p className="text-text-secondary text-sm">Log in to your anonymous account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
                autoComplete="username"
                autoFocus
                className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy/40 bg-surface"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy/40 bg-surface"
              />
            </div>

            {error && <p className="text-sm text-grade-f">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy text-white py-3.5 rounded-full text-sm font-medium disabled:opacity-50 hover:bg-navy-hover transition-colors"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            New here?{' '}
            <Link to="/signup" className="text-navy hover:underline font-medium">Create anonymous account</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { useAuth } from '../App';
import Navbar from '../components/Navbar';

export default function Signup() {
  const { setUser, setUsername } = useAuth();
  const navigate = useNavigate();
  const [username, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.register({ username, password, email: email || undefined });
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        setUser(data.session.user);
        setUsername(data.user.username);
        navigate('/');
      } else {
        navigate('/login');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-navy mb-1">Create an account</h1>
          <p className="text-text-secondary text-sm mb-6">Anonymous. Free. For law enforcement.</p>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6 text-sm text-amber-800">
            Do not use a work or department email address.
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Username <span className="text-grade-f">*</span></label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
                autoComplete="username"
                placeholder="e.g. officer_anon"
                className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
              />
              <p className="text-xs text-text-secondary mt-1">3–30 characters. Letters, numbers, and underscores only.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Password <span className="text-grade-f">*</span></label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Email <span className="text-text-secondary font-normal">(optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="personal@example.com"
                className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
              />
              <p className="text-xs text-text-secondary mt-1">Only used for account recovery. Never displayed publicly.</p>
            </div>

            {error && (
              <p className="text-sm text-grade-f">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy text-white py-3 rounded-full text-sm font-medium disabled:opacity-50 hover:bg-navy-hover transition-colors"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-navy hover:underline font-medium">Log in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

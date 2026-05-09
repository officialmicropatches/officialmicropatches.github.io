import { supabase } from './supabase';
import { mockApi } from './mockApi';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession().catch(() => ({ data: {} }));
  if (!session) return {};
  return { Authorization: `Bearer ${session.access_token}` };
}

async function request(path, options = {}) {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(options.headers || {}),
    },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}

const realApi = {
  // Auth
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // Agencies
  searchAgencies: (q) => request(`/agencies/search?q=${encodeURIComponent(q)}`),
  getAgency: (slug) => request(`/agencies/${slug}`),
  getAgencyReviews: (slug, page = 1) => request(`/agencies/${slug}/reviews/agency?page=${page}`),
  getSupervisorReviews: (slug, page = 1) => request(`/agencies/${slug}/reviews/supervisor?page=${page}`),
  getQuestions: (slug, page = 1) => request(`/agencies/${slug}/questions?page=${page}`),

  // Reviews
  submitAgencyReview: (data) => request('/reviews/agency', { method: 'POST', body: JSON.stringify(data) }),
  submitSupervisorReview: (data) => request('/reviews/supervisor', { method: 'POST', body: JSON.stringify(data) }),

  // Q&A
  postQuestion: (data) => request('/questions', { method: 'POST', body: JSON.stringify(data) }),
  postReply: (questionId, data) => request(`/questions/${questionId}/replies`, { method: 'POST', body: JSON.stringify(data) }),

  // Flags
  flagContent: (data) => request('/flags', { method: 'POST', body: JSON.stringify(data) }),
};

export const api = USE_MOCK ? mockApi : realApi;

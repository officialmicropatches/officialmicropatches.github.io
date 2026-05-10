import {
  MOCK_AGENCIES,
  MOCK_SUPERVISORS,
  MOCK_AGENCY_REVIEWS,
  MOCK_SUPERVISOR_REVIEWS_BY_SLUG,
  MOCK_QUESTIONS,
} from './mockData';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export const mockApi = {
  register: async ({ username }) => {
    await delay(500);
    return {
      user: { id: 'demo-user', username },
      session: { access_token: 'mock-token', refresh_token: 'mock-refresh', user: { id: 'demo-user' } },
    };
  },

  login: async ({ username }) => {
    await delay(500);
    return {
      user: { id: 'demo-user', username },
      session: { access_token: 'mock-token', refresh_token: 'mock-refresh', user: { id: 'demo-user' } },
    };
  },

  logout: async () => {
    await delay(200);
    return { message: 'Logged out' };
  },

  searchAgencies: async (q) => {
    await delay(200);
    const lower = q.toLowerCase();
    return MOCK_AGENCIES.filter(
      (a) =>
        a.name.toLowerCase().includes(lower) ||
        a.city?.toLowerCase().includes(lower) ||
        a.state.toLowerCase().includes(lower)
    ).slice(0, 8);
  },

  getAgency: async (slug) => {
    await delay(300);
    const agency = MOCK_AGENCIES.find((a) => a.slug === slug);
    if (!agency) throw new Error('Agency not found');
    return agency;
  },

  getAgencyReviews: async (_slug, _page) => {
    await delay(300);
    return { reviews: MOCK_AGENCY_REVIEWS, total: MOCK_AGENCY_REVIEWS.length, page: 1, page_size: 10 };
  },

  getAgencySupervisors: async (slug) => {
    await delay(300);
    const agency = MOCK_AGENCIES.find((a) => a.slug === slug);
    if (!agency) return [];
    return MOCK_SUPERVISORS.filter((s) => s.agency_id === agency.id);
  },

  getSupervisor: async (slug) => {
    await delay(300);
    const supervisor = MOCK_SUPERVISORS.find((s) => s.slug === slug);
    if (!supervisor) throw new Error('Supervisor not found');
    const agency = MOCK_AGENCIES.find((a) => a.id === supervisor.agency_id);
    return { ...supervisor, agencies: agency ? { id: agency.id, name: agency.name, slug: agency.slug, city: agency.city, state: agency.state, type: agency.type } : null };
  },

  getSupervisorReviews: async (slug, _page) => {
    await delay(300);
    const reviews = MOCK_SUPERVISOR_REVIEWS_BY_SLUG[slug] || [];
    return { reviews, total: reviews.length, page: 1, page_size: 10 };
  },

  getQuestions: async (_slug, _page) => {
    await delay(300);
    return { questions: MOCK_QUESTIONS, total: MOCK_QUESTIONS.length, page: 1, page_size: 10 };
  },

  submitAgencyReview: async (data) => {
    await delay(700);
    return { id: 'new-review', ...data };
  },

  submitSupervisorReview: async (data) => {
    await delay(700);
    return { id: 'new-sup-review', ...data };
  },

  postQuestion: async ({ body }) => {
    await delay(500);
    return {
      id: `q-${Date.now()}`,
      body,
      created_at: new Date().toISOString(),
      users: { username: 'you' },
      question_replies: [],
    };
  },

  postReply: async (_questionId, { body }) => {
    await delay(500);
    return {
      id: `r-${Date.now()}`,
      body,
      created_at: new Date().toISOString(),
      users: { username: 'you' },
    };
  },

  flagContent: async () => {
    await delay(400);
    return { message: 'Content flagged for review', id: 'mock-flag' };
  },
};

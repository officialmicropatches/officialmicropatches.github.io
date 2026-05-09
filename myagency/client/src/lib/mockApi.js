import {
  MOCK_AGENCIES,
  MOCK_AGENCY_REVIEWS,
  MOCK_SUPERVISOR_REVIEWS,
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
    );
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

  getSupervisorReviews: async (_slug, _page) => {
    await delay(300);
    return { reviews: MOCK_SUPERVISOR_REVIEWS, total: MOCK_SUPERVISOR_REVIEWS.length, page: 1, page_size: 10 };
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

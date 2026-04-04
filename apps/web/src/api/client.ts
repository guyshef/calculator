import axios from 'axios';
import { useGameStore } from '../stores/gameStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({ baseURL: BASE_URL });

// Attach JWT from store on every request.
// Parent-only endpoints (/auth/children, /dashboard) always use parentToken.
// Everything else (exercises, progress) uses the child token.
api.interceptors.request.use((config) => {
  const { activeChild, parentToken } = useGameStore.getState();
  const url = config.url ?? '';
  const isParentEndpoint =
    url.includes('/auth/children') ||
    url.includes('/auth/parent') ||
    url.includes('/dashboard');
  const token = isParentEndpoint ? parentToken : (activeChild?.token ?? parentToken);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  registerParent: (email: string, password: string) =>
    api.post('/auth/parent/register', { email, password }).then((r) => r.data),

  loginParent: (email: string, password: string) =>
    api.post('/auth/parent/login', { email, password }).then((r) => r.data),

  loginChild: (childId: string, pin: string) =>
    api.post('/auth/child/login', { childId, pin }).then((r) => r.data),

  getChildren: () => api.get('/auth/children').then((r) => r.data),

  createChild: (name: string, avatar: string, pin: string) =>
    api.post('/auth/child', { name, avatar, pin }).then((r) => r.data),
};

// ─── Exercises ────────────────────────────────────────────────────────────────

export const exercisesApi = {
  getByLevel: (level: number) =>
    api.get(`/exercises/${level}`).then((r) => r.data),

  getLevels: () => api.get('/exercises/levels').then((r) => r.data),
};

// ─── Progress ─────────────────────────────────────────────────────────────────

export const progressApi = {
  save: (dto: object) => api.post('/progress', dto).then((r) => r.data),
  getForChild: (childId: string) =>
    api.get(`/progress/${childId}`).then((r) => r.data),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const dashboardApi = {
  get: (childId: string) =>
    api.get(`/dashboard/${childId}`).then((r) => r.data),
};

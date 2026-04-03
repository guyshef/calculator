import type { Page } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:3000';

// ─── Token cache (per worker process) ────────────────────────────────────────
// Avoids repeated API calls that can hit the auth throttle limit (5–10 req/min).

let _cachedParentToken: string | null = null;
let _cachedChildToken: string | null = null;
let _cachedChild: { id: string; name: string; avatar: string; coins: number; currentLevel: number } | null = null;

// ─── Mock exercise data ───────────────────────────────────────────────────────

export const MOCK_EXERCISES = [
  {
    id: 'ex-1',
    type: 'addition',
    operandA: 3,
    operandB: 4,
    answer: 7,
    options: [5, 6, 7, 8, 9],
    narrationKey: 'ex.addition.3.4',
  },
  {
    id: 'ex-2',
    type: 'addition',
    operandA: 2,
    operandB: 5,
    answer: 7,
    options: [4, 5, 7, 8, 10],
    narrationKey: 'ex.addition.2.5',
  },
  {
    id: 'ex-3',
    type: 'addition',
    operandA: 1,
    operandB: 6,
    answer: 7,
    options: [3, 5, 7, 9, 11],
    narrationKey: 'ex.addition.1.6',
  },
];

// ─── API interceptor ──────────────────────────────────────────────────────────

/**
 * Intercepts all /exercises/** requests and returns MOCK_EXERCISES.
 * Call this before navigating to /exercise/:level so tests never need a real token.
 */
export async function mockExercisesApi(page: Page): Promise<void> {
  await page.route('**/exercises/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ exercises: MOCK_EXERCISES }),
    });
  });
}

// ─── localStorage seeders ─────────────────────────────────────────────────────

/**
 * Logs in the real test parent, fetches their children, logs in the first child
 * named "דני", then seeds localStorage with a real JWT so exercise API calls succeed.
 */
export async function seedAuthenticatedChild(page: Page): Promise<void> {
  // Use cached tokens so parallel workers don't exceed the auth throttle limit.
  if (!_cachedParentToken) {
    const res = await page.request.post(`${API_URL}/auth/parent/login`, {
      data: { email: 'test@test.com', password: 'password123' },
    });
    const body = await res.json();
    if (!body.accessToken) throw new Error(`Parent login failed: ${JSON.stringify(body)}`);
    _cachedParentToken = body.accessToken;
  }

  if (!_cachedChild) {
    const res = await page.request.get(`${API_URL}/auth/children`, {
      headers: { Authorization: `Bearer ${_cachedParentToken}` },
    });
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    if (list.length === 0) throw new Error(`/auth/children returned unexpected: ${JSON.stringify(data)}`);
    _cachedChild = list.find((c: any) => c.name === 'דני') ?? list[0];
  }

  if (!_cachedChildToken) {
    const res = await page.request.post(`${API_URL}/auth/child/login`, {
      data: { childId: _cachedChild!.id, pin: '1234' },
    });
    const body = await res.json();
    if (!body.accessToken) throw new Error(`Child login failed: ${JSON.stringify(body)}`);
    _cachedChildToken = body.accessToken;
  }

  const child = _cachedChild!;
  const childToken = _cachedChildToken!

  // 4. Seed localStorage
  const state = {
    activeChild: {
      id: child.id,
      name: child.name,
      avatar: child.avatar,
      coins: child.coins,
      currentLevel: child.currentLevel,
      token: childToken,
    },
    levels: [
      { level: 1, status: 'current', stars: 0 },
      { level: 2, status: 'locked', stars: 0 },
    ],
    pendingSessions: [],
  };

  await page.goto('/');
  await page.evaluate((s) => {
    localStorage.setItem('calculator-game-store', JSON.stringify({ state: s, version: 0 }));
  }, state);
}

/**
 * Seeds localStorage with an empty token — simulates an unauthenticated child.
 * Exercises API will return 401 and the error screen should render.
 */
export async function seedUnauthenticatedChild(page: Page): Promise<void> {
  const state = {
    activeChild: {
      id: 'unauthenticated-child',
      name: 'ילד',
      avatar: 'cat-1',
      coins: 0,
      currentLevel: 1,
      token: '',
    },
    levels: [{ level: 1, status: 'current', stars: 0 }],
    pendingSessions: [],
  };

  await page.goto('/');
  await page.evaluate((s) => {
    localStorage.setItem('calculator-game-store', JSON.stringify({ state: s, version: 0 }));
  }, state);
}

import { test, expect } from '@playwright/test';

/**
 * Performance testing — simulates a low-end tablet (throttled CPU + slow 3G).
 * Uses Playwright's CDP session to apply network and CPU throttling,
 * then measures Core Web Vitals via the Performance API.
 *
 * Thresholds are based on "good" ratings for a child on a budget Android tablet:
 *   - FCP  (First Contentful Paint) < 2500ms
 *   - LCP  (Largest Contentful Paint) < 3000ms
 *   - TBT  (Total Blocking Time) < 300ms  (proxy for INP on low-end devices)
 *   - TTI  (Time to Interactive) < 4000ms
 */

test.use({ browserName: 'chromium' }); // CDP required for throttling

const THRESHOLDS = {
  fcp: 2500,
  lcp: 3000,
  tbt: 300,
  tti: 4000,
};

async function measurePerf(page: import('@playwright/test').Page, url: string) {
  // Apply slow 3G + 4× CPU throttling (simulates budget Android tablet)
  const client = await (page.context() as any).newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: (1.5 * 1024 * 1024) / 8, // 1.5 Mbps
    uploadThroughput: (750 * 1024) / 8,            // 750 kbps
    latency: 40,
  });
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await page.goto(url, { waitUntil: 'networkidle' });

  // Collect Web Vitals via PerformanceObserver
  const metrics = await page.evaluate(() => {
    return new Promise<{
      fcp: number; lcp: number; tbt: number; domInteractive: number;
    }>((resolve) => {
      const result = { fcp: 0, lcp: 0, tbt: 0, domInteractive: 0 };

      // FCP
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntriesByName('first-contentful-paint');
        if (entries.length) result.fcp = entries[0].startTime;
      });
      fcpObserver.observe({ type: 'paint', buffered: true });

      // LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length) result.lcp = entries[entries.length - 1].startTime;
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      // TBT (sum of long task excess over 50ms)
      const tbtObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) result.tbt += entry.duration - 50;
        }
      });
      tbtObserver.observe({ type: 'longtask', buffered: true });

      setTimeout(() => {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        result.domInteractive = nav?.domInteractive ?? 0;
        resolve(result);
      }, 5000); // collect for 5s after load
    });
  });

  await client.send('Network.emulateNetworkConditions', {
    offline: false, downloadThroughput: -1, uploadThroughput: -1, latency: 0,
  });
  await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });

  return metrics;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('Performance — simulated low-end tablet (4× CPU, slow 3G)', () => {

  test('Lobby: FCP and LCP within threshold', async ({ page }) => {
    const m = await measurePerf(page, '/');
    console.log(`Lobby — FCP: ${m.fcp.toFixed(0)}ms, LCP: ${m.lcp.toFixed(0)}ms, TBT: ${m.tbt.toFixed(0)}ms`);
    expect(m.fcp, `FCP ${m.fcp.toFixed(0)}ms exceeds ${THRESHOLDS.fcp}ms threshold`).toBeLessThan(THRESHOLDS.fcp);
    expect(m.lcp, `LCP ${m.lcp.toFixed(0)}ms exceeds ${THRESHOLDS.lcp}ms threshold`).toBeLessThan(THRESHOLDS.lcp);
    expect(m.tbt, `TBT ${m.tbt.toFixed(0)}ms exceeds ${THRESHOLDS.tbt}ms threshold`).toBeLessThan(THRESHOLDS.tbt);
  });

  test('Avatar screen: FCP within threshold', async ({ page }) => {
    const m = await measurePerf(page, '/avatar');
    console.log(`Avatar — FCP: ${m.fcp.toFixed(0)}ms, LCP: ${m.lcp.toFixed(0)}ms`);
    expect(m.fcp).toBeLessThan(THRESHOLDS.fcp);
    expect(m.lcp).toBeLessThan(THRESHOLDS.lcp);
  });

  test('Exercise screen: loads within TTI threshold', async ({ page }) => {
    // Seed a child so the map doesn't redirect
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('calculator-game-store', JSON.stringify({
        state: {
          activeChild: { id: 'c1', name: 'Test', avatar: 'cat-1', coins: 0, currentLevel: 1, token: '' },
          levels: [{ level: 1, status: 'current', stars: 0 }],
          pendingSessions: [],
        },
        version: 0,
      }));
    });
    const m = await measurePerf(page, '/exercise/1');
    console.log(`Exercise — FCP: ${m.fcp.toFixed(0)}ms, LCP: ${m.lcp.toFixed(0)}ms, domInteractive: ${m.domInteractive.toFixed(0)}ms`);
    expect(m.fcp).toBeLessThan(THRESHOLDS.fcp);
    expect(m.domInteractive, `domInteractive ${m.domInteractive.toFixed(0)}ms exceeds TTI ${THRESHOLDS.tti}ms`).toBeLessThan(THRESHOLDS.tti);
  });

  test('Results screen: no heavy assets block render', async ({ page }) => {
    const m = await measurePerf(page, '/results');
    console.log(`Results — FCP: ${m.fcp.toFixed(0)}ms, TBT: ${m.tbt.toFixed(0)}ms`);
    expect(m.fcp).toBeLessThan(THRESHOLDS.fcp);
    expect(m.tbt).toBeLessThan(THRESHOLDS.tbt);
  });
});

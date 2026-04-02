import '@testing-library/jest-dom';

// Silence i18next initialization warnings in tests
vi.mock('../i18n', () => ({}));

// Mock Web Speech API (not available in jsdom)
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: { speak: vi.fn(), cancel: vi.fn(), getVoices: vi.fn(() => []) },
});

// Mock HTMLMediaElement.play (not implemented in jsdom)
window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
window.HTMLMediaElement.prototype.load = vi.fn();

// matchMedia mock (used by useAudio for prefers-reduced-motion)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAudio } from '../useAudio';

describe('useAudio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the three expected functions', () => {
    const { result } = renderHook(() => useAudio());
    expect(typeof result.current.playNarration).toBe('function');
    expect(typeof result.current.playSfx).toBe('function');
    expect(typeof result.current.cancelSpeech).toBe('function');
  });

  it('cancelSpeech calls speechSynthesis.cancel', () => {
    const { result } = renderHook(() => useAudio());
    act(() => result.current.cancelSpeech());
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
  });

  it('playNarration falls back to speechSynthesis when audio file unavailable', async () => {
    // HTMLMediaElement.play is mocked to reject (simulating missing file)
    window.HTMLMediaElement.prototype.play = vi.fn().mockRejectedValue(new Error('Not found'));

    const { result } = renderHook(() => useAudio());
    await act(async () => {
      result.current.playNarration('ex.addition.1.1');
      // Allow promises to settle
      await new Promise((r) => setTimeout(r, 1100));
    });

    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });

  it('playNarration does not call speechSynthesis for unknown key', async () => {
    const { result } = renderHook(() => useAudio());
    await act(async () => {
      result.current.playNarration('unknown.key.that.has.no.text');
      await new Promise((r) => setTimeout(r, 1100));
    });
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
  });
});

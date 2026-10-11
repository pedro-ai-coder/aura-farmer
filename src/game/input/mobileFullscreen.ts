/**
 * Immersive mobile presentation: native Fullscreen + optional landscape lock,
 * with a reversible CSS-only fallback where those APIs are unavailable.
 * Nothing here changes the 960×600 Phaser coordinate system or touch inputs.
 */
export function setupMobileFullscreen(): void {
  const stage = document.querySelector<HTMLElement>('.play-layout')!;
  const button = document.querySelector<HTMLButtonElement>('#fullscreen-toggle')!;
  const notice = document.querySelector<HTMLElement>('#mobile-fullscreen-status')!;
  let mode: 'off' | 'native' | 'fallback' = 'off';

  function isLandscape(): boolean {
    return window.innerWidth > window.innerHeight;
  }

  function setMode(next: typeof mode): void {
    mode = next;
    stage.classList.toggle('is-immersive', next !== 'off');
    button.textContent = next === 'off' ? 'FULL SCREEN' : 'EXIT';
    button.setAttribute('aria-pressed', String(next !== 'off'));
    window.dispatchEvent(new Event('aura:fullscreen-mode'));
    notice.textContent = next === 'off' ? '' : isLandscape()
      ? 'Landscape play mode' : 'Rotate your phone sideways for landscape play';
  }

  async function enter(): Promise<void> {
    let native = false;
    try {
      if (typeof stage.requestFullscreen === 'function') {
        await stage.requestFullscreen({ navigationUI: 'hide' });
        native = document.fullscreenElement === stage;
      }
    } catch {
      // iOS Safari / embedded browsers can reject a Fullscreen request.
    }
    setMode(native ? 'native' : 'fallback');
    if (native) {
      const orientation = screen.orientation as (ScreenOrientation & {
        lock?: (direction: 'landscape') => Promise<void>;
      }) | undefined;
      try {
        if (typeof orientation?.lock === 'function') await orientation.lock('landscape');
      } catch {
        // Orientation locking is optional; manual rotation must still work.
      }
    }
  }

  async function exit(): Promise<void> {
    try {
      if (document.fullscreenElement === stage) await document.exitFullscreen();
    } catch {
      // Even if the browser rejects the exit call, keep the controls usable.
    }
    setMode('off');
  }

  button.addEventListener('click', () => {
    // Direct user gesture required for native Fullscreen API.
    if (mode === 'off') void enter();
    else void exit();
  });
  document.addEventListener('fullscreenchange', () => {
    if (mode === 'native' && document.fullscreenElement !== stage) setMode('off');
  });
  window.addEventListener('resize', () => {
    if (mode !== 'off') notice.textContent = isLandscape()
      ? 'Landscape play mode' : 'Rotate your phone sideways for landscape play';
  });
  // Leave immersive mode gracefully when the page loses focus during navigation.
  window.addEventListener('pagehide', () => setMode('off'));
}

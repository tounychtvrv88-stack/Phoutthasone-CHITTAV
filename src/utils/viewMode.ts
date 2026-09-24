export type DeviceViewMode = 'desktop' | 'mobile';

const STORAGE_KEY = 'ny_store_view_mode';

export function getStoredViewMode(): DeviceViewMode {
  if (typeof window === 'undefined') return 'mobile';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'desktop' || saved === 'mobile') {
      return saved;
    }
  } catch (e) {
    console.error('Error reading view mode:', e);
  }
  return 'mobile';
}

export function applyViewMode(mode: DeviceViewMode) {
  if (typeof document === 'undefined') return;

  let meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'viewport';
    document.head.appendChild(meta);
  }

  const root = document.documentElement;

  if (mode === 'desktop') {
    // When desktop mode is active, adjust viewport width to 1280px with user scalability and appropriate scale
    const screenWidth = typeof window !== 'undefined' ? window.screen.width : 390;
    const initialScale = Math.max(0.25, Math.min(1.0, screenWidth / 1280));

    meta.setAttribute(
      'content',
      `width=1280, initial-scale=${initialScale.toFixed(2)}, minimum-scale=0.2, maximum-scale=3.0, user-scalable=yes`
    );
    root.classList.add('desktop-mode-active');
    document.body.classList.add('desktop-mode-active');
    try {
      localStorage.setItem(STORAGE_KEY, 'desktop');
    } catch {
      // Ignore
    }
  } else {
    // Standard responsive mobile viewport
    meta.setAttribute(
      'content',
      'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes'
    );
    root.classList.remove('desktop-mode-active');
    document.body.classList.remove('desktop-mode-active');
    try {
      localStorage.setItem(STORAGE_KEY, 'mobile');
    } catch {
      // Ignore
    }
  }
}

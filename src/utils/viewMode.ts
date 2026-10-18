export type DeviceViewMode = 'desktop' | 'mobile';

const STORAGE_KEY = 'ny_store_view_mode';

export function getStoredViewMode(): DeviceViewMode {
  if (typeof window === 'undefined') return 'mobile';
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // Ignore
  }
  return 'mobile';
}

export function applyViewMode(mode: DeviceViewMode = 'mobile') {
  if (typeof document === 'undefined') return;

  let meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'viewport';
    document.head.appendChild(meta);
  }

  const root = document.documentElement;

  // Ensure default responsive viewport and clean up desktop mode classes
  meta.setAttribute(
    'content',
    'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes'
  );
  root.classList.remove('desktop-mode-active');
  document.body.classList.remove('desktop-mode-active');

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}


export type AppEvent =
  | { type: 'race-deleted'; payload: { raceId: string } }
  | { type: 'race-created'; payload: { raceId: string } };

const STORAGE_KEY = 'app-event';

export function postAppEvent(event: AppEvent) {
  try {
    if (typeof window === 'undefined') return;
    if ('BroadcastChannel' in window) {
      const ch = new BroadcastChannel('app-events');
      ch.postMessage(event);
      ch.close();
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...event, ts: Date.now() }));
      // Limpieza rápida
      setTimeout(() => {
        try { localStorage.removeItem(STORAGE_KEY); } catch {}
      }, 0);
    }
  } catch {}
}

export function subscribeAppEvents(handler: (e: AppEvent) => void) {
  if (typeof window === 'undefined') return () => {};
  let ch: BroadcastChannel | null = null;
  const storageListener = (ev: StorageEvent) => {
    if (ev.key !== STORAGE_KEY || !ev.newValue) return;
    try {
      const data = JSON.parse(ev.newValue) as AppEvent & { ts?: number };
      handler({ type: data.type, payload: (data as any).payload });
    } catch {}
  };
  if ('BroadcastChannel' in window) {
    ch = new BroadcastChannel('app-events');
    ch.onmessage = (msg) => handler(msg.data as AppEvent);
  } else {
    window.addEventListener('storage', storageListener);
  }
  return () => {
    if (ch) ch.close();
    else window.removeEventListener('storage', storageListener);
  };
}



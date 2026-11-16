import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { initialData } from './data.js';

// Admin data store — DEMO: kept in the browser (localStorage). Swap for the real database later.
const KEY = 'drifton_admin_demo_v1';
const load = () => {
  try { const v = JSON.parse(localStorage.getItem(KEY)); if (v && v.orders) return v; } catch { /* ignore */ }
  return initialData;
};

const Ctx = createContext(null);

export function AdminStore({ children }) {
  const [data, setData] = useState(load);
  const [toast, setToast] = useState('');
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* ignore */ } }, [data]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2200); return () => clearTimeout(t); }, [toast]);

  // update one item in a list by id (or code for coupons)
  const update = useCallback((list, id, patch, msg) => {
    setData((d) => ({ ...d, [list]: d[list].map((x) => ((x.id ?? x.code) === id ? { ...x, ...patch } : x)) }));
    if (msg) setToast(msg);
  }, []);
  const add = useCallback((list, item, msg) => { setData((d) => ({ ...d, [list]: [item, ...d[list]] })); if (msg) setToast(msg); }, []);
  const remove = useCallback((list, id, msg) => { setData((d) => ({ ...d, [list]: d[list].filter((x) => (x.id ?? x.code) !== id) })); if (msg) setToast(msg); }, []);
  const saveSettings = useCallback((settings) => { setData((d) => ({ ...d, settings })); setToast('Settings saved'); }, []);
  const reset = useCallback(() => { setData(initialData); setToast('Demo data reset'); }, []);

  const value = useMemo(() => ({ data, update, add, remove, saveSettings, reset, toast, notify: setToast }), [data, update, add, remove, saveSettings, reset, toast]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAdmin = () => useContext(Ctx);

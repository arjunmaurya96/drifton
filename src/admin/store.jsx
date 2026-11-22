import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { collection, doc, onSnapshot, orderBy, query, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, firebaseReady } from '../lib/firebase.js';
import { initialData, defaultConfig } from './data.js';
import { DEMO_ADMIN_KEY } from '../lib/api.js';

// =====================================================================
//  Admin data store
//  • Firebase keys set  → LIVE data from Firestore (orders, enquiries, reviews, config/store)
//  • No keys (demo)     → demo data kept in this browser (localStorage)
// =====================================================================
export const LIVE = firebaseReady;

const KEY = DEMO_ADMIN_KEY;
const loadDemo = () => {
  try { const v = JSON.parse(localStorage.getItem(KEY)); if (v && v.orders) return v; } catch { /* ignore */ }
  return initialData;
};

const CONFIG_LISTS = ['products', 'offers', 'coupons'];
const toISO = (ts) => (ts?.toDate ? ts.toDate().toISOString() : typeof ts === 'string' ? ts : new Date().toISOString());

// customers are built from orders (aggregated by phone or email)
function customersFrom(orders) {
  const map = new Map();
  [...orders].reverse().forEach((o) => {
    const key = (o.phone || o.email || o.customer || '').trim();
    if (!key) return;
    if (!map.has(key)) {
      map.set(key, {
        id: key,
        name: o.customer || 'Customer',
        phone: o.phone || '',
        email: o.email || '',
        address: o.address || '',
        pin: o.pin || '',
        city: o.city || (o.pin ? `PIN ${o.pin}` : ''),
        joined: o.date || new Date().toISOString(),
      });
    } else {
      const cur = map.get(key);
      if (o.customer && cur.name === 'Customer') cur.name = o.customer;
      if (o.email && !cur.email) cur.email = o.email;
      if (o.phone && !cur.phone) cur.phone = o.phone;
      if (o.address && !cur.address) cur.address = o.address;
      if (o.pin && !cur.pin) cur.pin = o.pin;
      if (o.city && !cur.city) cur.city = o.city;
    }
  });
  return [...map.values()];
}

const Ctx = createContext(null);

export function AdminStore({ children }) {
  const [demo, setDemo] = useState(loadDemo);
  const [live, setLive] = useState({ orders: [], enquiries: [], reviews: [], ...defaultConfig(), loading: true, configSaved: false });
  const [toast, setToast] = useState('');
  const liveRef = useRef(live);
  liveRef.current = live;

  useEffect(() => { if (!LIVE) try { localStorage.setItem(KEY, JSON.stringify(demo)); } catch { /* ignore */ } }, [demo]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2200); return () => clearTimeout(t); }, [toast]);

  // demo: orders placed on the website in another tab show up here
  useEffect(() => {
    if (LIVE) return undefined;
    const onStorage = (e) => { if (e.key === KEY && e.newValue) try { setDemo(JSON.parse(e.newValue)); } catch { /* ignore */ } };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // live listeners
  useEffect(() => {
    if (!LIVE) return undefined;
    const fail = () => setToast('Could not load data — check admin access');
    const watch = (name, map) => onSnapshot(query(collection(db, name), orderBy('createdAt', 'desc')),
      (snap) => setLive((d) => ({ ...d, loading: false, [name]: snap.docs.map((x) => map({ id: x.id, ...x.data() })) })), fail);
    const offs = [
      watch('orders', (o) => ({ ...o, customerId: (o.phone || o.email || o.customer || '').trim(), city: o.city || (o.pin ? `PIN ${o.pin}` : ''), date: toISO(o.createdAt) })),
      watch('enquiries', (e) => ({ ...e, date: toISO(e.createdAt) })),
      watch('reviews', (r) => ({ ...r, date: toISO(r.createdAt) })),
      onSnapshot(doc(db, 'config', 'store'), (snap) => {
        if (!snap.exists()) return setLive((d) => ({ ...d, configSaved: false }));
        const c = snap.data(), def = defaultConfig();
        setLive((d) => ({ ...d, configSaved: true, products: c.products || def.products, offers: c.offers || def.offers, coupons: c.coupons || def.coupons, settings: { ...def.settings, ...(c.settings || {}) } }));
      }, fail),
    ];
    return () => offs.forEach((off) => off());
  }, []);

  // save the website settings document (products, offers, coupons, settings)
  const saveConfig = useCallback(async (patch, msg) => {
    const cur = liveRef.current;
    const next = { products: cur.products, offers: cur.offers, coupons: cur.coupons, settings: cur.settings, ...patch };
    setLive((d) => ({ ...d, ...patch }));
    try {
      await setDoc(doc(db, 'config', 'store'), { ...next, updatedAt: new Date().toISOString() });
      if (msg) setToast(msg);
    } catch { setToast('Save failed — try again'); }
  }, []);

  const keyOf = (x) => x.id ?? x.code;

  const update = useCallback((list, id, patch, msg) => {
    if (!LIVE) { setDemo((d) => ({ ...d, [list]: d[list].map((x) => (keyOf(x) === id ? { ...x, ...patch } : x)) })); if (msg) setToast(msg); return; }
    if (CONFIG_LISTS.includes(list)) {
      const arr = liveRef.current[list].map((x) => (keyOf(x) === id ? { ...x, ...patch } : x));
      // number boxes save on blur (msg present) — typing only updates the screen
      if (msg) saveConfig({ [list]: arr }, msg); else setLive((d) => ({ ...d, [list]: arr }));
      return;
    }
    setLive((d) => ({ ...d, [list]: d[list].map((x) => (keyOf(x) === id ? { ...x, ...patch } : x)) }));
    updateDoc(doc(db, list, id), patch).then(() => msg && setToast(msg)).catch(() => setToast('Save failed — try again'));
  }, [saveConfig]);

  const add = useCallback((list, item, msg) => {
    if (!LIVE) { setDemo((d) => ({ ...d, [list]: [item, ...d[list]] })); if (msg) setToast(msg); return; }
    if (CONFIG_LISTS.includes(list)) saveConfig({ [list]: [item, ...liveRef.current[list]] }, msg);
  }, [saveConfig]);

  const remove = useCallback((list, id, msg) => {
    if (!LIVE) { setDemo((d) => ({ ...d, [list]: d[list].filter((x) => keyOf(x) !== id) })); if (msg) setToast(msg); return; }
    if (CONFIG_LISTS.includes(list)) saveConfig({ [list]: liveRef.current[list].filter((x) => keyOf(x) !== id) }, msg);
    else deleteDoc(doc(db, list, id)).then(() => msg && setToast(msg)).catch(() => setToast('Delete failed'));
  }, [saveConfig]);

  const saveSettings = useCallback((settings) => {
    if (!LIVE) { setDemo((d) => ({ ...d, settings })); setToast('Settings saved'); return; }
    saveConfig({ settings }, 'Settings saved — live on the website');
  }, [saveConfig]);

  // demo: reset demo data · live: publish the default prices/offers/settings to the website
  const reset = useCallback(() => {
    if (!LIVE) { setDemo(initialData); setToast('Demo data reset'); return; }
    saveConfig(defaultConfig(), 'Default settings published');
  }, [saveConfig]);

  const data = useMemo(() => {
    if (!LIVE) {
      const uses = {};
      demo.orders.forEach((o) => { if (o.coupon) uses[o.coupon] = (uses[o.coupon] || 0) + 1; });
      return {
        ...demo,
        customers: customersFrom(demo.orders),
        coupons: demo.coupons.map((c) => ({ ...c, uses: (uses[c.code] != null ? uses[c.code] : c.uses) || 0 })),
      };
    }
    const uses = {};
    live.orders.forEach((o) => { if (o.coupon) uses[o.coupon] = (uses[o.coupon] || 0) + 1; });
    return { ...live, customers: customersFrom(live.orders), coupons: live.coupons.map((c) => ({ ...c, uses: uses[c.code] || 0 })) };
  }, [demo, live]);

  const value = useMemo(() => ({ data, live: LIVE, update, add, remove, saveSettings, reset, toast, notify: setToast }), [data, update, add, remove, saveSettings, reset, toast]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAdmin = () => useContext(Ctx);

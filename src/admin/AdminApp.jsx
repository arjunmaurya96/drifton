import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase.js';
import { AdminStore, useAdmin, LIVE } from './store.jsx';
import { Icon, LOW_STOCK, inputCls } from './ui.jsx';
import Overview from './pages/Overview.jsx';
import Orders from './pages/Orders.jsx';
import Products from './pages/Products.jsx';
import Offers from './pages/Offers.jsx';
import Customers from './pages/Customers.jsx';
import Enquiries from './pages/Enquiries.jsx';
import Reviews from './pages/Reviews.jsx';
import Settings from './pages/Settings.jsx';

// Login: Firebase email/password (LIVE) — the user must also have a doc in admins/{uid}.
// Without Firebase keys the panel runs in DEMO mode with the demo login below.
const DEMO = { email: 'admin@drifton.in', password: 'drifton123' };
const AUTH_KEY = 'drifton_admin_auth';
const isAuthed = () => { try { return sessionStorage.getItem(AUTH_KEY) === '1'; } catch { return false; } };

function Login({ onLogin, notice }) {
  const [email, setEmail] = useState(LIVE ? '' : DEMO.email);
  const [busy, setBusy] = useState(false);
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!LIVE) {
      if (email.trim().toLowerCase() === DEMO.email && pw === DEMO.password) onLogin();
      else setErr('Wrong email or password.');
      return;
    }
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pw);
      onLogin();
    } catch {
      setErr('Wrong email or password.');
    }
    setBusy(false);
  };
  return (
    <div className="grid min-h-svh grid-cols-1 bg-[#F6F7FB] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-[radial-gradient(120%_120%_at_0%_0%,#24408F_0%,#0F1A3C_60%)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <img src="/assets/images/logo-drifton-white.webp" alt="DriftOn" className="h-11 w-auto self-start" />
        <div>
          <h2 className="font-head text-[40px] font-bold leading-tight">Run your store<br />from one place.</h2>
          <p className="mt-3 max-w-[420px] text-[16px] text-ondark">Orders, products, offers, customers and enquiries — all in a simple dashboard.</p>
        </div>
        <img src="/assets/images/hero-products/all-four.webp" alt="" className="w-[78%] max-w-[480px] self-center drop-shadow-2xl" />
      </div>
      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-[400px] rounded-3xl bg-white p-7 shadow-[0_30px_60px_-30px_rgba(15,26,60,.35)] ring-1 ring-[#E6E9F2] sm:p-9">
          <img src="/assets/images/logo-drifton.webp" alt="DriftOn" className="mb-6 h-9 w-auto lg:hidden" />
          <h1 className="font-head text-[26px] font-bold">Admin login</h1>
          <p className="mt-1 text-[14px] text-muted-2">Sign in to manage DriftOn.</p>
          <div className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5"><span className="text-[13px] font-semibold">Email</span>
              <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></label>
            <label className="flex flex-col gap-1.5"><span className="text-[13px] font-semibold">Password</span>
              <span className="relative">
                <input className={`${inputCls} pr-11`} type={show ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
                <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-2 hover:bg-[#F3F5FA]">{show ? <Icon.eyeOff size={18} /> : <Icon.eye size={18} />}</button>
              </span></label>
            {(err || notice) && <p role="alert" className="text-[13px] font-semibold text-[#B42318]">{err || notice}</p>}
            <button disabled={busy} className="mt-1 min-h-12 rounded-xl bg-navy-900 text-[15px] font-semibold text-white hover:bg-navy-700 disabled:opacity-60">{busy ? 'Signing in…' : 'Sign in'}</button>
            {!LIVE && <p className="rounded-xl bg-[#FFF4E5] px-3.5 py-2.5 text-[12.5px] text-[#8A4B00]">Demo login — email <b>{DEMO.email}</b>, password <b>{DEMO.password}</b></p>}
            <Link to="/" className="text-center text-[13px] font-semibold text-navy-700 hover:underline">← Back to website</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------- new order alert: sound + pop-up message + browser notification ----------
const SOUND_KEY = 'drifton_admin_sound';
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [[880, 0], [1320, 0.18]].forEach(([f, t]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.35);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.4);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch { /* no sound support */ }
}
function useNewOrderAlert(orders, loading, notify) {
  const seen = useRef(null);
  const [sound, setSound] = useState(() => { try { return localStorage.getItem(SOUND_KEY) !== 'off'; } catch { return true; } });
  const [unseen, setUnseen] = useState(0);
  useEffect(() => {
    if (loading) return;
    const ids = orders.map((o) => o.id);
    if (!seen.current) { seen.current = new Set(ids); return; } // first load: nothing is "new"
    const fresh = orders.filter((o) => !seen.current.has(o.id) && o.status === 'New');
    ids.forEach((id) => seen.current.add(id));
    if (!fresh.length) return;
    const o = fresh[0];
    const msg = fresh.length > 1 ? `${fresh.length} new orders received` : `New order ${o.id} — ${o.customer}, ₹${Math.round(o.total || 0).toLocaleString('en-IN')}`;
    notify(msg);
    if (sound) beep();
    setUnseen((n) => n + fresh.length);
    try { if (document.hidden && 'Notification' in window && Notification.permission === 'granted') new Notification('DriftOn — new order', { body: msg, icon: '/assets/images/logo.webp' }); } catch { /* ignore */ }
  }, [orders, loading, notify, sound]);
  // tab title shows the count until the admin looks at the page
  useEffect(() => {
    const base = 'DriftOn Admin';
    document.title = unseen ? `(${unseen}) New order — ${base}` : base;
    if (!unseen) return undefined;
    const clear = () => !document.hidden && setUnseen(0);
    window.addEventListener('focus', clear); document.addEventListener('visibilitychange', clear); window.addEventListener('click', clear);
    return () => { window.removeEventListener('focus', clear); document.removeEventListener('visibilitychange', clear); window.removeEventListener('click', clear); };
  }, [unseen]);
  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    try { localStorage.setItem(SOUND_KEY, next ? 'on' : 'off'); } catch { /* ignore */ }
    if (next) { beep(); try { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); } catch { /* ignore */ } }
  };
  return { sound, toggleSound };
}

function Shell({ onLogout }) {
  const { data, toast, reset, notify } = useAdmin();
  const { sound, toggleSound } = useNewOrderAlert(data.orders, data.loading, notify);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  useEffect(() => setOpen(false), [pathname]);

  const newOrders = data.orders.filter((o) => o.status === 'New').length;
  const newEnq = data.enquiries.filter((e) => e.status === 'New').length;
  const pendingReviews = data.reviews.filter((r) => r.status === 'Pending').length;
  const nav = [
    ['', 'Overview', Icon.home],
    ['orders', 'Orders', Icon.orders, newOrders],
    ['products', 'Products', Icon.box, data.products.filter((p) => p.active && p.stock <= LOW_STOCK).length],
    ['offers', 'Offers & coupons', Icon.tag],
    ['customers', 'Customers & Users', Icon.users],
    ['enquiries', 'Enquiries', Icon.inbox, newEnq],
    ['reviews', 'Reviews', Icon.star, pendingReviews],
    ['settings', 'Settings', Icon.gear],
  ];

  const sidebar = (
    <div className="flex h-full flex-col bg-[#0F1A3C] text-white">
      <div className="flex h-16 items-center justify-between px-5">
        <img src="/assets/images/logo-drifton-white.webp" alt="DriftOn" className="h-8 w-auto" />
        <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-mint">Admin</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-3" aria-label="Admin">
        {nav.map(([to, label, Ico, n]) => (
          <NavLink key={label} to={`/admin${to ? `/${to}` : ''}`} end={!to}
            className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] font-medium transition ${isActive ? 'bg-white text-navy-900 shadow' : 'text-[#C9D1EA] hover:bg-white/10 hover:text-white'}`}>
            <Ico size={19} />
            <span className="flex-1">{label}</span>
            {n > 0 && <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold text-white">{n}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="flex flex-col gap-1 border-t border-white/10 p-3">
        <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-[#C9D1EA] hover:bg-white/10 hover:text-white"><Icon.external size={18} /> View website</a>
        <button onClick={onLogout} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] text-[#C9D1EA] hover:bg-white/10 hover:text-white"><Icon.logout size={18} /> Log out</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-svh bg-[#F6F7FB] font-body text-navy-900">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[256px] lg:block">{sidebar}</aside>
      {/* mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${open ? 'visible' : 'invisible'}`}>
        <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-navy-900/50 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} />
        <div className={`absolute inset-y-0 left-0 w-[270px] transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>{sidebar}</div>
      </div>

      <div className="lg:pl-[256px]">
        {/* top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#E6E9F2] bg-white/85 px-4 backdrop-blur sm:px-6">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="flex size-10 items-center justify-center rounded-xl hover:bg-[#F3F5FA] lg:hidden"><Icon.menu /></button>
          <form onSubmit={(e) => { e.preventDefault(); const q = new FormData(e.currentTarget).get('q'); navigate(`/admin/orders?q=${encodeURIComponent(q || '')}`); }} className="relative hidden max-w-[380px] flex-1 sm:block">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-2"><Icon.search size={18} /></span>
            <input name="q" placeholder="Search orders, customers…" className="min-h-10 w-full rounded-xl bg-[#F3F5FA] pl-10 pr-3 text-[14px] outline-none focus:bg-white focus:ring-2 focus:ring-blue-soft" />
          </form>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={toggleSound} title={sound ? 'New order sound is ON' : 'New order sound is OFF'} aria-label={sound ? 'Turn off new order sound' : 'Turn on new order sound'}
              className={`flex min-h-10 items-center gap-1.5 rounded-xl px-2.5 text-[12.5px] font-semibold hover:bg-[#F3F5FA] ${sound ? 'text-[#17703D]' : 'text-muted-2'}`}>
              {sound ? <Icon.sound size={19} /> : <Icon.mute size={19} />}<span className="hidden md:inline">{sound ? 'Order alert on' : 'Order alert off'}</span>
            </button>
            <Link to="/admin/orders" aria-label="Notifications" className="relative flex size-10 items-center justify-center rounded-xl hover:bg-[#F3F5FA]">
              <Icon.bell />{newOrders + newEnq > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-[#E5484D] ring-2 ring-white" />}
            </Link>
            <div className="flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-3 hover:bg-[#F3F5FA]">
              <span className="flex size-9 items-center justify-center rounded-full bg-navy-900 text-[13px] font-bold text-mint">AI</span>
              <span className="hidden leading-tight sm:block"><b className="block text-[13.5px]">AI Enterprises</b><span className="text-[12px] text-muted-2">Owner</span></span>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
          {!LIVE && (
            <div className="mb-5 rounded-xl border border-[#FFE2B8] bg-[#FFF8EC] px-4 py-2.5 text-[13px] text-[#8A4B00]">
              <b>Demo mode:</b> Firebase keys are not added yet, so this dashboard shows demo data.
            </div>
          )}
          {LIVE && !data.configSaved && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#BFD3FF] bg-[#EEF3FF] px-4 py-2.5 text-[13px] text-[#1E3A8A]">
              <span><b>First time setup:</b> publish the default prices, offers and settings to the database.</span>
              <button onClick={reset} className="rounded-lg bg-navy-900 px-3 py-1.5 text-[13px] font-semibold text-white">Publish defaults</button>
            </div>
          )}
          <Routes>
            <Route index element={<Overview />} />
            <Route path="orders" element={<Orders />} />
            <Route path="products" element={<Products />} />
            <Route path="offers" element={<Offers />} />
            <Route path="customers" element={<Customers />} />
            <Route path="enquiries" element={<Enquiries />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>

      {/* toast */}
      <div aria-live="polite" className={`fixed bottom-5 left-1/2 z-[80] -translate-x-1/2 transition-all duration-300 ${toast ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}>
        <span className="flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-3 text-[14px] font-semibold text-white shadow-xl"><span className="text-mint"><Icon.check size={18} /></span>{toast}</span>
      </div>
    </div>
  );
}

// LIVE: watch the Firebase session and check the admins/{uid} document
function useLiveAuth() {
  const [state, setState] = useState({ ready: !LIVE, authed: false, error: '' });
  useEffect(() => {
    if (!LIVE) return undefined;
    return onAuthStateChanged(auth, async (user) => {
      if (!user) return setState({ ready: true, authed: false, error: '' });
      try {
        const ok = (await getDoc(doc(db, 'admins', user.uid))).exists();
        if (ok) return setState({ ready: true, authed: true, error: '' });
      } catch { /* not allowed */ }
      await signOut(auth);
      setState({ ready: true, authed: false, error: 'This account is not an admin.' });
    });
  }, []);
  return state;
}

export default function AdminApp() {
  const liveAuth = useLiveAuth();
  const [demoAuthed, setDemoAuthed] = useState(isAuthed);
  useEffect(() => { document.title = 'DriftOn Admin'; return () => { document.title = 'Drifton – Natural Crystal Deodorant'; }; }, []);
  const login = () => { if (LIVE) return; try { sessionStorage.setItem(AUTH_KEY, '1'); } catch { /* ignore */ } setDemoAuthed(true); };
  const logout = () => { if (LIVE) { signOut(auth); return; } try { sessionStorage.removeItem(AUTH_KEY); } catch { /* ignore */ } setDemoAuthed(false); };
  if (!liveAuth.ready) return <div className="flex min-h-svh items-center justify-center bg-[#F6F7FB] text-[14px] text-muted-2">Loading…</div>;
  const authed = LIVE ? liveAuth.authed : demoAuthed;
  // data listeners start only after login (Firestore rules allow admins only)
  return authed ? <AdminStore><Shell onLogout={logout} /></AdminStore> : <Login onLogin={login} notice={liveAuth.error} />;
}

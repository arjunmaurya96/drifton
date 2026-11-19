import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { products, formatINR } from '../data/products.js';
import { business } from '../data/site.js';
import InvoiceModal from '../admin/components/InvoiceModal.jsx';

// =====================================================================
//  Customer dashboard (My Account) — simple and friendly:
//  header with name + 4 small numbers, then tabs: Overview · My orders · Address · Help
// =====================================================================

const STEPS = ['New', 'Packed', 'Shipped', 'Delivered'];
const STEP_TEXT = {
  New: { title: 'Order placed', note: 'We have received your order and will pack it soon.', emoji: '🧾' },
  Packed: { title: 'Packed & ready', note: 'Your roll ons are packed and waiting for the courier.', emoji: '📦' },
  Shipped: { title: 'On the way', note: 'Your order is with Ekart and will reach you soon.', emoji: '🚚' },
  Delivered: { title: 'Delivered', note: 'Enjoy your DriftOn roll on! Hope you love it.', emoji: '🎉' },
  Cancelled: { title: 'Cancelled', note: 'This order was cancelled. Contact us if you need help.', emoji: '✖️' },
};
const BADGE = {
  New: 'bg-[#EAF0FF] text-[#2647B8]', Packed: 'bg-[#FFF1E2] text-[#B45309]', Shipped: 'bg-[#EFE9FF] text-[#5B3FA8]',
  Delivered: 'bg-[#E5F5EC] text-[#17703D]', Cancelled: 'bg-[#FDECEC] text-[#B42318]',
};
const trackLink = (t) => `https://www.ekartlogistics.com/shipmenttrack/${encodeURIComponent(t)}`;

// Firestore Timestamp / ISO string / number → Date
const toDate = (v) => {
  if (!v) return null;
  if (typeof v.toDate === 'function') return v.toDate();
  if (typeof v === 'object' && 'seconds' in v) return new Date(v.seconds * 1000);
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};
const fmtDate = (v) => toDate(v)?.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) || 'Recently';

// ---------- small icons ----------
const I = ({ d, size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">{d}</svg>
);
const ic = {
  bag: <><path d="M5 8h14l-1 12H6z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
  rupee: <><path d="M7 5h10M7 9h10M10 5c4 0 5 2 5 4s-2 4-5 4H8l7 6" /></>,
  truck: <><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.6" /><circle cx="17" cy="17.5" r="1.6" /></>,
  pin: <><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  grid: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01" /></>,
  file: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></>,
  repeat: <><path d="M4 11a7 7 0 0 1 12-4.9L18 8" /><path d="M18 4v4h-4M20 13a7 7 0 0 1-12 4.9L6 16" /><path d="M6 20v-4h4" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
  phone: <><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></>,
  logout: <><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" /></>,
  edit: <><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></>,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
};

function StatCard({ icon, label, value, tint, ink }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/85 p-3.5 shadow-[0_10px_30px_-22px_rgba(15,26,60,.5)] backdrop-blur sm:p-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl" style={{ background: tint, color: ink }}><I d={icon} /></span>
      <span className="min-w-0">
        <span className="block text-[12px] font-semibold text-muted-2">{label}</span>
        <b className="block truncate font-head text-[19px] leading-tight text-navy-900 sm:text-[21px]">{value}</b>
      </span>
    </div>
  );
}

// friendly 4-step tracker
function Tracker({ status }) {
  if (status === 'Cancelled') return <p className="rounded-xl bg-[#FDECEC] px-4 py-3 text-[13.5px] font-semibold text-[#B42318]">This order was cancelled.</p>;
  const at = Math.max(0, STEPS.indexOf(status));
  return (
    <ol className="grid grid-cols-4">
      {STEPS.map((st, k) => {
        const done = k <= at;
        return (
          <li key={st} className="relative flex flex-col items-center gap-1.5 text-center">
            {k > 0 && <span className={`absolute right-1/2 top-[15px] h-[3px] w-full -translate-y-1/2 rounded-full ${k <= at ? 'bg-brand' : 'bg-[#E6E9F2]'}`} />}
            <span className={`relative z-[1] flex size-[30px] items-center justify-center rounded-full text-[12px] font-bold ring-4 ring-white ${done ? 'bg-brand text-white' : 'bg-[#EEF0F5] text-muted-2'} ${k === at ? 'shadow-[0_0_0_6px_rgba(31,146,84,.15)]' : ''}`}>
              {done ? <I d={ic.check} size={15} /> : k + 1}
            </span>
            <span className={`text-[11.5px] font-semibold sm:text-[12.5px] ${done ? 'text-navy-900' : 'text-muted-2'}`}>{st === 'New' ? 'Placed' : st}</span>
          </li>
        );
      })}
    </ol>
  );
}

function Thumbs({ items }) {
  return (
    <span className="flex -space-x-2">
      {(items || []).slice(0, 4).map((it, k) => {
        const p = products.find((x) => x.id === it.id);
        return (
          <span key={k} className="flex size-10 items-center justify-center rounded-xl border-2 border-white p-1 shadow-sm" style={{ background: p?.bg || '#F3F5FA' }}>
            <img src={p?.image || '/assets/images/cutouts/crystal.webp'} alt="" className="h-full w-auto object-contain" />
          </span>
        );
      })}
    </span>
  );
}

export default function Profile() {
  const { user, userProfile, userOrders, updateUserProfile, logout, openAuth, authLoading, addToCart, openCart, notify } = useStore();

  const [tab, setTab] = useState('overview');
  const [openId, setOpenId] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  // address form
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({});
  const startEdit = () => {
    setF({
      name: userProfile.name || user?.displayName || '', phone: userProfile.phone || user?.phoneNumber || '',
      address: userProfile.address || '', pin: userProfile.pin || '', city: userProfile.city || '',
    });
    setEditing(true);
    setTab('address');
  };
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateUserProfile({ name: f.name.trim(), phone: f.phone.trim(), address: f.address.trim(), pin: f.pin.trim(), city: f.city.trim() });
    setSaving(false);
    setEditing(false);
  };

  const stats = useMemo(() => {
    const live = userOrders.filter((o) => o.status !== 'Cancelled');
    return {
      orders: userOrders.length,
      spent: live.reduce((a, o) => a + (Number(o.total) || 0), 0),
      active: userOrders.filter((o) => !['Delivered', 'Cancelled'].includes(o.status || 'New')).length,
      rollOns: live.reduce((a, o) => a + (Number(o.sticks) || (o.items || []).reduce((s, i) => s + (i.qty || 0), 0)), 0),
    };
  }, [userOrders]);

  const buyAgain = (o) => {
    let added = 0;
    (o.items || []).forEach((it) => {
      const p = products.find((x) => x.id === it.id);
      if (p) { addToCart(p, it.qty || 1, undefined, true); added += it.qty || 1; }
    });
    if (added) { notify?.(`${added} roll on${added > 1 ? 's' : ''} added to your cart`); openCart?.(); }
  };

  // ---------- loading / signed out ----------
  if (authLoading) {
    return (
      <div className="container-x py-28 text-center text-muted">
        <span className="inline-block size-8 animate-spin rounded-full border-4 border-line border-t-navy-900" />
        <p className="mt-3 text-sm">Loading your account…</p>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="bg-[linear-gradient(160deg,#F3F7FF_0%,#FDF3F7_60%,#FFF6EA_100%)] py-20 sm:py-28">
        <div className="container-x">
          <div className="mx-auto grid max-w-[880px] overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_30px_70px_-40px_rgba(15,26,60,.45)] md:grid-cols-2">
            <div className="relative hidden items-end justify-center bg-[linear-gradient(160deg,#F3E9F3,#F7B9D0)] p-8 md:flex">
              <img src="/assets/images/hero-products/all-four.webp" alt="DriftOn roll ons" className="w-full max-w-[320px] object-contain" />
            </div>
            <div className="p-8 sm:p-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-mint-soft px-3 py-1 text-[12px] font-bold text-brand-dark">My DriftOn account</span>
              <h1 className="mt-4 font-head text-[28px] font-bold leading-tight text-navy-900">Sign in to see your orders</h1>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">Track every order, download invoices, re-order in one tap and keep your delivery address saved.</p>
              <ul className="mt-5 flex flex-col gap-2 text-[14px] text-navy-900">
                {['Live order tracking', 'Invoices in one click', 'Faster checkout with saved address'].map((t) => (
                  <li key={t} className="flex items-center gap-2"><span className="flex size-5 items-center justify-center rounded-full bg-mint-soft text-brand"><I d={ic.check} size={12} /></span>{t}</li>
                ))}
              </ul>
              <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
                <button onClick={() => openAuth('login')} className="btn-primary min-h-12 flex-1">Log in</button>
                <button onClick={() => openAuth('signup')} className="btn-line min-h-12 flex-1">Create account</button>
              </div>
              <Link to="/#shop" className="mt-5 inline-block text-[13px] font-semibold text-navy-700 hover:underline">← Continue shopping</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const name = userProfile.name || user.displayName || 'Friend';
  const first = name.split(' ')[0];
  const latest = userOrders[0];
  const hasAddress = Boolean(userProfile.address);
  const TABS = [
    ['overview', 'Overview', ic.grid],
    ['orders', 'My orders', ic.bag, userOrders.length],
    ['address', 'Address', ic.pin],
    ['help', 'Help', ic.help],
  ];

  return (
    <div className="min-h-screen bg-[#F6F7FB] pb-16">
      {/* ================= HEADER ================= */}
      <div className="relative overflow-hidden bg-[linear-gradient(120deg,#F3E9F3_0%,#EAF0FF_50%,#FFF3E2_100%)]">
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(#0F1A3C12_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(180deg,#000,transparent)]" />
        <div className="container-x relative max-w-[1160px] pb-24 pt-8 sm:pt-10">
          <div className="flex flex-wrap items-center gap-4">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="size-16 rounded-2xl object-cover ring-4 ring-white sm:size-[72px]" />
            ) : (
              <span className="flex size-16 items-center justify-center rounded-2xl bg-navy-900 font-head text-[26px] font-bold text-white ring-4 ring-white sm:size-[72px]">{name[0].toUpperCase()}</span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-muted-2">My account</p>
              <h1 className="font-head text-[26px] font-bold leading-tight text-navy-900 sm:text-[32px]">Hi {first} 👋</h1>
              <p className="truncate text-[13.5px] text-muted">{user.email}</p>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <Link to="/#shop" className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 text-[14px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(15,26,60,.7)] hover:bg-navy-700 sm:flex-none">
                <I d={ic.bag} size={18} /> Shop roll ons
              </Link>
              <button onClick={logout} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-navy-900/10 bg-white px-4 text-[14px] font-semibold text-navy-900 hover:border-[#F5C2C2] hover:text-[#B42318]">
                <I d={ic.logout} size={18} /> <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-x relative -mt-16 max-w-[1160px]">
        {/* 4 numbers */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={ic.bag} label="Total orders" value={stats.orders} tint="#EAF0FF" ink="#2647B8" />
          <StatCard icon={ic.truck} label="On the way" value={stats.active} tint="#EFE9FF" ink="#5B3FA8" />
          <StatCard icon={ic.check} label="Roll ons bought" value={stats.rollOns} tint="#E5F5EC" ink="#17703D" />
          <StatCard icon={ic.rupee} label="Total spent" value={formatINR(stats.spent)} tint="#FFF1E2" ink="#C2410C" />
        </div>

        {/* tabs */}
        <div className="sticky top-[72px] z-20 mt-6 -mx-[18px] overflow-x-auto bg-[#F6F7FB]/90 px-[18px] py-2 backdrop-blur [scrollbar-width:none] sm:mx-0 sm:px-0">
          <div className="inline-flex gap-1 rounded-2xl border border-line bg-white p-1 shadow-sm">
            {TABS.map(([k, label, icon, n]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-[13px] font-semibold transition sm:gap-2 sm:px-4 sm:text-[14px] ${tab === k ? 'bg-navy-900 text-white shadow' : 'text-muted hover:bg-[#F3F5FA] hover:text-navy-900'}`}>
                <span className="hidden sm:inline"><I d={icon} size={17} /></span>{label}
                {n > 0 && <span className={`rounded-full px-1.5 text-[11px] ${tab === k ? 'bg-white/20' : 'bg-[#EEF0F5] text-navy-900'}`}>{n}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* ================= OVERVIEW ================= */}
        {tab === 'overview' && (
          <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-5">
              {/* latest order */}
              <section className="rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-head text-[18px] font-bold text-navy-900">Your latest order</h2>
                  {userOrders.length > 1 && <button onClick={() => setTab('orders')} className="text-[13px] font-semibold text-navy-700 hover:underline">All orders →</button>}
                </div>
                {!latest ? (
                  <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl bg-[#F6F7FB] px-6 py-10 text-center">
                    <span className="text-[34px]" aria-hidden="true">🛍️</span>
                    <b className="font-head text-[17px] text-navy-900">No orders yet</b>
                    <p className="max-w-[340px] text-[13.5px] text-muted">Pick your favourite roll on.</p>
                    <Link to="/#shop" className="btn-primary mt-1">Shop now</Link>
                  </div>
                ) : (() => {
                  const st = latest.status || 'New';
                  const t = STEP_TEXT[st] || STEP_TEXT.New;
                  return (
                    <>
                      <div className="mt-4 flex items-start gap-4 rounded-2xl bg-[linear-gradient(120deg,#F1F7F3,#EEF3FF)] p-4">
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[24px] shadow-sm" aria-hidden="true">{t.emoji}</span>
                        <span className="min-w-0 flex-1">
                          <b className="block font-head text-[17px] text-navy-900">{t.title}</b>
                          <span className="block text-[13.5px] text-muted">{t.note}</span>
                          <span className="mt-1 block text-[12.5px] text-muted-2">Order #{latest.id} · {fmtDate(latest.date || latest.createdAt)}</span>
                        </span>
                        <b className="shrink-0 font-head text-[17px] text-navy-900">{formatINR(latest.total)}</b>
                      </div>
                      <div className="mt-5 px-1"><Tracker status={st} /></div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {latest.tracking ? (
                          <a href={trackLink(latest.tracking)} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-navy-900 px-4 text-[13.5px] font-semibold text-white hover:bg-navy-700"><I d={ic.truck} size={17} /> Track on Ekart</a>
                        ) : (
                          <span className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#F3F5FA] px-4 text-[13px] font-semibold text-muted-2"><I d={ic.truck} size={17} /> Tracking number comes after shipping</span>
                        )}
                        <button onClick={() => setInvoiceOrder(latest)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line-strong bg-white px-4 text-[13.5px] font-semibold text-navy-900 hover:bg-[#F3F5FA]"><I d={ic.file} size={17} /> Invoice</button>
                        <button onClick={() => buyAgain(latest)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line-strong bg-white px-4 text-[13.5px] font-semibold text-navy-900 hover:bg-[#F3F5FA]"><I d={ic.repeat} size={17} /> Buy again</button>
                      </div>
                    </>
                  );
                })()}
              </section>

              {/* shop more */}
              <section className="rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-head text-[18px] font-bold text-navy-900">Try another variant</h2>
                </div>
                <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {products.filter((p) => !p.hidden).map((p) => (
                    <li key={p.id}>
                      <Link to={`/product/${p.slug}`} className="group flex flex-col items-center rounded-2xl p-3 text-center transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-20px_rgba(15,26,60,.5)]" style={{ background: p.bg }}>
                        <img src={p.image} alt="" loading="lazy" className="h-28 w-auto object-contain transition duration-300 group-hover:scale-105" />
                        <b className="mt-2 text-[13.5px] text-navy-900">{p.short}</b>
                        <span className="text-[12.5px] text-muted">{formatINR(p.price)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="flex flex-col gap-5">
              {/* address card */}
              <section className="rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-head text-[18px] font-bold text-navy-900">Delivery address</h2>
                  <button onClick={startEdit} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-navy-700 hover:underline"><I d={ic.edit} size={15} />{hasAddress ? 'Edit' : 'Add'}</button>
                </div>
                {hasAddress ? (
                  <div className="mt-3 flex gap-3 rounded-2xl bg-[#F6F7FB] p-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-navy-900 shadow-sm"><I d={ic.pin} /></span>
                    <span className="min-w-0 text-[13.5px] leading-relaxed text-muted">
                      <b className="block text-[14.5px] text-navy-900">{name}</b>
                      {userProfile.address}<br />{userProfile.city ? `${userProfile.city} – ` : 'PIN '}{userProfile.pin}
                      {userProfile.phone && <><br />+91 {userProfile.phone}</>}
                    </span>
                  </div>
                ) : (
                  <button onClick={startEdit} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line-strong px-4 py-6 text-[14px] font-semibold text-navy-900 hover:border-navy-700">
                    <I d={ic.pin} /> Add your address for faster checkout
                  </button>
                )}
              </section>

              {/* help card */}
              <section className="rounded-3xl bg-navy-900 p-5 text-white sm:p-6">
                <h2 className="font-head text-[18px] font-bold">Need help?</h2>
                <p className="mt-1 text-[13.5px] text-[#C9D1EA]">Questions about an order, delivery or a product — we reply fast.</p>
                <div className="mt-4 flex flex-col gap-2">
                  <a href={`mailto:${business.email}`} className="flex min-h-11 items-center gap-3 rounded-xl bg-white/10 px-3.5 text-[14px] font-semibold !text-white hover:bg-white/15"><I d={ic.mail} size={18} /><span className="truncate">{business.email}</span></a>
                  <Link to="/contact" className="flex min-h-11 items-center gap-3 rounded-xl bg-white px-3.5 text-[14px] font-semibold text-navy-900 hover:bg-[#E8ECF5]"><I d={ic.help} size={18} />Contact us</Link>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* ================= ORDERS ================= */}
        {tab === 'orders' && (
          <section className="mt-4 flex flex-col gap-3">
            {userOrders.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-3xl border border-line bg-white px-6 py-14 text-center shadow-sm">
                <span className="text-[38px]" aria-hidden="true">🛍️</span>
                <b className="font-head text-[18px] text-navy-900">No orders yet</b>
                <p className="max-w-[340px] text-[13.5px] text-muted">When you place an order it will show up here with live tracking.</p>
                <Link to="/#shop" className="btn-primary mt-1">Shop roll ons</Link>
              </div>
            ) : userOrders.map((o) => {
              const st = o.status || 'New';
              const open = openId === o.id;
              return (
                <article key={o.id} className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition ${open ? 'border-navy-700/30' : 'border-line hover:border-[#C9D1EA]'}`}>
                  <button onClick={() => setOpenId(open ? null : o.id)} aria-expanded={open} className="flex w-full flex-wrap items-center gap-3 p-4 text-left sm:flex-nowrap sm:gap-4 sm:p-5">
                    <Thumbs items={o.items} />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <b className="font-head text-[15.5px] text-navy-900">#{o.id}</b>
                        <span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-bold ${BADGE[st] || BADGE.New}`}>{st === 'New' ? 'Placed' : st}</span>
                      </span>
                      <span className="block truncate text-[12.5px] text-muted-2">{fmtDate(o.date || o.createdAt)} · {(o.items || []).map((i) => `${(i.name || '').replace('DriftOn™ ', '').replace(' Alum Roll On', '')} ×${i.qty}`).join(', ')}</span>
                    </span>
                    <b className="font-head text-[16px] text-navy-900">{formatINR(o.total)}</b>
                    <span className={`text-muted-2 transition ${open ? 'rotate-180' : ''}`} aria-hidden="true"><I d={<path d="M6 9l6 6 6-6" />} size={18} /></span>
                  </button>

                  {open && (
                    <div className="border-t border-line bg-[#FBFCFE] p-4 sm:p-5">
                      <div className="px-1"><Tracker status={st} /></div>
                      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-line bg-white p-4">
                          <b className="mb-2 block text-[12px] font-bold uppercase tracking-wider text-muted-2">Items</b>
                          <ul className="flex flex-col gap-2">
                            {(o.items || []).map((it, k) => {
                              const p = products.find((x) => x.id === it.id);
                              return (
                                <li key={k} className="flex items-center gap-3">
                                  <span className="flex size-10 items-center justify-center rounded-xl p-1" style={{ background: p?.bg || '#F3F5FA' }}><img src={p?.image || '/assets/images/cutouts/crystal.webp'} alt="" className="h-full w-auto object-contain" /></span>
                                  <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-navy-900">{it.name}</span>
                                  <span className="text-[13px] text-muted">×{it.qty}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                        <div className="rounded-2xl border border-line bg-white p-4 text-[13.5px]">
                          <b className="mb-2 block text-[12px] font-bold uppercase tracking-wider text-muted-2">Delivery & payment</b>
                          <p className="text-muted">{o.address || userProfile.address}{o.pin ? ` – ${o.pin}` : ''}</p>
                          <p className="mt-2 flex justify-between"><span className="text-muted">Payment</span><b className="text-navy-900">{o.payment || 'Prepaid'}{o.paymentStatus ? ` · ${o.paymentStatus}` : ''}</b></p>
                          <p className="mt-1 flex justify-between"><span className="text-muted">Delivery</span><b className="text-navy-900">{o.delivery ? formatINR(o.delivery) : 'Free'}</b></p>
                          <p className="mt-1 flex justify-between border-t border-line pt-2"><span className="font-semibold text-navy-900">Total</span><b className="font-head text-[16px] text-navy-900">{formatINR(o.total)}</b></p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {o.tracking && <a href={trackLink(o.tracking)} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-navy-900 px-4 text-[13.5px] font-semibold text-white hover:bg-navy-700"><I d={ic.truck} size={17} /> Track ({o.tracking})</a>}
                        <button onClick={() => setInvoiceOrder(o)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line-strong bg-white px-4 text-[13.5px] font-semibold text-navy-900 hover:bg-[#F3F5FA]"><I d={ic.file} size={17} /> Invoice</button>
                        <button onClick={() => buyAgain(o)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line-strong bg-white px-4 text-[13.5px] font-semibold text-navy-900 hover:bg-[#F3F5FA]"><I d={ic.repeat} size={17} /> Buy again</button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}

        {/* ================= ADDRESS ================= */}
        {tab === 'address' && (
          <section className="mt-4 rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-head text-[20px] font-bold text-navy-900">Delivery address</h2>
                <p className="text-[13px] text-muted-2">Saved here so checkout is faster next time.</p>
              </div>
              {!editing && <button onClick={startEdit} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line-strong bg-white px-4 text-[13.5px] font-semibold text-navy-900 hover:bg-[#F3F5FA]"><I d={ic.edit} size={16} />{hasAddress ? 'Edit address' : 'Add address'}</button>}
            </div>

            {editing ? (
              <form onSubmit={save} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  ['name', 'Full name', 'Your name', 'text'],
                  ['phone', 'Mobile number', '10-digit mobile', 'tel'],
                ].map(([k, label, ph, type]) => (
                  <label key={k} className="flex flex-col gap-1.5 text-[13px] font-semibold text-navy-900">{label}
                    <input type={type} required value={f[k]} maxLength={k === 'phone' ? 10 : undefined} placeholder={ph}
                      onChange={(e) => setF({ ...f, [k]: k === 'phone' ? e.target.value.replace(/\D/g, '') : e.target.value })}
                      className="min-h-12 rounded-xl border border-line-strong px-3.5 text-[14.5px] font-normal outline-none focus:border-navy-700" />
                  </label>
                ))}
                <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-navy-900 sm:col-span-2">House no., building, street, area
                  <textarea rows={3} required value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} placeholder="House / flat no., street, landmark"
                    className="rounded-xl border border-line-strong p-3.5 text-[14.5px] font-normal outline-none focus:border-navy-700" />
                </label>
                <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-navy-900">Pincode
                  <input required maxLength={6} value={f.pin} onChange={(e) => setF({ ...f, pin: e.target.value.replace(/\D/g, '') })} placeholder="e.g. 110008"
                    className="min-h-12 rounded-xl border border-line-strong px-3.5 text-[14.5px] font-normal outline-none focus:border-navy-700" />
                </label>
                <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-navy-900">City / state
                  <input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} placeholder="e.g. New Delhi"
                    className="min-h-12 rounded-xl border border-line-strong px-3.5 text-[14.5px] font-normal outline-none focus:border-navy-700" />
                </label>
                <div className="flex gap-2 sm:col-span-2">
                  <button disabled={saving} className="btn-primary min-h-12 px-7 disabled:opacity-60">{saving ? 'Saving…' : 'Save address'}</button>
                  <button type="button" onClick={() => setEditing(false)} className="min-h-12 rounded-xl border border-line px-5 text-[14px] font-semibold text-muted hover:bg-[#F6F7FB]">Cancel</button>
                </div>
              </form>
            ) : hasAddress ? (
              <div className="mt-6 flex max-w-[560px] gap-4 rounded-2xl border border-line bg-[#F6F7FB] p-5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-navy-900 shadow-sm"><I d={ic.pin} size={22} /></span>
                <span className="text-[14px] leading-relaxed text-muted">
                  <span className="mb-1 inline-block rounded-md bg-mint-soft px-2 py-0.5 text-[11px] font-bold text-brand-dark">Default</span>
                  <b className="block text-[15.5px] text-navy-900">{name}</b>
                  {userProfile.address}<br />{userProfile.city ? `${userProfile.city} – ` : 'PIN '}{userProfile.pin}<br />
                  Mobile: +91 {userProfile.phone || user.phoneNumber || '—'}
                </span>
              </div>
            ) : (
              <button onClick={startEdit} className="mt-6 flex w-full max-w-[560px] items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line-strong px-4 py-10 text-[14.5px] font-semibold text-navy-900 hover:border-navy-700">
                <I d={ic.pin} /> Add your delivery address
              </button>
            )}
          </section>
        )}

        {/* ================= HELP ================= */}
        {tab === 'help' && (
          <section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              [ic.truck, 'Where is my order?', 'Open "My orders" — once shipped, tap "Track on Ekart" to see live status.', () => setTab('orders'), 'See my orders'],
              [ic.file, 'Need an invoice?', 'Every order has an "Invoice" button. You can print or save it as PDF.', () => setTab('orders'), 'Get invoice'],
              [ic.mail, 'Something else?', `Write to ${business.email} or use our contact form — we reply fast.`, null, 'Contact us'],
            ].map(([icon, t, d, fn, cta]) => (
              <div key={t} className="flex flex-col rounded-3xl border border-line bg-white p-5 shadow-sm">
                <span className="flex size-11 items-center justify-center rounded-xl bg-[#EAF0FF] text-[#2647B8]"><I d={icon} /></span>
                <b className="mt-3 font-head text-[16.5px] text-navy-900">{t}</b>
                <p className="mt-1 flex-1 text-[13.5px] leading-relaxed text-muted">{d}</p>
                {fn ? (
                  <button onClick={fn} className="mt-4 inline-flex min-h-10 w-fit items-center rounded-xl bg-navy-900 px-4 text-[13.5px] font-semibold text-white hover:bg-navy-700">{cta}</button>
                ) : (
                  <Link to="/contact" className="mt-4 inline-flex min-h-10 w-fit items-center rounded-xl bg-navy-900 px-4 text-[13.5px] font-semibold text-white hover:bg-navy-700">{cta}</Link>
                )}
              </div>
            ))}
          </section>
        )}
      </div>

      <InvoiceModal order={invoiceOrder} settings={{ storeName: 'DriftOn™', legalName: 'AI Enterprises' }} products={products}
        open={!!invoiceOrder} onClose={() => setInvoiceOrder(null)} />
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { products, formatINR, makeLine, getProductById, COMBO_PRICE, DELIVERY_FEE } from '../data/products.js';
import { useStore } from '../context/StoreContext.jsx';
import { Heart, Truck, Shield, Return, Cash } from '../components/Icons.jsx';

const cutout = (id) => getProductById(id)?.image;

// Offer banners (the coupon code is DUMMY — confirm with the client)
const offers = [
  {
    eyebrow: 'First order offer', title: 'Flat ₹100 off', text: 'Use code', code: 'DRIFTON100',
    bg: 'linear-gradient(110deg, #FFF1DE 0%, #FFC98A 100%)', ink: '#0F1A3C', accent: '#C2571A', products: ['palash', 'rose'],
  },
  {
    eyebrow: 'Combo deal', title: `Any 2 for ${formatINR(COMBO_PRICE)}`, text: 'Mix any 2 sticks. Combo price + free delivery, applied in your cart.', code: null, link: '/combo',
    bg: 'linear-gradient(110deg, #1C2E6B 0%, #0F1A3C 100%)', ink: '#FFFFFF', accent: '#7BE0A6', products: ['charcoal', 'natural'],
  },
];

const filters = [
  { id: 'all', label: 'All', match: () => true },
  { id: 'floral', label: 'Floral', match: (p) => /floral/i.test(p.tag) },
  { id: 'fresh', label: 'Detox & fresh', match: (p) => /detox|fresh/i.test(p.tag) },
  { id: 'pure', label: 'Pure & fragrance free', match: (p) => /pure/i.test(p.tag) },
];

const sorts = {
  featured: { label: 'Featured', fn: () => 0 },
  low: { label: 'Price: low to high', fn: (a, b) => a.price - b.price },
  high: { label: 'Price: high to low', fn: (a, b) => b.price - a.price },
  name: { label: 'Name A–Z', fn: (a, b) => a.name.localeCompare(b.name) },
};

function OfferBanner({ o }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(o.code); } catch {}
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="relative flex h-[170px] items-center overflow-hidden rounded-2xl px-5 sm:h-[210px] sm:px-9" style={{ background: o.bg, color: o.ink }}>
      <div className="relative z-[2] flex max-w-[62%] flex-col gap-2 sm:max-w-[58%]">
        <span className="text-xs font-bold uppercase tracking-[2px]" style={{ color: o.accent }}>{o.eyebrow}</span>
        <b className="font-serif text-[28px] font-normal leading-none sm:text-[44px]">{o.title}</b>
        {o.code ? (
          <span className="flex flex-wrap items-center gap-2 text-sm">
            {o.text}
            <button onClick={copy} className="rounded-full border-[1.5px] border-dashed px-3 py-1 font-bold tracking-wider" style={{ borderColor: o.accent, color: o.accent }}>
              {copied ? 'Copied!' : o.code}
            </button>
          </span>
        ) : (
          <span className="text-[13px] opacity-85 sm:text-sm">{o.text}{o.link && <> <Link to={o.link} className="font-semibold underline" style={{ color: o.accent }}>See combos</Link></>}</span>
        )}
      </div>
      <div aria-hidden="true" className="absolute inset-y-0 right-3 flex items-center gap-2 sm:right-8">
        {o.products.map((id, k) => (
          <img key={id} src={cutout(id)} alt="" className="h-[110px] w-auto object-contain sm:h-[160px]" />
        ))}
      </div>
    </div>
  );
}

/** Shop page: 2 slim offer banners, a compact toolbar (filters + sort), then tall product cards. */
export default function Shop() {
  const { addToCart, toggleWish, wishlist, cart, openBuy } = useStore();
  const [sort, setSort] = useState('featured');
  const [filter, setFilter] = useState('all');
  const f = filters.find((x) => x.id === filter);
  const list = products.filter(f.match).sort(sorts[sort].fn);

  return (
    <div className="container-wide pb-20 pt-6">
      {/* 1. Offers */}
      <section aria-label="Offers" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {offers.map((o) => <OfferBanner key={o.title} o={o} />)}
      </section>

      {/* 2. Toolbar */}
      <div className="mt-8 flex flex-col gap-5 border-b border-line pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-2">
            <Link to="/" className="text-muted-2 hover:text-brand">Home</Link><span>/</span><span className="text-navy-900">Shop</span>
          </nav>
          <h1 className="font-jost text-[32px] font-medium leading-tight tracking-tight sm:text-[38px]">
            Shop all <span className="align-middle text-base font-normal text-muted-2">({list.length} products)</span>
          </h1>
        </div>
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-2.5">
          <div className="-mx-4 flex min-w-0 items-center gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
            {filters.map((x) => (
              <button key={x.id} onClick={() => setFilter(x.id)} aria-pressed={filter === x.id}
                className={`min-h-10 shrink-0 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition ${filter === x.id ? 'bg-navy-900 text-white' : 'border-[1.5px] border-line-strong bg-white text-navy-900 hover:border-navy-700'}`}>
                {x.label}
              </button>
            ))}
          </div>
          <span className="mx-1 hidden h-6 w-px bg-line-strong sm:block" />
          <label className="flex shrink-0 items-center gap-2 text-sm font-semibold">
            Sort
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="min-h-10 flex-1 rounded-full border-[1.5px] border-line-strong bg-white px-3.5 text-sm font-medium outline-none focus:border-navy-700 sm:flex-none">
              {Object.entries(sorts).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      {/* 3. Products */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {list.map((p) => {
          const url = `/product/${p.slug}`;
          const inWish = wishlist.includes(p.id);
          const inCart = cart.some((l) => l.id === p.id);
          return (
            <article key={p.id} className="flex flex-col overflow-hidden rounded-xl border border-line bg-white">
              <div className="relative h-[72svh] min-h-[480px] overflow-hidden sm:h-[88svh] sm:min-h-[600px] xl:h-[100svh] xl:min-h-[780px]" style={{ background: p.bg }}>
                <Link to={url} aria-label={`View ${p.name}`} className="block h-full"><img src={p.scene} alt={p.name} loading="lazy" className="h-full w-full object-cover object-[50%_42%]" /></Link>
                <span className="absolute left-4 top-4 rounded-full bg-white px-3.5 py-1.5 font-jost text-[13px] font-medium text-navy-900">{p.badge}</span>
                <span className="absolute bottom-4 left-4 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">2 for {formatINR(COMBO_PRICE)}</span>
                <button onClick={() => toggleWish(p.id)} aria-pressed={inWish} aria-label={`${inWish ? 'Remove' : 'Add'} ${p.name} ${inWish ? 'from' : 'to'} wishlist`}
                  className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-white/90 text-navy-900"><Heart filled={inWish} /></button>
              </div>
              <div className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: p.accent }}>{p.tag}</span>
                    <Link to={url} className="font-jost text-[20px] font-medium leading-tight text-navy-900 hover:text-brand">{p.name}</Link>
                  </div>
                  <span className="shrink-0 text-right">
                    <b className="block font-head text-xl">{formatINR(p.price)}</b>
                    <small className="text-[12.5px] text-muted-2">+ delivery</small>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button onClick={() => addToCart(p)} className="min-h-11 rounded-full border-[1.5px] border-navy-900 px-2 font-jost text-[12.5px] sm:text-[13px] font-semibold uppercase tracking-wide text-navy-900 hover:bg-navy-900 hover:text-white">
                    {inCart ? 'Add more' : 'Add to cart'}
                  </button>
                  <button onClick={() => openBuy([makeLine(p)])} className="min-h-11 rounded-full bg-brand font-jost text-[13px] font-semibold uppercase tracking-wide text-white hover:bg-brand-dark">
                    Buy now
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* 4. Trust strip */}
      <ul className="mt-12 grid grid-cols-1 gap-4 rounded-2xl bg-navy-900 p-5 text-white sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
        {[[Truck, 'Free delivery', `On combos · single ${formatINR(DELIVERY_FEE)}`], [Cash, 'Cash on delivery', 'Pay when it arrives'], [Shield, 'Secure payments', 'UPI, cards, net banking'], [Return, '48-hour returns', 'On unopened products']].map(([I, t, s]) => (
          <li key={t} className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-mint"><I size={22} /></span>
            <span><b className="block font-head text-[15px] font-semibold">{t}</b><small className="text-ondark">{s}</small></span>
          </li>
        ))}
      </ul>
    </div>
  );
}

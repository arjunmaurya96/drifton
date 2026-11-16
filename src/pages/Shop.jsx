import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { products, formatINR, discount } from '../data/products.js';
import { useStore } from '../context/StoreContext.jsx';
import { Heart } from '../components/Icons.jsx';

const sorts = {
  featured: { label: 'Featured', fn: () => 0 },
  low: { label: 'Price: low to high', fn: (a, b) => a.price - b.price },
  high: { label: 'Price: high to low', fn: (a, b) => b.price - a.price },
  name: { label: 'Name A–Z', fn: (a, b) => a.name.localeCompare(b.name) },
};

/** Shop page: every product, with Add to cart and Buy now right on the card. */
export default function Shop() {
  const { addToCart, toggleWish, wishlist, cart } = useStore();
  const navigate = useNavigate();
  const [sort, setSort] = useState('featured');
  const list = [...products].sort(sorts[sort].fn);

  const buyNow = (p) => navigate('/checkout', { state: { buyNow: { productId: p.id, qty: 1 } } });

  return (
    <div className="container-x pb-24">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 py-6 text-sm text-muted-2">
        <Link to="/" className="text-muted-2 hover:text-brand">Home</Link><span>/</span><b className="font-semibold text-navy-900">Shop</b>
      </nav>

      <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <h1 className="font-jost text-[44px] font-medium leading-tight tracking-tight sm:text-[56px]">Shop all</h1>
          <p className="text-muted">{products.length} natural crystal deodorants</p>
        </div>
        <label className="flex items-center gap-3 text-sm font-semibold">
          Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="min-h-11 rounded-full border-[1.5px] border-line-strong bg-white px-4 text-[15px] font-medium outline-none focus:border-navy-700">
            {Object.entries(sorts).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((p) => {
          const url = `/product/${p.slug}`;
          const inWish = wishlist.includes(p.id);
          const inCart = cart.some((l) => l.id === p.id);
          return (
            <article key={p.id} className="flex flex-col overflow-hidden rounded-xl border border-line bg-white">
              <div className="relative aspect-[4/5] overflow-hidden" style={{ background: p.bg }}>
                <Link to={url} aria-label={`View ${p.name}`}><img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover" /></Link>
                <span className="absolute left-4 top-4 rounded-full bg-white px-3.5 py-1.5 font-jost text-[13px] font-medium text-navy-900">{p.badge}</span>
                <button onClick={() => toggleWish(p.id)} aria-pressed={inWish} aria-label={`${inWish ? 'Remove' : 'Add'} ${p.name} ${inWish ? 'from' : 'to'} wishlist`}
                  className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-white/90 text-navy-900"><Heart filled={inWish} /></button>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: p.accent }}>{p.tag}</span>
                  <Link to={url} className="font-jost text-[20px] font-medium leading-tight text-navy-900 hover:text-brand">{p.name}</Link>
                </div>
                <div className="flex items-baseline gap-2.5">
                  <b className="font-head text-xl">{formatINR(p.price)}</b>
                  <s className="text-sm text-muted-2">{formatINR(p.mrp)}</s>
                  <span className="rounded-full bg-mint-soft px-2 py-0.5 text-xs font-bold text-brand-dark">{discount(p)}% OFF</span>
                </div>
                <div className="mt-auto grid grid-cols-2 gap-2.5 pt-1">
                  <button onClick={() => addToCart(p)} className="min-h-11 rounded-full border-[1.5px] border-navy-900 font-jost text-[13px] font-semibold uppercase tracking-wide text-navy-900 hover:bg-navy-900 hover:text-white">
                    {inCart ? 'Add more' : 'Add to cart'}
                  </button>
                  <button onClick={() => buyNow(p)} className="min-h-11 rounded-full bg-brand font-jost text-[13px] font-semibold uppercase tracking-wide text-white hover:bg-brand-dark">
                    Buy now
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

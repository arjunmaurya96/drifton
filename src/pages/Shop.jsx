import { useState } from 'react';
import { Link } from 'react-router-dom';
import { products, formatINR, discount, makeLine } from '../data/products.js';
import { useStore } from '../context/StoreContext.jsx';
import { Heart } from '../components/Icons.jsx';
import { bannerSlides } from '../data/products.js';

// Top banner. Put the generated image at public/assets/images/shop-banner.jpg (wide, about 1920x800).
// Until that file exists, a designed banner with the product cutouts is shown instead.
const SHOP_BANNER = '/assets/images/shop-banner.jpg';

function ShopBanner() {
  const [hasImg, setHasImg] = useState(true);
  if (hasImg) {
    return (
      <section aria-label="Shop Drifton" className="relative h-[46svh] min-h-[340px] w-full overflow-hidden bg-[#dfe9f2] md:h-[62svh]">
        <img src={SHOP_BANNER} alt="Drifton natural crystal deodorant range" onError={() => setHasImg(false)} className="h-full w-full object-cover" />
      </section>
    );
  }
  const cuts = bannerSlides.map((b) => b.cutout);
  return (
    <section aria-label="Shop Drifton" className="relative h-[46svh] min-h-[340px] w-full overflow-hidden md:h-[62svh]"
      style={{ background: 'radial-gradient(50% 70% at 75% 60%, #FFFFFFAA, transparent 70%), linear-gradient(110deg, #FFE7C7 0%, #F9D3E0 38%, #DCD3F7 68%, #CFE6FA 100%)' }}>
      <div className="container-wide relative flex h-full items-center">
        <div className="relative z-[2] flex max-w-[560px] flex-col gap-4">
          <span className="eyebrow">The full range</span>
          <h1 className="font-serif text-[52px] leading-[0.95] text-navy-900 sm:text-[72px] xl:text-[88px]">Four crystals.<br /><span className="text-brand">One fresh you.</span></h1>
          <p className="max-w-[440px] text-lg text-navy-500">Natural alum deodorant sticks in Palash, Charcoal, Rose and Pure Crystal.</p>
        </div>
        <div aria-hidden="true" className="absolute bottom-0 right-[2%] hidden h-[88%] items-end gap-2 md:flex lg:right-[5%]">
          {cuts.map((c, k) => (
            <img key={c} src={c} alt="" className="w-auto animate-fade-up object-contain drop-shadow-xl" style={{ height: `${[78, 92, 100, 84][k]}%`, animationDelay: `${k * 120}ms` }} />
          ))}
        </div>
      </div>
    </section>
  );
}


const sorts = {
  featured: { label: 'Featured', fn: () => 0 },
  low: { label: 'Price: low to high', fn: (a, b) => a.price - b.price },
  high: { label: 'Price: high to low', fn: (a, b) => b.price - a.price },
  name: { label: 'Name A–Z', fn: (a, b) => a.name.localeCompare(b.name) },
};

/** Shop page: every product, with Add to cart and Buy now right on the card. */
export default function Shop() {
  const { addToCart, toggleWish, wishlist, cart, openBuy } = useStore();
  const [sort, setSort] = useState('featured');
  const list = [...products].sort(sorts[sort].fn);

  const buyNow = (p) => openBuy([makeLine(p)]);

  return (
    <>
    <ShopBanner />
    <div className="container-wide pb-24">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 py-6 text-sm text-muted-2">
        <Link to="/" className="text-muted-2 hover:text-brand">Home</Link><span>/</span><b className="font-semibold text-navy-900">Shop</b>
      </nav>

      <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-col gap-2">
          <h2 className="font-jost text-[44px] font-medium leading-tight tracking-tight sm:text-[56px]">Shop all</h2>
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {list.map((p) => {
          const url = `/product/${p.slug}`;
          const inWish = wishlist.includes(p.id);
          const inCart = cart.some((l) => l.id === p.id);
          return (
            <article key={p.id} className="flex flex-col overflow-hidden rounded-xl border border-line bg-white">
              <div className="relative h-[68svh] min-h-[460px] overflow-hidden sm:h-[72svh] xl:h-[calc(100svh-230px)] xl:min-h-[560px]" style={{ background: p.bg }}>
                <Link to={url} aria-label={`View ${p.name}`} className="block h-full"><img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover" /></Link>
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
    </>
  );
}

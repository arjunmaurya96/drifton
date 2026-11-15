import { Link } from 'react-router-dom';
import { products, formatINR, discount } from '../data/products.js';
import { useStore } from '../context/StoreContext.jsx';
import { Heart, Arrow } from './Icons.jsx';

// Colour of each product's zone. The whole strip is one continuous gradient,
// so there are no boxes and every product melts into the next.
const zone = {
  palash: { c: '#FFDDB0', dark: false },
  charcoal: { c: '#3B4253', dark: true },
  rose: { c: '#F8CADA', dark: false },
  lavender: { c: '#DACCF7', dark: false },
};

/** Big, box-free products, each sitting on its own colour that blends into the next. */
export default function ProductShowcase() {
  const { addToCart, toggleWish, wishlist, cart } = useStore();
  const stops = products.map((p, k) => `${zone[p.id].c} ${12.5 + k * 25}%`).join(', ');

  return (
    <section id="shop" className="relative">
      <div className="container-x flex flex-col items-center gap-3 pb-12 pt-24 text-center">
        <span className="eyebrow">Shop the range</span>
        <h2 className="h2">Pick your <span className="text-brand">crystal.</span></h2>
        <p className="max-w-[520px] text-[17px] text-muted">One natural alum crystal, four botanical blends. Tap a product to see everything about it.</p>
      </div>

      <div className="relative" style={{ background: `linear-gradient(90deg, ${stops})` }}>
        {/* fade the strip into the page colour at the top and bottom */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-page to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-page to-transparent" />

        <div className="relative grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((p) => {
            const z = zone[p.id];
            const url = `/product/${p.slug}`;
            const inWish = wishlist.includes(p.id);
            const inCart = cart.some((l) => l.id === p.id);
            return (
              <article key={p.id} className="group relative flex flex-col items-center px-6 pb-32 pt-24 text-center"
                // on small screens each product gets its own colour band
                style={{ '--zone': z.c }}>
                <span aria-hidden="true" className="absolute inset-0 bg-[var(--zone)] xl:hidden" />
                <button onClick={() => toggleWish(p.id)} aria-pressed={inWish} aria-label={`${inWish ? 'Remove' : 'Add'} ${p.name} ${inWish ? 'from' : 'to'} wishlist`}
                  className={`absolute right-8 top-28 z-20 flex size-11 items-center justify-center rounded-full ${z.dark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/60 text-navy-900 hover:bg-white'}`}>
                  <Heart filled={inWish} />
                </button>

                <Link to={url} aria-label={`View ${p.name}`} className="relative z-[1] block">
                  <span aria-hidden="true" className="absolute inset-10 rounded-full opacity-60 blur-3xl transition duration-500 group-hover:opacity-90" style={{ background: z.dark ? '#7E89A6' : '#FFFFFF' }} />
                  <img src={p.image} alt={p.name} loading="lazy"
                    className="relative h-[460px] w-[330px] max-w-full object-cover transition duration-700 group-hover:-translate-y-3 group-hover:scale-[1.04] 2xl:h-[520px] 2xl:w-[380px]"
                    style={{ WebkitMaskImage: 'radial-gradient(ellipse closest-side at 50% 48%, #000 60%, transparent 100%)', maskImage: 'radial-gradient(ellipse closest-side at 50% 48%, #000 60%, transparent 100%)' }} />
                </Link>

                <div className={`relative z-[1] -mt-6 flex flex-col items-center gap-3 ${z.dark ? 'text-white' : 'text-navy-900'}`}>
                  <span className={`text-xs font-bold uppercase tracking-[2px] ${z.dark ? 'text-mint' : 'text-navy-500'}`}>{p.badge} · {p.tag.split('·')[0].trim()}</span>
                  <Link to={url} className={`font-head text-2xl font-semibold leading-tight 2xl:text-[28px] ${z.dark ? 'text-white hover:text-mint' : 'text-navy-900 hover:text-brand'}`}>{p.name}</Link>
                  <span className={`max-w-[280px] text-[15px] ${z.dark ? 'text-ondark' : 'text-navy-500'}`}>{p.tagline}</span>
                  <span className="flex items-baseline gap-2.5">
                    <b className="font-head text-[26px] font-bold">{formatINR(p.price)}</b>
                    <s className={z.dark ? 'text-ondark/70' : 'text-navy-500/70'}>{formatINR(p.mrp)}</s>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${z.dark ? 'bg-mint text-navy-900' : 'bg-navy-900 text-white'}`}>{discount(p)}% OFF</span>
                  </span>
                  <div className="mt-1 flex gap-2.5">
                    <button onClick={() => addToCart(p)} className={z.dark ? 'btn-white' : 'btn-navy'}>{inCart ? 'Add another' : 'Add to cart'}</button>
                    <Link to={url} aria-label={`View ${p.name}`} className={`icon-btn size-12 border-[1.5px] ${z.dark ? 'border-white/30 text-white hover:bg-white/10' : 'border-navy-900/20 bg-white/40 hover:bg-white/80'}`}><Arrow /></Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

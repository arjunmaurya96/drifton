import { useState } from 'react';
import { Link } from 'react-router-dom';
import { products, bannerSlides, formatINR } from '../data/products.js';
import { Arrow } from './Icons.jsx';

// Look of each product when it is in the centre. Words are shown big on the left and right.
const looks = {
  palash: { from: '#3A1A06', to: '#0E0602', glow: '#FF8A2A', accent: '#FFB15E', left: ['FLOWER', 'POWER'], right: ['ZERO', 'ODOUR'] },
  charcoal: { from: '#2A2D35', to: '#08090C', glow: '#FF7A2F', accent: '#FF9A55', left: ['DEEP', 'CLEAN'], right: ['ZERO', 'SMELL'] },
  rose: { from: '#3D0F22', to: '#12040A', glow: '#FF5C93', accent: '#FF8FB6', left: ['SOFT', 'FRESH'], right: ['ALL', 'DAY'] },
  lavender: { from: '#0D2A4A', to: '#040C18', glow: '#4FB2FF', accent: '#8FD0FF', left: ['PURE', 'CRYSTAL'], right: ['100%', 'NATURAL'] },
};

const cutoutOf = (id) => bannerSlides.find((s) => s.productId === id)?.cutout;

/**
 * Phitku-style spotlight: the selected product big in the centre, its variants on either side,
 * huge bold words left and right. Click a side variant (or a name on top) to bring it to the centre.
 */
export default function VariantSpotlight() {
  const [i, setI] = useState(1); // start with Charcoal in the centre
  const n = products.length;
  const center = products[i];
  const left = products[(i + n - 1) % n];
  const right = products[(i + 1) % n];
  const opposite = products[(i + 2) % n]; // the 4th product
  const look = looks[center.id];
  // long words get a smaller size so they never run off the screen
  const big = (w) => (w.length > 5 ? 'text-[60px] md:text-[80px] xl:text-[120px]' : 'text-[78px] md:text-[110px] xl:text-[170px]');

  return (
    <section aria-label="Choose your variant" className="relative h-[100svh] max-h-[920px] min-h-[640px] overflow-hidden text-white">
      {/* backgrounds (cross-fade) */}
      {products.map((p, k) => {
        const l = looks[p.id];
        return (
          <div key={p.id} aria-hidden="true" className={`absolute inset-0 transition-opacity duration-700 ${k === i ? 'opacity-100' : 'opacity-0'}`}
            style={{ background: `radial-gradient(38% 46% at 50% 88%, ${l.glow}88 0%, transparent 70%), radial-gradient(60% 50% at 50% 100%, ${l.glow}33 0%, transparent 80%), radial-gradient(90% 80% at 50% 30%, ${l.from} 0%, ${l.to} 100%)` }} />
        );
      })}
      {/* soft smoke */}
      <div aria-hidden="true" className="absolute inset-0 opacity-40 [background:radial-gradient(30%_20%_at_20%_30%,rgba(255,255,255,.08),transparent),radial-gradient(25%_18%_at_80%_22%,rgba(255,255,255,.07),transparent),radial-gradient(35%_25%_at_70%_70%,rgba(255,255,255,.05),transparent)]" />

      {/* variant names on top */}
      <div className="absolute inset-x-0 top-6 z-20 flex justify-center">
        <div className="flex gap-1 rounded-full bg-white/10 p-1 ring-1 ring-white/15 backdrop-blur-md">
          {products.map((p, k) => (
            <button key={p.id} onClick={() => setI(k)} aria-pressed={k === i}
              className={`rounded-full px-4 py-2 font-jost text-sm font-medium transition sm:px-5 ${k === i ? 'bg-white text-navy-900' : 'text-white/80 hover:text-white'}`}>
              {p.short}
            </button>
          ))}
        </div>
      </div>

      {/* big words */}
      <div key={`l-${i}`} className="pointer-events-none absolute left-[4%] top-[17%] z-10 animate-from-left whitespace-nowrap text-right max-md:left-0 max-md:right-0 max-md:top-[13%] max-md:text-center md:left-auto md:right-[61%]">
        <span className="block font-display text-[56px] leading-none tracking-wide text-transparent [-webkit-text-stroke:2px_white] md:text-[80px] xl:text-[110px]">{look.left[0]}</span>
        <span className={`block font-display leading-[0.9] tracking-wide ${big(look.left[1])}`} style={{ color: '#fff' }}>{look.left[1]}</span>
      </div>
      <div key={`r-${i}`} className="absolute left-[61%] top-[26%] z-10 hidden animate-from-right whitespace-nowrap md:block">
        <span className="block font-display text-[80px] leading-none tracking-wide text-transparent [-webkit-text-stroke:2px_white] xl:text-[110px]">{look.right[0]}</span>
        <span className={`block font-display leading-[0.9] tracking-wide ${big(look.right[1])}`} style={{ color: look.accent }}>{look.right[1]}</span>
        <div className="mt-5 flex items-center gap-4">
          <span>
            <b className="block font-jost text-lg font-medium">{center.name}</b>
            <span className="font-jost text-white/80"><s className="text-white/50">{formatINR(center.mrp)}</s> {formatINR(center.price)}</span>
          </span>
          <Link to={`/product/${center.slug}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-6 font-jost text-sm font-semibold uppercase tracking-wide text-navy-900 hover:bg-mint hover:text-navy-900">
            Shop now <Arrow size={16} />
          </Link>
        </div>
      </div>

      {/* side variants */}
      {[{ p: left, k: (i + n - 1) % n, pos: 'left-[3%] max-md:left-[2%]' }, { p: right, k: (i + 1) % n, pos: 'right-[3%] max-md:right-[2%]' }].map(({ p, k, pos }) => (
        <button key={`${p.id}-${i}`} onClick={() => setI(k)} aria-label={`Show ${p.name}`}
          className={`absolute bottom-[3%] z-[5] h-[34%] animate-fade-up opacity-90 transition hover:opacity-100 md:h-[44%] ${pos}`}>
          <img src={cutoutOf(p.id)} alt="" className="h-full w-auto object-contain [filter:brightness(.82)_saturate(.9)]" />
        </button>
      ))}

      {/* 4th product: smaller, next to the left one, so all 4 products are on screen */}
      <button key={`${opposite.id}-o-${i}`} onClick={() => setI((i + 2) % n)} aria-label={`Show ${opposite.name}`}
        className="absolute bottom-[3%] left-[15%] z-[4] hidden h-[32%] animate-fade-up opacity-80 transition hover:opacity-100 md:block xl:left-[16%]"
        style={{ animationDelay: '120ms' }}>
        <img src={cutoutOf(opposite.id)} alt="" className="h-full w-auto object-contain [filter:brightness(.7)_saturate(.85)]" />
      </button>

      {/* centre product */}
      <Link key={`c-${i}`} to={`/product/${center.slug}`} aria-label={`View ${center.name}`}
        className="absolute bottom-[-2%] left-1/2 z-[6] h-[60%] -translate-x-1/2 md:h-[76%]">
        <span aria-hidden="true" className="absolute inset-x-[-30%] bottom-0 h-1/2 rounded-full blur-3xl" style={{ background: look.glow, opacity: 0.35 }} />
        <img src={cutoutOf(center.id)} alt={center.name} className="relative h-full w-auto animate-pop object-contain" />
      </Link>

      {/* mobile CTA */}
      <div className="absolute inset-x-0 top-[33%] z-20 flex justify-center md:hidden">
        <Link to={`/product/${center.slug}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-6 font-jost text-sm font-semibold uppercase text-navy-900">Shop {center.short}</Link>
      </div>
    </section>
  );
}

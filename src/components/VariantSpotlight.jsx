import { useState } from 'react';
import { Link } from 'react-router-dom';
import { products, bannerSlides } from '../data/products.js';

// Order requested: Charcoal swapped with Palash at the top
const charcoal = products.find((p) => p.id === 'charcoal') || products[1];
const palash = products.find((p) => p.id === 'palash') || products[0];
const rose = products.find((p) => p.id === 'rose') || products[2];
const natural = products.find((p) => p.id === 'natural') || products[3];

const spotlightProducts = [charcoal, palash, rose, natural];

// Look of each product when it is in the centre. Words are shown big on the left and right.
const looks = {
  charcoal: {
    from: '#2A2D35',
    to: '#08090C',
    glow: '#FF7A2F',
    accent: '#FF9A55',
    left: ['HELPS IN', 'DEEP CLEANING'],
    right: ['HELPS IN', 'REDUCING ODOR'],
  },
  palash: {
    from: '#3A1A06',
    to: '#0E0602',
    glow: '#FF8A2A',
    accent: '#FFB15E',
    left: ['HELPS IN', 'REDUCING SWEAT'],
    right: ['24/7 FRESH', 'ALL DAY LONG'],
  },
  rose: {
    from: '#3D0F22',
    to: '#12040A',
    glow: '#FF5C93',
    accent: '#FF8FB6',
    left: ['HELPS IN', 'LIGHTENING SKIN'],
    right: ['SOFT & FRESH', 'BOTANICAL GLOW'],
  },
  natural: {
    from: '#0D2A4A',
    to: '#040C18',
    glow: '#4FB2FF',
    accent: '#8FD0FF',
    left: ['HELPS IN', 'REDUCING ITCHING'],
    right: ['100% PURE', 'NATURAL ALUM'],
  },
};

const cutoutOf = (id) => bannerSlides.find((s) => s.productId === id)?.cutout;

/**
 * Phitku-style spotlight: the selected product big in the centre, its variants on either side,
 * bold benefit typography on left and right. Click a side variant or top button to switch.
 */
export default function VariantSpotlight() {
  const [i, setI] = useState(0); // start with Charcoal (index 0) in the centre
  const n = spotlightProducts.length;
  const center = spotlightProducts[i];
  const left = spotlightProducts[(i + n - 1) % n];
  const right = spotlightProducts[(i + 1) % n];
  const opposite = spotlightProducts[(i + 2) % n]; // the 4th product
  const look = looks[center.id];

  return (
    <section aria-label="Choose your variant" className="relative h-[100svh] max-h-[920px] min-h-[640px] overflow-hidden text-white">
      {/* backgrounds (cross-fade) */}
      {spotlightProducts.map((p, k) => {
        const l = looks[p.id];
        return (
          <div
            key={p.id}
            aria-hidden="true"
            className={`absolute inset-0 transition-opacity duration-700 ${k === i ? 'opacity-100' : 'opacity-0'}`}
            style={{
              background: `radial-gradient(38% 46% at 50% 88%, ${l.glow}88 0%, transparent 70%), radial-gradient(60% 50% at 50% 100%, ${l.glow}33 0%, transparent 80%), radial-gradient(90% 80% at 50% 30%, ${l.from} 0%, ${l.to} 100%)`,
            }}
          />
        );
      })}

      {/* soft smoke */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-40 [background:radial-gradient(30%_20%_at_20%_30%,rgba(255,255,255,.08),transparent),radial-gradient(25%_18%_at_80%_22%,rgba(255,255,255,.07),transparent),radial-gradient(35%_25%_at_70%_70%,rgba(255,255,255,.05),transparent)]"
      />

      {/* variant names on top: Charcoal first, then Palash, Rose, Natural */}
      <div className="absolute inset-x-0 top-6 z-20 flex justify-center">
        <div className="flex gap-1 rounded-full bg-white/10 p-1 ring-1 ring-white/15 backdrop-blur-md">
          {spotlightProducts.map((p, k) => (
            <button
              key={p.id}
              onClick={() => setI(k)}
              aria-pressed={k === i}
              className={`rounded-full px-4 py-2 font-jost text-sm font-semibold tracking-wide transition sm:px-5 ${
                k === i ? 'bg-white text-navy-900 shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              {p.short}
            </button>
          ))}
        </div>
      </div>

      {/* Big Words Left: Helps in Deep Cleaning (brought down to upper-center) */}
      <div
        key={`l-${i}`}
        className="pointer-events-none absolute left-[4%] top-[32%] z-10 animate-from-left whitespace-nowrap text-right max-lg:left-0 max-lg:right-0 max-lg:top-[16%] max-lg:text-center lg:left-auto lg:right-[59%]"
      >
        <span className="block font-display text-[42px] leading-none tracking-wider text-transparent [-webkit-text-stroke:1.5px_white] md:text-[58px] xl:text-[76px]">
          {look.left[0]}
        </span>
        <span className="block font-display text-[50px] leading-[0.95] tracking-wide text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] md:text-[68px] xl:text-[92px]">
          {look.left[1]}
        </span>

        {/* Mobile secondary benefit pill */}
        <div className="mt-3 flex justify-center lg:hidden">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 font-head text-[13px] font-semibold tracking-wide text-white shadow-lg backdrop-blur-md ring-1 ring-white/20">
            <span className="size-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: look.accent, color: look.accent }} />
            {look.right[0]} {look.right[1]}
          </span>
        </div>
      </div>

      {/* Big Words Right: Helps in Reducing Odor (Desktop) */}
      <div
        key={`r-${i}`}
        className="pointer-events-none absolute left-[59%] top-[32%] z-10 hidden animate-from-right whitespace-nowrap lg:block"
      >
        <span className="block font-display text-[42px] leading-none tracking-wider text-transparent [-webkit-text-stroke:1.5px_white] md:text-[58px] xl:text-[76px]">
          {look.right[0]}
        </span>
        <span
          className="block font-display text-[50px] leading-[0.95] tracking-wide md:text-[68px] xl:text-[92px]"
          style={{ color: look.accent, textShadow: `0 0 32px ${look.glow}55` }}
        >
          {look.right[1]}
        </span>
      </div>

      {/* side variants */}
      {[{ p: left, k: (i + n - 1) % n, pos: 'left-[3%] max-md:left-[2%]' }, { p: right, k: (i + 1) % n, pos: 'right-[3%] max-md:right-[2%]' }].map(({ p, k, pos }) => (
        <button
          key={`${p.id}-${i}`}
          onClick={() => setI(k)}
          aria-label={`Show ${p.name}`}
          className={`absolute bottom-[3%] z-[5] h-[34%] animate-fade-up opacity-90 transition hover:opacity-100 md:h-[44%] ${pos}`}
        >
          <img loading="lazy" decoding="async" src={cutoutOf(p.id)} alt="" className="h-full w-auto object-contain [filter:brightness(.82)_saturate(.9)]" />
        </button>
      ))}

      {/* 4th product: smaller, next to the left one, so all 4 products are on screen */}
      <button
        key={`${opposite.id}-o-${i}`}
        onClick={() => setI((i + 2) % n)}
        aria-label={`Show ${opposite.name}`}
        className="absolute bottom-[3%] left-[15%] z-[4] hidden h-[32%] animate-fade-up opacity-80 transition hover:opacity-100 md:block xl:left-[16%]"
        style={{ animationDelay: '120ms' }}
      >
        <img loading="lazy" decoding="async" src={cutoutOf(opposite.id)} alt="" className="h-full w-auto object-contain [filter:brightness(.7)_saturate(.85)]" />
      </button>

      {/* centre product */}
      <Link
        key={`c-${i}`}
        to={`/product/${center.slug}`}
        aria-label={`View ${center.name}`}
        className="absolute bottom-[-2%] left-1/2 z-[6] h-[60%] -translate-x-1/2 md:h-[76%]"
      >
        <span aria-hidden="true" className="absolute inset-x-[-30%] bottom-0 h-1/2 rounded-full blur-3xl" style={{ background: look.glow, opacity: 0.35 }} />
        <img loading="lazy" decoding="async" src={cutoutOf(center.id)} alt={center.name} className="relative h-full w-auto animate-pop object-contain" />
      </Link>
    </section>
  );
}

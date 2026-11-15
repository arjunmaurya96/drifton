import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bannerSlides, getProductById, formatINR } from '../data/products.js';
import { ModelFigure } from './ModelIllustrations.jsx';
import IngredientIcon from './IngredientIcon.jsx';
import { Arrow, ChevronLeft, ChevronRight } from './Icons.jsx';

// Timing (ms)
const ENTER = 1600; // model + product + 4 ingredients finish sliding in
const HOLD = 3000; // everything stays still for 3 seconds
const EXIT = 600; // slide-out before the next slide comes in

/**
 * Full-width hero banner.
 * Left: model slides in from the left. Right: the related product slides in from the right,
 * with its 4 key ingredients sliding in one by one underneath. Holds for 3s, then the next slide.
 */
export default function ModelBanner() {
  const [i, setI] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const n = bannerSlides.length;
  const slide = bannerSlides[i];
  const product = getProductById(slide.productId);
  const url = `/product/${product.slug}`;
  const dark = slide.dark;

  useEffect(() => {
    setLeaving(false);
    const t1 = setTimeout(() => setLeaving(true), ENTER + HOLD);
    const t2 = setTimeout(() => setI((x) => (x + 1) % n), ENTER + HOLD + EXIT);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [i, n]);

  const go = (k) => setI(((k % n) + n) % n);
  const out = leaving ? 'opacity-0' : 'opacity-100';

  return (
    <section id="top" aria-label="Featured products" aria-roledescription="carousel" className="relative overflow-hidden">
      {/* Background layers cross-fade so colours change smoothly */}
      {bannerSlides.map((s, k) => (
        <div key={k} aria-hidden="true" className={`absolute inset-0 transition-opacity duration-1000 ${k === i ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: `radial-gradient(60% 70% at 72% 45%, ${s.glow}55 0%, transparent 70%), linear-gradient(115deg, ${s.bgFrom} 0%, ${s.bgTo} 100%)` }} />
      ))}
      {/* soft fade into the page below */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-page/60" />

      <div key={i} className="container-wide relative grid min-h-[720px] grid-cols-1 items-center gap-6 pb-28 pt-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-4 lg:pt-6">
        {/* ---------- LEFT: model ---------- */}
        <div className={`transition-all duration-500 ${leaving ? '-translate-x-24' : ''} ${out}`}>
          <div className="mx-auto h-[260px] w-full max-w-[460px] animate-from-left sm:h-[460px] lg:h-[620px] lg:max-w-[520px]">
            {slide.modelPhoto ? (
              <img src={slide.modelPhoto} alt="Model using Drifton" className="h-full w-full rounded-t-[999px] object-cover" />
            ) : (
              <ModelFigure type={slide.model} tone={slide.tone} top={slide.top} stickTint={slide.stick} />
            )}
          </div>
        </div>

        {/* ---------- RIGHT: product + ingredients ---------- */}
        <div className={`flex flex-col gap-7 transition-all duration-500 ${leaving ? 'translate-x-24' : ''} ${out}`}>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
            <Link to={url} aria-label={`View ${product.name}`} className="group relative shrink-0 animate-from-right" style={{ animationDelay: '150ms' }}>
              <span aria-hidden="true" className="absolute inset-6 rounded-full blur-3xl" style={{ background: slide.glow, opacity: 0.45 }} />
              <img
                src={product.image} alt={product.name}
                className="relative h-[340px] w-[270px] object-cover transition duration-700 group-hover:scale-105 sm:h-[400px] sm:w-[310px]"
                style={{ WebkitMaskImage: 'radial-gradient(ellipse closest-side at 50% 50%, #000 62%, transparent 100%)', maskImage: 'radial-gradient(ellipse closest-side at 50% 50%, #000 62%, transparent 100%)' }}
              />
            </Link>

            <div className="flex animate-from-right flex-col items-center gap-4 text-center sm:items-start sm:text-left" style={{ animationDelay: '300ms' }}>
              <span className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold uppercase tracking-wider ${dark ? 'bg-white/10 text-mint' : 'bg-white/70 text-brand-dark'}`}>{product.tag}</span>
              <h1 className={`text-[38px] font-bold leading-[1.05] tracking-tight sm:text-5xl xl:text-[56px] ${dark ? 'text-white' : 'text-navy-900'}`}>
                {slide.headline}<br /><span style={{ color: dark ? '#7BE0A6' : slide.top }}>{slide.highlight}</span>
              </h1>
              <p className={`text-lg font-semibold ${dark ? 'text-ondark' : 'text-navy-500'}`}>{product.name}</p>
              <div className="flex items-baseline gap-3">
                <b className={`font-head text-3xl font-bold ${dark ? 'text-white' : 'text-navy-900'}`}>{formatINR(product.price)}</b>
                <s className={dark ? 'text-ondark/70' : 'text-muted-2'}>{formatINR(product.mrp)}</s>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to={url} className={dark ? 'btn-white' : 'btn-navy'}>Shop now <Arrow /></Link>
                <Link to="/#shop" className={`btn border-[1.5px] ${dark ? 'border-white/30 text-white hover:border-white hover:text-white' : 'border-navy-900/20 bg-white/50 text-navy-900 hover:border-navy-900'}`}>All products</Link>
              </div>
            </div>
          </div>

          {/* 4 key ingredients */}
          <div>
            <span className={`mb-3 block animate-from-right text-xs font-bold uppercase tracking-[2px] ${dark ? 'text-ondark' : 'text-navy-500'}`} style={{ animationDelay: '450ms' }}>Key ingredients</span>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {slide.ingredients.map((ing, k) => (
                <li key={ing.name} className={`flex animate-from-right items-center gap-3 rounded-2xl p-2.5 pr-3 backdrop-blur ${dark ? 'bg-white/10 ring-1 ring-white/10' : 'bg-white/60 ring-1 ring-white/70'}`}
                  style={{ animationDelay: `${600 + k * 180}ms` }}>
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full shadow-sm" style={{ background: ing.bg, color: ing.color }}>
                    <IngredientIcon icon={ing.icon} />
                  </span>
                  <span className={`text-[14px] font-semibold leading-tight ${dark ? 'text-white' : 'text-navy-900'}`}>{ing.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Controls: progress bars + arrows */}
      <div className="absolute inset-x-0 bottom-7 z-10">
        <div className="container-wide flex items-center justify-between gap-4">
          <div className="flex flex-1 gap-3">
            {bannerSlides.map((s, k) => {
              const p = getProductById(s.productId);
              return (
                <button key={k} onClick={() => go(k)} aria-label={`Show ${p.name}`} aria-current={k === i}
                  className={`group flex max-w-[180px] flex-1 flex-col gap-2 text-left text-[13px] font-semibold ${dark ? 'text-white' : 'text-navy-900'}`}>
                  <span className={`hidden sm:block ${k === i ? 'opacity-100' : 'opacity-50 group-hover:opacity-80'}`}>0{k + 1} · {p.short}</span>
                  <span className={`block h-[3px] w-full overflow-hidden rounded-full ${dark ? 'bg-white/20' : 'bg-navy-900/15'}`}>
                    {k < i && <i className={`block h-full w-full ${dark ? 'bg-mint' : 'bg-navy-900'}`} />}
                    {k === i && <i key={i} className={`block h-full animate-bar ${dark ? 'bg-mint' : 'bg-navy-900'}`} style={{ animationDuration: `${ENTER + HOLD}ms` }} />}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <button onClick={() => go(i - 1)} aria-label="Previous slide" className={`icon-btn border-[1.5px] ${dark ? 'border-white/30 text-white hover:bg-white/10' : 'border-navy-900/20 bg-white/60'}`}><ChevronLeft /></button>
            <button onClick={() => go(i + 1)} aria-label="Next slide" className={`icon-btn ${dark ? 'bg-white text-navy-900 hover:bg-mint' : 'bg-navy-900 text-white hover:bg-navy-700'}`}><ChevronRight /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

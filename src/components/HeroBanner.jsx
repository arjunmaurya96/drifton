import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bannerSlides, getProductById, formatINR } from '../data/products.js';
import { ChevronLeft, ChevronRight } from './Icons.jsx';

// Timing (ms): slide comes in, then stays still for 3 seconds, then the next one slides in.
const ENTER = 1200;
const HOLD = 3000;
const FALLBACK_MODEL = '/assets/images/models/model-girl.webp';

/**
 * Full-width hero banner.
 * Background: gradient in the product's colours. Left: model photo. Middle: headline, ingredients, SHOP NOW.
 * Right: the product on its own — no box, no shadow. Each slide slides in from the right.
 */
export default function HeroBanner() {
  const [i, setI] = useState(0);
  const n = bannerSlides.length;
  const slide = bannerSlides[i];
  const product = getProductById(slide.productId);
  const url = `/product/${product.slug}`;
  const dark = slide.dark;

  const go = (k) => setI(((k % n) + n) % n);

  useEffect(() => {
    const t = setTimeout(() => go(i + 1), ENTER + HOLD);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  return (
    <section id="top" aria-label="Featured products" aria-roledescription="carousel"
      className="relative h-[100svh] min-h-[720px] lg:min-h-[780px] overflow-hidden">
      {/* Product-colour backgrounds (cross-fade) */}
      {bannerSlides.map((s, k) => (
        <div key={k} aria-hidden="true" className={`absolute inset-0 transition-opacity duration-1000 ${k === i ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: `radial-gradient(42% 60% at 82% 50%, ${s.glow}AA 0%, transparent 70%), linear-gradient(110deg, ${s.bgFrom} 0%, ${s.bgTo} 100%)` }} />
      ))}

      {/* Campaign slide: the client's photo across the whole hero (no text) */}
      {slide.full && (
        <Link key={`f-${i}`} to={url} aria-label={`View ${product.name}`} className="absolute inset-0 z-[3] block animate-fade-in">
          {/* soft blurred copy fills the sides, the full photo sits on top — nothing gets cut */}
          <img src={slide.full} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl" />
          <img src={slide.full} alt="DriftOn Rose and Charcoal Alum Roll On campaign" fetchpriority="high"
            className="relative mx-auto h-full w-auto max-w-full object-contain lg:h-[calc(100svh-118px)] [-webkit-mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)] [mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)]" />
        </Link>
      )}

      {!slide.full && <>
      {/* Left: model photo, fading seamlessly into the background colour without any harsh divider line */}
      <div key={`m-${i}`} aria-hidden="true"
        style={slide.modelZoomOut ? { WebkitMaskImage: 'none', maskImage: 'none' } : undefined}
        className="absolute inset-x-0 top-[96px] h-[52%] w-full animate-from-left [-webkit-mask-image:linear-gradient(to_bottom,#000_0%,#000_65%,rgba(0,0,0,0.4)_85%,transparent_100%)] [mask-image:linear-gradient(to_bottom,#000_0%,#000_65%,rgba(0,0,0,0.4)_85%,transparent_100%)] lg:inset-y-0 lg:top-[118px] lg:right-auto lg:h-full lg:w-[54%] lg:[-webkit-mask-image:linear-gradient(to_right,#000_0%,#000_58%,rgba(0,0,0,0.85)_74%,rgba(0,0,0,0.35)_90%,transparent_100%)] lg:[mask-image:linear-gradient(to_right,#000_0%,#000_58%,rgba(0,0,0,0.85)_74%,rgba(0,0,0,0.35)_90%,transparent_100%)]">
        {slide.modelZoomOut ? (
          // banner photo: the whole photo, full height from the header to the bottom, flush left (no fade, no shadow)
          <img src={slide.modelPhoto} alt="" fetchpriority={i === 0 ? 'high' : undefined}
            className="absolute bottom-0 left-1/2 h-full w-auto max-w-none -translate-x-1/2 lg:bottom-auto lg:left-0 lg:top-0 lg:h-[calc(100%-118px)] lg:translate-x-0"
            onError={(e) => { if (!e.currentTarget.src.endsWith(FALLBACK_MODEL)) e.currentTarget.src = FALLBACK_MODEL; }} />
        ) : (
        <img src={slide.modelPhoto} alt="" fetchpriority={i === 0 ? 'high' : undefined} className="h-full w-full object-cover" style={{ objectPosition: slide.modelPos || '58% center' }}
          // if a photo is missing (e.g. model-boy.jpg not added yet), fall back to the girl photo
          onError={(e) => { if (!e.currentTarget.src.endsWith(FALLBACK_MODEL)) e.currentTarget.src = FALLBACK_MODEL; }} />
        )}
      </div>

      <div className="container-wide relative z-[2] flex h-full items-end justify-center pb-[118px] pt-[110px] sm:pb-24 lg:items-center lg:justify-end lg:pb-16 lg:pt-[135px]">
        {/* Right: unified luxury banner presentation with ambient glow and realistic grounding shadow */}
        <Link key={`p-${i}`} to={url} aria-label={`View ${product.name}`} className="flex h-[62%] w-full items-end justify-center sm:h-[66%] lg:h-full lg:w-[62%] xl:w-[64%] lg:items-center lg:justify-center lg:pr-8 xl:pr-14">
          <div className="relative flex items-center justify-center max-h-full max-w-full">
            {/* Ambient soft glow aura matching variant theme */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 top-1/4 bottom-8 rounded-full blur-3xl opacity-35 transition-all duration-700"
              style={{ background: slide.glow || '#FFF' }}
            />

            {/* Product Range Lineup with soft realistic drop shadow */}
            <img
              src={slide.rightImage || slide.cutout}
              alt={`${product.name} and other Drifton variants`}
              className="relative z-[2] h-auto max-h-full w-auto max-w-full animate-from-right object-contain drop-shadow-[0_24px_48px_rgba(15,26,60,0.18)] lg:max-h-[min(calc(100svh-170px),860px)]"
              style={{ animationDelay: '150ms' }}
            />

            {/* Realistic soft contact floor shadow grounding the bottles */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-2 inset-x-12 h-6 rounded-full bg-navy-950/20 blur-xl"
            />
          </div>
        </Link>
      </div>

      {/* Glass product card — sits on the seam between photo and products (desktop) */}
      <div className="pointer-events-none absolute inset-0 z-[4] hidden lg:block">
        <div className="container-wide relative h-full">
          <div key={`c-${i}`} className="pointer-events-auto absolute bottom-[84px] left-8 w-[330px] animate-fade-up rounded-[22px] border border-white/70 bg-white/80 p-5 shadow-[0_30px_60px_-30px_rgba(15,26,60,.55)] backdrop-blur-xl xl:w-[350px]" style={{ animationDelay: '450ms' }}>
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wider" style={{ background: slide.dark ? '#E5F5EC' : `${slide.glow}33`, color: slide.dark ? '#17703D' : slide.accent }}>
                <span className="size-1.5 rounded-full" style={{ background: slide.dark ? '#17703D' : slide.accent }} />{product.short || 'DriftOn'}
              </span>
              <span className="font-head text-[12px] font-semibold text-muted-2">{String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
            </div>
            <h2 className="mt-3 font-head text-[20px] font-bold leading-tight text-navy-900 xl:text-[21px]">{product.name}</h2>
            {product.tagline && <p className="mt-1 text-[14px] text-muted">{product.tagline}</p>}
            <div className="mt-3 flex items-center gap-2 text-[12.5px] text-muted">
              <span className="flex text-[#F5A524]" aria-hidden="true">{'★★★★★'}</span>
              <span><b className="text-navy-900">2,700+</b> happy customers</span>
            </div>
            <div className="mt-4 flex items-end justify-between gap-3">
              <span><b className="font-head text-[26px] font-bold text-navy-900">{formatINR(product.price)}</b><span className="ml-1.5 text-[12px] text-muted-2">incl. taxes</span></span>
              <span className="rounded-lg bg-mint-soft px-2 py-1 text-[11.5px] font-bold text-brand-dark">2 for ₹750</span>
            </div>
            <div className="mt-4 flex gap-2">
              <Link to={url} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-navy-900 text-[14px] font-semibold text-white transition hover:bg-navy-700">Shop now <span aria-hidden="true">→</span></Link>
              <Link to="/#shop" className="flex min-h-11 items-center justify-center rounded-xl border border-navy-900/15 bg-white px-4 text-[14px] font-semibold text-navy-900 transition hover:border-navy-900">All variants</Link>
            </div>
          </div>

          {/* trust badges near the products */}
          <div key={`b-${i}`} className="absolute right-10 top-[150px] flex animate-fade-up flex-col items-end gap-2 xl:right-16" style={{ animationDelay: '650ms' }}>
            {['100% natural alum', 'No white marks', 'Long lasting'].map((t) => (
              <span key={t} className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 py-1.5 pl-1.5 pr-3.5 text-[13px] font-semibold text-navy-900 shadow-[0_10px_24px_-14px_rgba(15,26,60,.5)] backdrop-blur">
                <span className="flex size-6 items-center justify-center rounded-full bg-mint-soft text-brand">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                </span>{t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile / tablet: slim glass bar with name, price and Shop now */}
      <div key={`mb-${i}`} className="absolute inset-x-[18px] bottom-[64px] z-[4] flex animate-fade-up items-center gap-3 rounded-2xl border border-white/70 bg-white/80 p-2.5 pl-4 shadow-[0_20px_40px_-24px_rgba(15,26,60,.6)] backdrop-blur-xl sm:inset-x-8 lg:hidden" style={{ animationDelay: '350ms' }}>
        <span className="min-w-0 flex-1">
          <b className="block truncate font-head text-[15px] text-navy-900">{product.name}</b>
          <span className="text-[13px] text-muted"><b className="text-navy-900">{formatINR(product.price)}</b> · 2 for ₹750</span>
        </span>
        <Link to={url} className="flex min-h-11 shrink-0 items-center rounded-xl bg-navy-900 px-4 text-[14px] font-semibold text-white">Shop now</Link>
      </div>
      </>}

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-6 z-[5]">
        <div className="container-wide flex items-center justify-between gap-4">
          <div className="flex gap-2.5">
            {bannerSlides.map((s, k) => (
              <button key={k} onClick={() => go(k)} aria-label={`Show slide ${k + 1}`} aria-current={k === i} className="flex h-6 w-10 items-center sm:w-14">
                <span className={`block h-[3px] w-full overflow-hidden rounded-full ${dark ? 'bg-white/30' : 'bg-navy-900/15'}`}>
                  {k < i && <i className={`block h-full w-full ${dark ? 'bg-white' : 'bg-navy-900'}`} />}
                  {k === i && <i key={i} className={`block h-full animate-bar ${dark ? 'bg-white' : 'bg-navy-900'}`} style={{ animationDuration: `${ENTER + HOLD}ms` }} />}
                </span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => go(i - 1)} aria-label="Previous slide" className={`icon-btn border-[1.5px] ${dark ? 'border-white/40 text-white hover:bg-white/15' : 'border-navy-900/20 bg-white/60'}`}><ChevronLeft /></button>
            <button onClick={() => go(i + 1)} aria-label="Next slide" className={`icon-btn ${dark ? 'bg-white text-navy-900 hover:bg-mint' : 'bg-navy-900 text-white hover:bg-navy-700'}`}><ChevronRight /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

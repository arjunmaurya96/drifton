import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bannerSlides, getProductById } from '../data/products.js';
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
      {/* Left: model photo, fading into the background colour */}
      {/* Mobile/tablet: photo across the top, fading down. Desktop: photo on the left, fading right. */}
      {/* The whole photo is always shown (never cut): it keeps its own shape and fits inside this area,
          then its edges fade softly into the background colour. */}
      <div key={`m-${i}`} aria-hidden="true"
        className="absolute inset-x-0 top-[96px] flex h-[52%] animate-from-left items-end justify-center lg:bottom-0 lg:right-auto lg:top-[118px] lg:h-auto lg:w-[50%] lg:justify-start">
        <img src={slide.modelPhoto} alt="" fetchpriority={i === 0 ? 'high' : undefined}
          className="block h-auto max-h-full w-auto max-w-full [-webkit-mask-composite:source-in] [mask-composite:intersect] [-webkit-mask-image:linear-gradient(to_bottom,transparent,#000_10%,#000_70%,transparent),linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)] [mask-image:linear-gradient(to_bottom,transparent,#000_10%,#000_70%,transparent),linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)] lg:[-webkit-mask-image:linear-gradient(to_top,#000_85%,transparent),linear-gradient(to_right,#000_72%,transparent)] lg:[mask-image:linear-gradient(to_top,#000_85%,transparent),linear-gradient(to_right,#000_72%,transparent)]"
          // if a photo is missing (e.g. model-boy.jpg not added yet), fall back to the girl photo
          onError={(e) => { if (!e.currentTarget.src.endsWith(FALLBACK_MODEL)) e.currentTarget.src = FALLBACK_MODEL; }} />
      </div>

      <div className="container-wide relative z-[2] flex h-full items-end justify-center pb-20 pt-[110px] lg:items-center lg:justify-end lg:pb-16 lg:pt-[135px]">
        {/* Right: this slide's product big in the middle, its other variants smaller around it (no text, no base) */}
        <Link key={`p-${i}`} to={url} aria-label={`View ${product.name}`} className="flex h-[62%] w-full items-end justify-center sm:h-[66%] lg:h-full lg:w-[62%] xl:w-[64%] lg:items-center lg:justify-center lg:pr-8 xl:pr-14">
          <img src={slide.rightImage || slide.cutout} alt={`${product.name} and other Drifton variants`}
            className="h-auto max-h-full w-auto max-w-full animate-from-right object-contain lg:max-h-[min(calc(100svh-170px),860px)]" style={{ animationDelay: '150ms' }} />
        </Link>
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

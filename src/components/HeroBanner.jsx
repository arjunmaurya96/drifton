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
      className="relative h-[calc(100svh-136px)] min-h-[600px] overflow-hidden lg:h-[100svh] lg:min-h-[640px]">
      {/* Product-colour backgrounds (cross-fade) */}
      {bannerSlides.map((s, k) => (
        <div key={k} aria-hidden="true" className={`absolute inset-0 transition-opacity duration-1000 ${k === i ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: `radial-gradient(42% 60% at 82% 50%, ${s.glow}AA 0%, transparent 70%), linear-gradient(110deg, ${s.bgFrom} 0%, ${s.bgTo} 100%)` }} />
      ))}

      {/* Left: model photo, fading into the background colour */}
      {/* Mobile/tablet: photo across the top, fading down. Desktop: photo on the left, fading right. */}
      <div key={`m-${i}`} aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[58%] w-full animate-from-left [-webkit-mask-image:linear-gradient(to_bottom,#000_55%,transparent_100%)] [mask-image:linear-gradient(to_bottom,#000_55%,transparent_100%)] lg:inset-y-0 lg:right-auto lg:h-full lg:w-[50%] lg:[-webkit-mask-image:linear-gradient(to_right,#000_62%,transparent_100%)] lg:[mask-image:linear-gradient(to_right,#000_62%,transparent_100%)]">
        <img src={slide.modelPhoto} alt="" className="h-full w-full object-cover" style={{ objectPosition: slide.modelPos || '58% center' }}
          // if a photo is missing (e.g. model-boy.jpg not added yet), fall back to the girl photo
          onError={(e) => { if (!e.currentTarget.src.endsWith(FALLBACK_MODEL)) e.currentTarget.src = FALLBACK_MODEL; }} />
      </div>

      <div className="container-wide relative z-[2] flex h-full items-end justify-center pb-20 lg:items-center lg:justify-end lg:pb-14">
        {/* Right: this slide's product big in the middle, its other variants smaller around it (no text, no base) */}
        <Link key={`p-${i}`} to={url} aria-label={`View ${product.name}`} className="flex h-[54%] w-full items-end justify-center sm:h-[56%] lg:h-full lg:w-[58%] lg:items-center">
          <img src={slide.rightImage || slide.cutout} alt={`${product.name} and other Drifton variants`}
            className="h-auto max-h-full w-auto max-w-full animate-from-right object-contain lg:max-h-[min(76svh,780px)]" style={{ animationDelay: '150ms' }} />
        </Link>
      </div>

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

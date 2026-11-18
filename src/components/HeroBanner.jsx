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
      {/* Left: model photo, fading seamlessly into the background colour without any harsh divider line */}
      <div key={`m-${i}`} aria-hidden="true"
        style={slide.modelZoomOut ? { WebkitMaskImage: 'none', maskImage: 'none' } : undefined}
        className="absolute inset-x-0 top-[96px] h-[52%] w-full animate-from-left [-webkit-mask-image:linear-gradient(to_bottom,#000_0%,#000_65%,rgba(0,0,0,0.4)_85%,transparent_100%)] [mask-image:linear-gradient(to_bottom,#000_0%,#000_65%,rgba(0,0,0,0.4)_85%,transparent_100%)] lg:inset-y-0 lg:top-[118px] lg:right-auto lg:h-full lg:w-[54%] lg:[-webkit-mask-image:linear-gradient(to_right,#000_0%,#000_58%,rgba(0,0,0,0.85)_74%,rgba(0,0,0,0.35)_90%,transparent_100%)] lg:[mask-image:linear-gradient(to_right,#000_0%,#000_58%,rgba(0,0,0,0.85)_74%,rgba(0,0,0,0.35)_90%,transparent_100%)]">
        {slide.modelZoomOut ? (
          // banner photo: the whole photo, full height. Its right edge melts into a band of the photo's own edge
          // colours, which then melts into the slide colour — so photo + products read as ONE banner (no divider line).
          <div className="absolute inset-x-0 bottom-0 top-0 flex justify-center lg:inset-x-auto lg:left-0 lg:h-[calc(100%-118px)] lg:justify-start">
            {/* mobile: soft band behind the photo in its own colours */}
            <span aria-hidden="true" className="absolute inset-0 lg:hidden [-webkit-mask-image:linear-gradient(to_bottom,#000_55%,transparent)] [mask-image:linear-gradient(to_bottom,#000_55%,transparent)]"
              style={{ background: `linear-gradient(180deg, ${slide.edge?.[0]}, ${slide.edge?.[1]}, ${slide.edge?.[2]})` }} />
            <span className="relative h-full">
              <img src={slide.modelPhoto} alt="" fetchpriority={i === 0 ? 'high' : undefined}
                className="relative z-[1] block h-full w-auto max-w-none [-webkit-mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent),linear-gradient(to_bottom,#000_75%,transparent)] [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent),linear-gradient(to_bottom,#000_75%,transparent)] [-webkit-mask-composite:source-in] [mask-composite:intersect] lg:[-webkit-mask-image:linear-gradient(to_right,#000_72%,transparent)] lg:[mask-image:linear-gradient(to_right,#000_72%,transparent)]"
                onError={(e) => { if (!e.currentTarget.src.endsWith(FALLBACK_MODEL)) e.currentTarget.src = FALLBACK_MODEL; }} />
              {/* desktop: colour band that continues the photo to the right and fades into the slide colour */}
              <span aria-hidden="true" className="absolute left-[60%] top-0 hidden h-full w-[90%] lg:block [-webkit-mask-image:linear-gradient(to_right,#000_25%,transparent)] [mask-image:linear-gradient(to_right,#000_25%,transparent)]"
                style={{ background: `linear-gradient(180deg, ${slide.edge?.[0]}, ${slide.edge?.[1]}, ${slide.edge?.[2]})` }} />
            </span>
          </div>
        ) : (
        <img src={slide.modelPhoto} alt="" fetchpriority={i === 0 ? 'high' : undefined} className="h-full w-full object-cover" style={{ objectPosition: slide.modelPos || '58% center' }}
          // if a photo is missing (e.g. model-boy.jpg not added yet), fall back to the girl photo
          onError={(e) => { if (!e.currentTarget.src.endsWith(FALLBACK_MODEL)) e.currentTarget.src = FALLBACK_MODEL; }} />
        )}
      </div>

      <div className="container-wide relative z-[2] flex h-full items-end justify-center pb-20 pt-[110px] lg:items-center lg:justify-end lg:pb-16 lg:pt-[135px]">
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

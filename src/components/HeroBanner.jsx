import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bannerSlides, getProductById } from '../data/products.js';
import IngredientIcon from './IngredientIcon.jsx';
import { ChevronLeft, ChevronRight } from './Icons.jsx';

// Timing (ms): slide comes in, then stays still for 3 seconds, then the next one slides in.
const ENTER = 1200;
const HOLD = 3000;

/**
 * Full-width image banner (phitku style).
 * The photo fills the whole width; big serif + bold headline, key ingredients and a SHOP NOW button sit on the left.
 * Each new slide slides in from the right. Clicking the photo opens the product page.
 */
export default function HeroBanner() {
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState(null);
  const n = bannerSlides.length;
  const navigate = useNavigate();
  const slide = bannerSlides[i];
  const product = getProductById(slide.productId);
  const url = `/product/${product.slug}`;

  const go = (k) => {
    const next = ((k % n) + n) % n;
    if (next === i) return;
    setPrev(i);
    setI(next);
  };

  useEffect(() => {
    const t = setTimeout(() => go(i + 1), ENTER + HOLD);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  return (
    <section id="top" aria-label="Featured products" aria-roledescription="carousel"
      className="relative h-[calc(100svh-118px)] max-h-[900px] min-h-[620px] overflow-hidden bg-navy-900">
      {/* Slides */}
      {bannerSlides.map((s, k) => {
        const state = k === i ? 'z-[2] translate-x-0 opacity-100' : k === prev ? 'z-[1] translate-x-0 opacity-100' : 'z-0 translate-x-full opacity-0';
        return (
          <div key={k} aria-hidden={k !== i} className={`absolute inset-0 overflow-hidden transition-[transform,opacity] duration-[1100ms] ease-[cubic-bezier(.7,0,.2,1)] ${state}`}>
            <img key={k === i ? `on-${i}` : 'off'} src={s.image} alt="" className={`h-full w-full object-cover object-[70%_center] ${k === i ? 'animate-ken' : ''}`} />
            {/* Model photo behind the text (left side). It fades out to the right into the product image. */}
            {s.modelPhoto && (
              <img src={s.modelPhoto} alt="" className={`absolute inset-y-0 left-0 h-full w-full object-cover object-top md:w-[58%] ${k === i ? 'animate-from-left' : ''}`}
                style={{ WebkitMaskImage: 'linear-gradient(to right, #000 55%, transparent 100%)', maskImage: 'linear-gradient(to right, #000 55%, transparent 100%)' }} />
            )}
          </div>
        );
      })}

      {/* Click anywhere on the photo to open the product */}
      <button onClick={() => navigate(url)} aria-label={`View ${product.name}`} className="absolute inset-0 z-[3] bg-transparent" />

      {/* Readability shade on the text side */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-r from-black/60 via-black/25 to-transparent max-md:bg-gradient-to-t max-md:from-black/75 max-md:via-black/35" />

      {/* Text */}
      <div className="container-wide pointer-events-none relative z-[4] flex h-full flex-col justify-between py-10 md:py-14">
        <div className="animate-fade-up">
          <img src="/assets/images/logo.png" alt="Drifton" className="h-14 w-auto brightness-0 invert md:h-20" />
          <span className="mt-2 block pl-1 font-jost text-sm font-medium tracking-[6px] text-white/90 md:text-base">NATURAL &amp; PURE</span>
        </div>

        <div key={i} className="pointer-events-auto flex max-w-[680px] flex-col gap-6 pb-14">
          <h1 className="animate-from-left">
            <span className="block font-serif text-[64px] leading-[0.95] sm:text-[96px] lg:text-[120px]" style={{ color: slide.accent }}>{slide.serif}</span>
            <span className="mt-2 block font-jost text-[30px] font-semibold leading-tight text-white sm:text-[44px] lg:text-[52px]">{slide.line}</span>
          </h1>

          <ul className="flex flex-wrap gap-2.5" aria-label="Key ingredients">
            {slide.ingredients.map((ing, k) => (
              <li key={ing.name} className="flex animate-from-right items-center gap-2.5 rounded-full bg-white/15 py-1.5 pl-1.5 pr-4 text-sm font-semibold text-white ring-1 ring-white/25 backdrop-blur-md"
                style={{ animationDelay: `${300 + k * 150}ms` }}>
                <span className="flex size-9 items-center justify-center rounded-full bg-white text-navy-900 [&_svg]:size-5"><IngredientIcon icon={ing.icon} /></span>
                {ing.name}
              </li>
            ))}
          </ul>

          <div className="flex animate-fade-up flex-wrap items-center gap-4" style={{ animationDelay: '700ms' }}>
            <Link to={url} className="inline-flex min-h-[64px] items-center rounded-full bg-white px-12 font-jost text-xl font-semibold tracking-wide text-navy-900 shadow-xl transition hover:bg-mint hover:text-navy-900">
              SHOP NOW
            </Link>
            <Link to="/#shop" className="font-jost text-lg font-medium text-white underline decoration-white/50 underline-offset-8 hover:text-mint">All products</Link>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-6 z-[5]">
        <div className="container-wide flex items-center justify-between gap-4">
          <div className="flex gap-2.5">
            {bannerSlides.map((s, k) => (
              <button key={k} onClick={() => go(k)} aria-label={`Show slide ${k + 1}`} aria-current={k === i} className="flex h-6 w-10 items-center sm:w-14">
                <span className="block h-[3px] w-full overflow-hidden rounded-full bg-white/30">
                  {k < i && <i className="block h-full w-full bg-white" />}
                  {k === i && <i key={i} className="block h-full animate-bar bg-white" style={{ animationDuration: `${ENTER + HOLD}ms` }} />}
                </span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => go(i - 1)} aria-label="Previous slide" className="icon-btn border-[1.5px] border-white/40 text-white hover:bg-white/15"><ChevronLeft /></button>
            <button onClick={() => go(i + 1)} aria-label="Next slide" className="icon-btn bg-white text-navy-900 hover:bg-mint"><ChevronRight /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

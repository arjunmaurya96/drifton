import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bannerSlides, getProductById } from '../data/products.js';
import IngredientIcon from './IngredientIcon.jsx';
import { ChevronLeft, ChevronRight } from './Icons.jsx';

// Timing (ms): slide comes in, then stays still for 3 seconds, then the next one slides in.
const ENTER = 1200;
const HOLD = 3000;
const FALLBACK_MODEL = '/assets/images/models/model-girl.jpg';

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
      className="relative h-[calc(100svh-118px)] max-h-[900px] min-h-[640px] overflow-hidden">
      {/* Product-colour backgrounds (cross-fade) */}
      {bannerSlides.map((s, k) => (
        <div key={k} aria-hidden="true" className={`absolute inset-0 transition-opacity duration-1000 ${k === i ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: `radial-gradient(42% 60% at 82% 50%, ${s.glow}AA 0%, transparent 70%), linear-gradient(110deg, ${s.bgFrom} 0%, ${s.bgTo} 100%)` }} />
      ))}

      {/* Left: model photo, fading into the background colour */}
      <div key={`m-${i}`} aria-hidden="true" className="absolute inset-y-0 left-0 w-full animate-from-left max-md:opacity-35 md:w-[50%] lg:w-[46%]"
        style={{ WebkitMaskImage: 'linear-gradient(to right, #000 62%, transparent 100%)', maskImage: 'linear-gradient(to right, #000 62%, transparent 100%)' }}>
        <img src={slide.modelPhoto} alt="" className="h-full w-full object-cover object-[58%_center]"
          // if a photo is missing (e.g. model-boy.jpg not added yet), fall back to the girl photo
          onError={(e) => { if (!e.currentTarget.src.endsWith(FALLBACK_MODEL)) e.currentTarget.src = FALLBACK_MODEL; }} />
      </div>

      <div className="container-wide relative z-[2] grid h-full grid-cols-1 items-center gap-6 pb-20 pt-6 md:grid-cols-[1fr_34%] lg:grid-cols-[34%_1fr_26%]">
        <div className="hidden lg:block" />

        {/* Middle: text */}
        <div key={`t-${i}`} className="flex flex-col gap-5">
          <h1 className="animate-from-right">
            <span className="block font-serif text-[52px] leading-[0.95] sm:text-[72px] xl:text-[88px]" style={{ color: slide.accent }}>{slide.serif}</span>
            <span className={`mt-2 block font-jost text-[26px] font-semibold leading-tight sm:text-[32px] xl:text-[38px] ${dark ? 'text-white' : 'text-navy-900'}`}>{slide.line}</span>
          </h1>
          <ul className="flex flex-wrap gap-2.5" aria-label="Key ingredients">
            {slide.ingredients.map((ing, k) => (
              <li key={ing.name} className={`flex animate-from-right items-center gap-2 rounded-full py-1 pl-1 pr-3.5 text-[13px] font-semibold backdrop-blur-md ${dark ? 'bg-white/10 text-white ring-1 ring-white/20' : 'bg-white/60 text-navy-900 ring-1 ring-white/80'}`}
                style={{ animationDelay: `${250 + k * 150}ms` }}>
                <span className="flex size-8 items-center justify-center rounded-full bg-white text-navy-900 shadow-sm [&_svg]:size-[18px]"><IngredientIcon icon={ing.icon} /></span>
                {ing.name}
              </li>
            ))}
          </ul>
          <div className="flex animate-fade-up flex-wrap items-center gap-5" style={{ animationDelay: '650ms' }}>
            <Link to={url} className={`inline-flex min-h-[54px] items-center rounded-full px-10 font-jost text-[17px] font-semibold tracking-wide shadow-lg ${dark ? 'bg-white text-navy-900 hover:bg-mint hover:text-navy-900' : 'bg-navy-900 text-white hover:bg-navy-700 hover:text-white'}`}>
              SHOP NOW
            </Link>
            <Link to="/#shop" className={`font-jost text-lg font-medium underline underline-offset-8 ${dark ? 'text-white decoration-white/50 hover:text-mint' : 'text-navy-900 decoration-navy-900/40 hover:text-navy-700'}`}>All products</Link>
          </div>
        </div>

        {/* Right: the product only */}
        <Link key={`p-${i}`} to={url} aria-label={`View ${product.name}`} className="hidden h-full items-center justify-center md:flex">
          <img src={slide.cutout} alt={product.name} className="h-[min(58svh,540px)] w-auto animate-from-right object-contain" style={{ animationDelay: '150ms' }} />
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

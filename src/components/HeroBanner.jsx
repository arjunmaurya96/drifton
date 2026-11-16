import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { heroImages } from '../data/products.js';
import { ChevronLeft, ChevronRight } from './Icons.jsx';

const HOLD = 4200; // ms each banner stays on screen

/**
 * Full-width image banner slider. The headline text is part of each image,
 * so the whole image is shown (never cropped): height follows the image's 16:9 ratio.
 * Slides alternate girl / boy, slide in from the right, then auto-advance.
 */
export default function HeroBanner() {
  const [i, setI] = useState(0);
  const n = heroImages.length;
  const go = (k) => setI(((k % n) + n) % n);

  useEffect(() => {
    const t = setTimeout(() => go(i + 1), HOLD);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  return (
    <section id="top" aria-label="Featured" aria-roledescription="carousel" className="relative w-full overflow-hidden bg-[#dfe9f2]">
      <div className="relative aspect-[2752/1536] w-full">
        {heroImages.map((s, k) => (
          <Link key={s.image} to={s.link} aria-hidden={k !== i} tabIndex={k === i ? 0 : -1}
            className={`absolute inset-0 transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(.7,0,.2,1)] ${k === i ? 'z-[2] translate-x-0 opacity-100' : 'z-[1] translate-x-[6%] opacity-0'}`}>
            <img src={s.image} alt={s.alt} className="h-full w-full object-cover" loading={k === 0 ? 'eager' : 'lazy'} />
          </Link>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-3 z-[5] sm:bottom-6">
        <div className="container-wide flex items-center justify-between gap-4">
          <div className="flex gap-2">
            {heroImages.map((s, k) => (
              <button key={k} onClick={() => go(k)} aria-label={`Show banner ${k + 1}`} aria-current={k === i} className="flex h-6 w-8 items-center sm:w-14">
                <span className="block h-[3px] w-full overflow-hidden rounded-full bg-white/50">
                  {k < i && <i className="block h-full w-full bg-white" />}
                  {k === i && <i key={i} className="block h-full animate-bar bg-white" style={{ animationDuration: `${HOLD}ms` }} />}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link to={heroImages[i].link} className="hidden min-h-11 items-center rounded-full bg-navy-900 px-7 font-jost text-[15px] font-semibold tracking-wide text-white shadow-lg hover:bg-navy-700 hover:text-white sm:inline-flex">SHOP NOW</Link>
            <button onClick={() => go(i - 1)} aria-label="Previous banner" className="icon-btn size-9 bg-white/80 text-navy-900 hover:bg-white sm:size-11"><ChevronLeft /></button>
            <button onClick={() => go(i + 1)} aria-label="Next banner" className="icon-btn size-9 bg-navy-900 text-white hover:bg-navy-700 sm:size-11"><ChevronRight /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

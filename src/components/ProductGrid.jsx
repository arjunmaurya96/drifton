import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { products } from '../data/products.js';
import ProductCard from './ProductCard.jsx';
import { ChevronLeft, ChevronRight } from './Icons.jsx';

/**
 * "Pick your crystal." product wall.
 * Desktop: 4 full cards in one row, the section is exactly one screen high (gentle scroll-snap).
 * Mobile: phitku-style carousel — one big card at a time, swipe or use the arrows to see the next one.
 */
export default function ProductGrid() {
  const track = useRef(null);
  const slide = (dir) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' });
  };

  return (
    <section id="shop" className="bg-white pb-16 pt-12 xl:flex xl:h-[100svh] xl:min-h-[620px] xl:snap-start xl:snap-always xl:flex-col xl:pb-5 xl:pt-0">
      <div className="container-wide xl:flex xl:min-h-0 xl:flex-1 xl:flex-col">
        <div className="mb-8 flex flex-col items-center gap-4 text-center sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-5 sm:text-left xl:mb-0 xl:h-[92px] xl:shrink-0 xl:items-center">
          <h2 className="font-jost text-[40px] font-medium leading-tight tracking-tight text-black sm:text-5xl xl:text-[44px]">Pick your crystal.</h2>
          <Link to="/shop" className="border-b-[3px] border-black pb-2 font-jost text-[15px] font-semibold uppercase tracking-wide text-black hover:text-black">
            Shop deodorants &amp; more
          </Link>
        </div>

        <div className="relative xl:flex xl:min-h-0 xl:flex-1">
          <div ref={track}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible xl:min-h-0 xl:flex-1 xl:grid-cols-4 [&::-webkit-scrollbar]:hidden">
            {products.map((p) => (
              <div key={p.id} className="w-full shrink-0 snap-center sm:w-auto xl:h-full">
                <ProductCard product={p} className="h-[560px] sm:h-[660px] xl:h-full" />
              </div>
            ))}
          </div>

          {/* mobile arrows (phitku style) */}
          <button onClick={() => slide(-1)} aria-label="Previous product"
            className="absolute left-3 top-[42%] z-10 flex size-11 items-center justify-center rounded-full bg-navy-900 text-white shadow-lg sm:hidden"><ChevronLeft /></button>
          <button onClick={() => slide(1)} aria-label="Next product"
            className="absolute right-3 top-[42%] z-10 flex size-11 items-center justify-center rounded-full bg-white/80 text-navy-900 shadow-lg sm:hidden"><ChevronRight /></button>
        </div>
      </div>
    </section>
  );
}

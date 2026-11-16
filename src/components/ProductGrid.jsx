import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { products } from '../data/products.js';
import ProductCard from './ProductCard.jsx';
import { ChevronLeft, ChevronRight } from './Icons.jsx';

/**
 * "Pick your crystal." product wall.
 * 4 big photo cards in one row on desktop (2×2 on tablet); on mobile a one-card carousel with arrows.
 * On large screens the section is exactly one screen high (gentle scroll-snap).
 */
export default function ProductGrid() {
  const track = useRef(null);
  const slide = (dir) => {
    const el = track.current;
    if (!el) return;
    const card = el.firstElementChild;
    const step = card ? card.getBoundingClientRect().width + 16 : el.clientWidth;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    if (dir > 0 && atEnd) el.scrollTo({ left: 0, behavior: 'smooth' });
    else if (dir < 0 && el.scrollLeft <= 4) el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    else el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <section id="shop" className="bg-white pb-16 pt-12 xl:flex xl:h-[100svh] xl:min-h-[860px] xl:snap-start xl:snap-always xl:flex-col xl:pb-4 xl:pt-0">
      <div className="container-wide xl:flex xl:min-h-0 xl:flex-1 xl:flex-col">
        <div className="mb-8 flex flex-col items-center gap-4 text-center sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-5 sm:text-left xl:mb-0 xl:h-[92px] xl:shrink-0 xl:items-center">
          <h2 className="font-jost text-[40px] font-medium leading-tight tracking-tight text-black sm:text-5xl xl:text-[44px]">Pick your crystal.</h2>
          <Link to="/shop" className="border-b-[3px] border-black pb-2 font-jost text-[15px] font-semibold uppercase tracking-wide text-black hover:text-black">
            Shop deodorants &amp; more
          </Link>
        </div>

        <div className="relative xl:flex xl:min-h-0 xl:flex-1">
          <div ref={track}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible lg:grid-cols-4 lg:gap-4 xl:min-h-0 xl:flex-1 [&::-webkit-scrollbar]:hidden">
            {products.map((p) => (
              <div key={p.id} className="w-full shrink-0 snap-start sm:w-auto xl:h-full">
                <ProductCard product={p} quickCheckout className="h-[78svh] min-h-[540px] max-h-[720px] sm:h-[720px] sm:max-h-none lg:h-[640px] xl:h-full" />
              </div>
            ))}
          </div>

          {/* arrows (phitku style) */}
          <button onClick={() => slide(-1)} aria-label="Previous products"
            className="absolute left-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-navy-900 shadow-lg sm:hidden"><ChevronLeft /></button>
          <button onClick={() => slide(1)} aria-label="Next products"
            className="absolute right-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-navy-900 shadow-lg sm:hidden"><ChevronRight /></button>
        </div>
      </div>
    </section>
  );
}

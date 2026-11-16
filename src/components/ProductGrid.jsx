import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { products } from '../data/products.js';
import ProductCard from './ProductCard.jsx';
import { ChevronLeft, ChevronRight } from './Icons.jsx';

/**
 * "Pick your crystal." product wall.
 * phitku-style carousel: 3 big photo cards on desktop, 2 on tablet, 1 on mobile — swipe or use the arrows.
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
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] sm:gap-5 xl:min-h-0 xl:flex-1 [&::-webkit-scrollbar]:hidden">
            {products.map((p) => (
              <div key={p.id} className="w-full shrink-0 snap-start sm:w-[calc((100%-20px)/2)] lg:w-[calc((100%-40px)/3)] xl:h-full">
                <ProductCard product={p} className="h-[78svh] min-h-[540px] max-h-[720px] sm:h-[680px] sm:max-h-none xl:h-full" />
              </div>
            ))}
          </div>

          {/* arrows (phitku style) */}
          <button onClick={() => slide(-1)} aria-label="Previous products"
            className="absolute left-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-navy-900 shadow-lg lg:-left-1 lg:size-12"><ChevronLeft /></button>
          <button onClick={() => slide(1)} aria-label="Next products"
            className="absolute right-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-navy-900 shadow-lg lg:-right-1 lg:size-12"><ChevronRight /></button>
        </div>
      </div>
    </section>
  );
}

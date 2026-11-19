import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { products } from '../data/products.js';
import ProductCard from './ProductCard.jsx';
import ProductInfoNote from './ProductInfoNote.jsx';
import { ChevronLeft, ChevronRight } from './Icons.jsx';

/**
 * "Pick your crystal." product wall.
 * 4 big photo cards in one row on desktop (2×2 on tablet); on mobile a one-card carousel with arrows.
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
    <section className="bg-white pb-16 pt-12 xl:pb-16 xl:pt-10">
      <div className="container-wide">
        <ProductInfoNote className="mb-12 sm:mb-14" />

        <div id="shop" className="mb-8 scroll-mt-28 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <h2 className="font-jost text-[40px] font-medium leading-tight tracking-tight text-black sm:text-5xl xl:text-[44px]">Pick your variant.</h2>
          <Link to="/ingredients" className="border-b-[3px] border-black pb-2 font-jost text-[15px] font-semibold uppercase tracking-wide text-black hover:text-black">
            Shop roll on &amp; more…
          </Link>
        </div>
      </div>

      {/* full width product wall. Desktop: hover a card and it grows wider (accordion), the others shrink */}
      <div className="relative px-3 sm:px-4">
        <div ref={track}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible lg:flex lg:gap-0 lg:divide-x lg:divide-line lg:overflow-hidden lg:rounded-2xl lg:border lg:border-line [&::-webkit-scrollbar]:hidden">
          {products.filter((p) => !p.hidden).map((p) => (
            <div key={p.id} id={p.id} data-product-id={p.id} data-slug={p.slug}
              className="group/card w-full shrink-0 snap-start scroll-mt-28 sm:w-auto lg:min-w-0 lg:flex-[1_1_0px] lg:transition-[flex-grow,flex-basis] lg:duration-[900ms] lg:ease-[cubic-bezier(.4,0,.2,1)] lg:hover:flex-[0_0_calc((620px-78px)*0.8)] xl:hover:flex-[0_0_calc((660px-78px)*0.8)]">
              <ProductCard product={p} quickCheckout className="h-[72svh] min-h-[520px] max-h-[640px] sm:h-[600px] sm:max-h-none lg:h-[620px] xl:h-[660px]" />
            </div>
          ))}
        </div>

        {/* arrows (phitku style) */}
        <button onClick={() => slide(-1)} aria-label="Previous products"
          className="absolute left-5 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-navy-900 shadow-lg sm:hidden"><ChevronLeft /></button>
        <button onClick={() => slide(1)} aria-label="Next products"
          className="absolute right-5 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-navy-900 shadow-lg sm:hidden"><ChevronRight /></button>
      </div>
    </section>
  );
}

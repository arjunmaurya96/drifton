import { Link } from 'react-router-dom';
import { products } from '../data/products.js';
import ProductCard from './ProductCard.jsx';

/**
 * "Pick your crystal." product wall.
 * On large screens the whole section is exactly one screen high: heading on top, 4 full cards filling the rest,
 * so every card (photo, name, price, button) is always fully visible. The page gently snaps to this section
 * when you scroll near it, from above or below. The header (when it slides back in) only covers the heading row.
 */
export default function ProductGrid() {
  return (
    <section id="shop" className="bg-white pb-16 pt-12 xl:flex xl:h-[100svh] xl:min-h-[620px] xl:snap-start xl:snap-always xl:flex-col xl:pb-5 xl:pt-0">
      <div className="container-wide xl:flex xl:min-h-0 xl:flex-1 xl:flex-col">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5 xl:mb-0 xl:h-[92px] xl:shrink-0 xl:items-center">
          <h2 className="font-jost text-4xl font-medium tracking-tight text-black sm:text-5xl xl:text-[44px]">Pick your crystal.</h2>
          <Link to="/#shop" className="border-b-[3px] border-black pb-2 font-jost text-[15px] font-semibold uppercase tracking-wide text-black hover:text-black">
            Shop deodorants &amp; more
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:min-h-0 xl:flex-1 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} className="h-[600px] sm:h-[660px] xl:h-full" />
          ))}
        </div>
      </div>
    </section>
  );
}

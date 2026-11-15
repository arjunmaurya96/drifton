import { Link } from 'react-router-dom';
import { products } from '../data/products.js';
import ProductCard from './ProductCard.jsx';

/**
 * "Pick your rock" style product wall.
 * On large screens the section fills exactly one screen height, so the 4 cards show in full.
 */
export default function ProductGrid() {
  return (
    <section id="shop" className="scroll-mt-0 bg-white py-12 xl:flex xl:h-[100svh] xl:min-h-[640px] xl:flex-col xl:py-6">
      <div className="container-wide flex flex-1 flex-col xl:min-h-0">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5 xl:mb-5">
          <h2 className="font-jost text-4xl font-medium tracking-tight text-black sm:text-5xl xl:text-[44px]">Pick your crystal.</h2>
          <Link to="/#shop" className="border-b-[3px] border-black pb-2 font-jost text-[15px] font-semibold uppercase tracking-wide text-black hover:text-black">
            Shop deodorants &amp; more
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:min-h-0 xl:flex-1 xl:grid-cols-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} className="h-[520px] sm:h-[560px] xl:h-full" />
          ))}
        </div>
      </div>
    </section>
  );
}

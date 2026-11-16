import { Link } from 'react-router-dom';
import { products } from '../data/products.js';
import ProductCard from './ProductCard.jsx';

/**
 * "Pick your rock" style product wall.
 * Tall cards: on large screens each card is almost a full screen high.
 */
export default function ProductGrid() {
  return (
    <section id="shop" className="bg-white pb-16 pt-12">
      <div className="container-wide">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5 xl:mb-5">
          <h2 className="font-jost text-4xl font-medium tracking-tight text-black sm:text-5xl xl:text-[44px]">Pick your crystal.</h2>
          <Link to="/#shop" className="border-b-[3px] border-black pb-2 font-jost text-[15px] font-semibold uppercase tracking-wide text-black hover:text-black">
            Shop deodorants &amp; more
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} className="h-[600px] sm:h-[660px] xl:h-[calc(100svh-32px)] xl:min-h-[680px] xl:max-h-[960px]" />
          ))}
        </div>
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import { products } from '../data/products.js';
import ProductCard from './ProductCard.jsx';

/** "Pick your rock" style product row: 4 big full-image cards. */
export default function ProductGrid() {
  return (
    <section id="shop" className="bg-white pb-20 pt-16">
      <div className="container-wide">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-5">
          <h2 className="font-jost text-4xl font-medium tracking-tight text-black sm:text-5xl">Pick your crystal.</h2>
          <Link to="/#shop" className="border-b-[3px] border-black pb-2 font-jost text-[15px] font-semibold uppercase tracking-wide text-black hover:text-black">
            Shop deodorants &amp; more
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}

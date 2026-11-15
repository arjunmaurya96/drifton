import { Link } from 'react-router-dom';
import { products } from '../data/products.js';
import ProductCard from './ProductCard.jsx';

export default function ProductGrid() {
  return (
    <section id="shop" className="py-24">
      <div className="container-wide">
        <div className="mb-11 flex flex-wrap items-end justify-between gap-5 px-2">
          <div className="flex flex-col gap-3">
            <span className="eyebrow">Shop the range</span>
            <h2 className="h2">Pick your <span className="text-brand">crystal.</span></h2>
          </div>
          <Link to="/#shop" className="border-b-2 border-navy-900 pb-1.5 text-sm font-bold uppercase tracking-wider text-navy-900">Shop deodorants &amp; more</Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}

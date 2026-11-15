import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { formatINR } from '../data/products.js';

/**
 * Product card, phitku "Pick your rock" style.
 * Fixed "wall" card: no hover effects. Full photo, Sale pill, white name + price, small ADD TO CART pill.
 */
export default function ProductCard({ product, className = 'h-[520px] sm:h-[560px] 2xl:h-[640px]' }) {
  const { addToCart, cart } = useStore();
  const url = `/product/${product.slug}`;
  const inCart = cart.some((l) => l.id === product.id);

  return (
    <article className={`relative overflow-hidden rounded-xl bg-page ${className}`}>
      <Link to={url} aria-label={`View ${product.name}`} className="absolute inset-0">
        {/* photo keeps its colours, toned just slightly so it sits well on the page background */}
        <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover [filter:saturate(.92)_brightness(.97)]" />
        <span aria-hidden="true" className="absolute inset-0 bg-page/10" />
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/45 via-black/15 to-transparent" />
      </Link>

      <span className="absolute right-5 top-5 rounded-full bg-white px-5 py-2 font-jost text-[14px] font-medium text-navy-900">
        {product.badge === 'Bestseller' ? 'Bestseller' : 'Sale'}
      </span>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-1.5 px-5 pb-6 text-center text-white">
        <Link to={url} className="pointer-events-auto font-jost text-[22px] font-medium leading-tight text-white [text-shadow:0_2px_10px_rgba(0,0,0,.35)] hover:text-white 2xl:text-[26px]">
          {product.name}
        </Link>
        <span className="flex items-baseline gap-2.5 font-jost text-[16px] font-medium [text-shadow:0_2px_8px_rgba(0,0,0,.35)]">
          <s className="text-white/80">Rs. {product.mrp.toFixed(2)}</s>
          <span>Rs. {product.price.toFixed(2)}</span>
        </span>
        <button onClick={() => addToCart(product)}
          className="pointer-events-auto mt-3 min-h-[40px] rounded-full bg-white px-7 font-jost text-[13px] font-medium uppercase tracking-wide text-navy-900">
          {inCart ? 'Add another' : 'Add to cart'}
        </button>
      </div>
      <span className="sr-only">{formatINR(product.price)}</span>
    </article>
  );
}

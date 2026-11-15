import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { formatINR } from '../data/products.js';

// Soft oval fade so the photo melts into the page instead of sitting in a box
const fade = 'radial-gradient(ellipse closest-side at 50% 50%, #000 68%, transparent 100%)';

/**
 * Product without a card: no box, no border, no hover effect.
 * The photo fades into the background; name, price and a small ADD TO CART sit underneath.
 */
export default function ProductCard({ product, className = 'h-[520px] sm:h-[560px]' }) {
  const { addToCart, cart } = useStore();
  const url = `/product/${product.slug}`;
  const inCart = cart.some((l) => l.id === product.id);

  return (
    <article className={`flex flex-col items-center text-center ${className}`}>
      <Link to={url} aria-label={`View ${product.name}`} className="relative block min-h-0 w-full flex-1">
        <img src={product.image} alt={product.name} loading="lazy"
          className="mx-auto h-full w-auto max-w-full object-cover [filter:saturate(.95)]"
          style={{ WebkitMaskImage: fade, maskImage: fade }} />
        <span className="absolute right-[16%] top-[4%] rounded-full bg-navy-900 px-4 py-1.5 font-jost text-[13px] font-medium text-white">
          {product.badge === 'Bestseller' ? 'Bestseller' : 'Sale'}
        </span>
      </Link>

      <div className="flex shrink-0 flex-col items-center gap-1.5 pt-2">
        <Link to={url} className="font-jost text-[21px] font-medium leading-tight text-navy-900 hover:text-navy-900 2xl:text-[24px]">{product.name}</Link>
        <span className="flex items-baseline gap-2.5 font-jost text-[16px] font-medium text-navy-900">
          <s className="text-muted-2">Rs. {product.mrp.toFixed(2)}</s>
          <span>Rs. {product.price.toFixed(2)}</span>
        </span>
        <button onClick={() => addToCart(product)}
          className="mt-2 min-h-[40px] rounded-full bg-navy-900 px-7 font-jost text-[13px] font-medium uppercase tracking-wide text-white">
          {inCart ? 'Add another' : 'Add to cart'}
        </button>
      </div>
      <span className="sr-only">{formatINR(product.price)}</span>
    </article>
  );
}

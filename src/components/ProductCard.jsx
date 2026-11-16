import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { formatINR, COMBO_PRICE } from '../data/products.js';

/**
 * Product card: just the product (no photo background, no base, no shadow) on a soft
 * tint of its own colour, with the details neatly underneath. Fixed — no hover effects.
 */
export default function ProductCard({ product, className = 'h-[560px] sm:h-[620px]' }) {
  const { addToCart, cart } = useStore();
  const url = `/product/${product.slug}`;
  const inCart = cart.some((l) => l.id === product.id);

  return (
    <article className={`flex flex-col overflow-hidden rounded-xl ${className}`}
      style={{ background: `linear-gradient(180deg, ${product.bg} 0%, #FFFFFF 78%)` }}>
      <Link to={url} aria-label={`View ${product.name}`} className="relative block min-h-0 flex-1">
        <img src={product.image} alt={product.name} loading="lazy" className="absolute inset-0 m-auto h-[82%] w-auto max-w-[78%] object-contain" />
        <span className="absolute left-4 top-4 rounded-full bg-white px-4 py-1.5 font-jost text-[13px] font-medium text-navy-900">{product.badge}</span>
        <span className="absolute right-4 top-4 rounded-full bg-navy-900 px-3 py-1.5 text-xs font-bold text-white">2 for {formatINR(COMBO_PRICE)}</span>
      </Link>

      <div className="flex shrink-0 flex-col items-center gap-1 px-5 pb-6 pt-2 text-center">
        <span className="text-[11px] font-bold uppercase tracking-[2px]" style={{ color: product.accent }}>{product.tag}</span>
        <Link to={url} className="font-jost text-[19px] font-medium leading-tight text-navy-900 hover:text-navy-900 2xl:text-[21px]">{product.name}</Link>
        <span className="flex items-baseline gap-2 font-jost text-[15px]">
          <b className="font-semibold text-navy-900">{formatINR(product.price)}</b>
          <span className="text-[13px] text-muted-2">+ delivery</span>
        </span>
        <button onClick={() => addToCart(product)}
          className="mt-2.5 min-h-[38px] rounded-full bg-navy-900 px-6 font-jost text-[12px] font-medium uppercase tracking-wider text-white hover:bg-navy-700">
          {inCart ? 'Add another' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}

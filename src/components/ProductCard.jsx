import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { formatINR } from '../data/products.js';
import { Cart } from './Icons.jsx';

/**
 * Product card, phitku style: a full-bleed photo of the product with its own natural
 * ingredient (palash flowers, rose, charcoal, crystals) and the name, price and
 * sleek cart + buy now buttons.
 */
export default function ProductCard({ product, className = 'h-[500px] sm:h-[560px]' }) {
  const { addToCart, cart, openCart } = useStore();
  
  // Both Buy Now and Add to Cart add the item and open the right-side cart drawer
  const onBuyNow = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    addToCart(product, 1, undefined, false);
    openCart();
  };

  const onAddToCart = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    addToCart(product, 1, undefined, false);
    openCart();
  };

  const url = `/product/${product.slug}`;
  const inCart = cart.some((l) => l.id === product.id);

  return (
    <article className={`group/c flex h-full flex-col overflow-hidden rounded-2xl bg-white lg:rounded-none ${className}`}>
      {/* photo */}
      <Link to={url} aria-label={`View ${product.name}`} className="relative block min-h-0 flex-1 overflow-hidden" style={{ background: product.bg }}>
        {/* soft blurred copy fills any extra space when the card grows; the real photo keeps its size (no zoom) */}
        <img src={product.card || product.scene} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl" />
        <img src={product.card || product.scene} alt={product.name} loading="lazy"
          className="absolute left-1/2 top-0 h-full w-auto max-w-none -translate-x-1/2" />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 font-jost text-[12.5px] font-semibold uppercase tracking-wider text-navy-900 shadow-sm">Sale</span>
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-3 rounded-full bg-black/55 px-4 py-2 font-jost text-[13px] font-medium text-white opacity-0 backdrop-blur transition duration-500 lg:group-hover/c:translate-y-0 lg:group-hover/c:opacity-100">View details →</span>
      </Link>

      {/* info strip with sleek cart icon button & buy now */}
      <div className="flex h-[78px] shrink-0 items-center gap-2.5 border-t border-line bg-white px-3.5 sm:px-4">
        <span className="min-w-0 flex-1">
          <Link to={url} className="block truncate font-jost leading-tight text-navy-900 hover:text-navy-700">
            <b className="text-[16px] sm:text-[17px] font-semibold">{product.short}</b>{' '}
            <span className="text-[12.5px] sm:text-[13px] font-medium text-muted">Alum Roll On</span>
          </Link>
          <span className="mt-0.5 block font-jost text-[14.5px] sm:text-[15px]">
            <b className="font-semibold text-navy-900">{formatINR(product.price)}</b>
          </span>
        </span>

        {/* Patla sa Cart Button (Add to cart & open side drawer) */}
        <button
          type="button"
          onClick={onAddToCart}
          aria-label={`Add ${product.name} to cart`}
          title={inCart ? `${product.name} is in cart (Click to view)` : `Add ${product.name} to cart`}
          className={`relative flex size-9.5 sm:size-10 shrink-0 items-center justify-center rounded-full border-[1.5px] transition hover:scale-105 active:scale-95 cursor-pointer shadow-xs ${
            inCart
              ? 'border-brand bg-mint-soft text-brand-dark'
              : 'border-line-strong bg-white text-navy-900 hover:border-navy-900 hover:bg-page'
          }`}
        >
          <Cart size={17} />
          {inCart && (
            <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white shadow-xs">
              ✓
            </span>
          )}
        </button>

        {/* Buy Now Button (Direct checkout) */}
        <button
          type="button"
          onClick={onBuyNow}
          aria-label={`Buy ${product.name} now`}
          className="h-9.5 sm:h-10 shrink-0 whitespace-nowrap rounded-full bg-navy-900 px-3.5 sm:px-4 font-jost text-[12px] sm:text-[12.5px] font-semibold uppercase tracking-wider text-white transition hover:bg-navy-700 hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
        >
          Buy now
        </button>
      </div>
    </article>
  );
}

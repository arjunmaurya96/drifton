import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { formatINR } from '../data/products.js';

/**
 * Product card, phitku style: a full-bleed photo of the product with its own natural
 * ingredient (palash flowers, rose, charcoal, crystals) and the name, price and
 * ADD TO CART sitting on the photo. Fixed — no hover effects.
 */
export default function ProductCard({ product, className = 'h-[500px] sm:h-[560px]', quickCheckout = false }) {
  const { addToCart, cart, openCheckout } = useStore();
  // quickCheckout (home page): add the stick and open the checkout popup straight away
  const onAdd = () => (quickCheckout ? (addToCart(product, 1, undefined, true), openCheckout()) : addToCart(product));
  const url = `/product/${product.slug}`;
  const inCart = cart.some((l) => l.id === product.id);

  return (
    <article className={`group/c flex h-full flex-col overflow-hidden rounded-2xl bg-white lg:rounded-none ${className}`}>
      {/* photo */}
      <Link to={url} aria-label={`View ${product.name}`} className="relative block min-h-0 flex-1 overflow-hidden" style={{ background: product.bg }}>
        <img src={product.card || product.scene} alt={product.name} loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] lg:group-hover/c:scale-[1.05]" />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 font-jost text-[12.5px] font-semibold uppercase tracking-wider text-navy-900 shadow-sm">Sale</span>
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-3 rounded-full bg-black/55 px-4 py-2 font-jost text-[13px] font-medium text-white opacity-0 backdrop-blur transition duration-500 lg:group-hover/c:translate-y-0 lg:group-hover/c:opacity-100">View details →</span>
      </Link>

      {/* info strip */}
      <div className="flex items-center gap-3 border-t border-line bg-white px-4 py-4 sm:px-5">
        <span className="min-w-0 flex-1">
          <Link to={url} className="block truncate font-jost text-[17px] font-semibold leading-tight text-navy-900 hover:text-navy-700">{product.name.replace('DriftOn™ ', '')}</Link>
          <span className="mt-0.5 flex items-center gap-2 font-jost text-[14px]">
            <b className="font-semibold text-navy-900">{formatINR(product.price)}</b>
            <span className="rounded-md bg-mint-soft px-1.5 py-0.5 text-[11.5px] font-bold text-brand-dark">2 for ₹750</span>
          </span>
        </span>
        <button onClick={onAdd} aria-label={`Add ${product.name} to cart`}
          className="shrink-0 rounded-full bg-navy-900 px-5 py-3 font-jost text-[13.5px] font-semibold uppercase tracking-wide text-white transition hover:bg-navy-700">
          {inCart ? 'Add more' : 'Add'}
        </button>
      </div>
    </article>
  );
}

import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { formatINR } from '../data/products.js';

/**
 * Product card, phitku style: a full-bleed photo of the product with its own natural
 * ingredient (palash flowers, rose, charcoal, crystals) and the name, price and
 * ADD TO CART sitting on the photo. Fixed — no hover effects.
 */
export default function ProductCard({ product, className = 'h-[600px] sm:h-[680px]' }) {
  const { addToCart, cart } = useStore();
  const url = `/product/${product.slug}`;
  const inCart = cart.some((l) => l.id === product.id);

  return (
    <article className={`relative overflow-hidden rounded-2xl ${className}`} style={{ background: product.bg }}>
      <Link to={url} aria-label={`View ${product.name}`} className="absolute inset-0">
        <img src={product.scene} alt={product.name} loading="lazy" className="h-full w-full object-cover object-[50%_42%]" />
      </Link>
      <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-white px-4 py-2 font-jost text-[14px] font-medium text-navy-900">Sale</span>

      {/* name, price and button on the photo */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-1.5 bg-gradient-to-t from-black/55 via-black/15 to-transparent px-5 pb-6 pt-28 text-center text-white">
        <Link to={url} className="pointer-events-auto font-jost text-[22px] font-medium leading-tight text-white [text-shadow:0_1px_8px_rgba(0,0,0,.35)] hover:text-white 2xl:text-[25px]">{product.name}</Link>
        <span className="font-jost text-[16px] font-medium">{formatINR(product.price)} <span className="text-[13px] font-normal text-white/80">+ delivery</span></span>
        <button onClick={() => addToCart(product)}
          className="pointer-events-auto mt-2 min-h-[46px] rounded-full bg-white px-9 font-jost text-[14px] font-medium uppercase tracking-wide text-navy-900 hover:bg-mint">
          {inCart ? 'Add another' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}

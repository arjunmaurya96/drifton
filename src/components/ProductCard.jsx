import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { formatINR } from '../data/products.js';
import { Heart } from './Icons.jsx';

/** Big full-image product card (phitku "Pick your rock" style). */
export default function ProductCard({ product, className = 'h-[540px] sm:h-[600px] 2xl:h-[680px]' }) {
  const { addToCart, toggleWish, wishlist, cart } = useStore();
  const url = `/product/${product.slug}`;
  const inWish = wishlist.includes(product.id);
  const inCart = cart.some((l) => l.id === product.id);

  return (
    <article className={`group relative overflow-hidden rounded-[28px] ${className}`} style={{ background: product.bg }}>
      <Link to={url} aria-label={`View ${product.name}`} className="absolute inset-0">
        <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]" />
      </Link>

      {/* bottom shade so the white text is always readable */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/60 via-black/25 to-transparent" />

      <span className="absolute right-5 top-5 rounded-full bg-white px-6 py-2.5 font-jost text-[15px] font-medium text-navy-900 shadow-sm">{product.badge === 'Bestseller' ? 'Bestseller' : 'Sale'}</span>
      <button onClick={() => toggleWish(product.id)} aria-pressed={inWish} aria-label={`${inWish ? 'Remove' : 'Add'} ${product.name} ${inWish ? 'from' : 'to'} wishlist`}
        className="absolute left-5 top-5 flex size-11 items-center justify-center rounded-full bg-white/90 text-navy-900 opacity-0 shadow-sm transition group-hover:opacity-100 focus-visible:opacity-100 aria-pressed:opacity-100">
        <Heart filled={inWish} />
      </button>

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 px-6 pb-7 text-center text-white">
        <Link to={url} className="font-jost text-[23px] font-medium leading-tight text-white 2xl:text-[27px] [text-shadow:0_2px_12px_rgba(0,0,0,.35)] hover:text-white">
          {product.name}
        </Link>
        <span className="flex items-baseline gap-3 font-jost text-[17px] font-medium [text-shadow:0_2px_10px_rgba(0,0,0,.35)]">
          <s className="text-white/80">Rs. {product.mrp.toFixed(2)}</s>
          <span>Rs. {product.price.toFixed(2)}</span>
        </span>
        <button onClick={() => addToCart(product)}
          className="mt-3 min-h-[52px] rounded-full bg-white px-10 font-jost text-[15px] font-medium uppercase tracking-wide text-navy-900 shadow-lg transition hover:bg-mint">
          {inCart ? 'Add another' : 'Add to cart'}
        </button>
      </div>
      <span className="sr-only">{formatINR(product.price)}</span>
    </article>
  );
}

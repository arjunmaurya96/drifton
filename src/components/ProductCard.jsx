import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { formatINR, discount } from '../data/products.js';
import { Heart } from './Icons.jsx';

export default function ProductCard({ product, height = 'h-[540px] sm:h-[640px]' }) {
  const { addToCart, toggleWish, wishlist, cart } = useStore();
  const url = `/product/${product.slug}`;
  const inWish = wishlist.includes(product.id);
  const inCart = cart.some((l) => l.id === product.id);

  return (
    <article className={`group relative overflow-hidden rounded-[30px] transition duration-300 hover:-translate-y-2 hover:shadow-[0_40px_70px_-30px_rgba(15,26,60,.5)] ${height}`} style={{ background: product.bg }}>
      <Link to={url} aria-label={`View ${product.name}`} className="absolute inset-0">
        <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.07]" />
      </Link>
      <span className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-navy-900 shadow">{product.badge}</span>
      <button onClick={() => toggleWish(product.id)} aria-pressed={inWish} aria-label={`${inWish ? 'Remove' : 'Add'} ${product.name} ${inWish ? 'from' : 'to'} wishlist`}
        className="absolute right-4 top-4 flex size-[46px] items-center justify-center rounded-full bg-white/95 text-navy-900 shadow">
        <Heart filled={inWish} />
      </button>
      <div className="absolute inset-x-3.5 bottom-3.5 flex flex-col gap-3 rounded-[22px] bg-navy-900/85 p-5 text-white backdrop-blur-md">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-widest text-mint">{product.tag}</span>
          <Link to={url} className="font-head text-[23px] font-semibold leading-tight text-white hover:text-mint">{product.name}</Link>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-baseline gap-2.5">
            <span className="font-head text-2xl font-bold">{formatINR(product.price)}</span>
            <s className="text-[15px] text-[#AEB8D8]">{formatINR(product.mrp)}</s>
          </span>
          <span className="rounded-full bg-mint px-2.5 py-1 text-[12.5px] font-bold text-navy-900">{discount(product)}% OFF</span>
        </div>
        <button className="btn-white w-full" onClick={() => addToCart(product)}>{inCart ? 'Added · Add another' : 'Add to cart'}</button>
      </div>
    </article>
  );
}

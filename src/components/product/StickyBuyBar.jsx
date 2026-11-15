import { useEffect, useState } from 'react';
import { formatINR } from '../../data/products.js';
import { QtyStepper } from '../CartDrawer.jsx';
import { Stars } from '../Reviews.jsx';

/** Bottom bar that slides in once the main "Add to cart" button scrolls out of view. */
export default function StickyBuyBar({ product, rating, price, qty, setQty, onAdd, onBuy, watchId }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = document.getElementById(watchId);
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, [watchId]);

  return (
    <div className={`fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/95 backdrop-blur transition-transform duration-300 ${show ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="container-x flex items-center justify-between gap-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <img src={product.image} alt="" className="size-14 rounded-2xl object-cover" />
          <div className="hidden min-w-0 sm:block">
            <b className="block truncate font-head font-semibold">{product.name}</b>
            <span className="flex items-center gap-2 text-sm text-muted-2"><Stars value={rating} size={14} /> {rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:block"><QtyStepper value={qty} onChange={(q) => setQty(Math.max(1, q))} size="sm" /></span>
          <b className="hidden font-head text-xl sm:block">{formatINR(price)}</b>
          <button className="btn-line min-h-11 px-4" onClick={onAdd}>Add to cart</button>
          <button className="btn-primary min-h-11 px-5" onClick={onBuy}>Buy now</button>
        </div>
      </div>
    </div>
  );
}

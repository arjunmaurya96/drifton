import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { formatINR, products } from '../data/products.js';
import { Close, Minus, Plus, Bag } from './Icons.jsx';

export function QtyStepper({ value, onChange, size = 'md' }) {
  const s = size === 'sm' ? 'size-9' : 'size-11';
  return (
    <div className="inline-flex items-center rounded-full border-[1.5px] border-line-strong bg-white" aria-label="Quantity">
      <button type="button" onClick={() => onChange(value - 1)} aria-label="Decrease quantity" className={`${s} flex items-center justify-center rounded-full hover:bg-[#EEF1F8]`}><Minus size={16} /></button>
      <span className="min-w-7 text-center font-semibold">{String(value).padStart(2, '0')}</span>
      <button type="button" onClick={() => onChange(value + 1)} aria-label="Increase quantity" className={`${s} flex items-center justify-center rounded-full hover:bg-[#EEF1F8]`}><Plus size={16} /></button>
    </div>
  );
}

// Two offer cards inside the cart (DUMMY offers — confirm with the client).
function CartOffers({ cart, count, addToCart }) {
  const inCart = new Set(cart.map((l) => l.id));
  const suggest = products.find((p) => !inCart.has(p.id)) || products[0];
  const need = Math.max(0, 3 - count);
  const pct = Math.min(100, (count / 3) * 100);
  return (
    <div className="mt-2 flex flex-col gap-3 border-t border-dashed border-line-strong pt-5">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-2">Offers for you</span>

      {/* 1. Add one more variant */}
      <div className="flex items-center gap-3 rounded-2xl p-3.5 ring-1 ring-line" style={{ background: `linear-gradient(110deg, ${suggest.bg}, #FFFFFF)` }}>
        <img src={suggest.image} alt="" className="h-[74px] w-auto shrink-0 object-contain" />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-dark">Add one more variant</span>
          <b className="truncate font-head text-[15px] font-semibold">{suggest.name}</b>
          <span className="text-[13px] text-muted-2">{formatINR(suggest.price)} <s className="ml-1">{formatINR(suggest.mrp)}</s></span>
        </span>
        <button onClick={() => addToCart(suggest)} className="min-h-10 shrink-0 rounded-full bg-navy-900 px-4 text-[13px] font-semibold text-white hover:bg-navy-700">+ Add</button>
      </div>

      {/* 2. Get the 3rd one free */}
      <div className="flex flex-col gap-2.5 rounded-2xl bg-navy-900 p-4 text-white">
        <div className="flex items-center justify-between gap-3">
          <span>
            <span className="block text-[11px] font-bold uppercase tracking-widest text-mint">Buy 2, get 3rd free</span>
            <b className="font-head text-[15px] font-semibold">
              {need > 0 ? `Add ${need} more to get 1 free` : 'Unlocked! Your 3rd stick is free'}
            </b>
          </span>
          <span className="font-serif text-3xl leading-none text-mint">{Math.min(count, 3)}/3</span>
        </div>
        <span className="block h-2 overflow-hidden rounded-full bg-white/15"><i className="block h-full rounded-full bg-mint transition-all duration-500" style={{ width: `${pct}%` }} /></span>
        {need > 0 && (
          <button onClick={() => addToCart(suggest)} className="self-start rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-navy-900 hover:bg-mint">
            Add {suggest.short}
          </button>
        )}
      </div>
    </div>
  );
}

export default function CartDrawer() {
  const { cart, cartOpen, closeCart, updateQty, subtotal, openBuy, addToCart, count } = useStore();
  if (!cartOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[80] animate-fade-in bg-navy-900/45" onClick={closeCart} />
      <aside role="dialog" aria-modal="true" aria-label="Your cart" className="fixed inset-y-0 right-0 z-[81] flex w-full max-w-[420px] animate-slide-in flex-col bg-white">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h3 className="text-[22px] font-semibold">Your cart</h3>
          <button className="icon-btn" onClick={closeCart} aria-label="Close cart"><Close /></button>
        </div>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center text-muted-2">
              <Bag size={40} />
              <span>Your cart is empty.</span>
              <Link to="/shop" className="btn-navy" onClick={closeCart}>Shop products</Link>
            </div>
          ) : (
            cart.map((l) => (
              <div key={l.key} className="flex items-center gap-3.5">
                <img src={l.image} alt="" className="size-[72px] rounded-2xl bg-page object-contain p-1.5" />
                <div className="flex flex-1 flex-col gap-1">
                  <b className="font-head text-base font-semibold">{l.name}</b>
                  <small className="text-[13.5px] text-muted-2">{l.pack} · {formatINR(l.unitPrice)}</small>
                  <div className="self-start"><QtyStepper size="sm" value={l.qty} onChange={(q) => updateQty(l.key, q)} /></div>
                </div>
                <b className="font-head">{formatINR(l.qty * l.unitPrice)}</b>
              </div>
            ))
          )}
          {cart.length > 0 && <CartOffers cart={cart} count={count} addToCart={addToCart} />}
        </div>
        {cart.length > 0 && (
          <div className="flex flex-col gap-3.5 border-t border-line px-6 py-5">
            <div className="flex justify-between text-[17px] font-semibold"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
            <small className="text-muted-2">Shipping and discounts are calculated at checkout.</small>
            <button className="btn-primary w-full" onClick={() => { closeCart(); openBuy(cart, true); }}>Checkout</button>
          </div>
        )}
      </aside>
    </>
  );
}

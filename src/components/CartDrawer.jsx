import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { formatINR } from '../data/products.js';
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

export default function CartDrawer() {
  const { cart, cartOpen, closeCart, updateQty, subtotal, notify } = useStore();
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
              <Link to="/#shop" className="btn-navy" onClick={closeCart}>Shop products</Link>
            </div>
          ) : (
            cart.map((l) => (
              <div key={l.key} className="flex items-center gap-3.5">
                <img src={l.image} alt="" className="size-[72px] rounded-2xl object-cover" />
                <div className="flex flex-1 flex-col gap-1">
                  <b className="font-head text-base font-semibold">{l.name}</b>
                  <small className="text-[13.5px] text-muted-2">{l.pack} · {formatINR(l.unitPrice)}</small>
                  <div className="self-start"><QtyStepper size="sm" value={l.qty} onChange={(q) => updateQty(l.key, q)} /></div>
                </div>
                <b className="font-head">{formatINR(l.qty * l.unitPrice)}</b>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="flex flex-col gap-3.5 border-t border-line px-6 py-5">
            <div className="flex justify-between text-[17px] font-semibold"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
            <small className="text-muted-2">Shipping and discounts are calculated at checkout.</small>
            <button className="btn-primary w-full" onClick={() => notify('Checkout coming soon (demo)')}>Checkout</button>
          </div>
        )}
      </aside>
    </>
  );
}

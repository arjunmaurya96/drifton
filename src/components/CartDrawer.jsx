import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { TaxNote } from './InfoNote.jsx';
import { formatINR, products, UNIT_PRICE, COMBO_PRICE, NATURAL_PAIR_PRICE, THIRD_PRICE } from '../data/products.js';
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

// Two offer cards inside the cart (client's logic):
//  1) by default: add a Natural Alum Roll On → both for ₹750
//  2) once there are 2 roll ons: the 3rd roll on (any variant) for just ₹300
export function CartOffers({ cart, count, addToCart }) {
  const natural = products.find((p) => p.id === 'natural');
  const onlyNatural = cart.length > 0 && cart.every((l) => l.id === 'natural');
  const second = onlyNatural ? products.find((p) => p.id !== 'natural') : natural; // the roll on we suggest as #2
  const naturals = cart.filter((l) => l.id === 'natural').reduce((s, l) => s + l.qty * (l.sticks || 1), 0);
  const step = count % 3; // 1 = needs a 2nd, 2 = needs a 3rd, 0 = set complete
  const pairPrice = naturals > 0 ? NATURAL_PAIR_PRICE : COMBO_PRICE;
  const tick = <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-[13px] font-bold text-white">✓</span>;

  return (
    <div className="mt-2 flex flex-col gap-3 border-t border-dashed border-line-strong pt-5">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-2">Offers for you</span>

      {/* Offer 1: 2nd roll on → ₹750 with Natural */}
      {step === 1 ? (
        <div className="flex items-center gap-3 rounded-2xl p-3 ring-1 ring-brand/40" style={{ background: `linear-gradient(110deg, ${second.bg}, #FFFFFF)` }}>
          <span className="flex h-[72px] w-12 shrink-0 items-center justify-center"><img src={second.image} alt="" className="h-full w-auto object-contain" /></span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-dark">Offer 1 · 2 roll ons for {formatINR(NATURAL_PAIR_PRICE)}</span>
            <b className="truncate font-head text-[15px] font-semibold">Add {second.name}</b>
            <span className="text-[13px] text-muted-2">Pay only {formatINR(NATURAL_PAIR_PRICE - UNIT_PRICE)} for it · save {formatINR(UNIT_PRICE * 2 - NATURAL_PAIR_PRICE)} + free delivery</span>
          </span>
          <button onClick={() => addToCart(second)} className="min-h-10 shrink-0 rounded-full bg-navy-900 px-4 text-[13px] font-semibold text-white hover:bg-navy-700">+ Add</button>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl bg-mint-soft px-4 py-3 text-[14px] font-semibold text-brand-dark">
          {tick} 2 roll ons for {formatINR(pairPrice)} applied · free delivery
        </div>
      )}

      {/* Offer 2: 3rd roll on for ₹300 */}
      <div className={`flex flex-col gap-3 rounded-2xl p-4 text-white ${step === 1 ? 'bg-navy-900/55' : 'bg-navy-900'}`}>
        <div className="flex items-center justify-between gap-3">
          <span className="min-w-0">
            <span className="block text-[11px] font-bold uppercase tracking-widest text-mint">Offer 2 · 3rd roll on</span>
            <b className="font-head text-[15px] font-semibold">
              {step === 0 ? `Unlocked! Your 3rd roll on is just ${formatINR(THIRD_PRICE)}` : step === 2 ? `Add a 3rd roll on for just ${formatINR(THIRD_PRICE)}` : `Unlocks after your 2nd roll on`}
            </b>
          </span>
          <span className="shrink-0 font-serif text-3xl leading-none text-mint">{formatINR(THIRD_PRICE)}</span>
        </div>
        {step === 2 && (
          <div className="grid grid-cols-4 gap-2">
            {products.filter((p) => !p.hidden).map((p) => (
              <button key={p.id} onClick={() => addToCart(p)} aria-label={`Add ${p.name} for ${formatINR(THIRD_PRICE)}`}
                className="flex flex-col items-center gap-1 rounded-xl bg-white/10 p-2 text-[12px] font-semibold hover:bg-white/20">
                <img src={p.image} alt="" className="h-12 w-auto object-contain" />
                {p.short}
                <span className="rounded-full bg-mint px-2 py-0.5 text-[11px] text-navy-900">+ Add</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function PriceRows({ s, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 text-[14.5px] ${className}`}>
      <div className="flex justify-between text-muted"><span>{s.sticks} {s.sticks === 1 ? 'roll on' : 'roll ons'} × {formatINR(UNIT_PRICE)}</span><span>{formatINR(s.full)}</span></div>
      {s.comboSaving > 0 && <div className="flex justify-between font-semibold text-brand-dark"><span>Offer discount</span><span>−{formatINR(s.comboSaving)}</span></div>}
      {s.couponOff > 0 && <div className="flex justify-between font-semibold text-brand-dark"><span>Coupon {s.coupon}</span><span>−{formatINR(s.couponOff)}</span></div>}
      <div className="flex justify-between text-muted"><span>Delivery</span><span>{s.delivery ? formatINR(s.delivery) : <b className="text-brand-dark">Free</b>}</span></div>
    </div>
  );
}

export default function CartDrawer() {
  const { cart, cartOpen, closeCart, updateQty, summary, openBuy, addToCart, count } = useStore();
  if (!cartOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[80] animate-fade-in bg-navy-900/45" onClick={closeCart} />
      <aside role="dialog" aria-modal="true" aria-label="Your cart" className="fixed inset-y-0 right-0 z-[81] flex w-full max-w-[420px] animate-slide-in flex-col bg-white">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6 sm:py-5">
          <h3 className="text-[22px] font-semibold">Your cart</h3>
          <button className="icon-btn" onClick={closeCart} aria-label="Close cart"><Close /></button>
        </div>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5 sm:px-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center text-muted-2">
              <Bag size={40} />
              <span>Your cart is empty.</span>
              <Link to="/#shop" className="btn-navy" onClick={closeCart}>Shop products</Link>
            </div>
          ) : (
            cart.map((l) => (
              <div key={l.key} className="flex items-center gap-3.5">
                <span className="flex size-[72px] shrink-0 items-center justify-center rounded-2xl bg-page p-1.5"><img src={l.image} alt="" className="h-full w-auto object-contain" /></span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <b className="truncate font-head text-base font-semibold">{l.name}</b>
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
          <div className="flex flex-col gap-3 border-t border-line px-5 py-4 sm:px-6">
            <PriceRows s={summary} />
            <div className="flex justify-between border-t border-line pt-3 text-[17px] font-semibold"><span>Total</span><span>{formatINR(summary.total)}</span></div>
            <TaxNote className="text-[13px]" />
            <button className="btn-primary w-full" onClick={() => { closeCart(); openBuy(cart, true); }}>Checkout</button>
          </div>
        )}
      </aside>
    </>
  );
}

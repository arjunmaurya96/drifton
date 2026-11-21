import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { TaxNote } from './InfoNote.jsx';
import { formatINR, products, UNIT_PRICE, COMBO_PRICE, NATURAL_PAIR_PRICE, THIRD_PRICE } from '../data/products.js';
import { Close, Minus, Plus, Bag, CheckCircle, Sparkle } from './Icons.jsx';
import ConfettiBoom from './ConfettiBoom.jsx';

export function QtyStepper({ value, onChange, size = 'md' }) {
  const s = size === 'sm' ? 'size-9' : 'size-11';
  return (
    <div className="inline-flex items-center rounded-full border-[1.5px] border-line-strong bg-white" aria-label="Quantity">
      <button type="button" onClick={() => onChange(value - 1)} aria-label="Decrease quantity" className={`${s} flex items-center justify-center rounded-full hover:bg-[#EEF1F8]`}>
        <Minus size={16} />
      </button>
      <span className="min-w-7 text-center font-semibold">{String(value).padStart(2, '0')}</span>
      <button type="button" onClick={() => onChange(value + 1)} aria-label="Increase quantity" className={`${s} flex items-center justify-center rounded-full hover:bg-[#EEF1F8]`}>
        <Plus size={16} />
      </button>
    </div>
  );
}

// =====================================================================
//  Interactive Cart Offers:
//  • Step 1 (count = 1): Show Offer 1 (Natural pair for ₹750) + 4 mini product cards + locked Offer 2.
//    Adding any product triggers the booming confetti celebration!
//  • Step 2 (count = 2): Offer 1 is checked, Offer 2 unlocks (3rd for ₹300) with 4 product cards.
//    Adding the 3rd roll on triggers another booming celebration!
//  • Step 3 (count >= 3): Both offers unlocked and completed with maximum savings note.
// =====================================================================
export function CartOffers({ cart, count, onAddWithCelebration }) {
  const allProducts = products.filter((p) => !p.hidden);
  const natural = products.find((p) => p.id === 'natural') || allProducts[0];
  const onlyNatural = cart.length > 0 && cart.every((l) => l.id === 'natural');
  const second = onlyNatural ? (products.find((p) => p.id !== 'natural') || natural) : natural;
  const naturals = cart.filter((l) => l.id === 'natural').reduce((s, l) => s + l.qty * (l.sticks || 1), 0);
  const step = count % 3; // 1 = needs 2nd, 2 = needs 3rd, 0 = complete set
  const pairPrice = naturals > 0 ? NATURAL_PAIR_PRICE : COMBO_PRICE;
  const pairSaving = (UNIT_PRICE * 2) - pairPrice;

  return (
    <div className="mt-2 flex flex-col gap-3.5 border-t border-dashed border-line-strong pt-5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-2">
          <Sparkle size={15} /> Offers for you
        </span>
        <span className="text-[11.5px] font-semibold text-brand">
          {count === 1 ? '1 step away from Combo' : count === 2 ? '🔥 ₹300 Offer Unlocked' : '✓ Maximum Savings Unlocked'}
        </span>
      </div>

      {/* ---------- OFFER 1: 2nd Roll On (Pair for ₹750 / ₹800) ---------- */}
      {step === 1 ? (
        <div className="flex flex-col gap-3">
          {/* Featured Natural Pair Card */}
          <div
            className="flex items-center gap-3.5 rounded-2xl p-3.5 ring-2 ring-brand/50 shadow-sm transition-all"
            style={{ background: `linear-gradient(115deg, ${second.bg || '#D9ECFA'} 0%, #FFFFFF 85%)` }}
          >
            <span className="flex h-20 w-14 shrink-0 items-center justify-center">
              <img src={second.image} alt={second.name} className="h-full w-auto object-contain drop-shadow-sm" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="inline-flex items-center gap-1 self-start rounded-full bg-brand/15 px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wide text-brand-dark">
                ⚡ Offer 1 · 2 Roll Ons for {formatINR(pairPrice)}
              </span>
              <b className="truncate font-head text-[15px] font-bold text-navy-900">Add {second.name}</b>
              <p className="text-[12.5px] text-muted-2 leading-tight">
                Pay only <b className="text-navy-900">{formatINR(pairPrice - UNIT_PRICE)}</b> for it · save <b className="text-brand-dark">{formatINR(pairSaving)}</b> + free delivery
              </p>
            </div>
            <button
              type="button"
              onClick={() => onAddWithCelebration(second, 'combo2')}
              className="btn-primary min-h-[40px] shrink-0 px-4 text-[13px] font-bold shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            >
              + Add
            </button>
          </div>

          {/* 4 Compact Products Mini-Grid */}
          <div className="flex flex-col gap-2 rounded-2xl bg-page/80 p-3 border border-line">
            <span className="text-[12px] font-bold text-navy-900">
              Or pick any variant to pair (Save {formatINR(pairSaving)}):
            </span>
            <div className="grid grid-cols-4 gap-2">
              {allProducts.map((p) => {
                const isNat = p.id === 'natural';
                const extraPay = isNat ? (NATURAL_PAIR_PRICE - UNIT_PRICE) : (COMBO_PRICE - UNIT_PRICE);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onAddWithCelebration(p, 'combo2')}
                    aria-label={`Add ${p.name}`}
                    className="group flex flex-col items-center gap-1 rounded-xl border border-line-strong bg-white p-2 text-center transition hover:border-navy-700 hover:shadow-md cursor-pointer"
                  >
                    <span className="flex h-11 w-full items-center justify-center">
                      <img src={p.image} alt="" className="h-full w-auto object-contain transition-transform group-hover:scale-110" />
                    </span>
                    <span className="truncate w-full text-[11px] font-bold text-navy-900">{p.short || p.name}</span>
                    <span className="text-[10px] font-semibold text-brand-dark">+{formatINR(extraPay)}</span>
                    <span className="w-full rounded-md bg-navy-900 py-0.5 text-[10.5px] font-bold text-white group-hover:bg-brand transition-colors">
                      + Add
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 rounded-2xl bg-mint-soft px-4 py-3 text-[13.5px] font-semibold text-brand-dark border border-brand/20">
          <CheckCircle size={20} className="shrink-0 text-brand" />
          <span>2 roll ons combo applied · Saved {formatINR(pairSaving)} + Free delivery!</span>
        </div>
      )}

      {/* ---------- OFFER 2: 3rd Roll On for ₹300 ---------- */}
      {step === 2 ? (
        /* Offer 2 Unlocked State (count = 2) */
        <div className="flex flex-col gap-3 rounded-2xl bg-[linear-gradient(135deg,#0A1E4A_0%,#153A7A_100%)] p-4 text-white shadow-xl ring-2 ring-mint/60 animate-fade-up">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1 rounded-full bg-mint/20 px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wide text-mint">
                🔥 Mega Offer 2 · Unlocked!
              </span>
              <b className="mt-1 block font-head text-[15.5px] font-bold text-white">
                Add any 3rd roll on for just {formatINR(THIRD_PRICE)}!
              </b>
              <span className="text-[12px] text-white/80">Regular price {formatINR(UNIT_PRICE)} · You save {formatINR(UNIT_PRICE - THIRD_PRICE)}</span>
            </div>
            <span className="shrink-0 font-serif text-3xl font-extrabold text-mint">{formatINR(THIRD_PRICE)}</span>
          </div>

          {/* 4 Choices to pick as the 3rd roll on */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {allProducts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onAddWithCelebration(p, 'combo3')}
                aria-label={`Add ${p.name} for ${formatINR(THIRD_PRICE)}`}
                className="group flex flex-col items-center gap-1 rounded-xl bg-white/10 p-2 text-[11px] font-semibold text-white hover:bg-white/20 transition-all hover:scale-105 cursor-pointer border border-white/15"
              >
                <img src={p.image} alt="" className="h-11 w-auto object-contain transition-transform group-hover:scale-110 drop-shadow" />
                <span className="truncate w-full text-center">{p.short || p.name}</span>
                <span className="w-full rounded-md bg-mint py-0.5 text-[10.5px] font-bold text-navy-900 group-hover:bg-white transition-colors">
                  + Add ₹{THIRD_PRICE}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : step === 0 && count >= 3 ? (
        /* Offer 2 Applied State (count >= 3) */
        <div className="flex items-center gap-2.5 rounded-2xl bg-navy-900 px-4 py-3 text-[13.5px] font-semibold text-white shadow-sm">
          <CheckCircle size={20} className="shrink-0 text-mint" />
          <span>3rd roll on for {formatINR(THIRD_PRICE)} applied · Extra {formatINR(UNIT_PRICE - THIRD_PRICE)} saved!</span>
        </div>
      ) : (
        /* Offer 2 Locked Preview State (count = 1) */
        <div className="flex items-center justify-between rounded-2xl border border-line-strong bg-page p-3.5 opacity-85">
          <div className="min-w-0">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-2">
              🔒 Offer 2 · 3rd Roll On
            </span>
            <b className="font-head text-[13.5px] font-semibold text-navy-900">
              Unlocks after your 2nd roll on
            </b>
            <span className="block text-[12px] text-muted-2">Get your 3rd roll on for just {formatINR(THIRD_PRICE)}</span>
          </div>
          <span className="shrink-0 font-serif text-2xl font-bold text-muted-2">{formatINR(THIRD_PRICE)}</span>
        </div>
      )}
    </div>
  );
}

export function PriceRows({ s, className = '', showDelivery = false }) {
  return (
    <div className={`flex flex-col gap-1.5 text-[14.5px] ${className}`}>
      <div className="flex justify-between text-muted">
        <span>{s.sticks} {s.sticks === 1 ? 'roll on' : 'roll ons'} × {formatINR(UNIT_PRICE)}</span>
        <span>{formatINR(s.full)}</span>
      </div>
      {s.comboSaving > 0 && (
        <div className="flex justify-between font-semibold text-brand-dark">
          <span>Offer discount</span>
          <span>−{formatINR(s.comboSaving)}</span>
        </div>
      )}
      {s.couponOff > 0 && (
        <div className="flex justify-between font-semibold text-brand-dark">
          <span>Coupon {s.coupon}</span>
          <span>−{formatINR(s.couponOff)}</span>
        </div>
      )}
      {showDelivery && (
        <div className="flex justify-between text-muted">
          <span>Delivery</span>
          <span>{s.delivery ? formatINR(s.delivery) : <b className="text-brand-dark">Free</b>}</span>
        </div>
      )}
    </div>
  );
}

export default function CartDrawer() {
  const { cart, cartOpen, closeCart, updateQty, summary, openBuy, openCheckout, addToCart, count } = useStore();
  const [boom, setBoom] = useState({ show: false, title: '', message: '', subtext: '', savings: 0 });

  if (!cartOpen) return null;

  const handleAddWithCelebration = (product, offerType) => {
    addToCart(product);
    if (offerType === 'combo2') {
      const isNatural = product.id === 'natural' || cart.some((c) => c.id === 'natural');
      const saving = isNatural ? 200 : 150;
      setBoom({
        show: true,
        title: 'Hurray! Combo Unlocked 🎉',
        message: `${product.name} added to cart!`,
        subtext: `2 Roll Ons Combo Applied · You saved ₹${saving} + FREE Delivery!`,
        savings: saving,
      });
    } else if (offerType === 'combo3') {
      const saving = UNIT_PRICE - THIRD_PRICE; // 175
      setBoom({
        show: true,
        title: 'Super Savings Unlocked! 🚀',
        message: `${product.name} added for just ₹${THIRD_PRICE}!`,
        subtext: `You saved ₹${saving} extra on your 3rd roll on!`,
        savings: saving,
      });
    } else {
      addToCart(product);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[80] animate-fade-in bg-navy-900/45" onClick={closeCart} />
      <aside role="dialog" aria-modal="true" aria-label="Your cart" className="fixed inset-y-0 right-0 z-[81] flex w-full max-w-[440px] animate-slide-in flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-2">
            <h3 className="text-[22px] font-semibold text-navy-900">Your cart</h3>
            {count > 0 && (
              <span className="rounded-full bg-navy-900 px-2.5 py-0.5 text-xs font-bold text-white">
                {count} {count === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <button className="icon-btn" onClick={closeCart} aria-label="Close cart">
            <Close />
          </button>
        </div>

        {/* Cart Items & Offers */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5 sm:px-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center text-muted-2">
              <Bag size={40} />
              <span className="text-[15px]">Your cart is empty.</span>
              <Link to="/#shop" className="btn-navy" onClick={closeCart}>
                Shop products
              </Link>
            </div>
          ) : (
            cart.map((l) => (
              <div key={l.key} className="flex items-center gap-3.5 rounded-2xl border border-line bg-white p-3 shadow-xs">
                <span className="flex size-[68px] shrink-0 items-center justify-center rounded-xl bg-page p-1">
                  <img src={l.image} alt="" className="h-full w-auto object-contain" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <b className="truncate font-head text-[15px] font-semibold text-navy-900">{l.name}</b>
                  <small className="text-[13px] text-muted-2">
                    {l.pack} · {formatINR(l.unitPrice)}
                  </small>
                  <div className="self-start">
                    <QtyStepper size="sm" value={l.qty} onChange={(q) => updateQty(l.key, q)} />
                  </div>
                </div>
                <b className="font-head text-[15px] text-navy-900">{formatINR(l.qty * l.unitPrice)}</b>
              </div>
            ))
          )}

          {/* Interactive Offers Flow */}
          {cart.length > 0 && (
            <CartOffers
              cart={cart}
              count={count}
              onAddWithCelebration={handleAddWithCelebration}
            />
          )}
        </div>

        {/* Footer: Price summary & Checkout CTA */}
        {cart.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-line bg-white px-5 py-4 sm:px-6">
            <PriceRows s={summary} />
            <div className="flex justify-between border-t border-line pt-2.5 text-[17px] font-bold text-navy-900">
              <span>Total</span>
              <span>{formatINR(summary.total)}</span>
            </div>
            <TaxNote className="text-[12.5px]" />
            <button
              className="btn-primary w-full min-h-[50px] text-base font-bold shadow-lg"
              onClick={() => {
                closeCart();
                openCheckout();
              }}
            >
              Checkout
            </button>
          </div>
        )}
      </aside>

      {/* Confetti Explosion Celebration Modal on Offer/Product Add */}
      <ConfettiBoom
        show={boom.show}
        title={boom.title}
        message={boom.message}
        subtext={boom.subtext}
        savings={boom.savings}
        onClose={() => setBoom({ show: false, title: '', message: '', subtext: '', savings: 0 })}
      />
    </>
  );
}

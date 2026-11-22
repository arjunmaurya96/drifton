import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { TaxNote } from './InfoNote.jsx';
import { formatINR, products, UNIT_PRICE, COMBO_PRICE, NATURAL_PAIR_PRICE, THIRD_PRICE, STORE_OFFERS, computeCartLinePrices } from '../data/products.js';
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
//  • Step 1 (count < 2): Show Offer 1 (Natural pair for ₹800, 2nd for ₹325) + 4 mini product cards.
//    Adding any product triggers the booming confetti celebration!
//  • Step 2 (count >= 2): Combo applied with Free delivery.
// =====================================================================
export function CartOffers({ cart, count, onAddWithCelebration, isCheckout = false }) {
  const allProducts = products.filter((p) => !p.hidden);
  const naturalProduct = products.find((p) => p.id === 'natural') || allProducts[0];

  const offer1Config = STORE_OFFERS['natural-pair'] || {
    title: '⚡ Offer 1 · 2 Roll Ons',
    desc: 'Add another Natural fresh rollon starting ₹325 onwards',
  };

  return (
    <div className="mt-2 flex flex-col gap-3.5 border-t border-dashed border-line-strong pt-5">
      {/* Big Attractive Blinking 'Offers for you' Header */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-brand/15 via-brand/5 to-transparent px-3.5 py-1.5 border border-brand/25 shadow-xs">
          <Sparkle size={22} className="text-brand shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="font-head text-[19px] sm:text-[21px] font-black tracking-wide text-brand-dark animate-pulse">
            Offers for you
          </span>
          <span className="relative flex size-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
            <span className="relative inline-flex rounded-full size-2.5 bg-brand"></span>
          </span>
        </div>
      </div>

      {/* ---------- OFFER 1: Featured Natural Roll On Card (when count < 2) ---------- */}
      {count < 2 ? (
        /* Featured Natural Pair Card with exact requested content */
        <div
          className="flex items-center justify-between gap-3 rounded-2xl p-4 ring-2 ring-brand/50 shadow-sm transition-all"
          style={{ background: `linear-gradient(115deg, ${naturalProduct?.bg || '#D9ECFA'} 0%, #FFFFFF 85%)` }}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="inline-flex items-center gap-1 self-start rounded-full bg-brand/15 px-2.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wide text-brand-dark">
              {offer1Config.title || '⚡ Offer 1 · 2 Roll Ons'}
            </span>
            <b className="truncate font-head text-[16px] font-bold text-navy-900">
              Add DriftOn™ Natural Alum Roll On
            </b>
            <p className="text-[12.5px] font-medium text-muted-2 leading-tight">
              Add another Natural fresh rollon starting ₹325 onwards
            </p>
          </div>
          <button
            type="button"
            onClick={() => onAddWithCelebration(naturalProduct, 'combo2')}
            className="btn-primary min-h-[40px] shrink-0 px-4 text-[13px] font-bold shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          >
            + Add
          </button>
        </div>
      ) : count === 2 && isCheckout ? (
        /* ---------- OFFER 2: 3rd Roll On Deal in Checkout for ₹300 + FREE Delivery ---------- */
        <div className="flex flex-col gap-3 rounded-2xl bg-[linear-gradient(135deg,#0A1E4A_0%,#153A7A_100%)] p-4 text-white shadow-xl ring-2 ring-mint/60 animate-fade-up">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1 rounded-full bg-mint/20 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-mint mb-1">
                🔥 Exclusive Checkout Deal · 3rd Roll On
              </span>
              <b className="block font-head text-[16px] sm:text-[17px] font-bold text-white">
                Add 3rd roll on for ₹300 + FREE Delivery!
              </b>
              <span className="text-[12px] text-white/80">
                Any variant for just ₹300 (Save ₹175) + Free Delivery (Save ₹50 extra)
              </span>
            </div>
            <span className="shrink-0 font-serif text-3xl font-extrabold text-mint">₹300</span>
          </div>

          {/* 4 Choices to pick as the 3rd roll on */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {allProducts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onAddWithCelebration(p, 'combo3')}
                aria-label={`Add ${p.name} for ₹300 + Free Delivery`}
                className="group flex flex-col items-center gap-1 rounded-xl bg-white/10 p-2 text-[11px] font-semibold text-white hover:bg-white/20 transition-all hover:scale-105 cursor-pointer border border-white/15"
              >
                <img src={p.image} alt="" className="h-11 w-auto object-contain transition-transform group-hover:scale-110 drop-shadow" />
                <span className="truncate w-full text-center">{p.short || p.name}</span>
                <span className="w-full rounded-md bg-mint py-0.5 text-[10.5px] font-bold text-navy-900 group-hover:bg-white transition-colors">
                  + Add ₹300
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : count === 2 && !isCheckout ? (
        <div className="flex flex-col gap-1 rounded-2xl bg-[#EEF4FF] p-3.5 border border-brand/20 text-navy-900">
          <div className="flex items-center gap-2 text-[13.5px] font-bold">
            <CheckCircle size={18} className="text-brand shrink-0" />
            <span>{cart.some((l) => l.id === 'natural') ? 'Natural roll on offer applied (₹325)!' : '2 roll ons added.'}</span>
          </div>
          <p className="text-[12px] text-muted-2 pl-6">
            👉 Proceed to <b>Checkout</b> to unlock any 3rd roll on for <b>₹300 + FREE Delivery</b>!
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 rounded-2xl bg-mint-soft px-4 py-3 text-[13.5px] font-semibold text-brand-dark border border-brand/20">
          <CheckCircle size={20} className="shrink-0 text-brand" />
          <span>3rd roll on for ₹300 applied · FREE Delivery unlocked!</span>
        </div>
      )}

      {/* 4 Compact Products Mini-Grid: ALWAYS VISIBLE even after 2nd product is added */}
      <div className="flex flex-col gap-2 rounded-2xl bg-page/80 p-3 border border-line">
        <span className="text-[12px] font-bold text-navy-900">
          {count < 2 ? 'Or pick any variant to pair:' : 'Add more roll ons:'}
        </span>
        <div className="grid grid-cols-4 gap-2">
          {allProducts.map((p) => {
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onAddWithCelebration(p, count < 2 ? 'combo2' : count === 2 ? 'combo3' : 'more')}
                aria-label={`Add ${p.name}`}
                className="group flex flex-col items-center gap-1.5 rounded-xl border border-line-strong bg-white p-2 text-center transition hover:border-navy-700 hover:shadow-md cursor-pointer"
              >
                <span className="flex h-11 w-full items-center justify-center">
                  <img src={p.image} alt="" className="h-full w-auto object-contain transition-transform group-hover:scale-110" />
                </span>
                <span className="truncate w-full text-[11px] font-bold text-navy-900">{p.short || p.name}</span>
                <span className="w-full rounded-md bg-navy-900 py-0.5 text-[10.5px] font-bold text-white group-hover:bg-brand transition-colors">
                  + Add
                </span>
              </button>
            );
          })}
        </div>
      </div>
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
      const willHaveNatural = product.id === 'natural' || cart.some((c) => c.id === 'natural');
      if (willHaveNatural) {
        setBoom({
          show: true,
          title: 'Hurray! Natural Offer Applied 🎉',
          message: `${product.name} added to cart!`,
          subtext: `Natural Roll On for ₹325 · You saved ₹150!`,
          savings: 150,
        });
      } else {
        setBoom({
          show: true,
          title: 'Product Added! 🎉',
          message: `${product.name} added to cart!`,
          subtext: `Proceed to checkout for 3rd roll on @ ₹300 + FREE Delivery!`,
          savings: 0,
        });
      }
    } else if (offerType === 'combo3') {
      const saving = (UNIT_PRICE - THIRD_PRICE) + DELIVERY_FEE; // 175 + 50 = 225
      setBoom({
        show: true,
        title: 'Super Deal Unlocked! 🚀',
        message: `${product.name} added for just ₹${THIRD_PRICE}!`,
        subtext: `You saved ₹175 on 3rd roll on + FREE Delivery (Saved ₹50)!`,
        savings: saving,
      });
    } else {
      setBoom({
        show: true,
        title: 'Item Added! 🎉',
        message: `${product.name} added to your cart!`,
        subtext: product.id === 'natural' ? 'Natural roll on offer applied!' : 'Great choice!',
        savings: product.id === 'natural' ? 150 : 0,
      });
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
            (() => {
              const linePrices = computeCartLinePrices(cart);
              return cart.map((l) => {
                const lp = linePrices[l.key] || { lineTotal: l.qty * l.unitPrice, hasOffer: false, regularTotal: l.qty * l.unitPrice, unitPrice: l.unitPrice };
                return (
                  <div key={l.key} className="flex items-center gap-3.5 rounded-2xl border border-line bg-white p-3 shadow-xs">
                    <span className="flex size-[68px] shrink-0 items-center justify-center rounded-xl bg-page p-1">
                      <img src={l.image} alt="" className="h-full w-auto object-contain" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <b className="truncate font-head text-[15px] font-semibold text-navy-900">{l.name}</b>
                        {lp.hasOffer && (
                          <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9.5px] font-extrabold text-emerald-800 uppercase tracking-wide">
                            Offer Applied
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[13px]">
                        {lp.hasOffer ? (
                          <>
                            <span className="text-muted-2 line-through">{formatINR(l.unitPrice)}</span>
                            <b className="font-bold text-[#166534]">{formatINR(lp.unitPrice)}</b>
                            <span className="text-xs text-muted-2">({l.pack})</span>
                          </>
                        ) : (
                          <small className="text-[13px] text-muted-2">
                            {l.pack} · {formatINR(l.unitPrice)}
                          </small>
                        )}
                      </div>
                      <div className="self-start mt-0.5">
                        <QtyStepper size="sm" value={l.qty} onChange={(q) => updateQty(l.key, q)} />
                      </div>
                    </div>
                    <div className="text-right">
                      {lp.hasOffer ? (
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-muted-2 line-through">{formatINR(lp.regularTotal)}</span>
                          <b className="font-head text-[15px] font-bold text-[#166534]">{formatINR(lp.lineTotal)}</b>
                        </div>
                      ) : (
                        <b className="font-head text-[15px] text-navy-900">{formatINR(lp.lineTotal)}</b>
                      )}
                    </div>
                  </div>
                );
              });
            })()
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

        {/* Footer: Price summary & Checkout CTA (Delivery fee hidden in cart, shown only in final checkout step) */}
        {cart.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-line bg-white px-5 py-4 sm:px-6">
            <PriceRows s={summary} showDelivery={false} />
            <div className="flex justify-between border-t border-line pt-2.5 text-[17px] font-bold text-navy-900">
              <span>Total</span>
              <span>{formatINR(summary.items - summary.couponOff)}</span>
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

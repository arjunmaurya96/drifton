import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { products, formatINR, summarize, coupons, UNIT_PRICE, COMBO_PRICE } from '../data/products.js';
import { createPayment } from '../lib/payment.js';
import { business } from '../data/site.js';
import { QtyStepper, PriceRows, CartOffers } from './CartDrawer.jsx';
import { Close, Lock, CheckCircle, Shield, Truck, Plus, Trash, ChevronLeft } from './Icons.jsx';

// =====================================================================
//  Quick checkout (opens from "Add to cart" on the home page).
//  Step 1: order summary — quantities, offers, more variants, coupon.
//  Step 2: mobile number + OTP verification (like phitku / Shiprocket checkout).
//  Step 3: delivery address + payment.
//  ⚠ DEMO ONLY: the OTP is not really sent (use 123456) and no money is taken.
//  To go live, call your backend in sendOtp / verifyOtp / createPayment (e.g. MSG91 / Firebase + Razorpay).
// =====================================================================
const DEMO_OTP = '123456';
const RESEND_AFTER = 30; // seconds
const COD_FEE = 49; // DUMMY

const steps = ['Mobile', 'Address & pay'];
const methods = [
  { id: 'upi', label: 'UPI', note: 'GPay, PhonePe, Paytm' },
  { id: 'card', label: 'Card', note: 'Credit / Debit' },
  { id: 'netbanking', label: 'Net banking', note: 'All banks' },
  { id: 'cod', label: 'Cash on delivery', note: `+ ${formatINR(COD_FEE)} COD fee` },
];
const field = 'min-h-12 w-full rounded-xl border-[1.5px] border-line-strong bg-white px-4 text-[15px] outline-none transition focus:border-navy-700 focus:ring-4 focus:ring-blue-soft';

function Stepper({ step }) {
  return (
    <ol className="flex items-center gap-2 px-5 pb-4 sm:px-7">
      {steps.map((s, k) => (
        <li key={s} className="flex min-w-0 flex-1 items-center gap-2">
          <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${k < step ? 'bg-brand text-white' : k === step ? 'bg-navy-900 text-white' : 'bg-page text-muted-2'}`}>
            {k < step ? '✓' : k + 1}
          </span>
          <span className={`truncate text-[13px] font-semibold ${k === step ? 'text-navy-900' : 'text-muted-2'}`}>{s}</span>
          {k < steps.length - 1 && <span className={`h-0.5 min-w-3 flex-1 rounded ${k < step ? 'bg-brand' : 'bg-line'}`} />}
        </li>
      ))}
    </ol>
  );
}

function OtpBoxes({ value, onChange }) {
  const refs = useRef([]);
  const set = (i, v) => {
    const d = v.replace(/\D/g, '');
    if (d.length > 1) { onChange(d.slice(0, 6)); refs.current[Math.min(5, d.length)]?.focus(); return; } // paste
    const arr = value.padEnd(6, ' ').split('');
    arr[i] = d || ' ';
    onChange(arr.join('').replace(/\s+$/, ''));
    if (d && i < 5) refs.current[i + 1]?.focus();
  };
  return (
    <div className="flex gap-2 sm:gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <input key={i} ref={(el) => (refs.current[i] = el)} inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'} aria-label={`OTP digit ${i + 1}`}
          value={(value[i] || '').trim()} onChange={(e) => set(i, e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Backspace' && !(value[i] || '').trim() && i > 0) refs.current[i - 1]?.focus(); }}
          className="h-12 w-full min-w-0 rounded-xl border-[1.5px] border-line-strong bg-white text-center font-head text-xl font-bold outline-none focus:border-navy-700 focus:ring-4 focus:ring-blue-soft sm:h-14" />
      ))}
    </div>
  );
}

export default function CheckoutModal() {
  const { checkoutOpen, closeCheckout, cart, updateQty, addToCart, clearCart } = useStore();
  const [step, setStep] = useState(1); // opens straight on the mobile-number box (client request)
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState('');
  const [codeMsg, setCodeMsg] = useState('');
  const [d, setD] = useState({ name: '', phone: '', address: '', pin: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [verified, setVerified] = useState(false);
  const [method, setMethod] = useState('upi');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState(null);

  const closeRef = useRef(closeCheckout);
  closeRef.current = closeCheckout;

  // reset only when the popup opens (not when the cart changes), lock page scroll, Esc to close
  useEffect(() => {
    if (!checkoutOpen) return;
    setStep(1); setErr(''); setOrder(null); setOtpSent(false); setOtp(''); setVerified(false); setMethod('upi');
    const onKey = (e) => e.key === 'Escape' && closeRef.current();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [checkoutOpen]);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  if (!checkoutOpen) return null;

  const sum = summarize(cart, applied);
  const fee = method === 'cod' ? COD_FEE : 0;
  const total = sum.total + fee;
  const qtyOf = (id) => cart.filter((l) => l.id === id).reduce((s, l) => s + l.qty * (l.sticks || 1), 0);

  const apply = () => {
    const c = code.trim().toUpperCase();
    if (coupons[c] && sum.comboSaving > 0) { setApplied(''); setCodeMsg('Your combo already has free delivery. Coupons can be used on single-stick orders.'); }
    else if (coupons[c]) { setApplied(c); setCodeMsg(`${c} applied — ${coupons[c].note}`); }
    else { setApplied(''); setCodeMsg('This coupon code is not valid.'); }
  };

  const sendOtp = () => {
    setErr('');
    if (!/^[6-9]\d{9}$/.test(d.phone)) return setErr('Please enter a valid 10-digit mobile number.');
    setOtpSent(true); setOtp(''); setTimer(RESEND_AFTER); // DEMO: here you would call your SMS / OTP API
  };
  const verifyOtp = () => {
    setErr('');
    if (otp === DEMO_OTP) { setVerified(true); setStep(2); } else setErr('Wrong OTP. Please try again.');
  };
  const pay = async () => {
    setErr('');
    if (!d.name.trim() || !d.address.trim() || !/^\d{6}$/.test(d.pin)) return setErr('Please add your name, full address and 6-digit pincode.');
    setBusy(true);
    const r = await createPayment({ amount: total, method });
    setBusy(false);
    if (!r.ok) return setErr('Payment failed. Please try again.');
    setOrder({ ...r, sticks: sum.sticks });
    clearCart();
  };

  return (
    <div className="fixed inset-0 z-[86] flex animate-fade-in items-end justify-center bg-navy-900/60 sm:items-center sm:p-6" onClick={closeCheckout}>
      <div role="dialog" aria-modal="true" aria-label="Checkout" onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[94svh] w-full max-w-[640px] animate-fade-up flex-col overflow-hidden rounded-t-[26px] bg-white shadow-2xl sm:rounded-[28px]">
        {/* header */}
        <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-4 sm:px-7 sm:pt-5">
          <div className="flex items-center gap-2">
            {step === 2 && !order && (
              <button className="icon-btn size-10" onClick={() => { setErr(''); setStep(1); }} aria-label="Back"><ChevronLeft /></button>
            )}
            <h2 className="text-xl font-semibold sm:text-[22px]">{order ? 'Order placed' : 'Checkout'}</h2>
          </div>
          <button className="icon-btn" onClick={closeCheckout} aria-label="Close"><Close /></button>
        </div>
        {!order && <div className="bg-navy-900 px-4 py-2 text-center text-[12.5px] font-bold uppercase tracking-wide text-mint sm:text-[13px]">2 roll ons from ₹750 · 3rd roll on ₹300 · Free delivery</div>}
        {!order && <div className="pt-4"><Stepper step={step - 1} /></div>}

        {order ? (
          <div className="flex flex-col items-center gap-4 border-t border-line px-6 py-12 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-mint-soft text-brand"><CheckCircle size={36} /></span>
            <p className="text-[17px] text-muted">Thank you, {d.name}! Order <b className="text-navy-900">#{order.orderId}</b> of {formatINR(order.amount)} ({order.sticks} {order.sticks === 1 ? 'stick' : 'sticks'}) is confirmed.</p>
            <span className="rounded-full bg-page px-4 py-1.5 text-sm text-muted-2">Demo order — no real payment was taken</span>
            <div className="flex flex-wrap justify-center gap-2.5">
              <a href={business.trackUrl} target="_blank" rel="noreferrer" className="btn-line">Track on Ekart</a>
              <button onClick={closeCheckout} className="btn-navy">Continue shopping</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto border-t border-line px-5 py-5 sm:px-7">
              {/* ---------- order summary (under the mobile box, collapsible) ---------- */}
              {step === 1 && (
                <details open={!otpSent} className="order-2 group rounded-2xl border border-line [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                    <b className="font-head text-[16px]">Order summary <span className="font-normal text-muted-2">({sum.sticks} {sum.sticks === 1 ? 'item' : 'items'})</span></b>
                    <span className="flex items-center gap-2 text-[15px] font-semibold">{formatINR(sum.total)}<span className="text-muted-2 transition group-open:rotate-180">⌄</span></span>
                  </summary>
                  <div className="flex flex-col gap-5 border-t border-line p-4">
                  {cart.length === 0 ? (
                    <p className="rounded-2xl bg-page p-5 text-center text-muted">Your bag is empty. Add a stick below.</p>
                  ) : (
                    <ul className="flex flex-col gap-3">
                      {cart.map((l) => (
                        <li key={l.key} className="flex items-center gap-3 rounded-2xl bg-page p-2.5 pr-3">
                          <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-white p-1"><img src={l.image} alt="" className="h-full w-auto object-contain" /></span>
                          <span className="min-w-0 flex-1">
                            <b className="block truncate font-head text-[15px] font-semibold">{l.name}</b>
                            <small className="text-[13px] text-muted-2">{l.pack} · {formatINR(l.unitPrice)}</small>
                          </span>
                          <QtyStepper size="sm" value={l.qty} onChange={(q) => updateQty(l.key, q)} />
                          <button onClick={() => updateQty(l.key, 0)} aria-label={`Remove ${l.name}`} className="hidden size-9 items-center justify-center rounded-full text-muted-2 hover:bg-white hover:text-[#C0392B] sm:flex"><Trash /></button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* the same 2 offer cards as in the cart */}
                  {cart.length > 0 && <CartOffers cart={cart} count={sum.sticks} addToCart={(p) => addToCart(p, 1, undefined, true)} />}

                  {/* add more variants */}
                  <div>
                    <span className="mb-2.5 block text-sm font-bold">Add more variants</span>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                      {products.map((p) => {
                        const n = qtyOf(p.id);
                        return (
                          <div key={p.id} className={`flex flex-col items-center gap-1.5 rounded-2xl border-[1.5px] p-3 text-center ${n ? 'border-navy-700' : 'border-line'}`} style={{ background: `linear-gradient(180deg, ${p.bg}, #fff 85%)` }}>
                            <img src={p.image} alt="" className="h-20 w-auto object-contain" />
                            <b className="text-[13.5px] leading-tight">{p.short}</b>
                            <span className="text-[12.5px] text-muted-2">{formatINR(UNIT_PRICE)}{n ? ` · ${n} in bag` : ''}</span>
                            <button onClick={() => addToCart(p, 1, undefined, true)} className="mt-0.5 inline-flex min-h-9 items-center gap-1 rounded-full bg-navy-900 px-3.5 text-[12.5px] font-semibold text-white hover:bg-navy-700">
                              <Plus size={14} /> Add
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* coupon */}
                  <div>
                    <span className="mb-2 block text-sm font-bold">Coupon code</span>
                    <div className="flex gap-2">
                      <input className={`${field} uppercase`} placeholder="Enter code" aria-label="Coupon code" value={code} onChange={(e) => setCode(e.target.value)} />
                      <button type="button" onClick={apply} className="min-h-12 shrink-0 rounded-xl bg-navy-900 px-5 text-sm font-semibold text-white hover:bg-navy-700">Apply</button>
                    </div>
                    {(sum.couponBlocked ? 'Your combo already has free delivery. Coupons can be used on single-stick orders.' : codeMsg) && <p className={`mt-1.5 text-[13px] font-semibold ${applied && !sum.couponBlocked ? 'text-brand-dark' : 'text-[#C0392B]'}`}>{sum.couponBlocked ? 'Your combo already has free delivery. Coupons can be used on single-stick orders.' : codeMsg}</p>}
                  </div>
                  </div>
                </details>
              )}

              {/* ---------- STEP 2: mobile number + OTP ---------- */}
              {step === 1 && (
                <div className="order-1 flex flex-col gap-4 pb-1">
                  <div className="text-center">
                    <h3 className="text-[20px] font-semibold">{otpSent ? 'Verify your number' : 'Enter mobile number'}</h3>
                    <p className="text-[14px] text-muted-2">{otpSent ? `Enter the 6-digit OTP sent to +91 ${d.phone}` : 'Provide your mobile number to continue'}</p>
                  </div>
                  {!otpSent ? (
                    <div className="flex items-center rounded-xl border-[1.5px] border-line-strong bg-white focus-within:border-navy-700 focus-within:ring-4 focus-within:ring-blue-soft">
                      <span className="flex shrink-0 items-center gap-2 whitespace-nowrap border-r border-line px-4 text-[15px] font-semibold">🇮🇳 +91</span>
                      <input autoFocus className="min-h-14 w-full min-w-0 rounded-xl bg-transparent px-4 text-[16px] outline-none" placeholder="10-digit mobile number" aria-label="Mobile number" inputMode="numeric" autoComplete="tel-national" maxLength={10}
                        value={d.phone} onChange={(e) => setD({ ...d, phone: e.target.value.replace(/\D/g, '') })} onKeyDown={(e) => e.key === 'Enter' && sendOtp()} />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 rounded-2xl bg-page p-4 sm:p-5">
                      <OtpBoxes value={otp} onChange={setOtp} />
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                        <span className="rounded-full bg-[#FFF4E5] px-3 py-1 font-semibold text-[#8A4B00]">Demo OTP: {DEMO_OTP}</span>
                        <span className="flex gap-3">
                          <button type="button" onClick={() => { setOtpSent(false); setOtp(''); }} className="font-semibold text-navy-700 underline">Change number</button>
                          {timer > 0 ? <span className="text-muted-2">Resend in {timer}s</span>
                            : <button type="button" onClick={sendOtp} className="font-semibold text-navy-700 underline">Resend OTP</button>}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ---------- STEP 3: payment ---------- */}
              {step === 2 && (
                <>
                  <div className="flex items-center gap-3 rounded-2xl bg-mint-soft px-4 py-3 text-[14px] font-semibold text-brand-dark">
                    <CheckCircle size={20} /> Mobile +91 {d.phone} verified
                  </div>
                  <fieldset className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <legend className="mb-2.5 text-sm font-bold">Delivery address</legend>
                    <input className={field} placeholder="Full name" aria-label="Full name" autoComplete="name" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} />
                    <input className={field} placeholder="Pincode" aria-label="Pincode" inputMode="numeric" maxLength={6} value={d.pin} onChange={(e) => setD({ ...d, pin: e.target.value.replace(/\D/g, '') })} />
                    <input className={`${field} sm:col-span-2`} placeholder="House no., street, area, city" aria-label="Address" autoComplete="street-address" value={d.address} onChange={(e) => setD({ ...d, address: e.target.value })} />
                  </fieldset>
                  <fieldset>
                    <legend className="mb-2.5 text-sm font-bold">Choose payment</legend>
                    <div className="grid grid-cols-2 gap-2.5">
                      {methods.map((m) => (
                        <label key={m.id} className={`flex cursor-pointer flex-col gap-0.5 rounded-2xl border-[1.5px] p-3.5 ${method === m.id ? 'border-navy-700 bg-blue-soft ring-1 ring-navy-700' : 'border-line-strong hover:border-navy-700'}`}>
                          <input type="radio" name="pay-method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="sr-only" />
                          <b className="text-[15px]">{m.label}</b>
                          <span className="text-[13px] text-muted-2">{m.note}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </>
              )}

              {err && <p role="alert" className="order-3 text-sm font-semibold text-[#C0392B]">{err}</p>}
            </div>

            {/* footer: totals + main action */}
            <div className="flex flex-col gap-3 border-t border-line bg-white px-5 py-4 sm:px-7">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[15px]">
                  <span className="text-muted">Total · {sum.sticks} {sum.sticks === 1 ? 'stick' : 'sticks'} <span className="text-xs underline">details</span></span>
                  <b className="font-head text-xl">{formatINR(total)}</b>
                </summary>
                <PriceRows s={sum} className="mt-2" />
                {fee > 0 && <div className="mt-1.5 flex justify-between text-[14.5px] text-muted"><span>COD fee</span><span>{formatINR(fee)}</span></div>}
              </details>

              {step === 1 && (!otpSent
                ? <button onClick={sendOtp} disabled={!cart.length} className="btn-primary min-h-[52px] w-full text-base">Send OTP</button>
                : <button onClick={verifyOtp} disabled={otp.length < 6} className="btn-primary min-h-[52px] w-full text-base disabled:opacity-50">Verify & continue</button>)}
              {step === 2 && (
                <button onClick={pay} disabled={busy} className="btn-primary min-h-[52px] w-full text-base disabled:opacity-60">
                  <Lock size={18} /> {busy ? 'Processing…' : method === 'cod' ? `Place order · ${formatINR(total)}` : `Pay ${formatINR(total)}`}
                </button>
              )}
              <span className="flex items-center justify-center gap-4 text-xs text-muted-2">
                <span className="flex items-center gap-1.5"><Shield size={14} />Secure checkout</span>
                <span className="flex items-center gap-1.5"><Truck size={16} />Ships in 1–2 days</span>
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

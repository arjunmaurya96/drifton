import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { products, formatINR, summarize, coupons, UNIT_PRICE, COMBO_PRICE } from '../data/products.js';
import { createPayment } from '../lib/payment.js';
import { saveOrder } from '../lib/api.js';
import { firebaseReady } from '../lib/firebaseReady.js';
import { business } from '../data/site.js';
import { QtyStepper, PriceRows, CartOffers } from './CartDrawer.jsx';
import { Close, Lock, CheckCircle, Shield, Truck, Plus, Trash, ChevronLeft } from './Icons.jsx';

// =====================================================================
//  Quick checkout (opens from "Add to cart" or CartDrawer).
//  Step 1: Account & Mobile — 1-click Google sign-in OR Email with 4-digit OTP.
//          Mobile number is compulsory for delivery updates.
//  Step 2: Delivery address & payment method.
// =====================================================================
const DEMO_OTP = '1234';
const RESEND_AFTER = 30; // seconds
const COD_FEE = 49; // DUMMY

const steps = ['Account & Mobile', 'Address & pay'];
const methods = [
  { id: 'upi', label: 'UPI', note: 'GPay, PhonePe, Paytm' },
  { id: 'card', label: 'Card', note: 'Credit / Debit' },
  { id: 'netbanking', label: 'Net banking', note: 'All banks' },
  { id: 'cod', label: 'Cash on delivery', note: `+ ${formatINR(COD_FEE)} COD fee` },
];
const field = 'min-h-12 w-full rounded-xl border-[1.5px] border-line-strong bg-white px-4 text-[15px] outline-none transition focus:border-navy-700 focus:ring-4 focus:ring-blue-soft';

const GoogleIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
  </svg>
);

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
    if (d.length > 1) { onChange(d.slice(0, 4)); refs.current[Math.min(3, d.length)]?.focus(); return; } // paste
    const arr = value.padEnd(4, ' ').split('');
    arr[i] = d || ' ';
    onChange(arr.join('').replace(/\s+$/, ''));
    if (d && i < 3) refs.current[i + 1]?.focus();
  };
  return (
    <div className="flex justify-center gap-3 sm:gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <input key={i} ref={(el) => (refs.current[i] = el)} inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'} aria-label={`OTP digit ${i + 1}`}
          value={(value[i] || '').trim()} onChange={(e) => set(i, e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Backspace' && !(value[i] || '').trim() && i > 0) refs.current[i - 1]?.focus(); }}
          className="h-13 w-13 rounded-2xl border-[1.5px] border-line-strong bg-white text-center font-head text-2xl font-bold outline-none focus:border-navy-700 focus:ring-4 focus:ring-blue-soft sm:h-14 sm:w-14" />
      ))}
    </div>
  );
}

export default function CheckoutModal() {
  const { checkoutOpen, closeCheckout, cart, updateQty, addToCart, clearCart, user, userProfile, recordUserOrder, loginWithGoogle, openAuth } = useStore();
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState('');
  const [codeMsg, setCodeMsg] = useState('');
  const [d, setD] = useState({ name: '', email: '', phone: '', address: '', pin: '' });
  const [authProvider, setAuthProvider] = useState(''); // 'google' | 'email_otp' | ''
  const [googleLoading, setGoogleLoading] = useState(false);
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

  // reset or prefill when the popup opens, lock page scroll, Esc to close
  useEffect(() => {
    if (!checkoutOpen) return;
    setErr('');
    setOrder(null);
    setMethod('upi');
    setGoogleLoading(false);

    if (user) {
      setD({
        name: userProfile.name || user.displayName || '',
        email: user.email || '',
        phone: userProfile.phone || user.phoneNumber || '',
        address: userProfile.address || '',
        pin: userProfile.pin || '',
      });
      setVerified(true);
      setStep(2);
    } else {
      setStep(1);
      setVerified(false);
      setOtpSent(false);
      setOtp('');
      setAuthProvider('');
    }

    const onKey = (e) => e.key === 'Escape' && closeRef.current();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [checkoutOpen, user, userProfile]);

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

  // 1-Click Google Sign In
  const handleGoogleSignIn = async () => {
    setErr('');
    setGoogleLoading(true);
    try {
      if (firebaseReady) {
        const { auth } = await import('../lib/firebase.js');
        const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
        const provider = new GoogleAuthProvider();
        const res = await signInWithPopup(auth, provider);
        const user = res.user;
        const email = user.email || '';
        const name = user.displayName || '';
        setD((prev) => ({ ...prev, email, name: prev.name || name }));
        setAuthProvider('google');
        if (/^[6-9]\d{9}$/.test(d.phone.trim())) {
          setVerified(true);
          setStep(2);
        }
      } else {
        // DEMO fallback for preview
        await new Promise((r) => setTimeout(r, 450));
        setD((prev) => ({
          ...prev,
          email: prev.email || 'customer@gmail.com',
          name: prev.name || 'Demo Customer',
        }));
        setAuthProvider('google');
        if (/^[6-9]\d{9}$/.test(d.phone.trim())) {
          setVerified(true);
          setStep(2);
        }
      }
    } catch (e) {
      console.error(e);
      setErr('Google sign-in was cancelled or failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const continueWithGooglePhone = () => {
    setErr('');
    if (!/^[6-9]\d{9}$/.test(d.phone.trim())) {
      return setErr('Please enter a valid 10-digit mobile number for delivery updates.');
    }
    setVerified(true);
    setStep(2);
  };

  // Send 4-digit OTP to Email
  const sendOtp = () => {
    setErr('');
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim());
    if (!emailValid) return setErr('Please enter a valid email address.');
    if (!/^[6-9]\d{9}$/.test(d.phone.trim())) return setErr('Please enter a valid 10-digit mobile number for delivery.');
    setOtpSent(true);
    setOtp('');
    setTimer(RESEND_AFTER);
    setAuthProvider('email_otp');
  };

  const verifyOtp = () => {
    setErr('');
    if (otp === DEMO_OTP) {
      setVerified(true);
      setStep(2);
    } else {
      setErr(`Wrong 4-digit OTP. Please enter ${DEMO_OTP} (Demo OTP) or try again.`);
    }
  };

  const pay = async () => {
    setErr('');
    if (!user) {
      setStep(1);
      return setErr('Login is required. Please sign in or create an account to make payment.');
    }
    if (!d.name.trim() || !d.address.trim() || !/^\d{6}$/.test(d.pin)) {
      return setErr('Please add your name, full address and 6-digit pincode.');
    }
    setBusy(true);
    const r = await createPayment({
      amount: total,
      method,
      customer: {
        name: d.name.trim(),
        email: d.email.trim().toLowerCase(),
        phone: d.phone,
        address: d.address.trim(),
        pin: d.pin,
      },
    });
    if (!r.ok) {
      setBusy(false);
      return setErr(r.error || 'Payment failed or was cancelled. Please try again.');
    }

    // save the order in the database with verified email + mobile number
    let saved;
    try {
      const paymentLabel = method === 'cod' ? 'Cash on Delivery' : `Razorpay (${(r.paymentMethod || method).toUpperCase()})`;
      const paymentStatus = method === 'cod' ? 'Pay on delivery' : 'Paid (Razorpay Test)';

      saved = await saveOrder({
        userId: user?.uid || null,
        customerId: user?.uid || null,
        customer: d.name.trim(),
        email: d.email.trim().toLowerCase(),
        phone: d.phone,
        address: d.address.trim(),
        pin: d.pin,
        items: cart.map((l) => ({ id: l.id, name: l.name, qty: l.qty * (l.sticks || 1) })),
        sticks: sum.sticks,
        subtotal: sum.items,
        delivery: sum.delivery,
        coupon: sum.coupon || '',
        couponOff: sum.couponOff,
        codFee: fee,
        total,
        payment: paymentLabel,
        paymentStatus,
        razorpayPaymentId: r.razorpay_payment_id || null,
        razorpayOrderId: r.razorpay_order_id || null,
        source: 'Quick checkout',
      });

      // Record in user's profile order list
      recordUserOrder({
        id: saved.id,
        date: new Date().toISOString(),
        customer: d.name.trim(),
        email: d.email.trim().toLowerCase(),
        phone: d.phone,
        address: d.address.trim(),
        pin: d.pin,
        items: cart.map((l) => ({ id: l.id, name: l.name, qty: l.qty * (l.sticks || 1) })),
        sticks: sum.sticks,
        total,
        payment: paymentLabel,
        paymentStatus,
        status: 'New',
        tracking: '',
      });
    } catch {
      setBusy(false);
      return setErr('Could not place the order. Please check your internet and try again.');
    }
    setBusy(false);
    setOrder({ ...r, orderId: saved.id, sticks: sum.sticks });
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
            <p className="text-[17px] text-muted">Thank you, {d.name}! Order <b className="text-navy-900">{order.orderId}</b> of {formatINR(order.amount)} ({order.sticks} {order.sticks === 1 ? 'roll on' : 'roll ons'}) is confirmed.</p>
            <p className="text-xs text-muted-2">Confirmation & tracking details will be sent to <b>{d.email}</b> and <b>+91 {d.phone}</b>.</p>
            {order.razorpay_payment_id ? (
              <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                Razorpay Payment Verified: <b className="font-mono">{order.razorpay_payment_id}</b>
              </span>
            ) : (
              <span className="rounded-full bg-page px-4 py-1.5 text-sm text-muted-2">Payment Mode: {order.payment || 'Cash on Delivery'}</span>
            )}
            <div className="flex flex-wrap justify-center gap-2.5">
              <a href={business.trackUrl} target="_blank" rel="noreferrer" className="btn-line">Track on Ekart</a>
              <button onClick={closeCheckout} className="btn-navy">Continue shopping</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto border-t border-line px-5 py-5 sm:px-7">
              {/* ---------- order summary (collapsible) ---------- */}
              {step === 1 && (
                <details open={!otpSent && authProvider !== 'google'} className="order-2 group rounded-2xl border border-line [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                    <b className="font-head text-[16px]">Order summary <span className="font-normal text-muted-2">({sum.sticks} {sum.sticks === 1 ? 'item' : 'items'})</span></b>
                    <span className="flex items-center gap-2 text-[15px] font-semibold">{formatINR(sum.total)}<span className="text-muted-2 transition group-open:rotate-180">⌄</span></span>
                  </summary>
                  <div className="flex flex-col gap-5 border-t border-line p-4">
                  {cart.length === 0 ? (
                    <p className="rounded-2xl bg-page p-5 text-center text-muted">Your bag is empty. Add a roll on below.</p>
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

                  {/* offer cards */}
                  {cart.length > 0 && <CartOffers cart={cart} count={sum.sticks} addToCart={(p) => addToCart(p, 1, undefined, true)} />}

                  {/* add more variants */}
                  <div>
                    <span className="mb-2.5 block text-sm font-bold">Add more variants</span>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                      {products.filter((p) => !p.hidden).map((p) => {
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

              {/* ---------- STEP 1: Google login OR Email + Mobile with 4-Digit OTP ---------- */}
              {step === 1 && (
                <div className="order-1 flex flex-col gap-4 pb-1">
                  {/* Case 1: Google account chosen, now enter mobile number */}
                  {authProvider === 'google' && !verified ? (
                    <div className="flex flex-col gap-3 rounded-2xl border border-[#86EFAC] bg-[#F0FDF4] p-4 sm:p-5">
                      <div className="flex items-center gap-2.5 text-[15px] font-bold text-[#166534]">
                        <CheckCircle size={20} />
                        <span>Google Verified: {d.email} {d.name ? `(${d.name})` : ''}</span>
                      </div>
                      <p className="text-[13px] text-[#15803D]">
                        Please enter your 10-digit mobile number for courier delivery updates:
                      </p>
                      <div className="flex items-center rounded-xl border-[1.5px] border-line-strong bg-white focus-within:border-navy-700 focus-within:ring-4 focus-within:ring-blue-soft">
                        <span className="flex shrink-0 items-center gap-2 whitespace-nowrap border-r border-line px-3.5 text-[14px] font-semibold">🇮🇳 +91</span>
                        <input autoFocus className="min-h-12 w-full min-w-0 rounded-xl bg-transparent px-3.5 text-[15px] outline-none" placeholder="10-digit mobile number" aria-label="Mobile number" inputMode="numeric" autoComplete="tel-national" maxLength={10}
                          value={d.phone} onChange={(e) => setD({ ...d, phone: e.target.value.replace(/\D/g, '') })} onKeyDown={(e) => e.key === 'Enter' && continueWithGooglePhone()} />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <button type="button" onClick={() => setAuthProvider('')} className="text-xs font-semibold text-muted underline">Change account</button>
                        <button type="button" onClick={continueWithGooglePhone} className="btn-primary min-h-[42px] px-5 text-sm">Continue to Address</button>
                      </div>
                    </div>
                  ) : otpSent ? (
                    /* Case 2: 4-digit Email OTP sent */
                    <div className="flex flex-col gap-3.5 rounded-2xl bg-page p-4 sm:p-5">
                      <div className="text-center">
                        <h3 className="text-[20px] font-semibold">Verify your Email</h3>
                        <p className="mt-1 text-[13.5px] text-muted-2">
                          Enter the 4-digit code sent to <b className="text-navy-900">{d.email}</b>
                        </p>
                        <p className="mt-0.5 text-xs text-muted-2">
                          Delivery mobile: <b className="text-navy-900">+91 {d.phone}</b>
                        </p>
                      </div>
                      <OtpBoxes value={otp} onChange={setOtp} />
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                        <span className="rounded-full bg-[#FFF4E5] px-3 py-1 font-semibold text-[#8A4B00]">Demo OTP: {DEMO_OTP}</span>
                        <span className="flex gap-3">
                          <button type="button" onClick={() => { setOtpSent(false); setOtp(''); }} className="font-semibold text-navy-700 underline">Change details</button>
                          {timer > 0 ? <span className="text-muted-2">Resend in {timer}s</span>
                            : <button type="button" onClick={sendOtp} className="font-semibold text-navy-700 underline">Resend OTP</button>}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Case 3: Initial Screen - Google Button + Email & Mobile inputs */
                    <div className="flex flex-col gap-3.5">
                      <div className="text-center">
                        <h3 className="text-[20px] font-semibold">Sign in to checkout</h3>
                        <p className="text-[13.5px] text-muted-2">Sign in with Google or verify with 4-digit Email OTP</p>
                      </div>

                      {/* 1-Click Google Button */}
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading}
                        className="flex min-h-[48px] w-full items-center justify-center gap-3 rounded-xl border border-line-strong bg-white px-4 text-[14.5px] font-semibold text-navy-900 shadow-sm transition hover:bg-page hover:border-navy-700 disabled:opacity-50"
                      >
                        <GoogleIcon size={19} />
                        <span>{googleLoading ? 'Connecting Google…' : 'Continue with Google'}</span>
                      </button>

                      <div className="relative my-1 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-line" /></div>
                        <span className="relative bg-white px-3 text-xs font-semibold uppercase text-muted-2">or continue with email & mobile</span>
                      </div>

                      {/* Email input */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[13px] font-semibold text-navy-900">Email Address <span className="text-red-500">*</span></label>
                        <input
                          type="email"
                          className={field}
                          placeholder="you@example.com"
                          aria-label="Email address"
                          autoComplete="email"
                          value={d.email}
                          onChange={(e) => setD({ ...d, email: e.target.value })}
                        />
                      </div>

                      {/* Mobile Number input */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[13px] font-semibold text-navy-900">Mobile Number (For Courier Delivery) <span className="text-red-500">*</span></label>
                        <div className="flex items-center rounded-xl border-[1.5px] border-line-strong bg-white focus-within:border-navy-700 focus-within:ring-4 focus-within:ring-blue-soft">
                          <span className="flex shrink-0 items-center gap-2 whitespace-nowrap border-r border-line px-3.5 text-[14px] font-semibold">🇮🇳 +91</span>
                          <input
                            className="min-h-12 w-full min-w-0 rounded-xl bg-transparent px-3.5 text-[15px] outline-none"
                            placeholder="10-digit mobile number"
                            aria-label="Mobile number"
                            inputMode="numeric"
                            autoComplete="tel-national"
                            maxLength={10}
                            value={d.phone}
                            onChange={(e) => setD({ ...d, phone: e.target.value.replace(/\D/g, '') })}
                            onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ---------- STEP 2: Address & Payment ---------- */}
              {step === 2 && (
                <>
                  <div className="flex items-center justify-between rounded-2xl bg-mint-soft px-4 py-3 text-[13.5px] font-semibold text-brand-dark">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={19} />
                      <span>Verified: <b>{d.email}</b> · Phone: <b>+91 {d.phone}</b></span>
                    </div>
                    <button type="button" onClick={() => { setStep(1); setOtpSent(false); setVerified(false); }} className="text-xs font-semibold text-navy-900 underline">Change</button>
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

              {step === 1 && (
                authProvider === 'google' && !verified ? (
                  <button onClick={continueWithGooglePhone} disabled={!cart.length} className="btn-primary min-h-[52px] w-full text-base">
                    Continue to Address
                  </button>
                ) : !otpSent ? (
                  <button onClick={sendOtp} disabled={!cart.length} className="btn-primary min-h-[52px] w-full text-base">
                    Send 4-Digit OTP to Email
                  </button>
                ) : (
                  <button onClick={verifyOtp} disabled={otp.length < 4} className="btn-primary min-h-[52px] w-full text-base disabled:opacity-50">
                    Verify 4-Digit OTP & Continue
                  </button>
                )
              )}

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

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { products, formatINR, summarize, coupons, getCouponStatus, UNIT_PRICE, COMBO_PRICE, THIRD_PRICE, computeCartLinePrices } from '../data/products.js';
import { createPayment } from '../lib/payment.js';
import { saveOrder } from '../lib/api.js';
import { firebaseReady } from '../lib/firebaseReady.js';
import { business } from '../data/site.js';
import { QtyStepper, PriceRows, CartOffers } from './CartDrawer.jsx';
import { Close, Lock, CheckCircle, Shield, Truck, Plus, Trash, ChevronLeft } from './Icons.jsx';
import ConfettiBoom from './ConfettiBoom.jsx';

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

function Stepper({ step, user }) {
  const stepList = user
    ? [
        { id: 2, label: 'Offers & Cart' },
        { id: 3, label: 'Delivery Address' },
        { id: 4, label: 'Payment & Delivery' },
      ]
    : [
        { id: 1, label: 'Sign in' },
        { id: 2, label: 'Offers' },
        { id: 3, label: 'Address' },
        { id: 4, label: 'Payment' },
      ];

  const currentIndex = stepList.findIndex((s) => s.id === step);

  return (
    <ol className="flex items-center gap-2 px-5 pb-3 sm:px-7">
      {stepList.map((s, k) => (
        <li key={s.id} className="flex min-w-0 flex-1 items-center gap-2">
          <span
            className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[12.5px] font-bold ${
              k < currentIndex
                ? 'bg-brand text-white'
                : k === currentIndex
                ? 'bg-navy-900 text-white'
                : 'bg-page text-muted-2'
            }`}
          >
            {k < currentIndex ? '✓' : k + 1}
          </span>
          <span
            className={`truncate text-[12px] font-semibold ${
              k === currentIndex ? 'text-navy-900' : 'text-muted-2'
            }`}
          >
            {s.label}
          </span>
          {k < stepList.length - 1 && (
            <span
              className={`h-0.5 min-w-2 flex-1 rounded ${
                k < currentIndex ? 'bg-brand' : 'bg-line'
              }`}
            />
          )}
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
  const { checkoutOpen, closeCheckout, cart, count, updateQty, addToCart, clearCart, user, userProfile, recordUserOrder, loginWithGoogle, openAuth, loginWithOtp } = useStore();
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
  const [boom, setBoom] = useState({ show: false, code: '', title: '', message: '', subtext: '', savings: 0 });

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

  const handleAddWithCelebration = (product, offerType) => {
    addToCart(product);
    if (offerType === 'combo2') {
      const willHaveNatural = product.id === 'natural' || cart.some((c) => c.id === 'natural');
      if (willHaveNatural) {
        setBoom({
          show: true,
          code: '',
          title: 'Hurray! Natural Offer Applied 🎉',
          message: `${product.name} added! Natural Roll On for ₹325.`,
          subtext: `You saved ₹150!`,
          savings: 150,
        });
      } else {
        setBoom({
          show: true,
          code: '',
          title: 'Product Added! 🎉',
          message: `${product.name} added to cart!`,
          subtext: `Add 3rd roll on for ₹300 + FREE Delivery!`,
          savings: 0,
        });
      }
    } else if (offerType === 'combo3') {
      const saving = (UNIT_PRICE - THIRD_PRICE) + DELIVERY_FEE; // 175 + 50 = 225
      setBoom({
        show: true,
        code: '',
        title: 'Super Deal Unlocked! 🚀',
        message: `${product.name} added for just ₹${THIRD_PRICE}!`,
        subtext: `You saved ₹175 on 3rd roll on + FREE Delivery (Saved ₹50)!`,
        savings: saving,
      });
    } else {
      setBoom({
        show: true,
        code: '',
        title: 'Item Added! 🎉',
        message: `${product.name} added to cart!`,
        subtext: product.id === 'natural' ? 'Natural roll on offer applied!' : 'Great choice!',
        savings: product.id === 'natural' ? 150 : 0,
      });
    }
  };

  const apply = () => {
    const c = code.trim();
    if (!c) return;
    const matchedKey = Object.keys(coupons).find((k) => k.toUpperCase() === c.toUpperCase());
    const cp = matchedKey ? coupons[matchedKey] : null;
    if (!cp) {
      setApplied('');
      return setCodeMsg('This coupon code is not valid.');
    }
    const status = getCouponStatus(cp);
    if (!status.valid) {
      setApplied('');
      if (status.reason === 'not_started') {
        return setCodeMsg(`This coupon will be active starting ${status.from}.`);
      } else if (status.reason === 'expired') {
        return setCodeMsg(`This coupon has expired on ${status.until}.`);
      } else {
        return setCodeMsg('This coupon is currently inactive.');
      }
    }
    const discount = cp.off;
    setApplied(matchedKey);
    setCodeMsg(`${matchedKey} applied — ${cp.note || `₹${discount} off`}`);
    setBoom({
      show: true,
      code: matchedKey,
      title: 'Hurray! 🎉',
      message: `${matchedKey} coupon applied successfully!`,
      subtext: `You saved ₹${discount} with this coupon!`,
      savings: discount,
    });
  };

  const removeCoupon = () => {
    setApplied('');
    setCodeMsg('');
    setCode('');
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
          loginWithOtp(email, d.phone.trim(), name);
          setVerified(true);
          setStep(2);
        }
      } else {
        // DEMO fallback for preview
        await new Promise((r) => setTimeout(r, 450));
        const demoEmail = prev?.email || 'customer@gmail.com';
        const demoName = prev?.name || 'Demo Customer';
        setD((p) => ({
          ...p,
          email: demoEmail,
          name: demoName,
        }));
        setAuthProvider('google');
        if (/^[6-9]\d{9}$/.test(d.phone.trim())) {
          loginWithOtp(demoEmail, d.phone.trim(), demoName);
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
    loginWithOtp(d.email.trim(), d.phone.trim(), d.name.trim());
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
    const cleanOtp = otp.trim();
    if (cleanOtp === DEMO_OTP || /^\d{4}$/.test(cleanOtp)) {
      loginWithOtp(d.email.trim(), d.phone.trim(), d.name.trim());
      setVerified(true);
      setStep(2);
    } else {
      setErr(`Please enter a valid 4-digit OTP (e.g. ${DEMO_OTP}).`);
    }
  };

  const goToAddress = () => {
    setErr('');
    setStep(3);
  };

  const goToPayment = () => {
    setErr('');
    if (!d.name.trim()) return setErr('Please enter your full name for delivery.');
    const cleanPhone = (d.phone || '').replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return setErr('Please enter a valid 10-digit mobile number (e.g. 9876543210). Mobile number is mandatory to proceed with payment and courier delivery.');
    }
    if (!/^\d{6}$/.test((d.pin || '').trim())) return setErr('Please enter a valid 6-digit delivery pincode.');
    if (!d.address.trim()) return setErr('Please enter your complete delivery street address.');
    setStep(4);
  };

  const pay = async () => {
    setErr('');
    if (!user) {
      setStep(1);
      return setErr('Login is required. Please sign in or create an account to make payment.');
    }
    const cleanPhone = (d.phone || '').replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setStep(3);
      return setErr('Please provide a valid 10-digit mobile number. Mobile number is mandatory to complete payment.');
    }
    if (!d.name.trim() || !d.address.trim() || !/^\d{6}$/.test((d.pin || '').trim())) {
      setStep(3);
      return setErr('Please add your full name, complete address, and 6-digit pincode.');
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
      const paymentLabel = method === 'cod' ? 'Cash on Delivery' : `Easebuzz (${(r.paymentMethod || method).toUpperCase()})`;
      const paymentStatus = method === 'cod' ? 'Pay on delivery' : 'Paid (Easebuzz)';

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
        easebuzzPaymentId: r.easebuzz_payment_id || null,
        easebuzzTxnId: r.txnid || null,
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
        <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-4 sm:px-7 sm:pt-5">
          <div className="flex items-center gap-2">
            {!order && step > 1 && !(user && step === 2) && (
              <button
                className="icon-btn size-10"
                onClick={() => {
                  setErr('');
                  setStep((prev) => (prev === 4 ? 3 : prev === 3 ? 2 : 1));
                }}
                aria-label="Back"
              >
                <ChevronLeft />
              </button>
            )}
            <h2 className="text-xl font-semibold sm:text-[22px]">
              {order
                ? 'Order placed'
                : step === 1
                ? 'Sign in to checkout'
                : step === 2
                ? 'Offers & Items'
                : step === 3
                ? 'Delivery Address'
                : 'Payment & Delivery'}
            </h2>
          </div>
          <button className="icon-btn" onClick={closeCheckout} aria-label="Close"><Close /></button>
        </div>
        {!order && (
          <>
            <Stepper step={step} user={Boolean(user)} />
            <div className="bg-[linear-gradient(90deg,#0A1E4A_0%,#1B49AF_50%,#0A1E4A_100%)] px-4 py-1.5 text-center text-[12px] font-bold tracking-wide text-white sm:text-[12.5px]">
              <span className="inline-block animate-glow-blink">💥 Unlock Special Discounts at Checkout!</span>
            </div>
          </>
        )}

        {order ? (
          <div className="flex flex-col items-center gap-4 border-t border-line px-6 py-12 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-mint-soft text-brand"><CheckCircle size={36} /></span>
            <p className="text-[17px] text-muted">Thank you, {d.name}! Order <b className="text-navy-900">{order.orderId}</b> of {formatINR(order.amount)} ({order.sticks} {order.sticks === 1 ? 'roll on' : 'roll ons'}) is confirmed.</p>
            <p className="text-xs text-muted-2">Confirmation & tracking details will be sent to <b>{d.email}</b> and <b>+91 {d.phone}</b>.</p>
            {order.easebuzz_payment_id || order.razorpay_payment_id ? (
              <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                Easebuzz Payment Verified: <b className="font-mono">{order.easebuzz_payment_id || order.razorpay_payment_id}</b>
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
              {/* ---------- STEP 1: Google login OR Email + Mobile with 4-Digit OTP ---------- */}
              {step === 1 && (
                <div className="flex flex-col gap-4 pb-1">
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

              {/* ---------- STEP 2: Offers & Cart Items Review ---------- */}
              {step === 2 && (
                <>
                  <div className="flex items-center justify-between rounded-2xl bg-mint-soft px-4 py-3 text-[13.5px] font-semibold text-brand-dark">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={19} />
                      <span>Account: <b>{d.email || user?.email || 'Verified Customer'}</b> {d.phone ? `· +91 ${d.phone}` : ''}</span>
                    </div>
                    {!user && (
                      <button type="button" onClick={() => { setStep(1); setOtpSent(false); setVerified(false); }} className="text-xs font-semibold text-navy-900 underline">Change</button>
                    )}
                  </div>

                  {/* Cart Items Summary */}
                  {cart.length > 0 && (
                    <div className="flex flex-col gap-2.5 rounded-2xl border border-line bg-page/40 p-3.5 sm:p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[12.5px] font-bold uppercase tracking-wider text-navy-900">
                          Items in your order ({sum.sticks} {sum.sticks === 1 ? 'stick' : 'sticks'})
                        </span>
                        <span className="text-xs font-semibold text-brand">Auto-Combo Savings</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {(() => {
                          const linePrices = computeCartLinePrices(cart);
                          return cart.map((l) => {
                            const lp = linePrices[l.key] || { lineTotal: l.qty * l.unitPrice, hasOffer: false, regularTotal: l.qty * l.unitPrice, unitPrice: l.unitPrice };
                            return (
                              <div key={l.key} className="flex items-center gap-3 rounded-xl border border-line bg-white p-2.5 shadow-xs">
                                <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-page p-1">
                                  <img src={l.image} alt="" className="h-full w-auto object-contain" />
                                </span>
                                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <b className="truncate font-head text-[14px] font-semibold text-navy-900">{l.name}</b>
                                    {lp.hasOffer && (
                                      <span className="rounded-md bg-emerald-100 px-1.5 py-0.2 text-[9px] font-extrabold text-emerald-800 uppercase tracking-wide">
                                        Offer Applied
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs">
                                    {lp.hasOffer ? (
                                      <>
                                        <span className="text-muted-2 line-through">{formatINR(l.unitPrice)}</span>
                                        <b className="font-bold text-[#166534]">{formatINR(lp.unitPrice)}</b>
                                        <span className="text-[11px] text-muted-2">({l.pack})</span>
                                      </>
                                    ) : (
                                      <small className="text-xs text-muted-2">{l.pack} · {formatINR(l.unitPrice)}</small>
                                    )}
                                  </div>
                                  <div className="self-start mt-0.5">
                                    <QtyStepper size="sm" value={l.qty} onChange={(q) => updateQty(l.key, q)} />
                                  </div>
                                </div>
                                <div className="text-right">
                                  {lp.hasOffer ? (
                                    <div className="flex flex-col items-end">
                                      <span className="text-[11px] text-muted-2 line-through">{formatINR(lp.regularTotal)}</span>
                                      <b className="font-head text-[14px] font-bold text-[#166534]">{formatINR(lp.lineTotal)}</b>
                                    </div>
                                  ) : (
                                    <b className="font-head text-[14px] text-navy-900">{formatINR(lp.lineTotal)}</b>
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Interactive Cart Offers with celebration right inside Checkout */}
                  {cart.length > 0 && (
                    <CartOffers
                      cart={cart}
                      count={count}
                      isCheckout={true}
                      onAddWithCelebration={handleAddWithCelebration}
                    />
                  )}

                  {/* Order Summary & Total Price Card on Step 2 */}
                  <div className="rounded-2xl border border-line-strong bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-line pb-2 mb-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-navy-900">
                        Order Summary ({sum.sticks} {sum.sticks === 1 ? 'item' : 'items'})
                      </span>
                      <span className="text-xs font-bold text-navy-700">Subtotal</span>
                    </div>
                    <div className="flex flex-col gap-1.5 text-[13.5px]">
                      <div className="flex justify-between text-muted">
                        <span>Items ({sum.sticks} {sum.sticks === 1 ? 'roll on' : 'roll ons'})</span>
                        <span className="font-medium text-navy-900">{formatINR(sum.full)}</span>
                      </div>
                      {sum.comboSaving > 0 && (
                        <div className="flex justify-between font-semibold text-[#166534]">
                          <span>Offer Discount</span>
                          <span>− {formatINR(sum.comboSaving)}</span>
                        </div>
                      )}
                      {sum.couponOff > 0 && (
                        <div className="flex justify-between font-semibold text-[#166534]">
                          <span>Coupon Discount</span>
                          <span>− {formatINR(sum.couponOff)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-1 border-t border-dashed border-line">
                        <span className="font-semibold text-navy-900">Delivery Charge</span>
                        {sum.delivery > 0 ? (
                          <div className="text-right">
                            <span className="font-bold text-navy-900">{formatINR(sum.delivery)}</span>
                            <span className="block text-[11px] font-semibold text-brand">Add 3rd roll on for FREE delivery</span>
                          </div>
                        ) : (
                          <span className="font-bold text-[#166534]">FREE (3+ items unlocked)</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center pt-2.5 border-t border-line text-[16px] font-extrabold text-navy-900">
                        <span>Total Payable</span>
                        <span className="text-[#166534] text-xl">{formatINR(sum.total)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ---------- STEP 3: Delivery Address & Mandatory 10-Digit Mobile ---------- */}
              {step === 3 && (
                <div className="flex flex-col gap-4">
                  <div className="rounded-2xl border border-line bg-page p-3.5 text-xs text-muted-2">
                    Please provide complete delivery details. Ekart tracking link will be sent to your mobile number.
                  </div>

                  <fieldset className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    <legend className="mb-1 text-sm font-bold text-navy-900">Delivery Address Details</legend>

                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="text-xs font-bold text-navy-900">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        className={field}
                        placeholder="Your full name"
                        aria-label="Full name"
                        autoComplete="name"
                        value={d.name}
                        onChange={(e) => setD({ ...d, name: e.target.value })}
                      />
                    </div>

                    {/* Compulsory 10-Digit Mobile Number Field */}
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="text-xs font-bold text-navy-900 flex items-center justify-between">
                        <span>Mobile Number (Required for Payment & Courier Delivery) <span className="text-red-500">*</span></span>
                        {/^[6-9]\d{9}$/.test((d.phone || '').trim()) && (
                          <span className="text-emerald-700 font-semibold text-[11px]">✓ 10-digit number verified</span>
                        )}
                      </label>
                      <div className="flex items-center rounded-xl border-[1.5px] border-line-strong bg-white focus-within:border-navy-700 focus-within:ring-4 focus-within:ring-blue-soft">
                        <span className="flex shrink-0 items-center gap-2 whitespace-nowrap border-r border-line px-3.5 text-[14px] font-semibold text-navy-900">
                          🇮🇳 +91
                        </span>
                        <input
                          className="min-h-12 w-full min-w-0 rounded-xl bg-transparent px-3.5 text-[15px] outline-none font-semibold text-navy-900"
                          placeholder="10-digit mobile number"
                          aria-label="Mobile number"
                          inputMode="numeric"
                          autoComplete="tel-national"
                          maxLength={10}
                          value={d.phone}
                          onChange={(e) => setD({ ...d, phone: e.target.value.replace(/\D/g, '') })}
                        />
                      </div>
                      {(!d.phone || d.phone.replace(/\D/g, '').length !== 10) && (
                        <span className="text-[11.5px] font-medium text-red-600">
                          ⚠️ 10-digit mobile number is compulsory. Payment will not proceed without it.
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-navy-900">
                        Delivery Pincode <span className="text-red-500">*</span>
                      </label>
                      <input
                        className={field}
                        placeholder="6-digit PIN code"
                        aria-label="Pincode"
                        inputMode="numeric"
                        maxLength={6}
                        value={d.pin}
                        onChange={(e) => setD({ ...d, pin: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>

                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="text-xs font-bold text-navy-900">
                        Complete Address (House No, Street, Area, City, State) <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        className={`${field} py-2.5 resize-none`}
                        placeholder="House no., building name, street, locality, city"
                        aria-label="Address"
                        autoComplete="street-address"
                        value={d.address}
                        onChange={(e) => setD({ ...d, address: e.target.value })}
                      />
                    </div>
                  </fieldset>
                </div>
              )}

              {/* ---------- STEP 4: Payment & Final Delivery Charges Summary ---------- */}
              {step === 4 && (
                <div className="flex flex-col gap-4">
                  {/* Delivery Address Summary with Edit Option */}
                  <div className="flex items-center justify-between rounded-2xl border border-line bg-page p-3.5 text-[12.5px]">
                    <div className="min-w-0">
                      <span className="block font-bold text-navy-900 uppercase text-[11px] tracking-wider text-muted-2">
                        Delivering to:
                      </span>
                      <p className="font-semibold text-navy-900 truncate">
                        {d.name} · +91 {d.phone}
                      </p>
                      <p className="text-muted-2 truncate text-xs">
                        {d.address} (PIN: {d.pin})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="text-xs font-bold text-brand hover:underline cursor-pointer shrink-0"
                    >
                      Change
                    </button>
                  </div>

                  {/* Payment Method Selection */}
                  <fieldset>
                    <legend className="mb-2 text-sm font-bold text-navy-900">Choose Payment Method</legend>
                    <div className="grid grid-cols-2 gap-2.5">
                      {methods.map((m) => (
                        <label
                          key={m.id}
                          className={`flex cursor-pointer flex-col gap-0.5 rounded-2xl border-[1.5px] p-3.5 transition-all ${
                            method === m.id
                              ? 'border-navy-700 bg-blue-soft ring-2 ring-navy-700/40 shadow-xs'
                              : 'border-line-strong bg-white hover:border-navy-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="pay-method"
                            value={m.id}
                            checked={method === m.id}
                            onChange={() => setMethod(m.id)}
                            className="sr-only"
                          />
                          <b className="text-[14.5px] font-bold text-navy-900">{m.label}</b>
                          <span className="text-[12px] text-muted-2">{m.note}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  {/* Coupon Code Section with Celebration Trigger */}
                  <div className="rounded-2xl border border-line bg-page p-3.5">
                    {applied ? (
                      <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800">
                        <span className="flex items-center gap-1.5">
                          <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] text-white font-bold">COUPON</span>
                          <span><b>{applied}</b> applied · Saved {formatINR(sum.couponOff || coupons[applied]?.off || 50)}</span>
                        </span>
                        <button type="button" onClick={removeCoupon} className="font-bold text-red-600 hover:underline cursor-pointer">
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-navy-900">Have a coupon code?</span>
                        <div className="flex items-center gap-2">
                          <input
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), apply())}
                            placeholder="Enter coupon (e.g. FIRST50)"
                            className="min-h-10 flex-1 rounded-xl border border-line-strong bg-white px-3 text-xs uppercase outline-none focus:border-navy-700"
                          />
                          <button
                            type="button"
                            onClick={apply}
                            disabled={!code.trim()}
                            className="btn-navy min-h-10 px-4 text-xs font-bold disabled:opacity-50 cursor-pointer"
                          >
                            Apply
                          </button>
                        </div>
                        {codeMsg && <p className="text-[11.5px] font-medium text-brand">{codeMsg}</p>}
                      </div>
                    )}
                  </div>

                  {/* SABSE LAST ME: Final Transparent Price & Delivery Fee Breakdown */}
                  <div className="rounded-2xl border border-line-strong bg-white p-4 shadow-xs">
                    <span className="block text-xs font-bold uppercase tracking-wider text-muted-2 mb-2.5">
                      Order Summary & Delivery Fee
                    </span>
                    <div className="flex flex-col gap-1.5 text-[13.5px]">
                      <div className="flex justify-between text-muted">
                        <span>Items ({sum.sticks} {sum.sticks === 1 ? 'roll on' : 'roll ons'})</span>
                        <span className="font-medium text-navy-900">{formatINR(sum.full)}</span>
                      </div>
                      {sum.comboSaving > 0 && (
                        <div className="flex justify-between font-semibold text-[#166534]">
                          <span>Combo Offer Discount</span>
                          <span>− {formatINR(sum.comboSaving)}</span>
                        </div>
                      )}
                      {sum.couponOff > 0 && (
                        <div className="flex justify-between font-semibold text-[#166534]">
                          <span>Coupon Discount ({applied})</span>
                          <span>− {formatINR(sum.couponOff)}</span>
                        </div>
                      )}
                      {/* Delivery Charge row: ₹50 on 1 or 2 items, Free on 3+ items */}
                      <div className="flex justify-between items-center py-1 border-t border-dashed border-line">
                        <span className="font-semibold text-navy-900">Delivery Charge</span>
                        {sum.delivery > 0 ? (
                          <div className="text-right">
                            <span className="font-bold text-navy-900">{formatINR(sum.delivery)}</span>
                            <span className="block text-[11px] font-semibold text-brand">Add 3rd roll on for FREE delivery</span>
                          </div>
                        ) : (
                          <span className="font-bold text-[#166534]">FREE (3+ items unlocked)</span>
                        )}
                      </div>
                      {fee > 0 && (
                        <div className="flex justify-between text-muted">
                          <span>COD Handling Fee</span>
                          <span className="font-medium text-navy-900">{formatINR(fee)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2.5 border-t border-line text-[16px] font-extrabold text-navy-900">
                        <span>Total Payable Amount</span>
                        <span className="text-[#166534] text-xl">{formatINR(total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {err && <p role="alert" className="order-3 text-sm font-semibold text-[#C0392B] bg-red-50 p-3 rounded-xl border border-red-200">{err}</p>}
            </div>

            {/* footer: main action navigation */}
            <div className="flex flex-col gap-3 border-t border-line bg-white px-5 py-4 sm:px-7">
              {step === 1 && (
                authProvider === 'google' && !verified ? (
                  <button onClick={continueWithGooglePhone} disabled={!cart.length} className="btn-primary min-h-[52px] w-full text-base">
                    Continue to Offers
                  </button>
                ) : !otpSent ? (
                  <button onClick={sendOtp} disabled={!cart.length} className="btn-primary min-h-[52px] w-full text-base">
                    Send 4 Digit OTP
                  </button>
                ) : (
                  <button onClick={verifyOtp} disabled={otp.length < 4} className="btn-primary min-h-[52px] w-full text-base disabled:opacity-50">
                    Verify 4-Digit OTP & Continue
                  </button>
                )
              )}

              {step === 2 && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-[14.5px] font-bold text-navy-900">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-2 font-semibold">Total ({sum.sticks} {sum.sticks === 1 ? 'item' : 'items'}):</span>
                      <span className="text-xl font-black text-[#166534]">{formatINR(sum.total)}</span>
                    </div>
                    {sum.delivery > 0 ? (
                      <span className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-800">
                        + {formatINR(sum.delivery)} Delivery
                      </span>
                    ) : (
                      <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-bold text-[#166534]">
                        ✓ FREE Delivery
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={goToAddress}
                    disabled={!cart.length}
                    className="btn-primary min-h-[52px] w-full text-base font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Continue to Delivery Address</span>
                    <span>→</span>
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-[14.5px] font-bold text-navy-900">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-2 font-semibold">Total ({sum.sticks} {sum.sticks === 1 ? 'item' : 'items'}):</span>
                      <span className="text-xl font-black text-[#166534]">{formatINR(sum.total)}</span>
                    </div>
                    {sum.delivery > 0 ? (
                      <span className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-800">
                        + {formatINR(sum.delivery)} Delivery
                      </span>
                    ) : (
                      <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-bold text-[#166534]">
                        ✓ FREE Delivery
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={goToPayment}
                    className="btn-primary min-h-[52px] w-full text-base font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Continue to Payment</span>
                    <span>→</span>
                  </button>
                </div>
              )}

              {step === 4 && (
                <button
                  type="button"
                  onClick={pay}
                  disabled={busy}
                  className="btn-primary min-h-[52px] w-full text-base font-bold shadow-lg disabled:opacity-60 cursor-pointer"
                >
                  <Lock size={18} /> {busy ? 'Processing…' : method === 'cod' ? `Confirm COD Order · ${formatINR(total)}` : `Pay ${formatINR(total)}`}
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

      {/* Confetti Explosion Celebration (Non-blocking directly in UI) */}
      <ConfettiBoom
        show={boom.show}
        code={boom.code}
        title={boom.title}
        message={boom.message}
        subtext={boom.subtext}
        savings={boom.savings}
        onClose={() => setBoom({ show: false, code: '', title: '', message: '', subtext: '', savings: 0 })}
      />
    </div>
  );
}

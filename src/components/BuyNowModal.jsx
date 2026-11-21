import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { formatINR, summarize, coupons, getCouponStatus } from '../data/products.js';
import { createPayment } from '../lib/payment.js';
import { saveOrder } from '../lib/api.js';
import { QtyStepper, PriceRows } from './CartDrawer.jsx';
import { Close, Lock, CheckCircle, Shield, Truck } from './Icons.jsx';

const GoogleIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
  </svg>
);

const methods = [
  { id: 'upi', label: 'UPI', note: 'GPay, PhonePe, Paytm' },
  { id: 'card', label: 'Card', note: 'Credit / Debit' },
  { id: 'netbanking', label: 'Net banking', note: 'All banks' },
  { id: 'cod', label: 'Cash on delivery', note: '+ ₹49 COD fee' },
];
const COD_FEE = 49;
const field = 'min-h-11 w-full rounded-xl border-[1.5px] border-line-strong bg-white px-3.5 text-[15px] outline-none transition focus:border-navy-700 focus:ring-2 focus:ring-blue-soft';

/** Buy now: instant direct checkout with mandatory customer authentication. */
export default function BuyNowModal() {
  const { buy, closeBuy, clearCart, user, userProfile, recordUserOrder, loginWithGoogle, openAuth } = useStore();
  const [lines, setLines] = useState([]);
  const [method, setMethod] = useState('upi');
  const [d, setD] = useState({ name: '', email: '', phone: '', address: '', pin: '' });
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [err, setErr] = useState('');
  const [order, setOrder] = useState(null);
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState('');
  const [codeMsg, setCodeMsg] = useState('');

  useEffect(() => {
    if (!buy) return;
    setLines(buy.lines.map((l) => ({ ...l })));
    setMethod('upi');
    setErr('');
    setOrder(null);
    setCode('');
    setApplied('');
    setCodeMsg('');

    if (user) {
      setD({
        name: userProfile.name || user.displayName || '',
        email: user.email || '',
        phone: userProfile.phone || user.phoneNumber || '',
        address: userProfile.address || '',
        pin: userProfile.pin || '',
      });
    }

    const onKey = (e) => e.key === 'Escape' && closeBuy();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [buy, closeBuy, user, userProfile]);

  if (!buy) return null;

  const sum = summarize(lines, applied);
  const fee = method === 'cod' ? COD_FEE : 0;
  const total = sum.total + fee;

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
    if (sum.comboSaving > 0) {
      setApplied('');
      setCodeMsg('Your combo already has free delivery. Coupons can be used on single-stick orders.');
    } else {
      setApplied(matchedKey);
      setCodeMsg(`${matchedKey} applied — ${cp.note || `₹${cp.off} off`}`);
    }
  };

  const setQty = (k, q) => setLines((ls) => ls.map((l, i) => (i === k ? { ...l, qty: Math.max(1, q) } : l)));

  const handleGoogleSignIn = async () => {
    setErr('');
    setGoogleBusy(true);
    const res = await loginWithGoogle();
    setGoogleBusy(false);
    if (!res.ok) {
      setErr(res.error || 'Google sign-in failed. Please try again.');
    }
  };

  const pay = async (e) => {
    e.preventDefault();
    setErr('');

    // Mandatory Authentication Check
    if (!user) {
      openAuth('login');
      return setErr('Customer login is required before making payment. Please sign in or create an account.');
    }

    const cleanPhone = (d.phone || '').replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return setErr('Please enter a valid 10-digit mobile number (e.g. 9876543210). Mobile number is mandatory for courier delivery and payment.');
    }

    if (!d.name.trim() || !d.email.trim() || !d.address.trim() || !/^\d{6}$/.test(d.pin)) {
      return setErr('Please enter your full name, valid email, complete address, and 6-digit pincode.');
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

    // Save order in Firestore & store under user's profile
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
        items: lines.map((l) => ({ id: l.id, name: l.name, qty: l.qty * (l.sticks || 1) })),
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
        source: buy.fromCart ? 'Cart' : 'Buy now',
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
        items: lines.map((l) => ({ id: l.id, name: l.name, qty: l.qty * (l.sticks || 1) })),
        sticks: sum.sticks,
        total,
        payment: paymentLabel,
        paymentStatus,
        status: 'New',
        tracking: '',
      });
    } catch {
      setBusy(false);
      return setErr('Could not place your order. Please check your internet connection and try again.');
    }

    setBusy(false);
    setOrder({ ...r, orderId: saved.id });
    if (buy.fromCart) clearCart();
  };

  return (
    <div className="fixed inset-0 z-[85] flex animate-fade-in items-center justify-center bg-navy-900/60 p-3 sm:p-6" onClick={closeBuy}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buy now"
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[94svh] w-full max-w-[560px] animate-fade-up flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl sm:rounded-[28px]"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
          <h2 className="text-xl font-semibold">{order ? 'Order Confirmed' : 'Instant Checkout'}</h2>
          <button className="icon-btn" onClick={closeBuy} aria-label="Close"><Close /></button>
        </div>

        {order ? (
          <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-mint-soft text-brand"><CheckCircle size={36} /></span>
            <p className="text-[17px] text-muted">
              Thank you, {d.name}! Order <b className="text-navy-900">{order.orderId}</b> of {formatINR(order.amount)} is confirmed.
            </p>
            {order.easebuzz_payment_id || order.razorpay_payment_id ? (
              <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                Easebuzz Payment Verified: <b className="font-mono">{order.easebuzz_payment_id || order.razorpay_payment_id}</b>
              </span>
            ) : (
              <span className="rounded-full bg-page px-4 py-1.5 text-sm text-muted-2">Payment Mode: {order.payment || 'Cash on Delivery'}</span>
            )}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Link to="/profile" onClick={closeBuy} className="btn-navy text-sm">
                Track Order & View Invoice
              </Link>
              <Link to="/#shop" onClick={closeBuy} className="btn-secondary text-sm">
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={pay} className="flex min-h-0 flex-1 flex-col">
            <div className="flex flex-col gap-5 overflow-y-auto px-5 py-5 sm:px-6">
              {/* Mandatory Auth Banner if not logged in */}
              {!user ? (
                <div className="rounded-2xl border-2 border-brand/30 bg-mint-soft/30 p-4 text-center sm:p-5">
                  <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <Lock size={20} />
                  </div>
                  <h3 className="text-base font-bold text-navy-900">Login Required to Complete Order</h3>
                  <p className="mt-1 text-xs text-muted leading-relaxed">
                    Sign in to link this order to your account, track live delivery, and download your official GST invoice.
                  </p>
                  <div className="mt-3.5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={googleBusy}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-line-strong bg-white px-4 text-xs font-bold shadow-sm hover:bg-page disabled:opacity-60"
                    >
                      <GoogleIcon size={16} />
                      {googleBusy ? 'Signing in…' : '1-Click Google Sign In'}
                    </button>
                    <button
                      type="button"
                      onClick={() => openAuth('login')}
                      className="inline-flex min-h-10 items-center justify-center rounded-xl bg-navy-900 px-4 text-xs font-bold text-white hover:bg-navy-700"
                    >
                      Email Login / Sign Up
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-xl bg-page px-3.5 py-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-brand text-white font-bold text-[11px]">
                      {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                    </span>
                    <span className="text-muted">
                      Logged in as <b className="text-navy-900">{user.displayName || user.email}</b>
                    </span>
                  </div>
                  <Link to="/profile" className="font-semibold text-brand hover:underline" onClick={closeBuy}>
                    My Profile
                  </Link>
                </div>
              )}

              {/* Items */}
              <ul className="flex flex-col gap-3">
                {lines.map((l, k) => (
                  <li key={l.key} className="flex items-center gap-3 rounded-2xl bg-page p-2.5 pr-4">
                    <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-white p-1">
                      <img src={l.image} alt="" className="h-full w-auto object-contain" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <b className="block truncate font-head font-semibold">{l.name}</b>
                      <small className="text-muted-2">{l.pack} · {formatINR(l.unitPrice)}</small>
                    </span>
                    {!buy.fromCart ? (
                      <QtyStepper size="sm" value={l.qty} onChange={(q) => setQty(k, q)} />
                    ) : (
                      <span className="text-sm font-semibold">× {l.qty}</span>
                    )}
                  </li>
                ))}
              </ul>

              {/* Coupon */}
              <div>
                <span className="mb-2 block text-sm font-bold">Coupon Code</span>
                <div className="flex gap-2">
                  <input
                    className={`${field} uppercase`}
                    placeholder="Enter coupon code"
                    aria-label="Coupon code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={apply}
                    className="min-h-11 shrink-0 rounded-xl bg-navy-900 px-5 text-sm font-semibold text-white hover:bg-navy-700"
                  >
                    Apply
                  </button>
                </div>
                {(sum.couponBlocked ? 'Your combo already has free delivery. Coupons can be used on single-stick orders.' : codeMsg) && (
                  <p className={`mt-1.5 text-[13px] font-semibold ${applied && !sum.couponBlocked ? 'text-brand-dark' : 'text-[#C0392B]'}`}>
                    {sum.couponBlocked ? 'Your combo already has free delivery. Coupons can be used on single-stick orders.' : codeMsg}
                  </p>
                )}
              </div>

              {/* Payment Methods */}
              <fieldset>
                <legend className="mb-2.5 text-sm font-bold">Payment Method</legend>
                <div className="grid grid-cols-2 gap-2.5">
                  {methods.map((m) => (
                    <label
                      key={m.id}
                      className={`flex cursor-pointer flex-col gap-0.5 rounded-2xl border-[1.5px] p-3.5 ${
                        method === m.id ? 'border-navy-700 bg-blue-soft ring-1 ring-navy-700' : 'border-line-strong hover:border-navy-700'
                      }`}
                    >
                      <input type="radio" name="method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="sr-only" />
                      <b className="text-[15px]">{m.label}</b>
                      <span className="text-[13px] text-muted-2">{m.note}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Delivery Details */}
              <fieldset className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <legend className="mb-2.5 text-sm font-bold">Delivery Address</legend>
                <input
                  className={field}
                  placeholder="Full name"
                  aria-label="Full name"
                  value={d.name}
                  onChange={(e) => setD({ ...d, name: e.target.value })}
                />
                <input
                  className={field}
                  type="email"
                  placeholder="Email address"
                  aria-label="Email address"
                  value={d.email}
                  onChange={(e) => setD({ ...d, email: e.target.value })}
                />
                <input
                  className={field}
                  placeholder="10-digit mobile number"
                  aria-label="Mobile number"
                  inputMode="numeric"
                  maxLength={10}
                  value={d.phone}
                  onChange={(e) => setD({ ...d, phone: e.target.value.replace(/\D/g, '') })}
                />
                <input
                  className={field}
                  placeholder="6-digit pincode"
                  aria-label="Pincode"
                  inputMode="numeric"
                  maxLength={6}
                  value={d.pin}
                  onChange={(e) => setD({ ...d, pin: e.target.value.replace(/\D/g, '') })}
                />
                <input
                  className={`${field} sm:col-span-2`}
                  placeholder="Flat / House no., street, area, city"
                  aria-label="Address"
                  value={d.address}
                  onChange={(e) => setD({ ...d, address: e.target.value })}
                />
              </fieldset>
              {err && <p role="alert" className="text-sm font-semibold text-[#C0392B]">{err}</p>}
            </div>

            <div className="flex flex-col gap-3 border-t border-line bg-white px-5 py-4 sm:px-6">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[15px]">
                  <span className="text-muted">
                    Total {sum.comboSaving > 0 && <span className="font-semibold text-brand-dark">· combo applied</span>}{' '}
                    <span className="text-xs underline">details</span>
                  </span>
                  <b className="font-head text-xl">{formatINR(total)}</b>
                </summary>
                <PriceRows s={sum} className="mt-2" />
                {fee > 0 && (
                  <div className="mt-1.5 flex justify-between text-[14.5px] text-muted">
                    <span>COD fee</span>
                    <span>{formatINR(fee)}</span>
                  </div>
                )}
              </details>

              <button
                disabled={busy}
                className="btn-primary min-h-[52px] w-full text-base font-semibold disabled:opacity-60"
              >
                <Lock size={18} />
                {!user
                  ? `Sign in & Pay ${formatINR(total)}`
                  : busy
                  ? 'Processing…'
                  : method === 'cod'
                  ? `Place Order · ${formatINR(total)}`
                  : `Pay ${formatINR(total)}`}
              </button>
              <span className="flex items-center justify-center gap-4 text-xs text-muted-2">
                <span className="flex items-center gap-1.5"><Shield size={14} />Secure payment</span>
                <span className="flex items-center gap-1.5"><Truck size={16} />Ships in 1–2 days</span>
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { products, packs, getProductById, formatINR } from '../data/products.js';
import { useStore } from '../context/StoreContext.jsx';
import { sendOtp, verifyOtp, createPayment } from '../lib/otp.js';
import { Check, CheckCircle, Lock, Shield, Truck } from '../components/Icons.jsx';

const methods = [
  { id: 'upi', label: 'UPI', note: 'Google Pay, PhonePe, Paytm, BHIM' },
  { id: 'card', label: 'Credit / Debit card', note: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net banking', note: 'All major banks' },
  { id: 'cod', label: 'Cash on delivery', note: 'Pay when it arrives' },
];

const field = 'min-h-12 w-full rounded-2xl border-[1.5px] border-line-strong bg-white px-4 text-[15px] outline-none focus:border-navy-700';

function StepHead({ n, title, state, children }) {
  const done = state === 'done';
  const active = state === 'active';
  return (
    <section className={`rounded-3xl border bg-white p-6 sm:p-7 ${active ? 'border-navy-700' : 'border-line'}`}>
      <div className="flex items-center gap-3">
        <span className={`flex size-9 items-center justify-center rounded-full font-head font-bold ${done ? 'bg-brand text-white' : active ? 'bg-navy-900 text-white' : 'bg-page text-muted-2'}`}>
          {done ? <Check size={18} /> : n}
        </span>
        <h2 className={`text-xl font-semibold ${state === 'todo' ? 'text-muted-2' : ''}`}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

/**
 * Checkout: 1) mobile number  2) OTP verify  3) payment.
 * Opened from "Buy now" (one product, passed in router state) or from the cart.
 */
export default function Checkout() {
  const { state } = useLocation();
  const { cart, clearCart } = useStore();

  // What is being bought
  const items = useMemo(() => {
    const b = state?.buyNow;
    if (b) {
      const p = getProductById(b.productId) || products[0];
      const pack = packs.find((x) => x.id === b.packId) || packs[0];
      return { fromCart: false, lines: [{ key: p.id, name: p.name, image: p.image, pack: pack.label, unitPrice: p.price * pack.multiplier * (1 - pack.off), qty: b.qty || 1 }] };
    }
    return { fromCart: true, lines: cart };
  }, [state, cart]);
  const subtotal = items.lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);

  const [step, setStep] = useState('phone'); // phone | otp | pay | done
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [demoCode, setDemoCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [timer, setTimer] = useState(0);
  const [method, setMethod] = useState('upi');
  const [addr, setAddr] = useState({ name: '', line: '', city: '', pin: '' });
  const [order, setOrder] = useState(null);
  const boxes = useRef([]);

  const cod = method === 'cod' ? 49 : 0; // DUMMY COD fee
  const total = subtotal + cod;

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const requestOtp = async (e) => {
    e?.preventDefault();
    setErr('');
    if (!/^[6-9]\d{9}$/.test(phone)) return setErr('Enter a valid 10-digit Indian mobile number.');
    setBusy(true);
    const r = await sendOtp(phone);
    setBusy(false);
    setDemoCode(r.demoCode);
    setOtp(['', '', '', '', '', '']);
    setStep('otp');
    setTimer(30);
    setTimeout(() => boxes.current[0]?.focus(), 50);
  };

  const typeOtp = (k, v) => {
    const d = v.replace(/\D/g, '');
    if (d.length > 1) { // pasted the whole code
      const arr = d.slice(0, 6).split('');
      setOtp([...arr, ...Array(6 - arr.length).fill('')]);
      boxes.current[Math.min(arr.length, 5)]?.focus();
      return;
    }
    const next = [...otp]; next[k] = d; setOtp(next);
    if (d && k < 5) boxes.current[k + 1]?.focus();
  };

  const confirmOtp = async (e) => {
    e.preventDefault();
    setErr('');
    const code = otp.join('');
    if (code.length < 6) return setErr('Enter the 6-digit OTP.');
    setBusy(true);
    const r = await verifyOtp(phone, code);
    setBusy(false);
    if (!r.ok) return setErr('Wrong OTP. Please try again.');
    setStep('pay');
  };

  const pay = async (e) => {
    e.preventDefault();
    setErr('');
    if (!addr.name || !addr.line || !addr.city || !/^\d{6}$/.test(addr.pin)) return setErr('Please fill in your delivery address and a 6-digit pincode.');
    setBusy(true);
    const r = await createPayment({ amount: total, method });
    setBusy(false);
    if (!r.ok) return setErr('Payment failed. Please try again.');
    setOrder(r);
    setStep('done');
    if (items.fromCart) clearCart();
  };

  if (step === 'done' && order) {
    return (
      <div className="container-x flex flex-col items-center gap-5 py-24 text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-mint-soft text-brand"><CheckCircle size={44} /></span>
        <h1 className="h2">Order placed!</h1>
        <p className="max-w-[460px] text-[17px] text-muted">Thank you, {addr.name}. Your order <b className="text-navy-900">#{order.orderId}</b> of {formatINR(order.amount)} is confirmed. We will send updates to +91 {phone}.</p>
        <span className="rounded-full bg-page px-4 py-2 text-sm text-muted-2">Demo order — no real payment was taken</span>
        <Link to="/shop" className="btn-navy">Continue shopping</Link>
      </div>
    );
  }

  if (items.lines.length === 0) {
    return (
      <div className="container-x flex flex-col items-center gap-5 py-24 text-center">
        <h1 className="h2">Your cart is empty</h1>
        <Link to="/shop" className="btn-navy">Shop products</Link>
      </div>
    );
  }

  const st = (name) => {
    const order = ['phone', 'otp', 'pay'];
    const a = order.indexOf(step), b = order.indexOf(name);
    return b < a ? 'done' : b === a ? 'active' : 'todo';
  };

  return (
    <div className="container-x pb-24">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 py-6 text-sm text-muted-2">
        <Link to="/" className="text-muted-2 hover:text-brand">Home</Link><span>/</span><b className="font-semibold text-navy-900">Checkout</b>
      </nav>
      <h1 className="mb-8 font-jost text-[40px] font-medium tracking-tight">Checkout</h1>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_400px]">
        <div className="flex flex-col gap-4">
          {/* 1. Mobile */}
          <StepHead n={1} title="Mobile number" state={st('phone')}>
            {step === 'phone' ? (
              <form onSubmit={requestOtp} className="mt-5 flex flex-col gap-4">
                <label className="flex flex-col gap-2 text-sm font-semibold">
                  We will send a 6-digit OTP to verify your number
                  <span className="flex items-center gap-2 rounded-2xl border-[1.5px] border-line-strong bg-white pl-4 focus-within:border-navy-700">
                    <span className="font-semibold text-navy-900">+91</span>
                    <input inputMode="numeric" autoComplete="tel-national" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="98765 43210" className="min-h-12 flex-1 bg-transparent pr-4 text-[16px] font-normal outline-none" aria-label="Mobile number" />
                  </span>
                </label>
                {err && <p role="alert" className="text-sm font-semibold text-[#C0392B]">{err}</p>}
                <button disabled={busy} className="btn-primary self-start disabled:opacity-60">{busy ? 'Sending OTP…' : 'Send OTP'}</button>
              </form>
            ) : (
              <p className="mt-3 flex items-center justify-between pl-12 text-[15px] text-muted">
                +91 {phone}
                {step !== 'pay' && <button onClick={() => { setStep('phone'); setErr(''); }} className="text-sm font-semibold text-navy-700 underline">Change</button>}
              </p>
            )}
          </StepHead>

          {/* 2. OTP */}
          <StepHead n={2} title="Verify OTP" state={st('otp')}>
            {step === 'otp' && (
              <form onSubmit={confirmOtp} className="mt-5 flex flex-col gap-4">
                <p className="text-[15px] text-muted">Enter the code sent to +91 {phone}</p>
                <div className="rounded-2xl border border-dashed border-[#E2B13C] bg-[#FFF8E6] px-4 py-3 text-sm text-[#7A5A00]">
                  <b>Demo mode:</b> SMS is not connected yet. Your OTP is <b className="tracking-widest">{demoCode}</b>
                </div>
                <div className="flex gap-2 sm:gap-3">
                  {otp.map((d, k) => (
                    <input key={k} ref={(el) => (boxes.current[k] = el)} value={d} inputMode="numeric" autoComplete={k === 0 ? 'one-time-code' : 'off'} maxLength={6}
                      aria-label={`OTP digit ${k + 1}`}
                      onChange={(e) => typeOtp(k, e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Backspace' && !otp[k] && k > 0) boxes.current[k - 1]?.focus(); }}
                      className="size-12 rounded-2xl border-[1.5px] border-line-strong text-center font-head text-xl font-bold outline-none focus:border-navy-700 sm:size-14" />
                  ))}
                </div>
                {err && <p role="alert" className="text-sm font-semibold text-[#C0392B]">{err}</p>}
                <div className="flex flex-wrap items-center gap-4">
                  <button disabled={busy} className="btn-primary disabled:opacity-60">{busy ? 'Verifying…' : 'Verify & continue'}</button>
                  <button type="button" disabled={timer > 0 || busy} onClick={requestOtp} className="text-sm font-semibold text-navy-700 underline disabled:text-muted-2 disabled:no-underline">
                    {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                  </button>
                </div>
              </form>
            )}
            {step === 'pay' && <p className="mt-3 flex items-center gap-2 pl-12 text-[15px] font-semibold text-brand-dark"><Check size={16} /> Number verified</p>}
          </StepHead>

          {/* 3. Payment */}
          <StepHead n={3} title="Delivery & payment" state={st('pay')}>
            {step === 'pay' && (
              <form onSubmit={pay} className="mt-5 flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input className={`${field} sm:col-span-2`} placeholder="Full name" aria-label="Full name" value={addr.name} onChange={(e) => setAddr({ ...addr, name: e.target.value })} />
                  <input className={`${field} sm:col-span-2`} placeholder="House no., street, area" aria-label="Address" value={addr.line} onChange={(e) => setAddr({ ...addr, line: e.target.value })} />
                  <input className={field} placeholder="City" aria-label="City" value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} />
                  <input className={field} placeholder="Pincode" aria-label="Pincode" inputMode="numeric" maxLength={6} value={addr.pin} onChange={(e) => setAddr({ ...addr, pin: e.target.value.replace(/\D/g, '') })} />
                </div>

                <fieldset className="flex flex-col gap-2.5">
                  <legend className="mb-2 text-sm font-bold">Payment method</legend>
                  {methods.map((m) => (
                    <label key={m.id} className={`flex cursor-pointer items-center gap-3 rounded-2xl border-[1.5px] p-4 ${method === m.id ? 'border-navy-700 bg-blue-soft' : 'border-line-strong'}`}>
                      <input type="radio" name="pay" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="size-5 accent-[#1C2E6B]" />
                      <span className="flex-1">
                        <b className="block font-semibold">{m.label}</b>
                        <span className="text-sm text-muted-2">{m.note}{m.id === 'cod' ? ` · ₹${49} COD fee` : ''}</span>
                      </span>
                    </label>
                  ))}
                </fieldset>

                {err && <p role="alert" className="text-sm font-semibold text-[#C0392B]">{err}</p>}
                <button disabled={busy} className="btn-primary min-h-[54px] w-full text-base disabled:opacity-60">
                  <Lock size={18} /> {busy ? 'Processing…' : method === 'cod' ? `Place order · ${formatINR(total)}` : `Pay ${formatINR(total)}`}
                </button>
              </form>
            )}
          </StepHead>
        </div>

        {/* Order summary */}
        <aside className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-6 lg:sticky lg:top-6">
          <h2 className="text-xl font-semibold">Order summary</h2>
          <ul className="flex flex-col gap-3">
            {items.lines.map((l) => (
              <li key={l.key} className="flex items-center gap-3">
                <span className="relative">
                  <img src={l.image} alt="" className="size-16 rounded-xl object-cover" />
                  <span className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">{l.qty}</span>
                </span>
                <span className="flex-1">
                  <b className="block font-head font-semibold leading-tight">{l.name}</b>
                  <small className="text-muted-2">{l.pack}</small>
                </span>
                <b className="font-head">{formatINR(l.unitPrice * l.qty)}</b>
              </li>
            ))}
          </ul>
          <dl className="flex flex-col gap-2 border-t border-line pt-4 text-[15px]">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatINR(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd className="font-semibold text-brand-dark">Free</dd></div>
            {cod > 0 && <div className="flex justify-between"><dt className="text-muted">COD fee</dt><dd>{formatINR(cod)}</dd></div>}
            <div className="flex justify-between border-t border-line pt-3 text-lg font-bold"><dt>Total</dt><dd>{formatINR(total)}</dd></div>
          </dl>
          <ul className="flex flex-col gap-2 text-sm text-muted-2">
            <li className="flex items-center gap-2"><span className="text-brand"><Shield size={16} /></span>Secure checkout</li>
            <li className="flex items-center gap-2"><span className="text-brand"><Truck size={18} /></span>Free shipping on prepaid orders</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}

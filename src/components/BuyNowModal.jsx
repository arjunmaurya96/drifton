import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { formatINR } from '../data/products.js';
import { createPayment } from '../lib/payment.js';
import { QtyStepper } from './CartDrawer.jsx';
import { Close, Lock, CheckCircle, Shield, Truck } from './Icons.jsx';

const methods = [
  { id: 'upi', label: 'UPI', note: 'GPay, PhonePe, Paytm' },
  { id: 'card', label: 'Card', note: 'Credit / Debit' },
  { id: 'netbanking', label: 'Net banking', note: 'All banks' },
  { id: 'cod', label: 'Cash on delivery', note: '+ ₹49 COD fee' },
];
const COD_FEE = 49; // DUMMY
const field = 'min-h-11 w-full rounded-xl border-[1.5px] border-line-strong bg-white px-3.5 text-[15px] outline-none focus:border-navy-700';

/** Buy now: a centred popup with the order and payment options straight away. No OTP step. */
export default function BuyNowModal() {
  const { buy, closeBuy, clearCart } = useStore();
  const [lines, setLines] = useState([]);
  const [method, setMethod] = useState('upi');
  const [d, setD] = useState({ name: '', phone: '', address: '', pin: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!buy) return;
    setLines(buy.lines.map((l) => ({ ...l })));
    setMethod('upi'); setErr(''); setOrder(null);
    const onKey = (e) => e.key === 'Escape' && closeBuy();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [buy, closeBuy]);

  if (!buy) return null;

  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
  const fee = method === 'cod' ? COD_FEE : 0;
  const total = subtotal + fee;
  const setQty = (k, q) => setLines((ls) => ls.map((l, i) => (i === k ? { ...l, qty: Math.max(1, q) } : l)));

  const pay = async (e) => {
    e.preventDefault();
    setErr('');
    if (!d.name.trim() || !/^[6-9]\d{9}$/.test(d.phone) || !d.address.trim() || !/^\d{6}$/.test(d.pin)) {
      return setErr('Please add your name, 10-digit mobile, address and 6-digit pincode.');
    }
    setBusy(true);
    const r = await createPayment({ amount: total, method });
    setBusy(false);
    if (!r.ok) return setErr('Payment failed. Please try again.');
    setOrder(r);
    if (buy.fromCart) clearCart();
  };

  return (
    <div className="fixed inset-0 z-[85] flex animate-fade-in items-center justify-center bg-navy-900/60 p-3 sm:p-6" onClick={closeBuy}>
      <div role="dialog" aria-modal="true" aria-label="Buy now" onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[94svh] w-full max-w-[560px] animate-fade-up flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-xl font-semibold">{order ? 'Order placed' : 'Buy now'}</h2>
          <button className="icon-btn" onClick={closeBuy} aria-label="Close"><Close /></button>
        </div>

        {order ? (
          <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-mint-soft text-brand"><CheckCircle size={36} /></span>
            <p className="text-[17px] text-muted">Thank you, {d.name}! Order <b className="text-navy-900">#{order.orderId}</b> of {formatINR(order.amount)} is confirmed.</p>
            <span className="rounded-full bg-page px-4 py-1.5 text-sm text-muted-2">Demo order — no real payment was taken</span>
            <Link to="/shop" onClick={closeBuy} className="btn-navy">Continue shopping</Link>
          </div>
        ) : (
          <form onSubmit={pay} className="flex min-h-0 flex-1 flex-col">
            <div className="flex flex-col gap-5 overflow-y-auto px-6 py-5">
              {/* Items */}
              <ul className="flex flex-col gap-3">
                {lines.map((l, k) => (
                  <li key={l.key} className="flex items-center gap-3 rounded-2xl bg-page p-2.5 pr-4">
                    <img src={l.image} alt="" className="size-16 rounded-xl bg-white object-contain p-1" />
                    <span className="min-w-0 flex-1">
                      <b className="block truncate font-head font-semibold">{l.name}</b>
                      <small className="text-muted-2">{l.pack} · {formatINR(l.unitPrice)}</small>
                    </span>
                    {!buy.fromCart ? <QtyStepper size="sm" value={l.qty} onChange={(q) => setQty(k, q)} /> : <span className="text-sm font-semibold">× {l.qty}</span>}
                  </li>
                ))}
              </ul>

              {/* Payment */}
              <fieldset>
                <legend className="mb-2.5 text-sm font-bold">Choose payment</legend>
                <div className="grid grid-cols-2 gap-2.5">
                  {methods.map((m) => (
                    <label key={m.id} className={`flex cursor-pointer flex-col gap-0.5 rounded-2xl border-[1.5px] p-3.5 ${method === m.id ? 'border-navy-700 bg-blue-soft ring-1 ring-navy-700' : 'border-line-strong hover:border-navy-700'}`}>
                      <input type="radio" name="method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="sr-only" />
                      <b className="text-[15px]">{m.label}</b>
                      <span className="text-[13px] text-muted-2">{m.note}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Delivery */}
              <fieldset className="grid grid-cols-2 gap-2.5">
                <legend className="mb-2.5 text-sm font-bold">Deliver to</legend>
                <input className={field} placeholder="Full name" aria-label="Full name" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} />
                <input className={field} placeholder="Mobile number" aria-label="Mobile number" inputMode="numeric" maxLength={10} value={d.phone} onChange={(e) => setD({ ...d, phone: e.target.value.replace(/\D/g, '') })} />
                <input className={`${field} col-span-2`} placeholder="House no., street, area, city" aria-label="Address" value={d.address} onChange={(e) => setD({ ...d, address: e.target.value })} />
                <input className={field} placeholder="Pincode" aria-label="Pincode" inputMode="numeric" maxLength={6} value={d.pin} onChange={(e) => setD({ ...d, pin: e.target.value.replace(/\D/g, '') })} />
              </fieldset>
              {err && <p role="alert" className="text-sm font-semibold text-[#C0392B]">{err}</p>}
            </div>

            <div className="flex flex-col gap-3 border-t border-line bg-white px-6 py-4">
              <div className="flex items-center justify-between text-[15px]">
                <span className="text-muted">Subtotal {formatINR(subtotal)}{fee ? ` + COD ${formatINR(fee)}` : ''} · <span className="font-semibold text-brand-dark">Free shipping</span></span>
                <b className="font-head text-xl">{formatINR(total)}</b>
              </div>
              <button disabled={busy} className="btn-primary min-h-[52px] w-full text-base disabled:opacity-60">
                <Lock size={18} /> {busy ? 'Processing…' : method === 'cod' ? `Place order · ${formatINR(total)}` : `Pay ${formatINR(total)}`}
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

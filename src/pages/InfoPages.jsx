import { useState } from 'react';
import { Link } from 'react-router-dom';
import { products, combos, formatINR, makeLine, UNIT_PRICE, COMBO_PRICE, COMBO_SAVING } from '../data/products.js';
import { termsEffective, termsIntro, termsSections } from '../data/terms.js';
import { business } from '../data/site.js';
import { useStore } from '../context/StoreContext.jsx';
import { Check, CheckCircle, Pin, Clock, Box, Truck } from '../components/Icons.jsx';

// ---------------------------------------------------------------------
// Shared page header
// ---------------------------------------------------------------------
function PageHead({ eyebrow, title, accent, text }) {
  return (
    <div className="border-b border-line bg-white">
      <div className="container-x flex flex-col gap-3 py-9 sm:py-14">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-2">
          <Link to="/" className="text-muted-2 hover:text-brand">Home</Link><span>/</span><span className="text-navy-900">{title} {accent}</span>
        </nav>
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="font-serif text-[40px] leading-none text-navy-900 sm:text-[60px]">{title} <span className="text-brand">{accent}</span></h1>
        {text && <p className="max-w-[620px] text-[15.5px] text-muted sm:text-[17px]">{text}</p>}
      </div>
    </div>
  );
}

const ingredientsOf = (id) => products.find((p) => p.id === id)?.ingredients || [];
const byId = (id) => products.find((p) => p.id === id);

// ---------------------------------------------------------------------
// Combo — the client's 3 combos, 2 sticks for ₹800 each
// ---------------------------------------------------------------------
export function Combo() {
  const { addToCart, openBuy, openCart } = useStore();
  return (
    <>
      <PageHead eyebrow="Combo offers" title="Better" accent="together" text={`Any 2 sticks for ${formatINR(COMBO_PRICE)} instead of ${formatINR(UNIT_PRICE * 2)}, with free delivery. Pick a ready combo or add any 2 to your cart — the combo price is applied automatically.`} />
      <div className="container-x grid grid-cols-1 gap-5 py-10 sm:grid-cols-2 sm:py-14 lg:grid-cols-3 lg:gap-6">
        {combos.map((c) => {
          const ps = c.items.map(byId);
          return (
            <article key={c.id} className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white">
              <div className="relative flex h-[280px] items-center justify-center gap-[6%] px-6 sm:h-[320px]" style={{ background: `linear-gradient(120deg, ${ps[0].bg}, ${ps[1].bg})` }}>
                {ps.map((p) => (
                  <img key={p.id} src={p.image} alt={p.name} className="h-[74%] w-auto max-w-[42%] object-contain" />
                ))}
                <span className="absolute left-4 top-4 rounded-full bg-navy-900 px-3 py-1.5 text-xs font-bold text-white">Save {formatINR(COMBO_SAVING)}</span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5 sm:p-6">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-dark">{c.tag}</span>
                <h2 className="text-[22px] font-semibold sm:text-2xl">{c.name}</h2>
                <p className="text-[14.5px] text-muted-2">{ps.map((p) => p.name).join(' + ')}</p>
                <span className="flex items-baseline gap-2.5">
                  <b className="font-head text-2xl">{formatINR(COMBO_PRICE)}</b>
                  <s className="text-muted-2">{formatINR(UNIT_PRICE * 2)}</s>
                  <span className="text-[13px] font-semibold text-brand-dark">+ free delivery</span>
                </span>
                <div className="mt-auto grid grid-cols-2 gap-2.5 pt-3">
                  <button onClick={() => { ps.forEach((p) => addToCart(p, 1, undefined, true)); openCart(); }} className="min-h-11 rounded-full border-[1.5px] border-navy-900 text-[13px] font-semibold uppercase text-navy-900 hover:bg-navy-900 hover:text-white">Add to cart</button>
                  <button onClick={() => openBuy(ps.map((p) => makeLine(p)))} className="min-h-11 rounded-full bg-brand text-[13px] font-semibold uppercase text-white hover:bg-brand-dark">Buy now</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------
// Know more ingredients
// ---------------------------------------------------------------------
const glossary = {
  'Natural potassium alum': 'A naturally occurring mineral salt — the crystal at the heart of every DriftOn stick.',
  Glycerine: 'Helps the crystal glide smoothly on damp skin.',
  'Palash extract': 'Extract of the bright orange Palash flower, long used in Indian traditions.',
  'Rose extract': 'A classic, gentle floral extract.',
  'Activated charcoal': 'Known for its deep-clean feel, ideal for active days.',
  Colour: 'Gives the crystal its signature shade.',
  Fragrance: 'A light scent that matches the variant.',
};

export function Ingredients() {
  return (
    <>
      <PageHead eyebrow="Know more" title="What's" accent="inside" text="Every DriftOn stick starts with natural potassium alum and glycerine. Here is the full ingredient list of each one." />
      <div className="container-x flex flex-col gap-5 py-10 sm:gap-6 sm:py-14">
        {products.map((p) => (
          <section key={p.id} className="grid grid-cols-1 overflow-hidden rounded-2xl border border-line bg-white md:grid-cols-[260px_1fr]">
            <div className="flex h-[240px] items-center justify-center md:h-auto md:min-h-[300px]" style={{ background: p.bg }}>
              <img src={p.image} alt={p.name} className="h-[200px] w-auto object-contain md:h-[240px]" />
            </div>
            <div className="flex flex-col gap-4 p-5 sm:p-8">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: p.accent }}>{p.tag}</span>
              <h2 className="text-[24px] font-semibold sm:text-[28px]">{p.name}</h2>
              <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                {p.ingredients.map((n, k) => (
                  <li key={n} className="flex items-start gap-3 rounded-2xl bg-page p-3.5 sm:p-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white font-head text-sm font-bold text-navy-900">{k + 1}</span>
                    <span><b className="block font-semibold">{n}</b><span className="text-sm text-muted-2">{glossary[n]}</span></span>
                  </li>
                ))}
              </ul>
              <Link to={`/product/${p.slug}`} className="btn-navy self-start">View product</Link>
            </div>
          </section>
        ))}
        <p className="text-sm text-muted-2">Always read the ingredient list printed on the pack before use.</p>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------
// Check your ingredient
// ---------------------------------------------------------------------
export function CheckIngredient() {
  const all = [...new Set(products.flatMap((p) => p.ingredients))];
  const [avoid, setAvoid] = useState([]);
  const toggle = (n) => setAvoid((a) => (a.includes(n) ? a.filter((x) => x !== n) : [...a, n]));

  return (
    <>
      <PageHead eyebrow="Check your ingredient" title="Find your" accent="match" text="Tap anything you want to avoid. We'll show which Drifton sticks suit you." />
      <div className="container-x grid grid-cols-1 gap-6 py-10 sm:py-14 lg:grid-cols-[360px_1fr] lg:gap-8">
        <div className="flex h-fit flex-col gap-4 rounded-2xl border border-line bg-white p-6 lg:sticky lg:top-6">
          <b className="font-head text-lg">I want to avoid…</b>
          <div className="flex flex-wrap gap-2">
            {all.map((n) => (
              <button key={n} onClick={() => toggle(n)} aria-pressed={avoid.includes(n)}
                className={`min-h-10 rounded-full px-3.5 text-sm font-semibold ${avoid.includes(n) ? 'bg-[#C0392B] text-white' : 'border-[1.5px] border-line-strong bg-white text-navy-900 hover:border-navy-700'}`}>
                {n}
              </button>
            ))}
          </div>
          {avoid.length > 0 && <button onClick={() => setAvoid([])} className="self-start text-sm font-semibold text-navy-700 underline">Clear</button>}
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:gap-5">
          {products.map((p) => {
            const ings = ingredientsOf(p.id);
            const hit = ings.filter((n) => avoid.includes(n));
            const ok = hit.length === 0;
            return (
              <li key={p.id} className={`flex flex-col overflow-hidden rounded-2xl border-2 bg-white transition ${ok ? 'border-brand' : 'border-line opacity-70'}`}>
                <div className="flex h-[200px] items-center justify-center sm:h-[220px]" style={{ background: p.bg }}><img src={p.image} alt={p.name} className="h-[170px] w-auto object-contain sm:h-[185px]" /></div>
                <div className="flex flex-col gap-2 p-3.5 sm:p-5">
                  <span className={`flex items-center gap-1.5 text-[13px] font-bold sm:text-sm ${ok ? 'text-brand-dark' : 'text-[#C0392B]'}`}>{ok ? <><Check size={16} /> Good match</> : `Contains ${hit.join(', ')}`}</span>
                  <b className="font-head text-[15px] font-semibold sm:text-lg">{p.name}</b>
                  <span className="text-[12.5px] text-muted-2 sm:text-sm">{ings.join(' · ')}</span>
                  <Link to={`/product/${p.slug}`} className="mt-2 text-sm font-semibold text-navy-700 underline">View product</Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------
// Terms & conditions — client's text lives in src/data/terms.js
// ---------------------------------------------------------------------
const slugify = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export function Terms() {
  return (
    <>
      <PageHead eyebrow="Legal" title="Terms &" accent="conditions" text={`Effective date: ${termsEffective}. Welcome to DriftOn™! ${termsIntro}`} />
      <div className="container-x grid grid-cols-1 gap-8 py-10 sm:py-14 lg:grid-cols-[280px_1fr] lg:gap-10">
        <nav aria-label="Sections" className="hidden h-fit flex-col gap-0.5 rounded-2xl border border-line bg-white p-3 lg:sticky lg:top-6 lg:flex">
          {termsSections.map((sec, k) => (
            <a key={sec.title} href={`#${slugify(sec.title)}`} className="rounded-xl px-3 py-2 text-[14px] font-medium text-navy-500 hover:bg-page hover:text-brand">{k + 1}. {sec.title}</a>
          ))}
        </nav>
        <ol className="flex min-w-0 flex-col gap-4">
          {termsSections.map((sec, k) => (
            <li key={sec.title} id={slugify(sec.title)} className="scroll-mt-28 rounded-2xl border border-line bg-white p-5 sm:p-7">
              <h2 className="mb-3 flex items-start gap-3 font-head text-[19px] font-semibold sm:text-[21px]">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-mint">{k + 1}</span>
                <span className="pt-0.5">{sec.title}</span>
              </h2>
              <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-muted">
                {sec.blocks.map((b, i) =>
                  b.h ? <h3 key={i} className="mt-2 font-head text-[16.5px] font-semibold text-navy-900">{b.h}</h3>
                  : b.ul ? <ul key={i} className="flex flex-col gap-1.5 pl-1">{b.ul.map((x) => <li key={x} className="flex gap-2.5"><span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand" />{x}</li>)}</ul>
                  : <p key={i} className="break-words">{b.p}</p>
                )}
              </div>
            </li>
          ))}
          <li className="rounded-2xl bg-navy-900 p-6 text-white sm:p-7">
            <b className="font-head text-lg">Thank you for choosing DriftOn™.</b>
            <p className="mt-1 text-ondark">We appreciate your trust and support. We are committed to providing a reliable and satisfying shopping experience.</p>
          </li>
        </ol>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------
// Track order  (DEMO — connect to your courier / order API)
// ---------------------------------------------------------------------
const stages = ['Order placed', 'Packed', 'Shipped', 'Out for delivery', 'Delivered'];

export function Track() {
  const [id, setId] = useState('');
  const [phone, setPhone] = useState('');
  const [res, setRes] = useState(null);
  const [err, setErr] = useState('');

  const submit = (e) => {
    e.preventDefault();
    setErr('');
    if (!id.trim() || !/^[6-9]\d{9}$/.test(phone)) return setErr('Enter your order ID and the 10-digit mobile number used for the order.');
    setRes({ id: id.trim().toUpperCase(), step: 2, eta: 'in 2–3 days' }); // DEMO status
  };

  return (
    <>
      <PageHead eyebrow="Track" title="Track your" accent="order" text="Enter your order ID and mobile number to see where your Drifton is." />
      <div className="container-x grid grid-cols-1 gap-6 py-10 sm:py-14 lg:grid-cols-2 lg:gap-8">
        <form onSubmit={submit} className="flex h-fit flex-col gap-4 rounded-2xl border border-line bg-white p-6 sm:p-8">
          <label className="flex flex-col gap-1.5 text-sm font-semibold">Order ID
            <input value={id} onChange={(e) => setId(e.target.value)} placeholder="e.g. DRF1234567" className="min-h-12 rounded-xl border-[1.5px] border-line-strong px-4 text-[15px] font-normal outline-none focus:border-navy-700" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">Mobile number
            <input value={phone} inputMode="numeric" maxLength={10} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="98765 43210" className="min-h-12 rounded-xl border-[1.5px] border-line-strong px-4 text-[15px] font-normal outline-none focus:border-navy-700" />
          </label>
          {err && <p role="alert" className="text-sm font-semibold text-[#C0392B]">{err}</p>}
          <button className="btn-primary self-start">Track order</button>
        </form>

        <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
          {res ? (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-full bg-mint-soft text-brand"><Truck size={22} /></span>
                <span><b className="block font-head text-lg">Order #{res.id}</b><span className="text-sm text-muted-2">Expected delivery {res.eta} · demo status</span></span>
              </div>
              <ol className="flex flex-col">
                {stages.map((s, k) => {
                  const done = k <= res.step;
                  return (
                    <li key={s} className="flex gap-4">
                      <span className="flex flex-col items-center">
                        <span className={`flex size-8 items-center justify-center rounded-full ${done ? 'bg-brand text-white' : 'bg-page text-muted-2'}`}>{done ? <Check size={16} /> : k + 1}</span>
                        {k < stages.length - 1 && <span className={`h-8 w-0.5 ${k < res.step ? 'bg-brand' : 'bg-line'}`} />}
                      </span>
                      <span className={`pt-1 font-semibold ${done ? 'text-navy-900' : 'text-muted-2'}`}>{s}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center text-muted-2">
              <Box size={40} />
              Your order status will appear here.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------
// Contact us
// ---------------------------------------------------------------------
export function Contact() {
  const { notify } = useStore();
  const [f, setF] = useState({ name: '', email: '', msg: '' });
  const send = (e) => {
    e.preventDefault();
    if (!f.name || !f.email.includes('@') || !f.msg) return notify('Please fill in all fields');
    setF({ name: '', email: '', msg: '' });
    notify('Thanks! We will get back to you soon.'); // DEMO — connect to email / CRM
  };
  const input = 'min-h-12 w-full rounded-xl border-[1.5px] border-line-strong px-4 text-[15px] font-normal outline-none focus:border-navy-700';
  return (
    <>
      <PageHead eyebrow="Contact us" title="We're here to" accent="help" text="Questions about an order, a product or a bulk enquiry? Write to us." />
      <div className="container-x grid grid-cols-1 gap-6 py-10 sm:py-14 lg:grid-cols-[1fr_400px] lg:gap-8">
        <form onSubmit={send} className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-semibold">Name<input className={input} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">Email<input type="email" className={input} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
          </div>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">Message<textarea rows={6} className={`${input} py-3`} value={f.msg} onChange={(e) => setF({ ...f, msg: e.target.value })} /></label>
          <button className="btn-primary self-start">Send message</button>
        </form>
        <aside className="flex flex-col gap-4 rounded-2xl bg-navy-900 p-7 text-white">
          <b className="font-head text-xl">{business.name}</b>
          <span className="flex gap-3 text-ondark"><span className="text-mint"><Pin /></span>{business.address}</span>
          <span className="flex gap-3 text-ondark"><span className="text-mint"><Clock size={18} /></span>{business.hours}</span>
          <a href={`mailto:${business.email}`} className="flex gap-3 break-all text-white hover:text-mint"><span className="text-mint"><CheckCircle size={18} /></span>{business.email}</a>
        </aside>
      </div>
    </>
  );
}

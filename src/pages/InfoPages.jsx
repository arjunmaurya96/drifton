import { useState } from 'react';
import { Link } from 'react-router-dom';
import { products, combos, formatINR, makeLine, UNIT_PRICE, COMBO_PRICE, COMBO_SAVING } from '../data/products.js';
import { termsEffective, termsIntro, termsSections } from '../data/terms.js';
import { business } from '../data/site.js';
import { useStore } from '../context/StoreContext.jsx';
import { Check, CheckCircle, Pin, Clock, Box, Truck, Mail, Arrow } from '../components/Icons.jsx';

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

// "Gyan" about the ingredients — shown at the bottom of the Know More Ingredients page.
// Photos: placeholders from our product shots until the client sends the real ingredient pictures.
const gyan = [
  { title: 'What is potassium alum?', img: '/assets/images/scenes/natural.webp', text: 'Potassium alum is a naturally occurring mineral salt that forms clear crystals. It has been used in personal care across India for generations — many households know it as "phitkari".' },
  { title: 'How does an alum stick work?', img: '/assets/images/scenes/charcoal.webp', text: 'Wet the crystal, glide it on clean, dry underarms and let it dry. It leaves a thin, invisible mineral layer — no white marks on clothes and no sticky feel.' },
  { title: 'Why glycerine?', img: '/assets/images/scenes/rose.webp', text: 'Glycerine helps the crystal glide smoothly on the skin, so applying it feels easy and comfortable every day.' },
  { title: 'Palash, rose & charcoal', img: '/assets/images/scenes/palash.webp', text: 'Palash extract (from the bright orange flame-of-the-forest flower), rose extract and activated charcoal give each variant its own character. The Natural stick keeps it simple with just alum and glycerine.' },
];

function IngredientGyan() {
  return (
    <section aria-labelledby="gyan" className="mt-6 rounded-2xl bg-navy-900 p-5 text-white sm:p-10">
      <span className="text-xs font-bold uppercase tracking-[2px] text-mint">Ingredient gyan</span>
      <h2 id="gyan" className="mt-2 font-serif text-[32px] font-normal leading-tight sm:text-[44px]">Good to <span className="text-mint">know</span></h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {gyan.map((g) => (
          <article key={g.title} className="overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
            <img src={g.img} alt="" loading="lazy" decoding="async" className="h-44 w-full object-cover object-center" />
            <div className="p-4">
              <h3 className="font-head text-[17px] font-semibold">{g.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ondark">{g.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// Order asked by the client: Natural, Palash, Charcoal, Rose
const ingredientOrder = ['natural', 'palash', 'charcoal', 'rose'];

export function Ingredients() {
  return (
    <>
      <PageHead eyebrow="Know more" title="What's" accent="inside" text="Every DriftOn roll on starts with natural potassium alum and glycerine. Here is the full ingredient list of each one." />
      <div className="container-wide flex flex-col gap-5 py-10 sm:gap-6 sm:py-14">
        {ingredientOrder.map(byId).map((p, k) => (
          // zig-zag: image left on 1st & 3rd, image right on 2nd & 4th
          <section key={p.id} className={`grid grid-cols-1 overflow-hidden rounded-2xl border border-line bg-white ${k % 2 ? 'md:grid-cols-[minmax(0,1fr)_340px] lg:grid-cols-[minmax(0,1fr)_400px]' : 'md:grid-cols-[340px_minmax(0,1fr)] lg:grid-cols-[400px_minmax(0,1fr)]'}`}>
            <div className={`flex items-center justify-center ${k % 2 ? 'md:order-2' : ''}`} style={{ background: p.bg }}>
              {/* ingredient image — all four are the same size (1194 × 1280) */}
              <img src={`/assets/images/ingredients/${p.id}.webp`} alt={`${p.name} ingredients`} loading="lazy" decoding="async" className="aspect-[1194/1280] w-full object-cover" />
            </div>
            <div className="flex flex-col justify-center gap-4 p-5 sm:p-8">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: p.accent }}>{p.tag}</span>
              <h2 className="text-[24px] font-semibold sm:text-[30px]">{p.name}</h2>
              <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                {p.ingredients.map((n, k) => (
                  <li key={n} className="flex items-start gap-3 rounded-2xl bg-page p-3.5 sm:p-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white font-head text-sm font-bold text-navy-900">{k + 1}</span>
                    <span><b className="block font-semibold">{n}</b><span className="text-sm text-muted-2">{glossary[n]}</span></span>
                  </li>
                ))}
              </ul>
              <Link to="/#shop" className="btn-navy self-start">View product</Link>
            </div>
          </section>
        ))}
        <IngredientGyan />
        <p className="text-sm text-muted-2">Always read the ingredient list printed on the pack before use.</p>
      </div>
    </>
  );
}


// ---------------------------------------------------------------------
// Terms & conditions — client's text lives in src/data/terms.js
// ---------------------------------------------------------------------
const slugify = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-');
// turns any email address in the text into a clickable mailto link
const withEmailLinks = (text) =>
  text.split(/([\w.+-]+@[\w-]+\.[\w.]+)/g).map((part, i) =>
    /@/.test(part) ? <a key={i} href={`mailto:${part}`} className="font-semibold text-navy-700 underline underline-offset-2 hover:text-brand">{part}</a> : part);

export function Terms() {
  const m = business.manufacturer;
  const rows = [
    ['Legal business name', business.legalName], ['Brand', 'DriftOn™'], ['Registered address', business.address],
    ['Customer care', <a key="e" href={`mailto:${business.email}`} className="font-semibold text-navy-700 underline">{business.email}</a>],
    ['Manufactured by', m.name], ['Manufacturer address', m.address], ['Licence / registration', m.licence],
  ];
  return (
    <div className="container-x py-8 sm:py-10">
      {/* header: business + manufacturer info (small font, as asked by the client) */}
      <header className="rounded-2xl border border-line bg-white p-4 sm:p-5">
        <h1 className="font-head text-[20px] font-semibold sm:text-[22px]">Terms &amp; Conditions</h1>
        <p className="mt-0.5 text-[12px] text-muted-2">Effective date: {termsEffective}</p>
        <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 border-t border-line pt-3 text-[12px] leading-snug sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(([k, v]) => (
            <div key={k} className="flex gap-1.5"><dt className="shrink-0 font-semibold text-navy-900">{k}:</dt><dd className="min-w-0 break-words text-muted">{v}</dd></div>
          ))}
        </dl>
      </header>

      <p className="mt-5 text-[13px] leading-relaxed text-muted">Welcome to DriftOn™! {termsIntro}</p>

      {/* the terms, in small font */}
      <ol className="mt-4 flex flex-col gap-4">
        {termsSections.map((sec, k) => (
          <li key={sec.title} id={slugify(sec.title)} className="scroll-mt-28">
            <h2 className="mb-1.5 font-head text-[14px] font-semibold text-navy-900">{k + 1}. {sec.title}</h2>
            <div className="flex flex-col gap-1.5 text-[12.5px] leading-relaxed text-muted">
              {sec.blocks.map((b, i) =>
                b.h ? <h3 key={i} className="mt-1 text-[13px] font-semibold text-navy-900">{b.h}</h3>
                : b.ul ? <ul key={i} className="flex list-disc flex-col gap-0.5 pl-5">{b.ul.map((x) => <li key={x}>{withEmailLinks(x)}</li>)}</ul>
                : <p key={i} className="break-words">{withEmailLinks(b.p)}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-6 border-t border-line pt-4 text-[12.5px] text-muted">Thank you for choosing DriftOn™. We appreciate your trust and support. We are committed to providing a reliable and satisfying shopping experience.</p>
    </div>
  );
}


// ---------------------------------------------------------------------
// Contact us
// ---------------------------------------------------------------------
const topics = ['Order & delivery', 'Returns & refunds', 'Product question', 'Bulk / wholesale', 'Something else'];

export function Contact() {
  const { notify } = useStore();
  const empty = { name: '', email: '', phone: '', order: '', topic: topics[0], msg: '' };
  const [f, setF] = useState(empty);
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: k === 'phone' ? e.target.value.replace(/\D/g, '') : e.target.value });
  const send = (e) => {
    e.preventDefault();
    if (!f.name.trim() || !/\S+@\S+\.\S+/.test(f.email) || !f.msg.trim()) return notify('Please add your name, a valid email and a message');
    setSent(true); setF(empty); // DEMO — connect to email / CRM
  };
  const input = 'min-h-12 w-full rounded-xl border-[1.5px] border-line-strong bg-white px-4 text-[15px] font-normal text-navy-900 outline-none transition focus:border-navy-700 focus:ring-4 focus:ring-blue-soft';
  const label = 'flex flex-col gap-1.5 text-[13.5px] font-semibold text-navy-900';
  const cards = [
    { Icon: Mail, title: 'Email us', value: business.email, href: `mailto:${business.email}`, note: 'We reply within 24 hours' },
    { Icon: Clock, title: 'Working hours', value: business.hours, note: 'Closed on public holidays' },
    { Icon: Pin, title: 'Registered office', value: business.address, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.mapQuery)}`, note: 'Get directions' },
  ];

  return (
    <>
      <PageHead eyebrow="Contact us" title="We're here to" accent="help" text="Questions about an order, a product or a bulk enquiry? Our customer care team will get back to you within one working day." />

      <div className="container-wide grid grid-cols-1 gap-6 pb-6 pt-10 sm:pb-8 sm:pt-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-8">
        <div className="rounded-2xl border border-line bg-white p-5 sm:p-9">
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-mint-soft text-brand"><CheckCircle size={34} /></span>
              <h2 className="text-2xl font-semibold">Thank you! Your message is on its way.</h2>
              <p className="max-w-[420px] text-muted">Our team will reply to your email within one working day.</p>
              <button onClick={() => setSent(false)} className="btn-line">Send another message</button>
            </div>
          ) : (
            <form onSubmit={send} className="flex flex-col gap-5" noValidate>
              <div>
                <h2 className="text-[24px] font-semibold sm:text-[28px]">Send us a message</h2>
                <p className="mt-1 text-[15px] text-muted-2">Fields marked * are required.</p>
              </div>
              <fieldset>
                <legend className="mb-2 text-[13.5px] font-semibold">What is it about?</legend>
                <div className="flex flex-wrap gap-2">
                  {topics.map((t) => (
                    <button type="button" key={t} onClick={() => setF({ ...f, topic: t })} aria-pressed={f.topic === t}
                      className={`min-h-10 rounded-full px-4 text-[13.5px] font-semibold transition ${f.topic === t ? 'bg-navy-900 text-white' : 'border-[1.5px] border-line-strong bg-white text-navy-900 hover:border-navy-700'}`}>{t}</button>
                  ))}
                </div>
              </fieldset>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className={label}>Full name *<input className={input} value={f.name} onChange={set('name')} autoComplete="name" /></label>
                <label className={label}>Email *<input type="email" className={input} value={f.email} onChange={set('email')} autoComplete="email" /></label>
                <label className={label}>Mobile number<input className={input} inputMode="numeric" maxLength={10} value={f.phone} onChange={set('phone')} autoComplete="tel" /></label>
                <label className={label}>Order ID (if any)<input className={input} placeholder="e.g. DRF1234567" value={f.order} onChange={set('order')} /></label>
              </div>
              <label className={label}>Message *<textarea rows={6} className={`${input} py-3`} value={f.msg} onChange={set('msg')} placeholder="Tell us how we can help…" /></label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[13px] text-muted-2">By sending, you agree to our <Link to="/terms" className="font-semibold text-navy-700 underline">Terms & Conditions</Link>.</span>
                <button className="btn-primary min-h-[52px] px-8">Send message</button>
              </div>
            </form>
          )}
        </div>

        <aside className="flex flex-col gap-5">
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <iframe title="DriftOn office on Google Maps" src={`https://www.google.com/maps?q=${encodeURIComponent(business.mapQuery)}&output=embed`}
              className="h-[260px] w-full border-0 sm:h-[300px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            <div className="p-5">
              <b className="font-head text-[17px]">{business.name}</b>
              <p className="mt-1 text-[14px] text-muted">{business.address}</p>
            </div>
          </div>
        </aside>
      </div>
      <div className="container-wide grid grid-cols-1 gap-4 pb-12 sm:grid-cols-3 sm:gap-5 sm:pb-16">
        {cards.map(({ Icon, title, value, href, note }) => {
          const Tag = href ? 'a' : 'div';
          return (
            <Tag key={title} {...(href ? { href, target: href.startsWith('http') ? '_blank' : undefined, rel: 'noreferrer' } : {})}
              className="flex items-start gap-4 rounded-2xl border border-line bg-white p-5 text-navy-900 transition hover:border-navy-700 sm:p-6">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-mint"><Icon size={22} /></span>
              <span className="min-w-0">
                <span className="block text-xs font-bold uppercase tracking-widest text-muted-2">{title}</span>
                <b className="mt-1 block break-words font-head text-[16px] font-semibold leading-snug">{value}</b>
                <span className="mt-1 block text-[13px] font-semibold text-brand-dark">{note}</span>
              </span>
            </Tag>
          );
        })}
      </div>

    </>
  );
}

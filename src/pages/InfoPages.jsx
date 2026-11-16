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
  'Natural potassium alum': 'A naturally occurring mineral salt — the crystal at the heart of every DriftOn roll on.',
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
    <section aria-labelledby="gyan" className="rounded-2xl bg-navy-900 p-5 text-white sm:p-10">
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
      {/* slim banner with the products */}
      <section className="container-wide pt-5 sm:pt-6">
        <div className="relative flex flex-col overflow-hidden rounded-[24px] bg-[linear-gradient(110deg,#0F1A3C_0%,#1C2E6B_60%,#2E7FA8_100%)] text-white sm:block">
          <div className="relative z-[2] flex flex-col gap-1.5 px-5 pb-3 pt-6 sm:max-w-[55%] sm:pb-8 sm:gap-2 sm:px-10 sm:py-8 lg:px-14">
            <span className="text-[11px] font-bold uppercase tracking-[2px] text-mint sm:text-xs">Know more</span>
            <h1 className="font-serif text-[30px] leading-none sm:text-[44px] lg:text-[52px]">What&apos;s <span className="text-mint">inside</span></h1>
            <p className="text-[13px] leading-snug text-ondark sm:text-[15.5px]">Every DriftOn roll on starts with natural potassium alum and glycerine. Here is the full ingredient list of each one.</p>
          </div>
          <img src="/assets/images/hero-products/all-four.webp" alt="" aria-hidden="true"
            className="mx-auto h-[110px] w-auto object-contain object-bottom sm:absolute sm:bottom-0 sm:right-8 sm:mx-0 sm:h-[86%] sm:max-w-[42%] lg:right-14" />
        </div>
      </section>

      <div className="container-wide flex flex-col gap-6 py-8 sm:gap-8 sm:py-12">
        {ingredientOrder.map(byId).map((p, k) => (
          // zig-zag: image left on 1st & 3rd, right on 2nd & 4th
          <section key={p.id} className="overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_20px_60px_-30px_rgba(15,26,60,.35)]">
            <div className={`grid grid-cols-1 items-stretch ${k % 2 ? 'lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]' : 'lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]'}`}>
              {/* image panel — the ingredient image is shown whole, raised on a soft colour panel */}
              <div className={`flex items-center justify-center p-5 sm:p-7 lg:p-9 ${k % 2 ? 'lg:order-2' : ''}`} style={{ background: `linear-gradient(160deg, ${p.bg} 0%, #FFFFFF 100%)` }}>
                <img src={`/assets/images/ingredients/${p.id}.webp`} alt={`${p.name} ingredients`} loading="lazy" decoding="async"
                  className="block aspect-[1194/1280] w-full max-w-[420px] rounded-[20px] object-cover shadow-[0_24px_50px_-20px_rgba(15,26,60,.55)] ring-4 ring-white" />
              </div>
              {/* text */}
              <div className="flex flex-col justify-center gap-5 p-6 sm:p-9 lg:p-12">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11.5px] font-bold uppercase tracking-[2px]" style={{ background: p.bg, color: p.accent }}>{p.tag}</span>
                  <h2 className="mt-3 font-head text-[26px] font-bold leading-tight tracking-tight sm:text-[34px]">{p.name}</h2>
                  <p className="mt-2 max-w-[560px] text-[15px] leading-relaxed text-muted">{p.description}</p>
                </div>
                <div>
                  <span className="mb-3 block text-[12px] font-bold uppercase tracking-[2px] text-muted-2">{p.ingredients.length} ingredients</span>
                  <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {p.ingredients.map((n, i) => (
                      <li key={n} className="flex items-start gap-3 rounded-2xl border border-line bg-page p-3.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white" style={{ background: p.accent }}>{i + 1}</span>
                        <span className="min-w-0"><b className="block text-[15px] font-semibold">{n}</b><span className="text-[13px] leading-snug text-muted-2">{glossary[n]}</span></span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link to="/#shop" className="btn-navy self-start">View product</Link>
              </div>
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
// Contact topics — Distributor enquiry & Retailers added for the client.
// For business topics the form asks for company + city instead of an order ID.
const topics = [
  { id: 'order', label: 'Order & delivery', icon: '📦' },
  { id: 'returns', label: 'Returns & refunds', icon: '↩️' },
  { id: 'product', label: 'Product question', icon: '💧' },
  { id: 'distributor', label: 'Distributor enquiry', icon: '🤝', business: true },
  { id: 'retailer', label: 'Retailers', icon: '🏪', business: true },
  { id: 'bulk', label: 'Bulk / wholesale', icon: '📊', business: true },
  { id: 'other', label: 'Something else', icon: '💬' },
];

export function Contact() {
  const { notify } = useStore();
  const empty = { name: '', email: '', phone: '', order: '', company: '', city: '', topic: topics[0].id, msg: '' };
  const [f, setF] = useState(empty);
  const [sent, setSent] = useState(false);
  const topic = topics.find((t) => t.id === f.topic);
  const set = (k) => (e) => setF({ ...f, [k]: k === 'phone' ? e.target.value.replace(/\D/g, '') : e.target.value });
  const send = (e) => {
    e.preventDefault();
    if (!f.name.trim() || !/\S+@\S+\.\S+/.test(f.email) || !f.msg.trim()) return notify('Please add your name, a valid email and a message');
    if (topic.business && (!f.company.trim() || !f.city.trim() || f.phone.length !== 10)) return notify('Please add your business name, city and 10-digit mobile number');
    setSent(true); setF(empty); // DEMO — connect to email / CRM
  };
  const input = 'min-h-[52px] w-full rounded-2xl border-[1.5px] border-line bg-page px-4 text-[15px] font-normal text-navy-900 outline-none transition placeholder:text-muted-2 focus:border-navy-700 focus:bg-white focus:ring-4 focus:ring-blue-soft';
  const label = 'flex flex-col gap-1.5 text-[13.5px] font-semibold text-navy-900';
  const cards = [
    { Icon: Mail, title: 'Email us', value: business.email, href: `mailto:${business.email}`, note: 'We reply within 24 hours' },
    { Icon: Clock, title: 'Working hours', value: business.hours, note: 'Closed on public holidays' },
    { Icon: Pin, title: 'Registered office', value: business.address, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.mapQuery)}`, note: 'Get directions' },
  ];

  return (
    <>
      {/* hero */}
      <section className="container-wide pt-5 sm:pt-6">
        <div className="relative flex flex-col overflow-hidden rounded-[28px] bg-[linear-gradient(115deg,#0F1A3C_0%,#1C2E6B_55%,#17703D_120%)] text-white sm:block">
          <span aria-hidden="true" className="absolute -right-20 -top-24 size-[340px] rounded-full bg-mint/15 blur-3xl" />
          <div className="relative z-[2] flex flex-col gap-3 px-6 pb-4 pt-8 sm:max-w-[58%] sm:px-10 sm:py-12 lg:px-14">
            <span className="inline-flex items-center gap-2 self-start rounded-full bg-white/10 px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-[2px] text-mint ring-1 ring-white/15">
              <span className="size-1.5 animate-pulse rounded-full bg-mint" /> We&apos;re online · Mon–Sat
            </span>
            <h1 className="font-serif text-[38px] leading-[1.02] sm:text-[52px] lg:text-[60px]">We&apos;re here to <span className="text-mint">help</span></h1>
            <p className="max-w-[520px] text-[15px] leading-relaxed text-ondark sm:text-[16.5px]">Questions about an order or a product? Want to become a distributor or stock DriftOn in your store? Write to us — we reply within one working day.</p>
            <div className="mt-2 flex flex-wrap gap-2.5">
              <a href={`mailto:${business.email}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-mint px-5 text-[14px] font-bold text-navy-900 hover:bg-white"><Mail size={18} /> Email us</a>
              <button type="button" onClick={() => { setF({ ...f, topic: 'distributor' }); document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/10 px-5 text-[14px] font-semibold text-white ring-1 ring-white/25 hover:bg-white/20">🤝 Become a distributor</button>
            </div>
          </div>
          <img src="/assets/images/hero-products/all-four.webp" alt="" aria-hidden="true"
            className="relative mx-auto h-[120px] w-auto object-contain sm:absolute sm:bottom-0 sm:right-8 sm:mx-0 sm:h-[78%] sm:max-w-[38%] lg:right-14" />
        </div>
      </section>

      {/* quick contact cards */}
      <div className="container-wide grid grid-cols-1 gap-4 pt-6 sm:grid-cols-3 sm:gap-5">
        {cards.map(({ Icon, title, value, href, note }) => {
          const Tag = href ? 'a' : 'div';
          return (
            <Tag key={title} {...(href ? { href, target: href.startsWith('http') ? '_blank' : undefined, rel: 'noreferrer' } : {})}
              className="group flex items-start gap-4 rounded-[22px] border border-line bg-white p-5 text-navy-900 shadow-[0_10px_30px_-18px_rgba(15,26,60,.35)] transition hover:-translate-y-0.5 hover:border-navy-700 sm:p-6">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-mint transition group-hover:bg-brand group-hover:text-white"><Icon size={22} /></span>
              <span className="min-w-0">
                <span className="block text-xs font-bold uppercase tracking-widest text-muted-2">{title}</span>
                <b className="mt-1 block break-words font-head text-[15.5px] font-semibold leading-snug">{value}</b>
                <span className="mt-1 block text-[13px] font-semibold text-brand-dark">{note}</span>
              </span>
            </Tag>
          );
        })}
      </div>

      {/* form + side */}
      <div id="contact-form" className="container-wide grid scroll-mt-24 grid-cols-1 gap-6 pb-14 pt-6 sm:pb-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-8">
        <div className="rounded-[28px] border border-line bg-white p-5 shadow-[0_24px_60px_-30px_rgba(15,26,60,.35)] sm:p-9">
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-mint-soft text-brand"><CheckCircle size={34} /></span>
              <h2 className="text-2xl font-semibold">Thank you! Your message is on its way.</h2>
              <p className="max-w-[420px] text-muted">Our team will reply to your email within one working day.</p>
              <button onClick={() => setSent(false)} className="btn-line">Send another message</button>
            </div>
          ) : (
            <form onSubmit={send} className="flex flex-col gap-6" noValidate>
              <div>
                <h2 className="font-head text-[26px] font-bold tracking-tight sm:text-[32px]">Send us a message</h2>
                <p className="mt-1 text-[15px] text-muted-2">Fields marked * are required.</p>
              </div>
              <fieldset>
                <legend className="mb-3 text-[14px] font-semibold">What is it about?</legend>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
                  {topics.map((t) => (
                    <button type="button" key={t.id} onClick={() => setF({ ...f, topic: t.id })} aria-pressed={f.topic === t.id}
                      className={`flex min-h-[52px] items-center gap-2.5 rounded-2xl px-3.5 text-left text-[13.5px] font-semibold leading-tight transition ${f.topic === t.id ? 'bg-navy-900 text-white shadow-md' : 'border-[1.5px] border-line bg-white text-navy-900 hover:border-navy-700'}`}>
                      <span className="text-[18px]" aria-hidden="true">{t.icon}</span>{t.label}
                    </button>
                  ))}
                </div>
                {topic.business && (
                  <p className="mt-3 rounded-2xl bg-mint-soft px-4 py-3 text-[13.5px] font-medium text-brand-dark">
                    {topic.id === 'retailer' ? 'Stock DriftOn in your store — share your store details and our team will send you retailer pricing.' : 'Interested in distributing DriftOn in your area? Share your details and our sales team will call you.'}
                  </p>
                )}
              </fieldset>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className={label}>Full name *<input className={input} placeholder="Your name" value={f.name} onChange={set('name')} autoComplete="name" /></label>
                <label className={label}>Email *<input type="email" className={input} placeholder="you@example.com" value={f.email} onChange={set('email')} autoComplete="email" /></label>
                <label className={label}>Mobile number{topic.business ? ' *' : ''}<input className={input} placeholder="10-digit mobile" inputMode="numeric" maxLength={10} value={f.phone} onChange={set('phone')} autoComplete="tel" /></label>
                {topic.business ? (
                  <>
                    <label className={label}>{topic.id === 'retailer' ? 'Store name *' : 'Business / company name *'}<input className={input} value={f.company} onChange={set('company')} autoComplete="organization" /></label>
                    <label className={`${label} sm:col-span-2`}>City / area *<input className={input} placeholder="e.g. Delhi NCR" value={f.city} onChange={set('city')} autoComplete="address-level2" /></label>
                  </>
                ) : (
                  <label className={label}>Order ID (if any)<input className={input} placeholder="e.g. DRF1234567" value={f.order} onChange={set('order')} /></label>
                )}
              </div>
              <label className={label}>Message *<textarea rows={5} className={`${input} py-3`} value={f.msg} onChange={set('msg')} placeholder="Tell us how we can help…" /></label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[13px] text-muted-2">By sending, you agree to our <Link to="/terms" className="font-semibold text-navy-700 underline">Terms & Conditions</Link>.</span>
                <button className="btn-primary min-h-[52px] px-8">Send message</button>
              </div>
            </form>
          )}
        </div>

        <aside className="flex flex-col gap-5">
          <div className="overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_24px_60px_-30px_rgba(15,26,60,.35)]">
            <iframe title="DriftOn office on Google Maps" src={`https://www.google.com/maps?q=${encodeURIComponent(business.mapQuery)}&output=embed`}
              className="h-[240px] w-full border-0 sm:h-[280px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            <div className="flex flex-col gap-1 p-5 sm:p-6">
              <b className="font-head text-[17px]">{business.name}</b>
              <p className="text-[14px] text-muted">{business.address}</p>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[28px] bg-navy-900 p-6 text-white sm:p-7">
            <span aria-hidden="true" className="absolute -bottom-16 -right-10 size-48 rounded-full bg-brand/30 blur-2xl" />
            <span className="relative text-[11.5px] font-bold uppercase tracking-[2px] text-mint">Partner with us</span>
            <h3 className="relative mt-2 font-head text-[22px] font-bold leading-tight">Distributors &amp; retailers welcome</h3>
            <ul className="relative mt-4 flex flex-col gap-2.5 text-[14.5px] text-ondark">
              {['Attractive margins on all 4 variants', 'Marketing support & product samples', 'Quick dispatch across India'].map((x) => (
                <li key={x} className="flex items-start gap-2.5"><span className="mt-0.5 text-mint"><Check size={16} /></span>{x}</li>
              ))}
            </ul>
            <div className="relative mt-5 flex flex-wrap gap-2.5">
              {['distributor', 'retailer'].map((id) => (
                <button key={id} type="button" onClick={() => { setF({ ...f, topic: id }); document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                  className="min-h-10 rounded-full bg-white px-4 text-[13.5px] font-semibold text-navy-900 hover:bg-mint">{id === 'distributor' ? 'Distributor enquiry' : 'Retailer enquiry'}</button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

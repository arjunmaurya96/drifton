import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { products, packs, offer, productInfo, sampleReviews, getProductBySlug, formatINR, makeLine, priceFor, UNIT_PRICE, DELIVERY_FEE } from '../data/products.js';
import { useStore } from '../context/StoreContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import ProductMarquee from '../components/ProductMarquee.jsx';
import ProductGallery from '../components/product/ProductGallery.jsx';
import ReviewsBlock from '../components/product/ReviewsBlock.jsx';
import Faq from '../components/product/Faq.jsx';
import StickyBuyBar from '../components/product/StickyBuyBar.jsx';
import { QtyStepper } from '../components/CartDrawer.jsx';
import { Stars } from '../components/Reviews.jsx';
import NotFound from './NotFound.jsx';
import { Heart, Pin, Truck, Shield, Return, Gem, CheckCircle, Drop, Clock, Box, Leaf, Sparkle } from '../components/Icons.jsx';

const loveIcons = { gem: () => <Gem size={30} />, check: () => <CheckCircle size={28} />, drop: () => <Drop size={28} />, clock: () => <Clock size={28} />, box: () => <Box size={28} />, leaf: () => <Leaf size={28} /> };
const toc = [
  ['description', 'Description'],
  ['ingredients', 'Ingredients'],
  ['works', 'How does it work'],
  ['details', 'Product details'],
  ['care', 'Care instructions'],
  ['info', 'Product information'],
];

const Block = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-28 rounded-[24px] border border-line bg-white p-5 sm:p-9">
    <h2 className="mb-5 text-[24px] font-bold tracking-tight sm:text-[28px]">{title}</h2>
    {children}
  </section>
);

const Table = ({ rows }) => (
  <dl className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
    {rows.map(([k, v]) => (
      <div key={k} className="grid grid-cols-[140px_1fr] gap-4 px-5 py-3.5 text-[15px] sm:grid-cols-[200px_1fr]">
        <dt className="font-semibold text-navy-900">{k}</dt>
        <dd className="text-muted">{v}</dd>
      </div>
    ))}
  </dl>
);

export default function ProductDetail() {
  const { slug } = useParams();
  const product = getProductBySlug(slug);
  const navigate = useNavigate();
  const { addToCart, toggleWish, wishlist, cart, openBuy } = useStore();

  const [pack, setPack] = useState(packs[0]);
  const [qty, setQty] = useState(1);
  const [pin, setPin] = useState('');
  const [pinMsg, setPinMsg] = useState('');

  useEffect(() => { setPack(packs[0]); setQty(1); setPinMsg(''); }, [slug]);

  // Gallery: product video (if any) + photo framings. Replace with real angle shots/videos.
  const media = useMemo(() => {
    if (!product) return [];
    const imgs = [
      { type: 'image', src: product.scene, cover: true },
      { type: 'image', src: product.image },
      { type: 'image', src: product.image, pos: 'center 20%', scale: 1.7 },
      { type: 'image', src: product.image, pos: 'center 85%', scale: 1.5 },
    ];
    if (product.video) imgs.splice(1, 0, { type: 'video', src: product.video, poster: product.poster });
    return imgs;
  }, [product]);

  if (!product) return <NotFound />;

  const reviews = sampleReviews;
  const rating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const unit = priceFor(pack.multiplier); // price of one pack
  const total = priceFor(pack.multiplier * qty);
  const inWish = wishlist.includes(product.id);
  const inCart = cart.filter((l) => l.id === product.id).reduce((s, l) => s + l.qty, 0);
  const related = products.filter((p) => p.id !== product.id);

  const add = () => addToCart(product, qty, pack);
  const buy = () => openBuy([makeLine(product, qty, pack)]);
  const checkPin = (e) => {
    e.preventDefault();
    setPinMsg(/^\d{6}$/.test(pin) ? `Delivery available to ${pin}. Usually ships in 1–2 days.` : 'Please enter a valid 6-digit pincode.');
  };

  return (
    <>
      <div className="container-x">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 py-6 text-sm text-muted-2">
          <Link to="/" className="text-muted-2 hover:text-brand">Home</Link><span>/</span>
          <Link to="/shop" className="text-muted-2 hover:text-brand">Shop</Link><span>/</span>
          <b className="font-semibold text-navy-900">{product.name}</b>
        </nav>

        <div className="grid grid-cols-1 items-start gap-10 pb-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-14">
          <ProductGallery key={product.id} media={media} name={product.name} badge={product.badge} bg={product.bg} />

          {/* ---------- Buy box ---------- */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-[13px] font-bold uppercase tracking-widest" style={{ color: product.accent }}>{product.tag}</span>
              <h1 className="text-[34px] font-bold leading-tight tracking-tight sm:text-[44px]">{product.name}</h1>
              <a href="#product-reviews" className="flex items-center gap-2 text-sm font-medium text-muted-2 hover:text-navy-900">
                <Stars value={rating} size={18} /> {rating.toFixed(1)} · {reviews.length} sample reviews
              </a>
            </div>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <b className="font-head text-4xl font-bold">{formatINR(unit)}</b>
              {pack.multiplier > 1 ? <s className="text-lg text-[#6B7493]">{formatINR(UNIT_PRICE * pack.multiplier)}</s> : <span className="text-[15px] font-semibold text-muted">+ delivery</span>}
              <span className="w-full text-[13.5px] text-muted-2">Inclusive of all taxes · {pack.multiplier > 1 ? 'free delivery on combos' : `delivery ${formatINR(DELIVERY_FEE)}, free on any 2 sticks`}</span>
            </div>

            <div className="flex items-center gap-3.5 rounded-2xl border border-dashed border-brand bg-mint-soft px-4 py-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white"><Sparkle size={18} /></span>
              <span>
                <b className="block font-head font-semibold text-brand-dark">{offer.title}</b>
                <small className="text-[13px] text-muted">{offer.note}</small>
              </span>
            </div>

            <p className="text-[16.5px] leading-relaxed text-muted">{product.description}</p>

            <div>
              <span className="mb-2.5 block text-sm font-bold">Variant: <span className="font-medium text-muted-2">{product.short}</span></span>
              <div className="flex flex-wrap gap-2.5">
                {products.map((p) => (
                  <Link key={p.id} to={`/product/${p.slug}`} aria-current={p.id === product.id}
                    className={`flex items-center gap-2.5 rounded-full border-[1.5px] py-1.5 pl-1.5 pr-4 text-[14.5px] font-semibold text-navy-900 transition ${p.id === product.id ? 'border-navy-700 bg-blue-soft' : 'border-line-strong bg-white hover:border-navy-700'}`}>
                    <span className="flex size-[34px] items-center justify-center rounded-full bg-white p-0.5"><img src={p.image} alt="" className="h-full w-auto object-contain" /></span>{p.short}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-2.5 block text-sm font-bold">Pack size</span>
              <div className="grid grid-cols-2 gap-2.5">
                {packs.map((p) => {
                  const on = p.id === pack.id;
                  return (
                    <button key={p.id} onClick={() => setPack(p)} aria-pressed={on}
                      className={`flex flex-col gap-1 rounded-2xl border-[1.5px] bg-white p-3.5 text-left transition ${on ? 'border-navy-700 bg-blue-soft ring-1 ring-navy-700' : 'border-line-strong hover:border-navy-700'}`}>
                      <b className="text-[15px]">{p.label}</b>
                      <span className="font-head text-lg font-bold">{formatINR(priceFor(p.multiplier))}</span>
                      <small className="text-[13px] font-semibold text-brand-dark">{p.note}</small>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="text-sm font-bold">Quantity <span className="font-medium text-muted-2">({inCart} in cart)</span></span>
              <div id="main-buy" className="flex items-center gap-2 sm:gap-3">
                <QtyStepper value={qty} onChange={(q) => setQty(Math.max(1, q))} />
                <button className="btn-navy min-h-[54px] min-w-0 flex-1 px-3 sm:px-6" onClick={add}><span className="hidden sm:inline">Add to cart ·&nbsp;</span><span className="sm:hidden">Add ·&nbsp;</span>{formatINR(total)}</button>
                <button className="icon-btn-outline size-[54px] shrink-0" onClick={() => toggleWish(product.id)} aria-pressed={inWish} aria-label="Wishlist"><Heart filled={inWish} /></button>
              </div>
              <button className="btn-primary min-h-[54px] w-full text-base" onClick={buy}>Buy now</button>
            </div>

            <form onSubmit={checkPin}>
              <span className="mb-2.5 block text-sm font-bold">Check delivery</span>
              <div className="flex items-center gap-2 rounded-full border-[1.5px] border-line-strong bg-white py-1.5 pl-4 pr-1.5">
                <Pin />
                <input inputMode="numeric" maxLength={6} placeholder="Enter pincode" aria-label="Pincode" value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} className="min-w-0 flex-1 text-[15px] outline-none" />
                <button className="btn-navy min-h-[42px] px-5">Check</button>
              </div>
              {pinMsg && <p className="mt-2 text-sm font-semibold text-brand-dark">{pinMsg}</p>}
            </form>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {[[Truck, 'Free delivery on combos'], [Shield, 'Secure checkout'], [Return, '48-hour returns']].map(([I, t]) => (
                <span key={t} className="flex items-center gap-2.5 rounded-2xl border border-line bg-white p-3.5 text-[13.5px] font-semibold text-navy-700">
                  <span className="text-brand"><I size={22} /></span>{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Why you'll love it ---------- */}
      <section className="bg-navy-900 py-16 text-white">
        <div className="container-x">
          <h2 className="mb-10 text-center text-4xl font-bold tracking-tight">Why you'll <span className="text-mint">love it?</span></h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {productInfo.loveIt.map(({ title, icon }) => {
              const I = loveIcons[icon];
              return (
                <div key={title} className="flex flex-col items-center gap-3.5 rounded-3xl bg-white/5 p-6 text-center ring-1 ring-white/10 transition hover:bg-white/10">
                  <span className="flex size-16 items-center justify-center rounded-full bg-mint text-navy-900"><I /></span>
                  <b className="font-head text-[16px] font-semibold leading-snug">{title}</b>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- Detail sections with sticky contents ---------- */}
      <div className="container-x grid grid-cols-1 gap-8 py-20 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <nav aria-label="On this page" className="sticky top-[100px] flex flex-col gap-1 rounded-[24px] border border-line bg-white p-4">
            <span className="px-3 pb-2 text-xs font-bold uppercase tracking-widest text-muted-2">On this page</span>
            {toc.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="rounded-xl px-3 py-2.5 text-[15px] font-medium text-navy-500 hover:bg-page hover:text-brand">{label}</a>
            ))}
          </nav>
        </aside>

        <div className="flex flex-col gap-6">
          <Block id="description" title="Description">
            <p className="text-[16.5px] leading-loose text-muted">{product.description} Drifton is a simple, mineral-based way to stay fresh every day. Just wet the crystal, glide it on, and go.</p>
          </Block>

          <Block id="ingredients" title="Ingredients">
            <ul className="flex flex-wrap gap-2.5">
              {product.ingredients.map((n) => (
                <li key={n} className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[15px] font-semibold text-navy-900" style={{ background: product.bg }}>
                  <span className="size-2 rounded-full" style={{ background: product.accent }} />{n}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[14.5px] leading-relaxed text-muted">{product.ingredientNote} Always read the label before use.</p>
          </Block>

          <Block id="works" title="How does it work">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {productInfo.howItWorks.map((w, i) => (
                <div key={w.title} className="flex flex-col gap-2 rounded-3xl bg-page p-6">
                  <span className="font-head text-3xl font-bold text-brand">0{i + 1}</span>
                  <b className="font-head text-xl font-semibold">{w.title}</b>
                  <p className="leading-relaxed text-muted">{w.text}</p>
                </div>
              ))}
            </div>
          </Block>

          <Block id="details" title="Product details"><Table rows={productInfo.details} /></Block>

          <Block id="care" title="Care instructions">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {productInfo.care.map((c, i) => (
                <div key={c.title} className="flex items-start gap-3.5 rounded-2xl bg-page p-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-navy-700 font-head text-sm font-bold text-mint">{i + 1}</span>
                  <span>
                    <b className="block font-semibold">{c.title}</b>
                    <span className="text-[14px] text-muted-2">{c.text}</span>
                  </span>
                </div>
              ))}
            </div>
          </Block>

          <Block id="info" title="Product information"><Table rows={productInfo.legal} /></Block>
        </div>
      </div>

      <ProductMarquee dark />
      <ReviewsBlock reviews={reviews} />
      <Faq items={productInfo.faqs} />

      <section className="pb-24">
        <div className="container-wide">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 px-2">
            <div className="flex flex-col gap-3">
              <span className="eyebrow">You may also like</span>
              <h2 className="h2">More from <span className="text-brand">Drifton</span></h2>
            </div>
            <button className="btn-line" onClick={() => navigate('/shop')}>View all</button>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      <StickyBuyBar product={product} rating={rating} price={total} qty={qty} setQty={setQty} onAdd={add} onBuy={buy} watchId="main-buy" />
    </>
  );
}

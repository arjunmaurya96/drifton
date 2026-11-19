import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { products, packs, productInfo, sampleReviews, getProductBySlug, formatINR, makeLine, UNIT_PRICE } from '../data/products.js';
import { useStore } from '../context/StoreContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import ProductMarquee from '../components/ProductMarquee.jsx';
import ProductGallery from '../components/product/ProductGallery.jsx';
import StickyBuyBar from '../components/product/StickyBuyBar.jsx';
import { Stars } from '../components/Reviews.jsx';
import NotFound from './NotFound.jsx';
import { Truck, Shield, Return, Gem, CheckCircle, Drop, Clock, Box, Leaf } from '../components/Icons.jsx';

const loveIcons = {
  gem: () => <Gem size={30} />,
  check: () => <CheckCircle size={28} />,
  drop: () => <Drop size={28} />,
  clock: () => <Clock size={28} />,
  box: () => <Box size={28} />,
  leaf: () => <Leaf size={28} />,
};

const variantColors = {
  palash: 'Botanical Orange',
  charcoal: 'Smoky Charcoal',
  rose: 'Soft Pink',
  natural: 'Clear Crystal',
};

export default function ProductDetail() {
  const { slug } = useParams();
  const product = getProductBySlug(slug);
  const navigate = useNavigate();
  const { addToCart, cart, openBuy } = useStore();

  const defaultPack = packs[0];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // Gallery: product video (if any) + photo framings
  const media = useMemo(() => {
    if (!product) return [];
    const ingr = { palash: 'palash', charcoal: 'charcoal', rose: 'rose', natural: 'natural' }[product.id];
    const imgs = [
      product.card && { type: 'image', src: product.card, label: 'Studio' },
      { type: 'image', src: product.image, fit: 'contain', stage: true, label: 'Product' },
      { type: 'image', src: product.scene, pos: '50% 45%', label: 'Natural' },
      ingr && { type: 'image', src: `/assets/images/ingredients/${ingr}.webp`, fit: 'contain', bg: '#fff', label: 'Ingredients' },
    ].filter(Boolean);
    if (product.video) imgs.splice(1, 0, { type: 'video', src: product.video, poster: product.poster });
    return imgs;
  }, [product]);

  if (!product) return <NotFound />;

  const reviews = sampleReviews;
  const rating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const unit = UNIT_PRICE;
  const inCart = cart.filter((l) => l.id === product.id).reduce((s, l) => s + l.qty, 0);
  const related = products.filter((p) => p.id !== product.id);

  const add = () => addToCart(product, 1, defaultPack);
  const buy = () => openBuy([makeLine(product, 1, defaultPack)]);

  return (
    <>
      <div className="container-x">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 py-4 text-sm text-muted-2">
          <Link to="/" className="text-muted-2 hover:text-brand">Home</Link>
          <span>/</span>
          <Link to="/#shop" className="text-muted-2 hover:text-brand">Shop</Link>
          <span>/</span>
          <b className="font-semibold text-navy-900">{product.name}</b>
        </nav>

        {/* Main Product Hero Grid */}
        <div className="grid grid-cols-1 items-start gap-8 pb-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:gap-10 xl:gap-12">
          {/* Left Column: Big Product Image Gallery with precisely aligned illustration text */}
          <div className="flex flex-col">
            <ProductGallery key={product.id} media={media} name={product.name} badge={product.badge} bg={product.bg} />
          </div>

          {/* Right Column: In front of product ("product ke samne") */}
          <div className="flex flex-col gap-5 rounded-[28px] border border-line bg-white p-6 shadow-[0_24px_60px_-44px_rgba(15,26,60,.4)] sm:p-7">
            {/* Title & Reviews */}
            <div className="flex flex-col gap-2">
              <h1 className="text-[28px] font-extrabold leading-[1.12] tracking-tight text-navy-900 sm:text-[34px]">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-2">
                <Stars value={rating} size={17} />
                <span>{rating.toFixed(1)} · {reviews.length} verified reviews</span>
              </div>
            </div>

            {/* Pricing Box */}
            <div className="flex flex-col gap-1 rounded-2xl border border-line bg-page px-4.5 py-3.5">
              <div className="flex items-baseline gap-3">
                <b className="font-head text-[34px] font-extrabold text-navy-900">{formatINR(unit)}</b>
                <span className="text-[14px] font-semibold text-muted">+ delivery</span>
              </div>
              <span className="text-[13.5px] font-semibold text-brand">
                🎉 Combo Offer: Any 2 roll ons for ₹800 (Free Delivery)
              </span>
              <span className="text-[12px] text-muted-2">
                Inclusive of all taxes. Discounts applied automatically at checkout.
              </span>
            </div>

            {/* Variant Selector */}
            <div>
              <span className="mb-2 block text-sm font-bold text-navy-900">
                Variant: <span className="font-semibold text-brand">{product.short}</span>
              </span>
              <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
                {products.filter((p) => !p.hidden).map((p) => (
                  <Link
                    key={p.id}
                    to={`/product/${p.slug}`}
                    aria-current={p.id === product.id}
                    className={`flex flex-col overflow-hidden rounded-2xl border-[1.5px] bg-white text-center transition ${
                      p.id === product.id
                        ? 'border-brand ring-2 ring-brand/20 shadow-sm'
                        : 'border-line hover:border-navy-700'
                    }`}
                  >
                    <span className="block aspect-[4/3] w-full overflow-hidden" style={{ background: p.bg }}>
                      <img src={p.card || p.image} alt="" className="h-full w-full object-cover" />
                    </span>
                    <span className={`py-1.5 text-[12.5px] font-bold ${p.id === product.id ? 'bg-navy-900 text-white' : 'text-navy-900'}`}>
                      {p.short}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Product Specifications: ONLY Colour, Weight & Structure */}
            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-line bg-page p-3.5 text-center">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-2">Colour</span>
                <b className="text-[13px] font-bold text-navy-900 sm:text-[14px]">
                  {variantColors[product.id] || 'Natural'}
                </b>
              </div>
              <div className="flex flex-col gap-0.5 border-x border-line px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-2">Weight</span>
                <b className="text-[13px] font-bold text-navy-900 sm:text-[14px]">60g</b>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-2">Structure</span>
                <b className="text-[13px] font-bold text-navy-900 sm:text-[14px]">Solid Roll On</b>
              </div>
            </div>

            {/* Action Buttons: ONLY Add to Cart & Buy Now (No Increment Stepper, No Pack Size) */}
            <div id="main-buy" className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                className="btn-navy min-h-[52px] flex-1 text-[15.5px] font-bold shadow-sm transition hover:bg-navy-900"
                onClick={add}
              >
                Add to cart · {formatINR(unit)}
                {inCart > 0 && <span className="ml-1.5 text-xs font-normal text-mint">({inCart} in cart)</span>}
              </button>
              <button
                className="btn-primary min-h-[52px] flex-1 text-[15.5px] font-bold shadow-md transition hover:bg-brand-dark"
                onClick={buy}
              >
                Buy now
              </button>
            </div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-3 gap-2 border-t border-line pt-3.5 text-center text-xs text-muted-2">
              <span className="flex flex-col sm:flex-row items-center justify-center gap-1.5 font-medium">
                <Truck size={17} className="text-brand" />
                <span>Free on 2+ units</span>
              </span>
              <span className="flex flex-col sm:flex-row items-center justify-center gap-1.5 font-medium">
                <Shield size={17} className="text-brand" />
                <span>100% Pure Alum</span>
              </span>
              <span className="flex flex-col sm:flex-row items-center justify-center gap-1.5 font-medium">
                <Return size={17} className="text-brand" />
                <span>48-hr returns</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width Attractive Description Section */}
      <section className="border-t border-line bg-gradient-to-b from-white via-page/40 to-white py-12 sm:py-16">
        <div className="container-x">
          <div className="relative overflow-hidden rounded-[32px] border border-line bg-white p-6 sm:p-10 lg:p-12 shadow-[0_12px_40px_-20px_rgba(15,26,60,0.08)]">
            {/* Ambient subtle glow */}
            <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-brand/5 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -left-16 -bottom-16 size-72 rounded-full bg-mint/10 blur-3xl" />

            <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 items-center">
              {/* Left Column: Heading, Subtitle & Full Description */}
              <div className="flex flex-col gap-4">
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand">
                  <span className="size-2 rounded-full bg-brand animate-pulse" />
                  Product Story &amp; Details
                </span>
                <h2 className="font-head text-[28px] font-extrabold tracking-tight text-navy-900 sm:text-[36px] xl:text-[40px] leading-tight">
                  <span className="relative inline-block bg-gradient-to-r from-brand via-brand-dark to-navy-900 bg-clip-text text-transparent">
                    {product.name}.
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 h-[3.5px] w-full rounded-full bg-gradient-to-r from-brand via-mint to-transparent"
                    />
                  </span>
                </h2>
                <p className="text-[16px] leading-relaxed text-slate-700 sm:text-[17px] font-normal">
                  {product.description}
                </p>
                <p className="text-[14.5px] leading-relaxed text-muted">
                  Formulated with 100% natural mineral potassium alum, it creates an invisible breathable layer that eliminates odor-causing bacteria at the source. Free from alcohol, artificial dyes, and sticky residue.
                </p>
              </div>

              {/* Right Column: 4 Highlight Pillars */}
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                {[
                  { title: '24-Hour Odor Defense', desc: 'Natural mineral shield keeps you smelling fresh morning to night.', icon: '🛡️' },
                  { title: '0% Alcohol & Sticky Feel', desc: 'Clear glide formula that dries fast with zero white chalky residue.', icon: '✨' },
                  { title: 'Skin Gentle & Tested', desc: 'Enriched with glycerine to protect underarm barrier softness.', icon: '🌿' },
                  { title: 'Long-Lasting Stick', desc: 'Solid crystal lasts 3x longer than conventional spray deodorants.', icon: '💎' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-1.5 rounded-2xl border border-line bg-page/80 p-4.5 transition-all duration-300 hover:border-brand/40 hover:bg-white hover:shadow-md"
                  >
                    <span className="text-2xl mb-1">{item.icon}</span>
                    <b className="font-head text-[15px] font-bold text-navy-900 leading-snug">{item.title}</b>
                    <p className="text-[13px] leading-relaxed text-muted-2">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Blinking Benefits Slider */}
      <ProductMarquee dark />

      {/* 2. Why you'll love it? Section */}
      <section className="bg-navy-900 py-12 text-white">
        <div className="container-x">
          <h2 className="mb-8 text-center font-head text-3xl font-bold tracking-tight sm:text-4xl">
            Why you'll <span className="text-mint">love it?</span>
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {productInfo.loveIt.map(({ title, icon }) => {
              const I = loveIcons[icon];
              return (
                <div
                  key={title}
                  className="flex flex-col items-center gap-3 rounded-2xl bg-white/5 p-5 text-center ring-1 ring-white/10 transition duration-300 hover:bg-white/10 hover:-translate-y-1"
                >
                  <span className="flex size-13 items-center justify-center rounded-full bg-mint text-navy-900 shadow-sm">
                    <I />
                  </span>
                  <b className="font-head text-[15.5px] font-semibold leading-snug">{title}</b>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. You May Also Like / More from DriftOn Section */}
      <section className="pb-16 pt-10">
        <div className="container-wide">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4 px-2">
            <div className="flex flex-col gap-2">
              <span className="eyebrow">Other Variants</span>
              <h2 className="h2 text-3xl sm:text-4xl">
                More from <span className="text-brand">DriftOn</span>
              </h2>
            </div>
            <button className="btn-line" onClick={() => navigate('/#shop')}>View all</button>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* quickCheckout prop passed so clicking Buy now directly opens checkout popup */}
            {related.map((p) => <ProductCard key={p.id} product={p} quickCheckout />)}
          </div>
        </div>
      </section>

      {/* Sticky Bottom Bar (No increment/decrement stepper) */}
      <StickyBuyBar
        product={product}
        rating={rating}
        price={unit}
        onAdd={add}
        onBuy={buy}
        watchId="main-buy"
      />
    </>
  );
}

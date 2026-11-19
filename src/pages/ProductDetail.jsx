import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { products, packs, sampleReviews, getProductBySlug, formatINR, makeLine, UNIT_PRICE, DELIVERY_FEE } from '../data/products.js';
import { useStore } from '../context/StoreContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import ProductGallery from '../components/product/ProductGallery.jsx';
import ReviewsBlock from '../components/product/ReviewsBlock.jsx';
import StickyBuyBar from '../components/product/StickyBuyBar.jsx';
import { Stars } from '../components/Reviews.jsx';
import NotFound from './NotFound.jsx';
import { Truck, Shield, Return } from '../components/Icons.jsx';

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

  const [qty] = useState(1);
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
        <div className="grid grid-cols-1 items-start gap-8 pb-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:gap-10 xl:gap-12">
          {/* Left Column: Product Gallery & Disclaimer */}
          <div className="flex flex-col">
            <ProductGallery key={product.id} media={media} name={product.name} badge={product.badge} bg={product.bg} />
            <p className="mt-3.5 px-2 text-center text-[12.5px] font-medium leading-relaxed text-muted-2 sm:text-[13px]">
              Images are for illustration. Actual product may vary slightly in colour, design or packaging.
            </p>
          </div>

          {/* Right Column: Front Product Information & Buy Box */}
          <div className="flex flex-col gap-5 rounded-[28px] border border-line bg-white p-6 shadow-[0_24px_60px_-44px_rgba(15,26,60,.4)] sm:p-7">
            {/* Tag, Title & Reviews */}
            <div className="flex flex-col gap-2">
              <span className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[12px] font-bold uppercase tracking-widest" style={{ color: product.accent, background: product.bg }}>
                <span className="size-1.5 rounded-full" style={{ background: product.accent }} />
                {product.tag}
              </span>
              <h1 className="text-[28px] font-extrabold leading-[1.12] tracking-tight text-navy-900 sm:text-[34px]">
                {product.name}
              </h1>
              <a href="#product-reviews" className="flex items-center gap-2 text-sm font-medium text-muted-2 hover:text-navy-900">
                <Stars value={rating} size={17} />
                <span>{rating.toFixed(1)} · {reviews.length} verified reviews</span>
              </a>
            </div>

            {/* Pricing Box */}
            <div className="flex flex-col gap-1 rounded-2xl bg-page px-4.5 py-3.5 border border-line">
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

            {/* Product Specifications: Colour, Weight & Structure */}
            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-line bg-page p-3 text-center">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-2">Colour</span>
                <b className="text-[13px] font-bold text-navy-900 sm:text-[14px]">
                  {variantColors[product.id] || 'Clear Crystal'}
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

            {/* Description Box */}
            <div className="flex flex-col gap-1.5 rounded-2xl border border-line bg-page/70 p-4">
              <span className="text-[11.5px] font-bold uppercase tracking-wider text-navy-900">Description</span>
              <p className="text-[14px] leading-relaxed text-muted">
                {product.description} DriftOn is a 100% natural alum crystal roll on designed for 24-hr odor defense with 0% alcohol and no white marks.
              </p>
            </div>

            {/* Action Buttons: ONLY Add to cart and Buy now */}
            <div id="main-buy" className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                className="btn-navy min-h-[52px] flex-1 text-[15px] font-bold shadow-sm transition hover:bg-navy-900"
                onClick={add}
              >
                Add to cart · {formatINR(unit)}
                {inCart > 0 && <span className="ml-1.5 text-xs font-normal text-mint">({inCart} in cart)</span>}
              </button>
              <button
                className="btn-primary min-h-[52px] flex-1 text-[15px] font-bold shadow-md transition hover:bg-brand-dark"
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

      {/* Customer Reviews Section */}
      <ReviewsBlock reviews={reviews} />

      {/* You May Also Like Section */}
      <section className="pb-16 pt-4">
        <div className="container-wide">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4 px-2">
            <div className="flex flex-col gap-2">
              <span className="eyebrow">Other Variants</span>
              <h2 className="h2 text-3xl sm:text-4xl">More from <span className="text-brand">DriftOn</span></h2>
            </div>
            <button className="btn-line" onClick={() => navigate('/#shop')}>View all</button>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Sticky Quick Buy Bar for Mobile & Desktop Scroll */}
      <StickyBuyBar product={product} rating={rating} price={unit} qty={qty} setQty={() => {}} onAdd={add} onBuy={buy} watchId="main-buy" />
    </>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { heroSlides, getProductById, formatINR } from '../data/products.js';
import { Arrow, ChevronLeft, ChevronRight, Play, Pause } from './Icons.jsx';

/**
 * Full-width hero with 3 video slides.
 * Each video plays once; when it ends the slider moves to the next slide (then loops).
 * Clicking the video or the product tag opens that product's detail page.
 */
export default function HeroVideoSlider() {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const videos = useRef([]);
  const navigate = useNavigate();

  const total = heroSlides.length;
  const slide = heroSlides[index];
  const product = getProductById(slide.productId);
  const productUrl = `/product/${product.slug}`;

  const goTo = (i) => {
    setProgress(0);
    setIndex((i + total) % total);
  };

  useEffect(() => {
    videos.current.forEach((v, i) => {
      if (!v) return;
      if (i === index) {
        v.currentTime = 0;
        if (!paused) v.play().catch(() => {});
      } else v.pause();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const togglePause = () => {
    const v = videos.current[index];
    if (!v) return;
    paused ? v.play().catch(() => {}) : v.pause();
    setPaused(!paused);
  };

  return (
    <section id="top" aria-label="Featured products" className="relative min-h-[640px] overflow-hidden bg-navy-900 md:min-h-[720px]">
      {heroSlides.map((s, i) => {
        const p = getProductById(s.productId);
        return (
          <video
            key={p.id}
            ref={(el) => (videos.current[i] = el)}
            src={p.video}
            poster={p.poster}
            muted
            playsInline
            preload={i === 0 ? 'auto' : 'metadata'}
            onTimeUpdate={(e) => i === index && setProgress(e.target.currentTime / (e.target.duration || 1))}
            onEnded={() => i === index && goTo(index + 1)}
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${i === index ? 'opacity-100' : 'opacity-0'}`}
          />
        );
      })}
      <button aria-label={`View ${product.name}`} onClick={() => navigate(productUrl)} className="absolute inset-0 z-[1] bg-transparent" />

      <div className="container-x pointer-events-none relative z-[2] flex min-h-[640px] items-center pb-24 pt-16 md:min-h-[720px]">
        <div key={index} className="pointer-events-auto flex max-w-[580px] animate-fade-up flex-col gap-5 rounded-[32px] border border-white/80 bg-white/95 p-7 shadow-[0_30px_70px_-30px_rgba(15,26,60,.45)] sm:p-11">
          <span className="self-start rounded-full bg-mint-soft px-3.5 py-1.5 text-[12.5px] font-bold uppercase tracking-wider text-brand-dark">{slide.eyebrow}</span>
          <h1 className="text-[42px] font-bold leading-[1.02] tracking-tight text-navy-900 sm:text-[64px]">
            {slide.title}<br /><span className="text-brand">{slide.highlight}</span>
          </h1>
          <p className="text-lg leading-relaxed text-muted">{slide.text}</p>
          <div className="flex flex-wrap gap-3">
            <Link to={productUrl} className="btn-primary">Shop {product.short} <Arrow /></Link>
            <Link to="/#shop" className="btn-line">View all products</Link>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
            <div className="flex items-center gap-3.5">
              <span className="font-head font-bold">0{index + 1} <span className="font-medium text-[#8A93B0]">/ 0{total}</span></span>
              <div className="flex items-center gap-2">
                {heroSlides.map((_, i) => (
                  <button key={i} onClick={() => goTo(i)} aria-label={`Show slide ${i + 1}`} className="flex h-6 w-12 items-center">
                    <span className="block h-[3px] w-full overflow-hidden rounded-full bg-line-strong">
                      <i className="block h-full bg-brand" style={{ width: i < index ? '100%' : i === index ? `${progress * 100}%` : '0%' }} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="icon-btn-outline" onClick={togglePause} aria-label={paused ? 'Play video' : 'Pause video'}>{paused ? <Play /> : <Pause />}</button>
              <button className="icon-btn-outline" onClick={() => goTo(index - 1)} aria-label="Previous slide"><ChevronLeft /></button>
              <button className="icon-btn-outline" onClick={() => goTo(index + 1)} aria-label="Next slide"><ChevronRight /></button>
            </div>
          </div>
        </div>
      </div>

      <Link key={`tag-${index}`} to={productUrl} className="absolute bottom-8 right-8 z-[2] hidden animate-fade-up items-center gap-3.5 rounded-[18px] bg-navy-900 px-4 py-3.5 text-white shadow-2xl hover:bg-navy-700 hover:text-white md:flex">
        <img src={product.image} alt="" className="size-12 rounded-xl object-cover" />
        <span>
          <b className="block font-head text-base font-semibold">{product.name}</b>
          <small className="text-sm text-ondark">From <strong className="text-mint">{formatINR(product.price)}</strong> · View product</small>
        </span>
      </Link>
    </section>
  );
}

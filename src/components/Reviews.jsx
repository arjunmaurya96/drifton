import { useState } from 'react';
import { sampleReviews, getProductById } from '../data/products.js';
import { socials } from '../data/site.js';
import SocialIcon from './SocialIcon.jsx';
import { ChevronLeft, ChevronRight, Quote, Star } from './Icons.jsx';

const insta = socials.find((x) => x.id === 'instagram');

export function Stars({ value = 5, size = 19 }) {
  return (
    <span className="flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(value) ? 'text-[#F2A93B]' : 'text-line-strong'}><Star size={size} /></span>
      ))}
    </span>
  );
}

// Home page review carousel (SAMPLE reviews from data/products.js)
export default function Reviews() {
  const [start, setStart] = useState(0);
  const n = sampleReviews.length;
  const visible = [0, 1, 2].map((k) => ({ ...sampleReviews[(start + k) % n], key: (start + k) % n }));

  return (
    <section id="reviews" className="border-y border-line bg-white py-24">
      <div className="container-x">
        <div className="mb-11 flex flex-wrap items-end justify-between gap-5">
          <div className="flex flex-col gap-3">
            <span className="eyebrow">Reviews</span>
            <h2 className="h2">Join our <span className="text-brand">community</span></h2>
            <p className="max-w-[520px] text-[16px] text-muted">Real words from people who switched to DriftOn.</p>
          </div>
          <div className="flex gap-2">
            <button className="icon-btn-outline size-12" onClick={() => setStart((start + n - 1) % n)} aria-label="Previous reviews"><ChevronLeft /></button>
            <button className="icon-btn size-12 bg-navy-700 text-white hover:bg-navy-900" onClick={() => setStart((start + 1) % n)} aria-label="Next reviews"><ChevronRight /></button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((r) => {
            const p = getProductById(r.productId);
            return (
              <article key={r.key} className="lift flex animate-fade-up flex-col gap-5 rounded-[28px] border border-line bg-page p-7">
                <div className="flex items-center justify-between">
                  <Stars value={r.rating} />
                  <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    Google Review
                  </span>
                </div>
                <span className="text-[#C9D3F0]"><Quote /></span>
                <div className="flex flex-1 flex-col gap-2">
                  <b className="font-head text-xl font-semibold">{r.title}</b>
                  <p className="text-[17px] leading-relaxed text-navy-500">{r.text}</p>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-[#E0E4EF] pt-4">
                  <span className="flex items-center gap-3">
                    <span className="flex size-[46px] items-center justify-center rounded-full bg-navy-700 font-head font-semibold text-white">
                      {(r.author || 'Customer').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                    <span>
                      <b className="block text-[15.5px] font-semibold">{r.author || 'Customer'}</b>
                      <small className="text-[13.5px] text-muted-2">{r.time ? `${r.time} · ` : ''}{p.short || p.name}</small>
                    </span>
                  </span>
                  <img loading="lazy" decoding="async" src={p.image} alt="" className="size-[54px] rounded-2xl bg-white object-contain p-1" />
                </div>
              </article>
            );
          })}
        </div>

        {/* Instagram: follow & get a discount */}
        <div className="mt-10 grid grid-cols-1 items-center gap-6 overflow-hidden rounded-[28px] bg-[linear-gradient(120deg,#FFF1E6_0%,#FDE7F1_50%,#EEE9FF_100%)] p-6 sm:p-9 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-10">
          <span className="flex size-16 items-center justify-center rounded-2xl text-white shadow-lg sm:size-20" style={{ background: insta.color }}>
            <SocialIcon id="instagram" size={34} />
          </span>
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold uppercase tracking-[2px] text-[#C13584]">Instagram exclusive</span>
            <h3 className="font-head text-[24px] font-bold leading-tight text-navy-900 sm:text-[30px]">Follow us &amp; unlock a special discount</h3>
            <p className="text-[15px] leading-relaxed text-muted">Follow DriftOn on Instagram, then send us a DM — we will share your follower-only discount code for your next order. Plus tips, new launches and giveaways.</p>
          </div>
          <a href={insta.url} target="_blank" rel="noreferrer"
            className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-full px-7 text-[15px] font-semibold text-white shadow-md transition hover:opacity-90" style={{ background: insta.color }}>
            <SocialIcon id="instagram" size={20} /> Follow on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}

import { useState, useEffect, useRef } from 'react';
import { sampleReviews, getProductById } from '../data/products.js';
import { socials, business } from '../data/site.js';
import SocialIcon from './SocialIcon.jsx';
import { ChevronLeft, ChevronRight, Star } from './Icons.jsx';

const insta = socials.find((x) => x.id === 'instagram');

export function Stars({ value = 5, size = 18 }) {
  return (
    <span className="flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(value) ? 'text-[#F5A623]' : 'text-slate-200'}>
          <Star size={size} />
        </span>
      ))}
    </span>
  );
}

const GoogleIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

export default function Reviews() {
  const [reviews, setReviews] = useState(() => sampleReviews.slice(0, 6));
  const [isLive, setIsLive] = useState(false);
  const [stats, setStats] = useState({ rating: 4.8, count: 126 });
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  // Fetch real-time live reviews from Google Places API
  useEffect(() => {
    fetch('/api/google-reviews')
      .then((res) => res.json())
      .then((data) => {
        if (data.live && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviews(data.reviews);
          setIsLive(true);
          if (data.rating) setStats({ rating: data.rating, count: data.reviewCount || 126 });
        }
      })
      .catch(() => {
        // Gracefully stay on verified reviews
      });
  }, []);

  // Auto-scroll loop every 3.2 seconds (pauses when user hovers)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      const cardWidth = el.querySelector('article')?.offsetWidth || 320;
      const gap = 20;
      const scrollStep = cardWidth + gap;

      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 20) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: scrollStep, behavior: 'smooth' });
      }
    }, 3200);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleScroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('article')?.offsetWidth || 320;
    const gap = 20;
    const scrollStep = (cardWidth + gap) * dir;
    el.scrollBy({ left: scrollStep, behavior: 'smooth' });
  };

  return (
    <section id="reviews" className="relative overflow-hidden bg-[#FAFCFF] py-16 sm:py-24 border-t border-slate-200/70">
      {/* Background ambient glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[8%] top-0 h-[450px] w-[500px] rounded-full bg-brand/5 blur-3xl" />
        <div className="absolute right-[0%] top-[25%] h-[400px] w-[450px] rounded-full bg-[#E1306C]/5 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      <div className="container-x relative z-10">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex flex-col items-start gap-2.5">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-bold tracking-wide ${
              isLive ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700' : 'border-brand/20 bg-brand/10 text-brand'
            }`}>
              <span className={`size-2 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-brand'} animate-pulse`} />
              {isLive ? 'LIVE GOOGLE SYNC · VERIFIED' : 'GOOGLE REVIEWS & COMMUNITY'}
            </span>
            <h2 className="font-head text-[34px] font-extrabold tracking-tight text-navy-900 sm:text-[42px] xl:text-[48px]">
              Join Our{' '}
              <span className="relative inline-block bg-gradient-to-r from-brand via-brand-dark to-navy-900 bg-clip-text text-transparent">
                Community.
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 h-[3.5px] w-full rounded-full bg-gradient-to-r from-brand via-mint to-transparent"
                />
              </span>
            </h2>
            <p className="max-w-[560px] text-[15px] font-medium text-muted sm:text-base">
              Latest Google reviews from real customers who made the healthy switch to DriftOn Alum Roll On.
            </p>
          </div>

          {/* Google Rating Badge & Carousel Navigation Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={business.reviewUrl}
              target="_blank"
              rel="noreferrer"
              title="View all reviews on Google Maps"
              className="flex items-center gap-2.5 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 shadow-sm transition hover:border-[#4285F4]/60 hover:shadow-md"
            >
              <GoogleIcon size={20} />
              <div className="flex flex-col leading-tight">
                <span className="flex items-center gap-1 text-[13px] font-bold text-navy-900">
                  <Star size={14} className="text-[#F5A623] inline" />
                  {stats.rating.toFixed(1)} / 5.0
                </span>
                <span className="text-[11px] font-medium text-muted-2">
                  {stats.count ? `${stats.count} Reviews ↗` : 'Google Reviews ↗'}
                </span>
              </div>
            </a>

            <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
              <button
                className="flex size-10 items-center justify-center rounded-full text-navy-700 transition hover:bg-slate-100 active:scale-95 cursor-pointer"
                onClick={() => handleScroll(-1)}
                aria-label="Previous reviews"
              >
                <ChevronLeft size={19} />
              </button>
              <button
                className="flex size-10 items-center justify-center rounded-full bg-navy-900 text-white shadow-sm transition hover:bg-brand active:scale-95 cursor-pointer"
                onClick={() => handleScroll(1)}
                aria-label="Next reviews"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          </div>
        </div>

        {/* Continuous Auto-Sliding Carousel Track (Uniform & Slender Cards) */}
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex gap-5 overflow-x-auto pb-4 pt-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {reviews.map((r) => {
            const p = getProductById(r.productId);
            const isLong = r.text.length > 95;
            return (
              <article
                key={r.id}
                className="group relative flex h-[260px] w-[295px] sm:w-[325px] shrink-0 flex-col justify-between rounded-[24px] border border-slate-200/90 bg-white p-5.5 shadow-[0_4px_20px_-4px_rgba(15,26,60,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:border-brand/40 hover:shadow-[0_16px_32px_-8px_rgba(15,26,60,0.12)] select-none"
              >
                <div>
                  {/* Top: Google Icon + Stars + Verified Badge */}
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <GoogleIcon size={18} />
                      <Stars value={r.rating} size={15} />
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-800">
                      <svg className="size-3 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                      </svg>
                      Verified
                    </span>
                  </div>

                  {/* Review Title */}
                  <h3 className="mb-1.5 font-head text-[15px] font-bold leading-snug text-navy-900 group-hover:text-brand line-clamp-1">
                    "{r.title}"
                  </h3>

                  {/* Review Text with Truncate & Read More */}
                  <p className="text-[13px] leading-relaxed text-slate-600">
                    {isLong ? (
                      <>
                        "{r.text.slice(0, 95)}... "
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReview(r);
                          }}
                          className="font-bold text-brand hover:underline cursor-pointer inline"
                        >
                          Read more
                        </button>
                      </>
                    ) : (
                      `"${r.text}"`
                    )}
                  </p>
                </div>

                {/* Bottom Bar: Customer Avatar + Direct Google Link */}
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {r.profilePhoto ? (
                      <img src={r.profilePhoto} alt={r.author} className="size-9 shrink-0 rounded-full object-cover ring-1 ring-slate-200" />
                    ) : (
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-navy-900 to-brand text-[11px] font-bold text-white shadow-2xs">
                        {(r.author || 'User').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <b className="block truncate text-[13px] font-bold text-navy-900 leading-tight">
                        {r.author}
                      </b>
                      <span className="block text-[11px] font-medium text-slate-400">
                        {r.time}
                      </span>
                    </div>
                  </div>

                  {/* Direct Link to Google Reviews */}
                  <a
                    href={business.reviewUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="View this review directly on Google"
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200/90 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700 transition hover:border-[#4285F4]/60 hover:bg-[#4285F4]/5 hover:text-[#1A73E8]"
                  >
                    <GoogleIcon size={12} />
                    <span>Google ↗</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        {/* Read More Modal */}
        {selectedReview && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
            onClick={() => setSelectedReview(null)}
          >
            <div
              className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                aria-label="Close dialog"
                className="absolute right-5 top-5 flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 cursor-pointer"
              >
                ✕
              </button>

              <div className="mb-4 flex items-center gap-3">
                <GoogleIcon size={26} />
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    <svg className="size-3 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                    </svg>
                    Verified Google Review
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <Stars value={selectedReview.rating} size={16} />
                    <span className="text-xs text-slate-400">{selectedReview.time}</span>
                  </div>
                </div>
              </div>

              <h4 className="mb-2 font-head text-[18px] font-bold text-navy-900">
                "{selectedReview.title}"
              </h4>
              <p className="mb-6 text-[14.5px] leading-relaxed text-slate-700 whitespace-pre-line">
                {selectedReview.text}
              </p>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-tr from-navy-900 to-brand text-xs font-bold text-white">
                    {(selectedReview.author || 'User').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <b className="block text-sm font-bold text-navy-900">{selectedReview.author}</b>
                    <span className="text-xs text-slate-400">Google Reviewer</span>
                  </div>
                </div>

                <a
                  href={business.reviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand cursor-pointer"
                >
                  <GoogleIcon size={14} />
                  View on Google ↗
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Modern SaaS Instagram VIP Community Banner */}
        <div className="relative mt-12 overflow-hidden rounded-[32px] border border-navy-800 bg-gradient-to-br from-navy-950 via-navy-900 to-[#0e1726] p-7 text-white shadow-2xl sm:p-10 lg:p-12">
          {/* Ambient Glow Bubbles */}
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-brand/20 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-20 size-80 rounded-full bg-[#E1306C]/25 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 items-center gap-7 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-10">
            {/* Instagram Gradient Icon Box */}
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white shadow-[0_10px_25px_rgba(225,48,108,0.45)] sm:size-20">
              <SocialIcon id="instagram" size={36} />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-2">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-pink-300">
                <span className="size-1.5 rounded-full bg-pink-400 animate-ping" />
                Instagram VIP Community
              </span>
              <h3 className="font-head text-[24px] font-bold leading-tight text-white sm:text-[30px] tracking-tight">
                Follow &amp; Get Exclusive Community Perks
              </h3>
              <p className="max-w-2xl text-[14.5px] leading-relaxed text-slate-300">
                Follow <span className="font-semibold text-white">@drifton.care</span> and send us a direct message to receive your instant follower-only discount code, plus early access to new product drops &amp; natural skincare tips.
              </p>
            </div>

            {/* SaaS CTA Button */}
            <a
              href={insta.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] px-8 text-sm font-bold text-white shadow-[0_10px_25px_rgba(225,48,108,0.4)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_15px_30px_rgba(225,48,108,0.6)] active:scale-95 whitespace-nowrap"
            >
              <SocialIcon id="instagram" size={20} />
              Follow on Instagram
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

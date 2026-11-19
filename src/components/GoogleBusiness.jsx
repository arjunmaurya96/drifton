import { business } from '../data/site.js';
import { Star, Pin, Clock } from './Icons.jsx';

const G = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 01-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill="#4285F4" />
    <path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0012 22z" fill="#34A853" />
    <path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 000 9.2z" fill="#FBBC05" />
    <path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 003.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1z" fill="#EA4335" />
  </svg>
);

/** "Find us on Google" — Google Business Profile card + live Google Map. */
export default function GoogleBusiness() {
  const hasRating = business.rating != null;
  const mapSrc = business.mapEmbedUrl || `https://www.google.com/maps?q=${encodeURIComponent(business.mapQuery)}&output=embed`;

  return (
    <section id="google" className="pb-20 pt-8 sm:pb-24 sm:pt-10">
      <div className="container-x">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          {/* <span className="eyebrow">Find us on Google</span> */}
          <h2 className="h2">Visit, call or <span className="text-brand">review us</span></h2>
        </div>
        <div className="grid grid-cols-1 overflow-hidden rounded-[32px] border border-line bg-white lg:grid-cols-[.9fr_1.1fr]">
          <div className="flex flex-col gap-6 p-8 sm:p-10">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-page"><G /></span>
              <span>
                <b className="block font-head text-xl font-semibold">{business.name}</b>
                <span className="text-sm text-muted-2">Google Business Profile</span>
              </span>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-page p-5">
              <b className="font-head text-5xl font-bold leading-none">{hasRating ? business.rating.toFixed(1) : '–'}</b>
              <span className="flex flex-col gap-1">
                <span className="flex gap-0.5 text-[#F2A93B]">{[1, 2, 3, 4, 5].map((k) => <span key={k} className={hasRating && k > Math.round(business.rating) ? 'text-line-strong' : ''}><Star size={18} /></span>)}</span>
                <span className="text-sm text-muted-2">{hasRating ? `${business.reviewCount} Google reviews` : '[Google rating will show here]'}</span>
              </span>
            </div>

            <ul className="flex flex-col gap-3 text-[15px] text-navy-500">
              <li className="flex items-start gap-3"><span className="mt-0.5 text-brand"><Pin /></span><a href={business.mapsUrl} target="_blank" rel="noreferrer" className="text-navy-900 hover:text-brand hover:underline">{business.address}</a></li>
              <li className="flex items-start gap-3"><span className="mt-0.5 text-brand"><Clock size={18} /></span>{business.hours}</li>
              <li className="flex items-start gap-3 break-all"><span className="mt-0.5 font-bold text-brand">✉</span><a href={`mailto:${business.email}`} className="text-navy-900 hover:text-brand hover:underline">{business.email}</a></li>
            </ul>

            <div className="flex flex-wrap gap-3">
              <a href={business.reviewUrl} target="_blank" rel="noreferrer" className="btn-navy">Write a review</a>
              <a href={business.mapsUrl} target="_blank" rel="noreferrer" className="btn-line">Get directions</a>
              <a href={business.profileUrl} target="_blank" rel="noreferrer" className="btn-line">View on Google Maps</a>
            </div>
          </div>
          <a
            href={business.mapsUrl}
            target="_blank"
            rel="noreferrer"
            title="Click anywhere to open DriftOn in Google Maps"
            className="group relative block h-[360px] w-full cursor-pointer overflow-hidden lg:h-full lg:min-h-[460px]"
          >
            <iframe
              title="Drifton on Google Maps"
              src={mapSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="pointer-events-none h-full w-full border-0"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-navy-900/0 transition-colors group-hover:bg-navy-900/15">
              <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-navy-900 shadow-lg opacity-0 transition-opacity group-hover:opacity-100">
                📍 Click to open in Google Maps ↗
              </span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { socials, business } from '../data/site.js';
import SocialIcon from './SocialIcon.jsx';
import PolicyModal, { policies } from './PolicyModal.jsx';

const OFFER_TEXT = 'Buy 2, get your 3rd roll on for just ₹300';

const Col = ({ title, children }) => (
  <div className="flex flex-col gap-3 text-[15px]">
    <h4 className="mb-1 text-[17px] font-semibold text-white">{title}</h4>
    {children}
  </div>
);
const fl = 'text-ondark hover:text-mint';

export default function Footer() {
  const { notify } = useStore();
  const [email, setEmail] = useState('');
  const [policy, setPolicy] = useState(null); // which policy popup is open

  const subscribe = (e) => {
    e.preventDefault();
    if (!email.includes('@')) return notify('Please enter a valid email');
    setEmail('');
    notify('Thanks for subscribing!');
  };

  return (
    <>
    {/* scrolling offer strip just above the footer */}
    <div aria-label={OFFER_TEXT} className="overflow-hidden bg-brand py-3.5 text-white sm:py-4">
      <div aria-hidden="true" className="flex w-max animate-marquee items-center hover:[animation-play-state:paused]">
        {Array.from({ length: 2 }).map((_, half) => (
          <div key={half} className="flex shrink-0 items-center">
            {Array.from({ length: 6 }).map((__, k) => (
              <span key={k} className="flex shrink-0 items-center gap-10 px-5 font-head text-[17px] font-semibold tracking-wide sm:gap-14 sm:px-7 sm:text-[21px]">
                {OFFER_TEXT}
                <span className="size-3.5 rotate-45 bg-white sm:size-4" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
    <footer id="footer" className="bg-navy-900 pb-8 pt-[72px] text-ondark">
      <div className="container-x">
        <div className="mb-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.4fr]">
          <div className="flex flex-col gap-4">
            <Link to="/" aria-label="DriftOn home" className="self-start"><img loading="lazy" decoding="async" src="/assets/images/logo-drifton-white.webp" alt="DriftOn" className="h-11 w-auto sm:h-12" /></Link>
            <span className="max-w-[300px] text-[14.5px] leading-relaxed">Natural crystal deodorants by AI Enterprises.</span>
            <span className="text-[14.5px] leading-relaxed">Customer care: <a href={`mailto:${business.email}`} className="font-semibold text-white underline-offset-4 hover:text-mint hover:underline">{business.email}</a></span>
          </div>
          <Col title="Shop">
            <Link to="/#shop" className={fl}>All products</Link>
            <Link to="/#why" className={fl}>Why Drifton</Link>
            <Link to="/#how" className={fl}>How to use</Link>
            <Link to="/#refer" className={fl}>Refer &amp; Earn</Link>
          </Col>
          <Col title="Help">
            <a href={business.trackUrl} target="_blank" rel="noreferrer" className={fl}>Track order</a>
            <Link to="/contact" className={fl}>Contact us</Link>
          </Col>
          <Col title="Policies">
            {Object.entries(policies).map(([id, x]) => (
              <button key={id} type="button" onClick={() => setPolicy(id)} className={`${fl} text-left`}>{x.title}</button>
            ))}
          </Col>
          <form onSubmit={subscribe} className="flex flex-col gap-3.5">
            <h4 className="text-[17px] font-semibold text-white">Subscribe for offers</h4>
            <label htmlFor="nl" className="text-[14.5px]">Get new launches and deals in your inbox.</label>
            <div className="flex gap-2 rounded-full bg-navy-700 p-1.5">
              <input id="nl" type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} className="min-w-0 flex-1 bg-transparent px-3.5 text-[15px] text-white outline-none placeholder:text-[#9AA5C8]" />
              <button className="btn-primary min-h-11 px-5">Subscribe</button>
            </div>
          </form>
        </div>
        {/* Business information (from the Terms & Conditions) — small legal lines, like a normal footer */}
        <div className="grid grid-cols-1 gap-x-10 gap-y-3 border-t border-[#26366E] py-6 text-[13px] leading-relaxed text-[#9AA5C8] md:grid-cols-[auto_minmax(0,1fr)]">
          <h4 className="text-[13px] font-semibold uppercase tracking-[1.5px] text-white">Business information</h4>
          <p className="flex flex-wrap gap-x-2 gap-y-1">
            {[
              <>Owned &amp; operated by <span className="text-ondark">{business.legalName}</span></>,
              <>Brand: <span className="text-ondark">DriftOn™</span></>,
              <>Registered office: <span className="text-ondark">{business.address}</span></>,
              <>Manufactured by: <span className="text-ondark">{business.manufacturer.name}, {business.manufacturer.address}</span></>,
              <>Licence: <span className="text-ondark">{business.manufacturer.licence}</span></>,
              <>Customer care: <a href={`mailto:${business.email}`} className="text-ondark hover:text-mint">{business.email}</a></>,
            ].map((x, k, all) => (
              <span key={k}>{x}{k < all.length - 1 && <span className="ml-2 text-[#4A5A8E]">|</span>}</span>
            ))}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#26366E] pt-6 text-[13.5px] text-[#9AA5C8]">
          <span>© {new Date().getFullYear()} DriftOn™ · AI Enterprises. All rights reserved.</span>
          <ul className="flex flex-wrap gap-2" aria-label="Follow Drifton">
            {socials.filter((x) => x.url).map((x) => (
              <li key={x.id}>
                <a href={x.url} {...(x.url.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})} aria-label={x.label}
                  className="flex size-10 items-center justify-center rounded-full text-white shadow-md transition hover:-translate-y-0.5 hover:brightness-110" style={{ background: x.color }}>
                  <SocialIcon id={x.id} size={18} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <PolicyModal id={policy} onClose={() => setPolicy(null)} />
    </footer>
    </>
  );
}

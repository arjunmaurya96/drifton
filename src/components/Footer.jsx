import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { socials } from '../data/site.js';
import SocialIcon from './SocialIcon.jsx';

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

  const subscribe = (e) => {
    e.preventDefault();
    if (!email.includes('@')) return notify('Please enter a valid email');
    setEmail('');
    notify('Thanks for subscribing!');
  };

  return (
    <footer id="footer" className="bg-navy-900 pb-8 pt-[72px] text-ondark">
      <div className="container-x">
        <div className="mb-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.4fr]">
          <div className="flex flex-col gap-4">
            <span className="font-head text-3xl font-bold text-white">Drift<span className="text-mint">o</span>n</span>
            <span className="max-w-[300px] text-[14.5px] leading-relaxed">Natural crystal deodorants by AI Enterprises.</span>
            <span className="text-[14.5px]">Customer care: [EMAIL] · [PHONE]</span>
          </div>
          <Col title="Shop">
            <Link to="/#shop" className={fl}>All products</Link>
            <Link to="/#why" className={fl}>Why Drifton</Link>
            <Link to="/#how" className={fl}>How to use</Link>
            <Link to="/#refer" className={fl}>Refer &amp; Earn</Link>
          </Col>
          <Col title="Help">
            <a href="#footer" className={fl}>Track order</a>
            <a href="#footer" className={fl}>Shipping policy</a>
            <a href="#footer" className={fl}>Returns &amp; refunds</a>
            <a href="#footer" className={fl}>Privacy policy</a>
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
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#26366E] pt-6 text-[13.5px] text-[#9AA5C8]">
          <span>© {new Date().getFullYear()} Drifton · AI Enterprises. All rights reserved.</span>
          <ul className="flex flex-wrap gap-2" aria-label="Follow Drifton">
            {socials.filter((x) => x.url).map((x) => (
              <li key={x.id}>
                <a href={x.url} target="_blank" rel="noreferrer" aria-label={x.label}
                  className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-mint hover:text-navy-900">
                  <SocialIcon id={x.id} size={18} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

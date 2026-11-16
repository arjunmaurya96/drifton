import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { business } from '../data/site.js';
import { useStore } from '../context/StoreContext.jsx';
import { Search, Heart, Bag, Menu, Close } from './Icons.jsx';
import SearchOverlay from './SearchOverlay.jsx';
import AnnouncementBar from './AnnouncementBar.jsx';

const links = [
  { to: '/#shop', label: 'Shop' }, // the 4 products on the home page
  { to: '/combo', label: 'Combo' },
  { to: '/ingredients', label: 'Know More Ingredients' },
  { to: '/terms', label: 'Terms & Conditions' },
  { href: business.trackUrl, label: 'Track' }, // Ekart tracking site
  { to: '/check-ingredient', label: 'Check Your Ingredient' },
  { to: '/contact', label: 'Contact Us' },
];

// One menu link: outside sites open in a new tab; "/#shop" also scrolls when you are already on the home page
function NavLink({ l, className, onClick }) {
  const { pathname } = useLocation();
  if (l.href) return <a href={l.href} target="_blank" rel="noreferrer" onClick={onClick} className={className}>{l.label}</a>;
  const go = () => {
    onClick?.();
    if (l.to.startsWith('/#') && pathname === '/') document.getElementById(l.to.slice(2))?.scrollIntoView({ behavior: 'smooth' });
  };
  return <Link to={l.to} onClick={go} className={className}>{l.label}</Link>;
}

const Badge = ({ n }) => (
  <span className="absolute right-0.5 top-1 flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white">{n}</span>
);

/**
 * Hides when you scroll down, slides back in as soon as you scroll up a little.
 */
function useHideOnScroll() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y <= 2) setHidden(false); // back at the very top
        else if (y > lastY + 1) setHidden(true); // any scroll down: slide the whole header (top bar + nav) up
        else if (y < lastY - 1) setHidden(false); // any scroll up: slide it back down
        lastY = y;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return hidden;
}

export default function Header() {
  const { count, openAuth, openCart, wishlist } = useStore();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const hidden = useHideOnScroll() && !open && !searchOpen;

  return (
    <header className={`sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${hidden ? '-translate-y-full' : 'translate-y-0 shadow-[0_8px_24px_-18px_rgba(15,26,60,.35)]'}`}>
      <AnnouncementBar />
      <div className="container-x flex h-[78px] items-center justify-between gap-5">
        <Link to="/" aria-label="Drifton home" className="shrink-0">
          <img src="/assets/images/logo.png" alt="Drifton by AI Enterprises" className="h-9 w-auto sm:h-11" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-4 xl:flex 2xl:gap-6">
          {links.map((l) => <NavLink key={l.label} l={l} className="whitespace-nowrap text-[14px] font-medium text-navy-500 transition-colors hover:text-brand 2xl:text-[15px]" />)}
        </nav>

        <div className="flex items-center gap-0 sm:gap-1">
          <button className="icon-btn" aria-label="Search" aria-expanded={searchOpen} onClick={() => setSearchOpen(!searchOpen)}><Search /></button>
          <button className="icon-btn hidden sm:inline-flex" aria-label={`Wishlist, ${wishlist.length} items`}>
            <Heart size={21} />
            {wishlist.length > 0 && <Badge n={wishlist.length} />}
          </button>
          <button className="icon-btn" aria-label={`Cart, ${count} items`} onClick={openCart}>
            <Bag />
            <Badge n={count} />
          </button>
          <span className="mx-2 hidden h-6 w-px bg-[#E0E4EF] sm:block" />
          <button onClick={() => openAuth('login')} className="hidden min-h-11 rounded-full px-4 text-[15px] font-semibold text-navy-700 hover:bg-[#EEF1F8] sm:block xl:hidden 2xl:block">Log in</button>
          <button onClick={() => openAuth('signup')} className="min-h-10 whitespace-nowrap rounded-full bg-navy-700 px-3 text-[14px] sm:min-h-11 sm:px-4 sm:text-[15px] font-semibold text-white transition-colors hover:bg-brand sm:px-5">Sign up</button>
          <button className="icon-btn xl:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav aria-label="Mobile" className="flex flex-col border-t border-line bg-white px-8 pb-5 pt-2 xl:hidden">
          {links.map((l) => <NavLink key={l.label} l={l} onClick={() => setOpen(false)} className="py-3 font-semibold text-navy-900" />)}
        </nav>
      )}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}

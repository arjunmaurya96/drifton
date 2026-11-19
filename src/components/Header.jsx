import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { business } from '../data/site.js';
import { useStore } from '../context/StoreContext.jsx';
import { Search, Heart, Bag, Menu, Close } from './Icons.jsx';
import SearchOverlay from './SearchOverlay.jsx';
import AnnouncementBar from './AnnouncementBar.jsx';

const links = [
  { to: '/#shop', label: 'Shop' }, // the 4 products on the home page
  { to: '/ingredients', label: 'Know More Ingredients' },
  { to: '/terms', label: 'Terms & Conditions' },
  { href: business.trackUrl, label: 'Track' }, // Ekart tracking site
  { to: '/contact', label: 'Contact Us' },
];

// One menu link: outside sites open in a new tab; "/#shop" also scrolls when you are already on the home page
function NavLink({ l, className, onClick }) {
  const { pathname } = useLocation();
  if (l.href) return <a href={l.href} target="_blank" rel="noreferrer" onClick={onClick} className={className}>{l.label}</a>;
  const go = () => {
    onClick?.();
    if (l.to.startsWith('/#') && pathname === '/') {
      const el = document.getElementById(l.to.slice(2));
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => el?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 650); // after the mobile menu closes
    }
  };
  return <Link to={l.to} onClick={go} className={className}>{l.label}</Link>;
}

const Badge = ({ n }) => (
  <span className="absolute right-0.5 top-1 flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white">{n}</span>
);

export default function Header() {
  const { count, openAuth, openCart, wishlist, user, userProfile, logout } = useStore();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { pathname } = useLocation();
  const ref = useRef(null);
  const [h, setH] = useState(118);
  // header is permanently fixed at the top — measure it so other pages can leave room under it
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const measure = () => setH((el.querySelector('[data-header-bar]')?.offsetHeight || 0) + (el.querySelector('[data-header-nav]')?.offsetHeight || 0));
    measure();
    const ro = new ResizeObserver(measure); ro.observe(el); return () => ro.disconnect();
  }, []);

  return (
    <>
    {/* spacer on every page except home, where the hero sits right under the header */}
    {pathname !== '/' && <div aria-hidden="true" style={{ height: h }} />}
    <header ref={ref} className="fixed inset-x-0 top-0 z-40 border-b border-line bg-white/95 backdrop-blur shadow-[0_8px_24px_-18px_rgba(15,26,60,.28)]">
      <div data-header-bar><AnnouncementBar /></div>
      <div data-header-nav className="container-x flex h-[78px] items-center justify-between gap-5">
        <Link to="/" aria-label="Drifton home" className="shrink-0">
          <img src="/assets/images/logo.webp" alt="Drifton by AI Enterprises" className="h-9 w-auto sm:h-11" />
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

          {user ? (
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-full border border-line-strong bg-[#F8F9FC] py-1 pl-1 pr-3 hover:bg-[#EEF1F8] transition"
              title="My Account & Orders"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="size-8 rounded-full object-cover" />
              ) : (
                <span className="flex size-8 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">
                  {(user.displayName || userProfile.name || user.email || 'U')[0].toUpperCase()}
                </span>
              )}
              <span className="hidden text-[13.5px] font-semibold text-navy-900 sm:inline max-w-[100px] truncate">
                {user.displayName?.split(' ')[0] || userProfile.name?.split(' ')[0] || 'Account'}
              </span>
            </Link>
          ) : (
            <>
              <button onClick={() => openAuth('login')} className="hidden min-h-11 rounded-full px-4 text-[15px] font-semibold text-navy-700 hover:bg-[#EEF1F8] sm:block xl:hidden 2xl:block">Log in</button>
              <button onClick={() => openAuth('signup')} className="min-h-10 whitespace-nowrap rounded-full bg-navy-700 px-3 text-[14px] sm:min-h-11 sm:px-4 sm:text-[15px] font-semibold text-white transition-colors hover:bg-brand sm:px-5">Sign up</button>
            </>
          )}

          <button className="icon-btn xl:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </div>
      {/* mobile menu: slides open slowly, links fade in one by one */}
      <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(.22,1,.36,1)] xl:hidden ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`} aria-hidden={!open}>
        <nav aria-label="Mobile" className="flex min-h-0 flex-col overflow-hidden border-t border-line bg-white px-8">
          <span className="h-2 shrink-0" />
          {links.map((l, k) => (
            <span key={l.label} className={`transition-all duration-500 ${open ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`} style={{ transitionDelay: open ? `${120 + k * 60}ms` : '0ms' }}>
              <NavLink l={l} onClick={() => setOpen(false)} className="block py-3 font-semibold text-navy-900" />
            </span>
          ))}

          {user ? (
            <div className="border-t border-line pt-3 mt-1 pb-4">
              <Link to="/profile" onClick={() => setOpen(false)} className="block py-2.5 font-bold text-brand">
                👤 My Account & Orders ({user.email})
              </Link>
              <button onClick={() => { logout(); setOpen(false); }} className="block py-2 text-left font-semibold text-red-600">
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex gap-2 py-4 border-t border-line mt-2">
              <button onClick={() => { openAuth('login'); setOpen(false); }} className="btn-line flex-1 min-h-10 text-sm">Log in</button>
              <button onClick={() => { openAuth('signup'); setOpen(false); }} className="btn-primary flex-1 min-h-10 text-sm">Sign up</button>
            </div>
          )}

          <span className="h-4 shrink-0" />
        </nav>
      </div>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
    </>
  );
}

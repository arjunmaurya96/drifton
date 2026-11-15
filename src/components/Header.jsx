import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { Search, Heart, Bag, Menu, Close } from './Icons.jsx';

const links = [
  { to: '/#shop', label: 'Shop' },
  { to: '/#why', label: 'Why Drifton' },
  { to: '/#how', label: 'How to use' },
  { to: '/#tested', label: 'Tested' },
  { to: '/#reviews', label: 'Reviews' },
  { to: '/#refer', label: 'Refer & Earn' },
];

const Badge = ({ n }) => (
  <span className="absolute right-0.5 top-1 flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white">{n}</span>
);

export default function Header() {
  const { count, openAuth, openCart, wishlist } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="container-x flex h-[78px] items-center justify-between gap-5">
        <Link to="/" aria-label="Drifton home" className="shrink-0">
          <img src="/assets/images/logo.png" alt="Drifton by AI Enterprises" className="h-9 w-auto sm:h-11" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 xl:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-[15px] font-medium text-navy-500 transition-colors hover:text-brand">{l.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button className="icon-btn" aria-label="Search"><Search /></button>
          <button className="icon-btn hidden sm:inline-flex" aria-label={`Wishlist, ${wishlist.length} items`}>
            <Heart size={21} />
            {wishlist.length > 0 && <Badge n={wishlist.length} />}
          </button>
          <button className="icon-btn" aria-label={`Cart, ${count} items`} onClick={openCart}>
            <Bag />
            <Badge n={count} />
          </button>
          <span className="mx-2 hidden h-6 w-px bg-[#E0E4EF] sm:block" />
          <button onClick={() => openAuth('login')} className="hidden min-h-11 rounded-full px-4 text-[15px] font-semibold text-navy-700 hover:bg-[#EEF1F8] sm:block">Log in</button>
          <button onClick={() => openAuth('signup')} className="min-h-11 whitespace-nowrap rounded-full bg-navy-700 px-4 text-[15px] font-semibold text-white transition-colors hover:bg-brand sm:px-5">Sign up</button>
          <button className="icon-btn xl:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav aria-label="Mobile" className="flex flex-col border-t border-line bg-white px-8 pb-5 pt-2 xl:hidden">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="py-3 font-semibold text-navy-900">{l.label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}

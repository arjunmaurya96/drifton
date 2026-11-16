import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { products, UNIT_PRICE, summarize } from '../data/products.js';

const StoreContext = createContext(null);

const load = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

export function StoreProvider({ children }) {
  // Old saved carts may have old prices/images/ids — rebuild each line from the current product data
  const [cart, setCart] = useState(() =>
    load('drifton_cart', []).map((l) => {
      const p = products.find((x) => x.id === (l.id === 'lavender' ? 'natural' : l.id));
      if (!p) return null;
      const sticks = l.sticks || (/2/.test(l.pack) ? 2 : /3/.test(l.pack) ? 3 : 1);
      return { ...l, key: `${p.id}-${sticks}`, id: p.id, name: p.name, image: p.image, sticks, pack: sticks === 2 ? 'Combo of 2' : sticks === 1 ? 'Single' : l.pack, unitPrice: UNIT_PRICE * sticks };
    }).filter(Boolean));
  const [wishlist, setWishlist] = useState(() => load('drifton_wish', []));
  const [authMode, setAuthMode] = useState(null); // 'login' | 'signup' | null
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [buy, setBuy] = useState(null); // { lines, fromCart } for the Buy now modal
  const timer = useRef();

  useEffect(() => {
    try { localStorage.setItem('drifton_cart', JSON.stringify(cart)); } catch {}
  }, [cart]);
  useEffect(() => {
    try { localStorage.setItem('drifton_wish', JSON.stringify(wishlist)); } catch {}
  }, [wishlist]);

  const notify = useCallback((msg) => {
    clearTimeout(timer.current);
    setToast(msg);
    timer.current = setTimeout(() => setToast(''), 2400);
  }, []);

  // A line is a product in a given pack size
  const addToCart = useCallback((product, qty = 1, pack = { id: 1, label: 'Single', multiplier: 1 }, silent = false) => {
    const key = `${product.id}-${pack.multiplier}`;
    const unitPrice = UNIT_PRICE * pack.multiplier;
    setCart((c) => {
      const found = c.find((l) => l.key === key);
      if (found) return c.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l));
      return [...c, { key, id: product.id, name: product.name, image: product.image, pack: pack.label, sticks: pack.multiplier, unitPrice, qty }];
    });
    if (!silent) notify(`${product.name} added to cart`);
  }, [notify]);

  const clearCart = useCallback(() => setCart([]), []);

  const updateQty = (key, qty) =>
    setCart((c) => (qty <= 0 ? c.filter((l) => l.key !== key) : c.map((l) => (l.key === key ? { ...l, qty } : l))));

  const toggleWish = useCallback((id) => {
    const has = wishlist.includes(id);
    setWishlist((w) => (has ? w.filter((x) => x !== id) : [...w, id]));
    notify(has ? 'Removed from wishlist' : 'Saved to wishlist');
  }, [wishlist, notify]);

  const value = useMemo(() => {
    const count = cart.reduce((s, l) => s + l.qty * (l.sticks || 1), 0); // number of sticks
    const summary = summarize(cart);
    const subtotal = summary.items; // with the automatic combo price
    return {
      cart, count, subtotal, summary, addToCart, updateQty, clearCart,
      wishlist, toggleWish,
      authMode, openAuth: setAuthMode, closeAuth: () => setAuthMode(null),
      cartOpen, openCart: () => setCartOpen(true), closeCart: () => setCartOpen(false),
      toast, notify,
      buy, openBuy: (lines, fromCart = false) => setBuy({ lines, fromCart }), closeBuy: () => setBuy(null),
    };
  }, [cart, wishlist, authMode, cartOpen, toast, addToCart, toggleWish, notify, clearCart, buy]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);

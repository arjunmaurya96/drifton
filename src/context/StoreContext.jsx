import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

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
  const [cart, setCart] = useState(() => load('drifton_cart', []));
  const [wishlist, setWishlist] = useState(() => load('drifton_wish', []));
  const [authMode, setAuthMode] = useState(null); // 'login' | 'signup' | null
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState('');
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
  const addToCart = useCallback((product, qty = 1, pack = { id: 1, label: 'Single', multiplier: 1, off: 0 }) => {
    const key = `${product.id}-${pack.id}`;
    const unitPrice = product.price * pack.multiplier * (1 - pack.off);
    setCart((c) => {
      const found = c.find((l) => l.key === key);
      if (found) return c.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l));
      return [...c, { key, id: product.id, name: product.name, image: product.image, pack: pack.label, unitPrice, qty }];
    });
    notify(`${product.name} added to cart`);
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
    const count = cart.reduce((s, l) => s + l.qty, 0);
    const subtotal = cart.reduce((s, l) => s + l.qty * l.unitPrice, 0);
    return {
      cart, count, subtotal, addToCart, updateQty, clearCart,
      wishlist, toggleWish,
      authMode, openAuth: setAuthMode, closeAuth: () => setAuthMode(null),
      cartOpen, openCart: () => setCartOpen(true), closeCart: () => setCartOpen(false),
      toast, notify,
    };
  }, [cart, wishlist, authMode, cartOpen, toast, addToCart, toggleWish, notify, clearCart]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);

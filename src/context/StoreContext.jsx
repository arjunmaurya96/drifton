import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, db, firebaseReady } from '../lib/firebase.js';
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
  // Old saved carts rebuild each line from current product data
  const [cart, setCart] = useState(() =>
    load('drifton_cart', []).map((l) => {
      const p = products.find((x) => x.id === (l.id === 'lavender' ? 'natural' : l.id));
      if (!p) return null;
      const sticks = l.sticks || (/2/.test(l.pack) ? 2 : /3/.test(l.pack) ? 3 : 1);
      return {
        ...l,
        key: `${p.id}-${sticks}`,
        id: p.id,
        name: p.name,
        image: p.image,
        sticks,
        pack: sticks === 2 ? 'Combo of 2' : sticks === 1 ? 'Single' : l.pack,
        unitPrice: UNIT_PRICE * sticks,
      };
    }).filter(Boolean)
  );

  const [wishlist, setWishlist] = useState(() => load('drifton_wish', []));
  const [authMode, setAuthMode] = useState(null); // 'login' | 'signup' | null
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [buy, setBuy] = useState(null); // { lines, fromCart } for the Buy now modal
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const timer = useRef();

  // User Auth & Profile State
  const [user, setUser] = useState(() => (firebaseReady ? null : load('drifton_user_demo', null)));
  const [userProfile, setUserProfile] = useState(() => load('drifton_profile_data', {}));
  const [userOrders, setUserOrders] = useState(() => load('drifton_user_orders_cache', []));
  const [authLoading, setAuthLoading] = useState(true);
  const afterAuthCallback = useRef(null);

  // Sync cart & wishlist
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

  // Fetch or sync user profile & past orders
  const loadUserData = useCallback(async (u) => {
    if (!u) {
      setUserProfile({});
      setUserOrders([]);
      return;
    }

    // 1. Fetch user profile from Firestore or local storage
    if (firebaseReady && db) {
      try {
        const uDoc = await getDoc(doc(db, 'users', u.uid));
        if (uDoc.exists()) {
          const p = uDoc.data();
          setUserProfile(p);
          localStorage.setItem('drifton_profile_data', JSON.stringify(p));
        } else {
          // Initialize user doc
          const initial = {
            name: u.displayName || 'Customer',
            email: u.email || '',
            phone: u.phoneNumber || '',
            address: '',
            pin: '',
            city: '',
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'users', u.uid), initial, { merge: true });
          setUserProfile(initial);
          localStorage.setItem('drifton_profile_data', JSON.stringify(initial));
        }
      } catch (err) {
        console.warn('Could not load user profile from Firestore:', err);
      }

      // 2. Query user orders from Firestore
      try {
        const qOrders = query(
          collection(db, 'orders'),
          where('email', '==', (u.email || '').toLowerCase())
        );
        const snap = await getDocs(qOrders);
        const list = [];
        snap.forEach((d) => list.push(d.data()));
        list.sort((a, b) => new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime());
        
        // Merge with local orders cache
        const localOrders = load('drifton_user_orders_cache', []);
        const mergedMap = new Map();
        [...localOrders, ...list].forEach((o) => {
          if (o && o.id) mergedMap.set(o.id, o);
        });
        const finalOrders = [...mergedMap.values()].sort((a, b) => new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime());
        setUserOrders(finalOrders);
        localStorage.setItem('drifton_user_orders_cache', JSON.stringify(finalOrders));
      } catch (err) {
        console.warn('Could not query user orders:', err);
      }
    }
  }, []);

  // Watch Firebase Auth
  useEffect(() => {
    if (!firebaseReady || !auth) {
      setAuthLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (currUser) => {
      setUser(currUser);
      setAuthLoading(false);
      if (currUser) {
        await loadUserData(currUser);
        if (afterAuthCallback.current) {
          const fn = afterAuthCallback.current;
          afterAuthCallback.current = null;
          fn();
        }
      }
    });

    return () => unsub();
  }, [loadUserData]);

  // Auth Functions
  const loginWithGoogle = useCallback(async () => {
    if (!firebaseReady || !auth) {
      // Demo Google login
      const demoUser = {
        uid: 'demo_user_101',
        displayName: 'Demo User',
        email: 'user@example.com',
        photoURL: '',
      };
      setUser(demoUser);
      localStorage.setItem('drifton_user_demo', JSON.stringify(demoUser));
      notify('Signed in with Google (Demo)');
      setAuthMode(null);
      if (afterAuthCallback.current) {
        const fn = afterAuthCallback.current;
        afterAuthCallback.current = null;
        fn();
      }
      return { ok: true, user: demoUser };
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      // Prevent infinite hanging if browser COOP blocks popup.closed
      const popupPromise = signInWithPopup(auth, provider);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject({ code: 'auth/timeout', message: 'Sign-in took too long or popup was closed.' }), 50000)
      );
      const res = await Promise.race([popupPromise, timeoutPromise]);

      notify(`Welcome, ${res.user.displayName || 'Customer'}!`);
      setAuthMode(null);
      return { ok: true, user: res.user };
    } catch (err) {
      console.error('Google login error:', err);
      let msg = err.message || 'Google sign-in failed.';
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/timeout') {
        msg = 'Google window was closed or timed out. Please try again.';
      } else if (err.code === 'auth/popup-blocked') {
        msg = 'Pop-up was blocked by your browser. Please allow popups for localhost.';
      } else if (err.code === 'auth/unauthorized-domain') {
        msg = 'Domain not authorized in Firebase Console (Authentication > Settings > Authorized domains).';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'Google provider is not enabled in Firebase Console (Authentication > Sign-in method).';
      } else {
        msg = msg.replace('Firebase:', '').trim();
      }
      return { ok: false, error: msg };
    }
  }, [notify]);

  const loginWithEmail = useCallback(async (email, password) => {
    if (!firebaseReady || !auth) {
      const demoUser = {
        uid: 'demo_user_102',
        displayName: email.split('@')[0],
        email: email.trim().toLowerCase(),
      };
      setUser(demoUser);
      localStorage.setItem('drifton_user_demo', JSON.stringify(demoUser));
      notify('Logged in successfully (Demo)');
      setAuthMode(null);
      if (afterAuthCallback.current) {
        const fn = afterAuthCallback.current;
        afterAuthCallback.current = null;
        fn();
      }
      return { ok: true, user: demoUser };
    }

    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), password);
      notify(`Welcome back, ${res.user.displayName || 'Customer'}!`);
      setAuthMode(null);
      return { ok: true, user: res.user };
    } catch (err) {
      return { ok: false, error: err.message.replace('Firebase:', '').trim() };
    }
  }, [notify]);

  const signupWithEmail = useCallback(async (email, password, name, phone) => {
    if (!firebaseReady || !auth) {
      const demoUser = {
        uid: 'demo_user_' + Date.now().toString().slice(-6),
        displayName: name || email.split('@')[0],
        email: email.trim().toLowerCase(),
        phone: phone || '',
      };
      setUser(demoUser);
      localStorage.setItem('drifton_user_demo', JSON.stringify(demoUser));
      notify('Account created successfully (Demo)');
      setAuthMode(null);
      if (afterAuthCallback.current) {
        const fn = afterAuthCallback.current;
        afterAuthCallback.current = null;
        fn();
      }
      return { ok: true, user: demoUser };
    }
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (name) {
        await updateProfile(res.user, { displayName: name });
      }
      // Save initial profile in Firestore
      if (db) {
        await setDoc(doc(db, 'users', res.user.uid), {
          name: name || '',
          email: email.trim().toLowerCase(),
          phone: phone || '',
          address: '',
          pin: '',
          city: '',
          createdAt: new Date().toISOString(),
        });
      }
      notify(`Welcome to DriftOn, ${name || 'Customer'}!`);
      setAuthMode(null);
      return { ok: true, user: res.user };
    } catch (err) {
      return { ok: false, error: err.message.replace('Firebase:', '').trim() };
    }
  }, [notify]);

  const logout = useCallback(async () => {
    if (firebaseReady && auth) {
      await signOut(auth);
    }
    setUser(null);
    setUserProfile({});
    localStorage.removeItem('drifton_user_demo');
    localStorage.removeItem('drifton_profile_data');
    notify('Logged out successfully');
  }, [notify]);

  // Update profile details (Name, phone, address, pincode)
  const updateUserProfile = useCallback(async (patch) => {
    const next = { ...userProfile, ...patch };
    setUserProfile(next);
    localStorage.setItem('drifton_profile_data', JSON.stringify(next));

    if (user && firebaseReady && db) {
      try {
        await setDoc(doc(db, 'users', user.uid), next, { merge: true });
        notify('Profile and address saved');
      } catch (err) {
        console.warn('Error saving profile:', err);
      }
    } else {
      notify('Profile updated');
    }
  }, [user, userProfile, notify]);

  // Add new order to user's order history
  const recordUserOrder = useCallback((orderData) => {
    setUserOrders((prev) => {
      const next = [orderData, ...prev.filter((o) => o.id !== orderData.id)];
      try {
        localStorage.setItem('drifton_user_orders_cache', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Gatekeeping function: Requires user to be logged in before proceeding
  const requireAuth = useCallback((callback) => {
    if (user) {
      callback();
    } else {
      afterAuthCallback.current = callback;
      setAuthMode('login');
      notify('Please log in or sign up to continue to payment.');
    }
  }, [user, notify]);

  // Cart operations
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
    const count = cart.reduce((s, l) => s + l.qty * (l.sticks || 1), 0);
    const summary = summarize(cart);
    const subtotal = summary.items;
    return {
      cart, count, subtotal, summary, addToCart, updateQty, clearCart,
      wishlist, toggleWish,
      authMode, openAuth: setAuthMode, closeAuth: () => setAuthMode(null),
      cartOpen, openCart: () => setCartOpen(true), closeCart: () => setCartOpen(false),
      toast, notify,
      buy,
      openBuy: (lines, fromCart = false) => {
        if (lines && lines.length > 0 && !fromCart) {
          setCart((prev) => {
            const copy = [...prev];
            for (const line of lines) {
              const idx = copy.findIndex((l) => l.id === line.id && l.sticks === line.sticks);
              if (idx >= 0) copy[idx] = { ...copy[idx], qty: line.qty };
              else copy.push(line);
            }
            return copy;
          });
        }
        setCartOpen(false);
        setCheckoutOpen(true);
      },
      closeBuy: () => setBuy(null),
      checkoutOpen, openCheckout: () => { setCartOpen(false); setCheckoutOpen(true); }, closeCheckout: () => setCheckoutOpen(false),
      // User Profile & Authentication exports
      user, userProfile, userOrders, authLoading,
      loginWithGoogle, loginWithEmail, signupWithEmail, logout,
      updateUserProfile, recordUserOrder, requireAuth,
    };
  }, [
    cart, wishlist, authMode, cartOpen, toast, addToCart, toggleWish, notify, clearCart, buy, checkoutOpen,
    user, userProfile, userOrders, authLoading,
    loginWithGoogle, loginWithEmail, signupWithEmail, logout,
    updateUserProfile, recordUserOrder, requireAuth,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);

// =====================================================================
//  Website ↔ database. Every function works in DEMO mode too (no Firebase keys).
//
//  Firestore collections:
//    orders/{JSR-drifton-0041}   one document per order
//    counters/orders             { next: 41 }  → order number counter
//    enquiries/{auto id}         Contact page messages
//    config/store                prices, offers, coupons, product price/stock/visibility, settings
//    reviews/{auto id}           customer reviews (admin publishes them)
//    admins/{uid}                who can open the admin panel
// =====================================================================
import { firebaseReady } from './firebaseReady.js';

// Firebase is loaded only when needed, so the website's first load stays fast
const fb = async () => {
  const [{ db }, fs] = await Promise.all([import('./firebase.js'), import('firebase/firestore')]);
  return { db, ...fs };
};

export const ORDER_PREFIX = 'JSR-drifton-';
export const FIRST_ORDER_NO = 41; // first order = JSR-drifton-0041
export const formatOrderId = (n) => `${ORDER_PREFIX}${String(n).padStart(4, '0')}`;

// Save a new order and give it the next number (JSR-drifton-0041, 0042 …)
export async function saveOrder(order) {
  if (!firebaseReady) {
    // DEMO: number kept in this browser only
    let n = FIRST_ORDER_NO;
    try { n = Number(localStorage.getItem('drifton_demo_order_no')) || FIRST_ORDER_NO; localStorage.setItem('drifton_demo_order_no', String(n + 1)); } catch { /* ignore */ }
    return { id: formatOrderId(n), demo: true };
  }
  const { db, doc, runTransaction, serverTimestamp } = await fb();
  const counterRef = doc(db, 'counters', 'orders');
  const id = await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const n = snap.exists() ? snap.data().next : FIRST_ORDER_NO;
    const orderId = formatOrderId(n);
    if (snap.exists()) tx.update(counterRef, { next: n + 1 }); else tx.set(counterRef, { next: n + 1 });
    tx.set(doc(db, 'orders', orderId), { ...order, id: orderId, no: n, status: 'New', tracking: '', createdAt: serverTimestamp() });
    return orderId;
  });
  return { id };
}

// Save a Contact page message (order question, distributor, retailer …)
export async function saveEnquiry(enq) {
  if (!firebaseReady) return { demo: true };
  const { db, collection, addDoc, serverTimestamp } = await fb();
  await addDoc(collection(db, 'enquiries'), { ...enq, status: 'New', createdAt: serverTimestamp() });
  return { ok: true };
}

// Store settings (prices, offers, coupons, products, announcement) set from the admin panel
export async function loadStoreConfig() {
  if (!firebaseReady) return null;
  try {
    const { db, doc, getDoc } = await fb();
    const snap = await getDoc(doc(db, 'config', 'store'));
    return snap.exists() ? snap.data() : null;
  } catch {
    return null; // site keeps its built-in values
  }
}

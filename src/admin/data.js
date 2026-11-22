// =====================================================================
//  ADMIN PANEL — DEMO DATA
//  Used only when Firebase keys are NOT set (demo mode).
//  `defaultConfig` is also what "Publish default settings" writes to Firebase.
// =====================================================================
import { products, UNIT_PRICE, COMBO_PRICE, NATURAL_PAIR_PRICE, THIRD_PRICE, DELIVERY_FEE, coupons } from '../data/products.js';
import { business } from '../data/site.js';
import { formatOrderId, FIRST_ORDER_NO } from '../lib/api.js';

// small deterministic random so the demo looks the same on every reload
let seed = 7;
const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
const pick = (a) => a[Math.floor(rnd() * a.length)];

const first = ['Riya', 'Aman', 'Priya', 'Karan', 'Neha', 'Rahul', 'Sneha', 'Arjun', 'Pooja', 'Vikram', 'Ananya', 'Rohit', 'Isha', 'Sahil', 'Meera', 'Kabir', 'Tanya', 'Nikhil', 'Diya', 'Aditya'];
const last = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Mehta', 'Kapoor', 'Jain', 'Malhotra', 'Arora', 'Chopra', 'Bansal', 'Khanna'];
const cities = ['New Delhi', 'Gurugram', 'Noida', 'Mumbai', 'Pune', 'Bengaluru', 'Jaipur', 'Lucknow', 'Chandigarh', 'Hyderabad', 'Kolkata', 'Ahmedabad'];

export const ORDER_STATUSES = ['New', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];
export const PAYMENT = ['UPI', 'Card', 'Net banking', 'COD'];

const DAY = 86400000;
const today = new Date(); today.setHours(12, 0, 0, 0);

// customers
const customers = Array.from({ length: 34 }, (_, i) => {
  const name = `${first[i % first.length]} ${pick(last)}`;
  return {
    id: `C${1001 + i}`,
    name,
    phone: `9${Math.floor(100000000 + rnd() * 899999999)}`,
    email: `${name.toLowerCase().replace(/\s/g, '.')}@gmail.com`,
    city: pick(cities),
    joined: new Date(today - Math.floor(rnd() * 60) * DAY).toISOString(),
  };
});

// order price with the site's offers
const priceOf = (items) => {
  const n = items.reduce((s, i) => s + i.qty, 0);
  const naturals = items.filter((i) => i.id === 'natural').reduce((s, i) => s + i.qty, 0);
  const sets = Math.floor(n / 3), rest = n % 3, pairs = sets + (rest === 2 ? 1 : 0);
  const np = Math.min(pairs, naturals);
  const sub = np * NATURAL_PAIR_PRICE + (pairs - np) * COMBO_PRICE + sets * THIRD_PRICE + (rest === 1 ? UNIT_PRICE : 0);
  return { sticks: n, subtotal: sub, delivery: n === 1 ? DELIVERY_FEE : 0, total: sub + (n === 1 ? DELIVERY_FEE : 0) };
};

const orders = Array.from({ length: 64 }, (_, i) => {
  const c = pick(customers);
  const daysAgo = Math.floor(Math.pow(rnd(), 1.4) * 30);
  const items = [];
  const kinds = 1 + Math.floor(rnd() * 2.2);
  for (let k = 0; k < kinds; k++) {
    const p = pick(products);
    const f = items.find((x) => x.id === p.id);
    if (f) f.qty += 1; else items.push({ id: p.id, name: p.name, qty: 1 });
  }
  const pr = priceOf(items);
  let status = daysAgo > 6 ? 'Delivered' : daysAgo > 3 ? pick(['Shipped', 'Delivered']) : daysAgo > 1 ? pick(['Packed', 'Shipped']) : pick(['New', 'New', 'Packed']);
  if (rnd() < 0.05) status = 'Cancelled';
  return {
    id: formatOrderId(FIRST_ORDER_NO + 63 - i),
    customerId: c.id, customer: c.name, phone: c.phone, city: c.city,
    address: `${Math.floor(rnd() * 200) + 1}, Sector ${Math.floor(rnd() * 60) + 1}, ${c.city}`,
    items, ...pr,
    payment: pick(PAYMENT),
    status,
    tracking: ['Shipped', 'Delivered'].includes(status) ? `EK${Math.floor(1e9 + rnd() * 9e9)}` : '',
    date: new Date(today - daysAgo * DAY - Math.floor(rnd() * 10) * 3600000).toISOString(),
  };
}).sort((a, b) => b.date.localeCompare(a.date)).map((o, i, all) => ({ ...o, id: formatOrderId(FIRST_ORDER_NO + all.length - 1 - i) }));

const enquiries = [
  ['distributor', 'Manoj Agarwal', 'Agarwal Distributors', 'Jaipur', 'We distribute personal care products across Rajasthan. Interested in DriftOn distribution.'],
  ['retailer', 'Sunita Rao', 'Rao Pharmacy', 'Bengaluru', 'Want to stock all 4 variants in our pharmacy. Please share retailer pricing.'],
  ['order', 'Riya Sharma', '', 'New Delhi', 'When will my order JSR-drifton-0102 be delivered?'],
  ['product', 'Aman Verma', '', 'Noida', 'Is the Natural roll on safe for sensitive skin?'],
  ['distributor', 'Imran Shaikh', 'Shaikh Traders', 'Mumbai', 'Looking for distributorship for Mumbai suburbs.'],
  ['bulk', 'Kavya Nair', 'FitLife Gyms', 'Pune', 'Need 200 roll ons for our gym members. Bulk price?'],
  ['retailer', 'Deepak Jain', 'Jain General Store', 'Indore', 'Can we get a sample kit before placing the order?'],
  ['returns', 'Pooja Mehta', '', 'Gurugram', 'Received a damaged pack. Sharing photos on email.'],
  ['other', 'Harsh Gupta', '', 'Lucknow', 'Do you ship to Nepal?'],
].map(([topic, name, company, city, msg], i) => ({
  id: `E${501 + i}`, topic, name, company, city, msg,
  email: `${name.split(' ')[0].toLowerCase()}@example.com`,
  phone: `98${Math.floor(10000000 + rnd() * 89999999)}`,
  status: i < 4 ? 'New' : i < 7 ? 'Contacted' : 'Closed',
  date: new Date(today - i * 0.7 * DAY).toISOString(),
}));

const reviews = [
  ['palash', 5, 'Fresh and light', 'Feels very light and fresh. No white marks on my clothes at all.', 'Published'],
  ['charcoal', 5, 'Great for gym days', 'I use it before workouts. Quick to apply and easy to carry.', 'Published'],
  ['rose', 4, 'Lovely smell', 'Gentle on skin and the rose note is soft, not overpowering.', 'Published'],
  ['natural', 5, 'Simple and works', 'No fragrance, no fuss. Exactly what I wanted.', 'Pending'],
  ['rose', 3, 'Okay', 'Works fine, packaging could be better.', 'Pending'],
  ['palash', 5, 'Love the colour', 'Looks premium on my shelf and lasts long.', 'Hidden'],
].map(([productId, rating, title, text, status], i) => ({
  id: `R${301 + i}`, productId, rating, title, text, status,
  customer: `${first[(i * 3) % first.length]} ${last[i % last.length]}`,
  date: new Date(today - (i * 2 + 1) * DAY).toISOString(),
}));

export const initialData = {
  orders,
  customers,
  enquiries,
  reviews,
  products: products.map((p, i) => ({
    id: p.id, name: p.name, short: p.short, image: p.image, bg: p.bg, accent: p.accent, tag: p.tag,
    price: p.price, stock: [120, 64, 92, 18][i], active: true, ingredients: p.ingredients,
  })),
  offers: [
    { id: 'natural-pair', title: '⚡ Offer 1 · 2 Roll Ons', desc: 'Add another Natural fresh rollon starting ₹325 onwards', value: NATURAL_PAIR_PRICE, unit: '₹ for 2', active: true },
    { id: 'any-pair', title: 'Any 2 roll ons', desc: 'Pair price without a Natural roll on.', value: COMBO_PRICE, unit: '₹ for 2', active: true },
    { id: 'third', title: '3rd roll on deal', desc: 'Add any 3rd roll on for just ₹300!', value: THIRD_PRICE, unit: '₹ for 3rd', active: true },
    { id: 'delivery', title: 'Delivery charge', desc: 'On single roll on orders. Free on 2 or more.', value: DELIVERY_FEE, unit: '₹', active: true },
  ],
  coupons: Object.entries(coupons).map(([code, c]) => ({ code, off: c.off, note: c.note, validFrom: c.validFrom || null, validUntil: c.validUntil || null, uses: 23, active: true }))
    .concat([
      { code: 'INSTA@50', off: 50, note: 'Instagram follower discount', validFrom: null, validUntil: null, uses: 8, active: true },
      { code: 'DIWALI#150', off: 150, note: 'Festive offer (expired)', validFrom: '2026-10-01T00:00', validUntil: '2026-11-01T23:59', uses: 41, active: false }
    ]),
  settings: {
    storeName: 'DriftOn™', legalName: business.legalName, email: business.email, phone: business.phone || '',
    address: business.address, hours: business.hours,
    announcement: '💥 Unlock Special Discounts at Checkout!',
    gst: '07ACIFA5199E1Z8',
    manufacturer: business.manufacturer.name, manufacturerAddress: business.manufacturer.address, licence: business.manufacturer.licence,
  },
};

export const TOPIC_LABEL = { order: 'Order & delivery', returns: 'Returns & refunds', product: 'Product question', distributor: 'Distributor', retailer: 'Retailer', bulk: 'Bulk / wholesale', other: 'Other' };

// website settings that live in Firestore config/store
export const defaultConfig = () => ({
  products: initialData.products,
  offers: initialData.offers,
  coupons: initialData.coupons.filter((c) => c.active).map(({ code, off, note, validFrom, validUntil, active }) => ({ code, off, note, validFrom: validFrom || null, validUntil: validUntil || null, active })),
  settings: initialData.settings,
});

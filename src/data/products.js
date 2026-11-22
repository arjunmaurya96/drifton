// =====================================================================
//  ALL STORE DATA LIVES HERE. Values in [BRACKETS] and the prices are
//  dummy preview content — replace them with the client's real data.
// =====================================================================
const IMG = '/assets/images';
const VID = '/assets/videos';

// ===== Pricing (from the client) =====
// One stick ₹475 + delivery. Any 2 sticks = combo ₹800 (applied automatically in the cart).
// DELIVERY_FEE is a PLACEHOLDER — confirm the real delivery charge with the client.
export let UNIT_PRICE = 475;
export let COMBO_PRICE = 800;
export let DELIVERY_FEE = 50; // DUMMY — charged on single-stick orders only; combos ship free
export let COMBO_SAVING = UNIT_PRICE * 2 - COMBO_PRICE; // ₹150 per pair

// Price for n sticks with the combo applied to every pair
// Cart offers (client):
//  • Offer 1 — add a Natural Alum Roll On as the 2nd roll on: the pair costs ₹750 (any other pair: ₹800).
//  • Offer 2 — after 2 roll ons, the 3rd roll on (any variant) costs just ₹300.
//  Works in sets of 3: [pair + ₹300 third]. A leftover pair = pair price, a leftover single = ₹475.
export let NATURAL_PAIR_PRICE = 800;
// which offers are switched on (admin panel → Offers & coupons)
export const OFFERS_ON = { naturalPair: true, anyPair: true, third: false, delivery: true };
export let THIRD_PRICE = 300;

export let STORE_OFFERS = {
  'natural-pair': {
    id: 'natural-pair',
    title: '⚡ Offer 1 · 2 Roll Ons',
    desc: 'Add another Natural fresh rollon starting ₹325 onwards',
    value: 800,
    unit: '₹ for 2',
    active: true,
  },
  'any-pair': {
    id: 'any-pair',
    title: 'Any 2 roll ons',
    desc: 'Pair price without a Natural roll on.',
    value: 800,
    unit: '₹ for 2',
    active: true,
  },
  third: {
    id: 'third',
    title: '3rd roll on deal',
    desc: 'Add any 3rd roll on for just ₹300!',
    value: 300,
    unit: '₹ for 3rd',
    active: false,
  },
  delivery: {
    id: 'delivery',
    title: 'Delivery charge',
    desc: 'On single roll on orders. Free on 2 or more.',
    value: 50,
    unit: '₹',
    active: true,
  },
};

// Computes transparent individual line item pricing with combo discounts applied to each item
export function computeCartLinePrices(cart) {
  let stickIndex = 0;
  const result = {};

  cart.forEach((l) => {
    const totalSticks = (l.sticks || 1) * l.qty;
    let lineTotal = 0;
    let regularTotal = totalSticks * UNIT_PRICE;
    let hasOffer = false;

    for (let i = 0; i < totalSticks; i++) {
      stickIndex++;
      const pos = stickIndex % 2;
      if (pos === 1) {
        // 1st stick of pair: base unit price (₹475)
        lineTotal += UNIT_PRICE;
      } else {
        // 2nd stick of pair: Combo offer price -> exactly ₹325!
        const secondPrice = 325;
        lineTotal += secondPrice;
        hasOffer = true;
      }
    }

    result[l.key] = {
      lineTotal,
      regularTotal,
      hasOffer,
      unitPrice: Math.round(lineTotal / l.qty),
    };
  });

  return result;
}

export const priceFor = (n) => {
  const pairs = Math.floor(n / 2);
  const leftover = n % 2;
  const pairPrice = OFFERS_ON.anyPair ? COMBO_PRICE : UNIT_PRICE * 2;
  return pairs * pairPrice + leftover * UNIT_PRICE;
};

// Coupons — DUMMY codes, confirm with the client
export const coupons = {
  FIRST50: { off: 50, note: '₹50 off on your order' },
  DRIFTON100: { off: 100, note: '₹100 off (single-stick orders, not with combos)' },
  WELCOME50: { off: 50, note: '₹50 welcome discount' },
};

// The real combos from the client (each = 2 roll ons for ₹800)
export const combos = [
  { id: 'rose-palash', name: 'Rose + Palash Roll On', items: ['rose', 'palash'], tag: 'Floral pair' },
  { id: 'charcoal-rose', name: 'Charcoal + Rose Roll On', items: ['charcoal', 'rose'], tag: 'Fresh + floral' },
  { id: 'natural-rose', name: 'Natural + Rose Roll On', items: ['natural', 'rose'], tag: 'Pure + floral' },
];

export const products = [
  {
    id: 'palash',
    scene: `${IMG}/scenes/palash.webp`,
    card: `${IMG}/scenes/palash-card.webp`, // 'Pick your variant' card photo (4:5) // product photo with its natural ingredient (phitku style)
    slug: 'palash-alum-stick',
    name: 'Palash Alum Roll On',
    short: 'Palash',
    tag: 'Floral · Bestseller',
    badge: 'Bestseller',
    price: UNIT_PRICE,
    image: `${IMG}/cutouts/palash.webp`, // product only, no background
    photo: `${IMG}/palash.jpg`,
    video: null,
    poster: `${IMG}/poster-palash.jpg`,
    bg: '#FCEFD9',
    accent: '#A3461A',
    ingredients: ['Natural potassium alum', 'Glycerine', 'Palash extract', 'Colour', 'Fragrance'],
    ingredient: 'Palash extract',
    ingredientNote: 'Extract of the bright orange Palash flower, long used in Indian traditions, for a warm floral touch.',
    tagline: 'Warm, floral and naturally soothing',
    description:
      'Natural potassium alum with Palash extract and glycerine. Glides on clear, leaves no white marks and keeps you feeling fresh through the day.',
  },
  {
    id: 'charcoal',
    scene: `${IMG}/scenes/charcoal.webp`,
    card: `${IMG}/scenes/charcoal-card.webp`, // 'Pick your variant' card photo (4:5) // product photo with its natural ingredient (phitku style)
    slug: 'charcoal-alum-stick',
    name: 'Charcoal Alum Roll On',
    short: 'Charcoal',
    tag: 'Detox · Fresh',
    badge: 'New',
    price: UNIT_PRICE,
    image: `${IMG}/cutouts/charcoal.webp`, // product only, no background
    photo: `${IMG}/charcoal.jpg`,
    video: null,
    poster: `${IMG}/poster-charcoal.jpg`,
    bg: '#E4E6EB',
    accent: '#3A4466',
    ingredients: ['Natural potassium alum', 'Glycerine', 'Activated charcoal', 'Fragrance'],
    ingredient: 'Activated charcoal',
    ingredientNote: 'Known for its deep-clean feel, paired with alum for active, sweaty days.',
    tagline: 'A deep-clean feel for active days',
    description:
      'Natural potassium alum with activated charcoal and glycerine for a fresh, deep-clean feel. Made for gym days, long commutes and everything in between.',
  },
  {
    id: 'rose',
    scene: `${IMG}/scenes/rose.webp`,
    card: `${IMG}/scenes/rose-card.webp`, // 'Pick your variant' card photo (4:5) // product photo with its natural ingredient (phitku style)
    slug: 'rose-alum-stick',
    name: 'Rose Alum Roll On',
    short: 'Rose',
    tag: 'Floral · Gentle',
    badge: 'Popular',
    price: UNIT_PRICE,
    image: `${IMG}/cutouts/rose.webp`, // product only, no background
    photo: `${IMG}/rose.jpg`,
    video: null,
    poster: `${IMG}/poster-rose.jpg`,
    bg: '#FBE3EA',
    accent: '#A02E54',
    ingredients: ['Natural potassium alum', 'Glycerine', 'Rose extract', 'Colour', 'Fragrance'],
    ingredient: 'Rose extract',
    ingredientNote: 'A classic, gentle floral note that keeps the routine light and pleasant.',
    tagline: 'Soft, classic and gentle on skin',
    description:
      'Natural potassium alum with rose extract and glycerine. Gentle on skin, easy to apply and a classic everyday favourite.',
  },
  {
    id: 'natural',
    scene: `${IMG}/scenes/natural.webp`,
    card: `${IMG}/scenes/natural-card.webp`, // 'Pick your variant' card photo (4:5) // product photo with its natural ingredient (phitku style)
    slug: 'natural-alum-stick',
    name: 'Natural Alum Roll On',
    short: 'Natural',
    tag: 'Pure · Fragrance free',
    badge: 'Pure',
    price: UNIT_PRICE,
    image: `${IMG}/cutouts/crystal.webp`, // product only, no background
    photo: `${IMG}/lavender-crystal.jpg`,
    video: null,
    poster: null,
    bg: '#D9ECFA',
    accent: '#1C6FB8',
    ingredients: ['Natural potassium alum', 'Glycerine'],
    ingredient: 'Glycerine',
    ingredientNote: 'Helps the crystal glide smoothly on damp skin. Nothing else added.',
    tagline: 'Just alum. Nothing else.',
    description:
      'Only natural potassium alum and glycerine — no colour, no fragrance. The simplest way to stay fresh every day.',
  },
];

// ===== Home hero banner =====
// Left: model photo. Middle: headline, key ingredients, SHOP NOW. Right: the product on its own (no box, no shadow).
// Background: a gradient in the product's own colours.
// modelPhoto: photo on the left. Slides alternate girl / boy:
//   public/assets/images/models/model-girl.webp and model-boy.jpg (until model-boy.jpg is added, the girl photo is shown).
// cutout: transparent PNG of just the product (public/assets/images/cutouts/).
// rightImage: product photo shown on the right (soft-faded edges). Put one per slide in
//   public/assets/images/hero-products/ (e.g. range-palash.jpg). If empty, the cutout is shown.
// Ingredients from the client's list.
// icon: 'gem' | 'flower' | 'leaf' | 'drop' | 'hex' | 'sprig'
export const bannerSlides = [
  // Campaign photo from the client on the left, products on the right
  {
    productId: 'rose', modelPhoto: '/assets/images/hero-campaign.webp', modelPos: '50% 0%', cutout: '/assets/images/cutouts/rose.webp', rightImage: '/assets/images/hero-products/range-rose.webp',
    bgFrom: '#F3E9F3', bgTo: '#F7B9D0', glow: '#FF9CC2', dark: false, accent: '#A02E54',
  },
  {
    productId: 'palash', modelPhoto: '/assets/images/models/model-palash-robe.jpg', modelPos: '50% 20%', modelZoomOut: true, edge: ['#D0CBBD', '#E2D3D2', '#F1E7F3'], cutout: '/assets/images/cutouts/palash.webp', rightImage: '/assets/images/hero-products/range-palash.webp',
    bgFrom: '#FBF2E1', bgTo: '#F8D48E', glow: '#FFC65C', dark: false, accent: '#C2571A',
    serif: 'Crystal Roll On', line: 'that keeps you fresh 24/7',
    ingredients: [
      { name: 'Natural Alum', icon: 'gem' }, { name: 'Glycerine', icon: 'drop' },
      { name: 'Palash Extract', icon: 'flower' }, { name: 'Fragrance', icon: 'sprig' },
    ],
  },
  {
    productId: 'charcoal', modelPhoto: '/assets/images/models/hero-duo-2.webp', modelPos: '50% 20%', modelZoomOut: true, edge: ['#C9BBDA', '#E6D3D6', '#C4C1D6'], cutout: '/assets/images/cutouts/charcoal.webp', rightImage: '/assets/images/hero-products/range-charcoal.webp',
    bgFrom: '#F1EFF5', bgTo: '#C9D0DE', glow: '#AFBBD2', dark: false, accent: '#2E3A4F',
    serif: 'Deep clean', line: 'for your busiest days',
    ingredients: [
      { name: 'Natural Alum', icon: 'gem' }, { name: 'Glycerine', icon: 'drop' },
      { name: 'Activated Charcoal', icon: 'hex' }, { name: 'Fragrance', icon: 'sprig' },
    ],
  },
  {
    productId: 'rose', modelPhoto: '/assets/images/models/model-two-girls-drifton.jpg', modelPos: '50% 15%', cutout: '/assets/images/cutouts/rose.webp', rightImage: '/assets/images/hero-products/range-rose.webp',
    bgFrom: '#F2EAF6', bgTo: '#DCC4F1', glow: '#C7A0F4', dark: false, accent: '#B0305D',
    serif: 'Soft & fresh', line: 'with a touch of rose',
    ingredients: [
      { name: 'Natural Alum', icon: 'gem' }, { name: 'Glycerine', icon: 'drop' },
      { name: 'Rose Extract', icon: 'flower' }, { name: 'Fragrance', icon: 'sprig' },
    ],
  },
  {
    productId: 'natural', modelPhoto: '/assets/images/models/model-natural-full.webp', modelPos: '50% 15%', modelZoomOut: true, edge: ['#CAC4CB', '#C8C4CA', '#D2CBD5'], cutout: '/assets/images/cutouts/crystal.webp', rightImage: '/assets/images/hero-products/range-natural.webp',
    bgFrom: '#F5EFE7', bgTo: '#EBD7BC', glow: '#EBC99E', dark: false, accent: '#1C6FB8',
    serif: 'Pure & clear', line: 'natural mineral freshness',
    ingredients: [
      { name: 'Natural Alum', icon: 'gem' }, { name: 'Glycerine', icon: 'drop' },
    ],
  },
];

// Hero video slides (no longer used on the home page; product videos are still shown in the product gallery).
export const heroSlides = [
  { productId: 'palash', eyebrow: 'Natural Crystal Roll On', title: 'Stay fresh.', highlight: 'Naturally.', text: 'Drifton alum crystal roll ons keep odour away with one simple glide. Four botanical variants, one clean routine.' },
  { productId: 'charcoal', eyebrow: 'New · Charcoal Alum', title: 'Deep clean.', highlight: 'All day fresh.', text: 'Activated charcoal meets natural alum crystal. Made for active days and long commutes.' },
  { productId: 'rose', eyebrow: 'Floral · Gentle care', title: 'Soft as a', highlight: 'rose.', text: 'A gentle rose-infused crystal roll on that glides on clear, with no white marks.' },
];

// Offer shown on the product page
export const offer = { title: '2 roll ons for ₹750 · 3rd for just ₹300', note: 'Add a Natural Alum Roll On as your 2nd and pay ₹750 for both. Your 3rd roll on (any variant) is just ₹300. Applied automatically in your cart.' };

export const packs = [
  { id: 1, label: 'Single', note: '+ delivery', multiplier: 1 },
  { id: 2, label: 'Combo of 2', note: `Save ₹${COMBO_SAVING} · free delivery`, multiplier: 2 },
];

// Shared product-page content (same for every variant)
export const productInfo = {
  loveIt: [
    { title: 'Natural alum crystal', icon: 'gem' },
    { title: 'No Alcohol', icon: 'check' },
    { title: '100% Natural', icon: 'leaf' },
    { title: 'Travel Friendly', icon: 'box' },
    { title: 'Mild Fragrance', icon: 'sparkle' },
    { title: 'Botanical Blends', icon: 'flower' },
  ],
  howItWorks: [
    { title: 'Mineral freshness', text: 'Alum is a mineral salt that has been used for generations as a simple way to keep underarm odour in check.' },
    { title: 'A light botanical touch', text: 'Each variant adds a botanical note, so your routine feels fresh without a heavy perfume.' },
  ],
  details: [
    ['Colour', 'Clear crystal with botanical tint'],
    ['Weight', '60g'],
    ['Structure', 'Solid crystal roll on with twist base'],
    ['Texture', 'Smooth, glides when wet'],
    ['Special features', 'No white marks, travel friendly'],
  ],
  howToUse: [
    { title: 'Prepare the skin', text: 'Start with clean skin, ideally right after a shower.' },
    { title: 'Wet the surface', text: 'Dip the crystal tip in water for a second.' },
    { title: 'Apply evenly', text: 'Glide it gently over the underarm a few times and let it dry.' },
  ],
  care: [
    { title: 'Dry the roll on', text: 'Pat the crystal dry with a towel after every use.' },
    { title: 'Keep it dry', text: 'Store it away from running water between uses.' },
    { title: 'Store securely', text: 'Put the cap back on and keep it upright.' },
    { title: 'Avoid cross-use', text: 'Use one roll on per person for hygiene.' },
    { title: 'Use regularly', text: 'Apply daily for the best everyday freshness.' },
  ],
  legal: [
    ['Marketed by', 'AI Enterprises, Balraj Khanna Marg, Block O, West Patel Nagar, Patel Nagar, New Delhi, Delhi, 110008'],
    ['Manufactured by', '[MANUFACTURER NAME & ADDRESS]'],
    ['Price', '₹475 per roll on · any 2 for ₹800'],
    ['Country of origin', '[COUNTRY]'],
    ['Net quantity', '[NET WEIGHT]'],
    ['Best before', '[EXPIRY DETAILS]'],
  ],
  faqs: [
    { q: 'Is the Drifton roll on just alum?', a: 'The base is a natural alum crystal. Every roll on is natural potassium alum with glycerine. Palash, Rose and Charcoal also have their own extract and fragrance; the Natural roll on has nothing else added.' },
    { q: 'Is it suitable for sensitive skin?', a: 'Alum crystal is generally gentle, but everyone’s skin is different. Do a small patch test first and stop using it if you notice irritation.' },
    { q: 'How long does one roll on last?', a: 'With normal daily use a crystal roll on lasts a long time. [Add the client’s tested duration here.]' },
    { q: 'Does it stop sweat or only odour?', a: 'An alum roll on is designed to help with odour. It is not an antiperspirant, so you may still sweat normally.' },
  ],
};

// Verified real Google Reviews from Google Business Profile
export const sampleReviews = [
  {
    id: 'rev-1',
    rating: 5,
    author: 'Abhijeet Chaudhary',
    meta: '5 hours ago',
    time: '5 hours ago',
    title: 'Natural Alum is really fantastic',
    text: 'Natural Alum is really fantastic. The packaging is premium and it glides smoothly on the skin without leaving any white residue. Highly satisfied with the results!',
    productId: 'natural',
  },
  {
    id: 'rev-2',
    rating: 5,
    author: 'Sachin Bhalla',
    meta: '6 hours ago',
    time: '6 hours ago',
    title: 'Product & packing arrived on time',
    text: 'The product and packing is really good and arrived on time. Thank you team for suggesting me to buy natural for daily use. Feeling fresh all day long.',
    productId: 'natural',
  },
  {
    id: 'rev-3',
    rating: 5,
    author: 'Verma Veena',
    meta: 'a day ago',
    time: 'a day ago',
    title: 'Palash flower is really good',
    text: 'Palash flower fragrance is so soothing and mild. Does not irritate the underarms at all. Will definitely order the combo next time!',
    productId: 'palash',
  },
  {
    id: 'rev-4',
    rating: 5,
    author: 'Guguloth Ganesh',
    meta: '4 days ago',
    time: '4 days ago',
    title: 'Fragrance is mild & very good for skin',
    text: 'The product is really good. Would surely recommend the charcoal variant the one I bought and using helping me a lot in day to day life. The fragrance is mild and the product is very good for underarm skin. Thanks once again for your recommendation.',
    productId: 'charcoal',
  },
  {
    id: 'rev-5',
    rating: 5,
    author: 'Anshul Singh',
    meta: 'a week ago',
    time: 'a week ago',
    title: 'Stays for a long time',
    text: "Got palash flavourful. That's really good and stays for a long time without any chemical smell. Solid crystal finish is very durable.",
    productId: 'palash',
  },
  {
    id: 'rev-6',
    rating: 5,
    author: 'Neera Bhogal',
    meta: 'a week ago',
    time: 'a week ago',
    title: 'Helps in reducing sweat, mild fragrance',
    text: 'Wow really nice product. I got the palash underarm roll on that is really good and helping in reducing sweat and fragrance is mild and good.',
    productId: 'palash',
  },
];

export const getProductBySlug = (slug) => products.find((p) => p.slug === slug);
export const getProductById = (id) => products.find((p) => p.id === id);
export const formatINR = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

// One order line (cart + Buy now). sticks = sticks in the pack; unitPrice = full price, combo discount is applied on the whole order.
export const makeLine = (product, qty = 1, pack = packs[0]) => ({
  key: `${product.id}-${pack.id}`, id: product.id, name: product.name, image: product.image,
  pack: pack.label, sticks: pack.multiplier, unitPrice: UNIT_PRICE * pack.multiplier, qty,
});

// Check coupon time & date validity
export function getCouponStatus(coupon) {
  if (!coupon) return { valid: false, reason: 'invalid' };
  if (coupon.active === false) return { valid: false, reason: 'inactive' };

  const now = Date.now();
  if (coupon.validFrom) {
    const fromTime = new Date(coupon.validFrom).getTime();
    if (!isNaN(fromTime) && now < fromTime) {
      return {
        valid: false,
        reason: 'not_started',
        from: new Date(coupon.validFrom).toLocaleString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
        }),
      };
    }
  }
  if (coupon.validUntil) {
    const untilTime = new Date(coupon.validUntil).getTime();
    if (!isNaN(untilTime) && now > untilTime) {
      return {
        valid: false,
        reason: 'expired',
        until: new Date(coupon.validUntil).toLocaleString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
        }),
      };
    }
  }
  return { valid: true };
}

// Order summary with the automatic combo price, delivery and coupon
export const summarize = (lines, couponCode = '') => {
  const sticks = lines.reduce((s, l) => s + (l.sticks || 1) * l.qty, 0);
  const full = sticks * UNIT_PRICE;
  const naturals = lines.filter((l) => l.id === 'natural').reduce((s, l) => s + (l.sticks || 1) * l.qty, 0);
  const items = priceFor(sticks, naturals);
  const comboSaving = full - items;
  const delivery = sticks === 0 || sticks >= 2 || !OFFERS_ON.delivery ? 0 : DELIVERY_FEE;

  // Case-insensitive match, supporting special characters like @, #, -, _, !, etc.
  const cleanCode = (couponCode || '').trim();
  const matchedKey = Object.keys(coupons).find((k) => k.toUpperCase() === cleanCode.toUpperCase());
  const coupon = matchedKey ? coupons[matchedKey] : null;
  const status = coupon ? getCouponStatus(coupon) : { valid: false, reason: 'invalid' };
  const isCouponValid = Boolean(coupon) && status.valid;

  // Client: a combo gets ONE benefit — free delivery OR coupon off.
  const couponBlocked = isCouponValid && comboSaving > 0;
  const couponOff = isCouponValid && !couponBlocked ? Math.min(coupon.off, items) : 0;
  return {
    sticks,
    naturals,
    full,
    items,
    comboSaving,
    delivery,
    couponBlocked,
    couponStatus: status,
    coupon: isCouponValid && !couponBlocked ? matchedKey : '',
    couponOff,
    total: items + delivery - couponOff,
  };
};

// =====================================================================
//  Values saved from the admin panel (Firestore config/store) override the
//  built-in ones above. Called once when the site starts.
// =====================================================================
export function applyStoreConfig(cfg) {
  if (!cfg) return;
  if (cfg.offers && Array.isArray(cfg.offers)) {
    cfg.offers.forEach((co) => {
      if (co && co.id) {
        STORE_OFFERS[co.id] = { ...(STORE_OFFERS[co.id] || {}), ...co };
      }
    });
  }
  const o = Object.fromEntries((cfg.offers || []).map((x) => [x.id, x]));
  if (o['natural-pair']) {
    const val = Number(o['natural-pair'].value);
    NATURAL_PAIR_PRICE = (val && val !== 750) ? val : 800;
    OFFERS_ON.naturalPair = o['natural-pair'].active !== false;
  }
  if (o['any-pair']) { COMBO_PRICE = Number(o['any-pair'].value) || COMBO_PRICE; OFFERS_ON.anyPair = o['any-pair'].active !== false; }
  if (o.third) { THIRD_PRICE = Number(o.third.value) || THIRD_PRICE; OFFERS_ON.third = o.third.active === true; }
  if (o.delivery) { DELIVERY_FEE = Number(o.delivery.value) || 0; OFFERS_ON.delivery = o.delivery.active !== false; }
  if (cfg.products) {
    const first = cfg.products.find((p) => Number(p.price));
    if (first) UNIT_PRICE = Number(first.price);
    cfg.products.forEach((cp) => {
      const p = products.find((x) => x.id === cp.id);
      if (!p) return;
      if (Number(cp.price)) p.price = Number(cp.price);
      if (cp.name) p.name = cp.name;
      if (cp.tag) p.tag = cp.tag;
      if (Array.isArray(cp.ingredients) && cp.ingredients.length) p.ingredients = cp.ingredients;
      p.stock = cp.stock;
      p.hidden = cp.active === false;
    });
  }
  COMBO_SAVING = UNIT_PRICE * 2 - COMBO_PRICE;
  if (cfg.coupons) {
    Object.keys(coupons).forEach((k) => delete coupons[k]);
    cfg.coupons.filter((c) => c.active !== false).forEach((c) => {
      coupons[c.code] = {
        off: Number(c.off) || 0,
        note: c.note || '',
        validFrom: c.validFrom || null,
        validUntil: c.validUntil || null,
        active: c.active !== false,
      };
    });
  }
}

// Auto-hydrate initial config from demo localStorage if present
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const savedDemo = JSON.parse(window.localStorage.getItem('drifton_admin_demo') || 'null');
    if (savedDemo?.offers) {
      applyStoreConfig({ offers: savedDemo.offers, products: savedDemo.products, coupons: savedDemo.coupons });
    }
  }
} catch {}


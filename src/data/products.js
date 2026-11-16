// =====================================================================
//  ALL STORE DATA LIVES HERE. Values in [BRACKETS] and the prices are
//  dummy preview content — replace them with the client's real data.
// =====================================================================
const IMG = '/assets/images';
const VID = '/assets/videos';

// ===== Pricing (from the client) =====
// One stick ₹475 + delivery. Any 2 sticks = combo ₹800 (applied automatically in the cart).
// DELIVERY_FEE is a PLACEHOLDER — confirm the real delivery charge with the client.
export const UNIT_PRICE = 475;
export const COMBO_PRICE = 800;
export const DELIVERY_FEE = 50; // DUMMY — charged on single-stick orders only; combos ship free
export const COMBO_SAVING = UNIT_PRICE * 2 - COMBO_PRICE; // ₹150 per pair

// Price for n sticks with the combo applied to every pair
export const priceFor = (n) => Math.floor(n / 2) * COMBO_PRICE + (n % 2) * UNIT_PRICE;

// Coupons — DUMMY codes, confirm with the client
export const coupons = { DRIFTON100: { off: 100, note: '₹100 off (single-stick orders, not with combos)' } };

// The real combos from the client (each = 2 sticks for ₹800)
export const combos = [
  { id: 'rose-palash', name: 'Rose + Palash', items: ['rose', 'palash'], tag: 'Floral pair' },
  { id: 'charcoal-rose', name: 'Charcoal + Rose', items: ['charcoal', 'rose'], tag: 'Fresh + floral' },
  { id: 'natural-rose', name: 'Natural + Rose', items: ['natural', 'rose'], tag: 'Pure + floral' },
];

export const products = [
  {
    id: 'palash',
    scene: `${IMG}/scenes/palash.webp`, // product photo with its natural ingredient (phitku style)
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
    scene: `${IMG}/scenes/charcoal.webp`, // product photo with its natural ingredient (phitku style)
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
    scene: `${IMG}/scenes/rose.webp`, // product photo with its natural ingredient (phitku style)
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
    scene: `${IMG}/scenes/natural.webp`, // product photo with its natural ingredient (phitku style)
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
  {
    productId: 'palash', modelPhoto: '/assets/images/models/model-girl.webp', modelPos: '58% center', cutout: '/assets/images/cutouts/palash.webp', rightImage: '/assets/images/hero-products/range-palash.webp',
    bgFrom: '#FFF3E2', bgTo: '#FFC98A', glow: '#FFB45E', dark: false, accent: '#C2571A',
    serif: 'Crystal deo', line: 'that keeps you fresh 24/7',
    ingredients: [
      { name: 'Natural Alum', icon: 'gem' }, { name: 'Glycerine', icon: 'drop' },
      { name: 'Palash Extract', icon: 'flower' }, { name: 'Fragrance', icon: 'sprig' },
    ],
  },
  {
    productId: 'charcoal', modelPhoto: '/assets/images/models/model-boy.webp', modelPos: '55% center', cutout: '/assets/images/cutouts/charcoal.webp', rightImage: '/assets/images/hero-products/range-charcoal.webp',
    bgFrom: '#4A5163', bgTo: '#161A23', glow: '#8C97B3', dark: true, accent: '#7BE0A6',
    serif: 'Deep clean', line: 'for your busiest days',
    ingredients: [
      { name: 'Natural Alum', icon: 'gem' }, { name: 'Glycerine', icon: 'drop' },
      { name: 'Activated Charcoal', icon: 'hex' }, { name: 'Fragrance', icon: 'sprig' },
    ],
  },
  {
    productId: 'rose', modelPhoto: '/assets/images/models/model-girls.webp', modelPos: 'center 30%', cutout: '/assets/images/cutouts/rose.webp', rightImage: '/assets/images/hero-products/range-rose.webp',
    bgFrom: '#FFF0F4', bgTo: '#F7B5CA', glow: '#F08AAE', dark: false, accent: '#B0305D',
    serif: 'Soft & fresh', line: 'with a touch of rose',
    ingredients: [
      { name: 'Natural Alum', icon: 'gem' }, { name: 'Glycerine', icon: 'drop' },
      { name: 'Rose Extract', icon: 'flower' }, { name: 'Fragrance', icon: 'sprig' },
    ],
  },
  {
    productId: 'natural', modelPhoto: '/assets/images/models/model-couple.webp', modelPos: '62% center', cutout: '/assets/images/cutouts/crystal.webp', rightImage: '/assets/images/hero-products/range-natural.webp',
    bgFrom: '#EEF7FF', bgTo: '#A9D3F5', glow: '#7FBDF0', dark: false, accent: '#1C6FB8',
    serif: 'Pure & clear', line: 'natural mineral freshness',
    ingredients: [
      { name: 'Natural Alum', icon: 'gem' }, { name: 'Glycerine', icon: 'drop' },
    ],
  },
];

// Hero video slides (no longer used on the home page; product videos are still shown in the product gallery).
export const heroSlides = [
  { productId: 'palash', eyebrow: 'Natural Crystal Deodorant', title: 'Stay fresh.', highlight: 'Naturally.', text: 'Drifton alum crystal sticks keep odour away with one simple glide. Four botanical variants, one clean routine.' },
  { productId: 'charcoal', eyebrow: 'New · Charcoal Alum', title: 'Deep clean.', highlight: 'All day fresh.', text: 'Activated charcoal meets natural alum crystal. Made for active days and long commutes.' },
  { productId: 'rose', eyebrow: 'Floral · Gentle care', title: 'Soft as a', highlight: 'rose.', text: 'A gentle rose-infused crystal stick that glides on clear, with no white marks.' },
];

// Offer shown on the product page
export const offer = { title: 'Any 2 sticks for ₹800', note: 'Combo price applied automatically in your cart. Free delivery on combos.' };

export const packs = [
  { id: 1, label: 'Single', note: '+ delivery', multiplier: 1 },
  { id: 2, label: 'Combo of 2', note: `Save ₹${COMBO_SAVING} · free delivery`, multiplier: 2 },
];

// Shared product-page content (same for every variant)
export const productInfo = {
  loveIt: [
    { title: 'Natural alum crystal', icon: 'gem' },
    { title: 'No white marks', icon: 'check' },
    { title: 'Glides on clear', icon: 'drop' },
    { title: 'Long lasting stick', icon: 'clock' },
    { title: 'Travel friendly', icon: 'box' },
    { title: 'Botanical blends', icon: 'leaf' },
  ],
  howItWorks: [
    { title: 'Mineral freshness', text: 'Alum is a mineral salt that has been used for generations as a simple way to keep underarm odour in check.' },
    { title: 'A light botanical touch', text: 'Each variant adds a botanical note, so your routine feels fresh without a heavy perfume.' },
  ],
  details: [
    ['Colour', 'Clear crystal with botanical tint'],
    ['Height', '[HEIGHT]'],
    ['Weight', '[NET WEIGHT]'],
    ['Structure', 'Solid crystal stick with twist base'],
    ['Texture', 'Smooth, glides when wet'],
    ['Shelf life', '[SHELF LIFE]'],
    ['Special features', 'No white marks, travel friendly'],
  ],
  howToUse: [
    { title: 'Prepare the skin', text: 'Start with clean skin, ideally right after a shower.' },
    { title: 'Wet the surface', text: 'Dip the crystal tip in water for a second.' },
    { title: 'Apply evenly', text: 'Glide it gently over the underarm a few times and let it dry.' },
  ],
  care: [
    { title: 'Dry the stick', text: 'Pat the crystal dry with a towel after every use.' },
    { title: 'Keep it dry', text: 'Store it away from running water between uses.' },
    { title: 'Store securely', text: 'Put the cap back on and keep it upright.' },
    { title: 'Avoid cross-use', text: 'Use one stick per person for hygiene.' },
    { title: 'Use regularly', text: 'Apply daily for the best everyday freshness.' },
  ],
  legal: [
    ['Marketed by', 'AI Enterprises, Block-O, No. 28, Balraj Khanna Marg, West Patel Nagar, New Delhi – 110008'],
    ['Manufactured by', '[MANUFACTURER NAME & ADDRESS]'],
    ['Price', '₹475 per stick · any 2 for ₹800'],
    ['Country of origin', '[COUNTRY]'],
    ['Net quantity', '[NET WEIGHT]'],
    ['Best before', '[EXPIRY DETAILS]'],
  ],
  faqs: [
    { q: 'Is the Drifton stick just alum?', a: 'The base is a natural alum crystal. Every stick is natural potassium alum with glycerine. Palash, Rose and Charcoal also have their own extract and fragrance; the Natural stick has nothing else added.' },
    { q: 'Is it suitable for sensitive skin?', a: 'Alum crystal is generally gentle, but everyone’s skin is different. Do a small patch test first and stop using it if you notice irritation.' },
    { q: 'How long does one stick last?', a: 'With normal daily use a crystal stick lasts a long time. [Add the client’s tested duration here.]' },
    { q: 'Does it stop sweat or only odour?', a: 'An alum deodorant is designed to help with odour. It is not an antiperspirant, so you may still sweat normally.' },
  ],
};

// SAMPLE reviews for the design — replace with real, verified reviews before launch
export const sampleReviews = [
  { rating: 5, title: 'Fresh and light', text: 'Feels very light and fresh. No white marks on my clothes at all.', productId: 'palash' },
  { rating: 5, title: 'Great for gym days', text: 'I use it before workouts. Quick to apply and easy to carry.', productId: 'charcoal' },
  { rating: 4, title: 'Lovely smell', text: 'Gentle on skin and the rose note is soft, not overpowering.', productId: 'rose' },
  { rating: 5, title: 'Good value', text: 'One stick lasts a long time. Will buy again.', productId: 'natural' },
  { rating: 4, title: 'Takes a day to get used to', text: 'You have to wet it first, but once you get the habit it works well.', productId: 'palash' },
];

export const getProductBySlug = (slug) => products.find((p) => p.slug === slug);
export const getProductById = (id) => products.find((p) => p.id === id);
export const formatINR = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

// One order line (cart + Buy now). sticks = sticks in the pack; unitPrice = full price, combo discount is applied on the whole order.
export const makeLine = (product, qty = 1, pack = packs[0]) => ({
  key: `${product.id}-${pack.id}`, id: product.id, name: product.name, image: product.image,
  pack: pack.label, sticks: pack.multiplier, unitPrice: UNIT_PRICE * pack.multiplier, qty,
});

// Order summary with the automatic combo price, delivery and coupon
export const summarize = (lines, couponCode = '') => {
  const sticks = lines.reduce((s, l) => s + (l.sticks || 1) * l.qty, 0);
  const full = sticks * UNIT_PRICE;
  const items = priceFor(sticks);
  const comboSaving = full - items;
  const delivery = sticks === 0 || sticks >= 2 ? 0 : DELIVERY_FEE;
  const coupon = coupons[couponCode.trim().toUpperCase()];
  // Client: a combo gets ONE benefit — free delivery OR ₹100 off. Combos get free delivery, so the coupon is not added on top.
  const couponBlocked = Boolean(coupon) && comboSaving > 0;
  const couponOff = coupon && !couponBlocked ? Math.min(coupon.off, items) : 0;
  return { sticks, full, items, comboSaving, delivery, couponBlocked, coupon: coupon && !couponBlocked ? couponCode.trim().toUpperCase() : '', couponOff, total: items + delivery - couponOff };
};

// =====================================================================
//  ALL STORE DATA LIVES HERE. Values in [BRACKETS] and the prices are
//  dummy preview content — replace them with the client's real data.
// =====================================================================
const IMG = '/assets/images';
const VID = '/assets/videos';

export const products = [
  {
    id: 'palash',
    slug: 'palash-flower-alum-stick',
    name: 'Palash Flower Alum Stick',
    short: 'Palash',
    tag: 'Floral · Bestseller',
    badge: 'Bestseller',
    price: 699,
    mrp: 999,
    image: `${IMG}/palash.jpg`,
    video: `${VID}/hero-palash.mp4`,
    poster: `${IMG}/poster-palash.jpg`,
    bg: '#FCEFD9',
    accent: '#A3461A',
    ingredient: 'Palash flower',
    ingredientNote: 'A bright orange flower long used in Indian traditions, added for a warm floral touch.',
    tagline: 'Warm, floral and naturally soothing',
    description:
      'A natural alum crystal stick infused with the warmth of Palash flower. Glides on clear, leaves no white marks and keeps you feeling fresh through the day.',
  },
  {
    id: 'charcoal',
    slug: 'charcoal-alum-stick',
    name: 'Charcoal Alum Stick',
    short: 'Charcoal',
    tag: 'Detox · Fresh',
    badge: 'New',
    price: 699,
    mrp: 999,
    image: `${IMG}/charcoal.jpg`,
    video: `${VID}/hero-charcoal.mp4`,
    poster: `${IMG}/poster-charcoal.jpg`,
    bg: '#E4E6EB',
    accent: '#3A4466',
    ingredient: 'Activated charcoal',
    ingredientNote: 'Known for its deep-clean feel, paired with alum for active, sweaty days.',
    tagline: 'A deep-clean feel for active days',
    description:
      'Activated charcoal blended with natural alum crystal for a fresh, deep-clean feel. Made for gym days, long commutes and everything in between.',
  },
  {
    id: 'rose',
    slug: 'rose-alum-stick',
    name: 'Rose Alum Stick',
    short: 'Rose',
    tag: 'Floral · Gentle',
    badge: 'Sale',
    price: 699,
    mrp: 999,
    image: `${IMG}/rose.jpg`,
    video: `${VID}/hero-rose.mp4`,
    poster: `${IMG}/poster-rose.jpg`,
    bg: '#FBE3EA',
    accent: '#A02E54',
    ingredient: 'Rose',
    ingredientNote: 'A classic, gentle floral note that keeps the routine light and pleasant.',
    tagline: 'Soft, classic and gentle on skin',
    description:
      'Natural alum crystal with a soft touch of rose. Gentle on skin, easy to apply and a classic everyday favourite.',
  },
  {
    id: 'lavender',
    slug: 'lavender-alum-stick',
    name: 'Lavender Alum Stick',
    short: 'Lavender',
    tag: 'Calm · Herbal',
    badge: 'Sale',
    price: 699,
    mrp: 999,
    image: `${IMG}/lavender.jpg`,
    video: null,
    poster: null,
    bg: '#ECE6FA',
    accent: '#5B3FA8',
    ingredient: 'Lavender',
    ingredientNote: 'A calming herbal note for a relaxed start to the day.',
    tagline: 'Calm, herbal and easy to love',
    description:
      'Natural alum crystal with calming lavender. A light, herbal way to start your morning and stay fresh all day.',
  },
];

// ===== Home hero banner (full-width image slides, phitku style) =====
// image: DUMMY banners made from the product photos. Replace with real model photos
// (e.g. '/assets/images/banner/model-1.jpg', 1920x1080 or wider, subject on the right half).
// Ingredients are DUMMY — confirm the real key ingredients for each variant with the client.
// icon: 'gem' | 'flower' | 'leaf' | 'drop' | 'hex' | 'sprig'
export const bannerSlides = [
  {
    productId: 'palash', image: '/assets/images/banner/banner-palash.jpg',
    serif: 'Crystal deo', line: 'that keeps you fresh 24/7', accent: '#FFD2A8',
    ingredients: [
      { name: 'Natural Alum', icon: 'gem' }, { name: 'Palash Flower', icon: 'flower' },
      { name: 'Aloe Vera', icon: 'leaf' }, { name: 'Vitamin E', icon: 'drop' },
    ],
  },
  {
    productId: 'charcoal', image: '/assets/images/banner/banner-charcoal.jpg',
    serif: 'Deep clean', line: 'for your busiest days', accent: '#CFD6E6',
    ingredients: [
      { name: 'Natural Alum', icon: 'gem' }, { name: 'Activated Charcoal', icon: 'hex' },
      { name: 'Tea Tree', icon: 'leaf' }, { name: 'Mint', icon: 'sprig' },
    ],
  },
  {
    productId: 'rose', image: '/assets/images/banner/banner-rose.jpg',
    serif: 'Soft & fresh', line: 'with a touch of rose', accent: '#FFC9DA',
    ingredients: [
      { name: 'Natural Alum', icon: 'gem' }, { name: 'Rose Petals', icon: 'flower' },
      { name: 'Glycerin', icon: 'drop' }, { name: 'Aloe Vera', icon: 'leaf' },
    ],
  },
  {
    productId: 'lavender', image: '/assets/images/banner/banner-lavender.jpg',
    serif: 'Calm & fresh', line: 'for him and for her', accent: '#DCCBFF',
    ingredients: [
      { name: 'Natural Alum', icon: 'gem' }, { name: 'Lavender', icon: 'sprig' },
      { name: 'Chamomile', icon: 'flower' }, { name: 'Vitamin E', icon: 'drop' },
    ],
  },
];

// Hero video slides (no longer used on the home page; product videos are still shown in the product gallery).
export const heroSlides = [
  { productId: 'palash', eyebrow: 'Natural Crystal Deodorant', title: 'Stay fresh.', highlight: 'Naturally.', text: 'Drifton alum crystal sticks keep odour away with one simple glide. Four botanical variants, one clean routine.' },
  { productId: 'charcoal', eyebrow: 'New · Charcoal Alum', title: 'Deep clean.', highlight: 'All day fresh.', text: 'Activated charcoal meets natural alum crystal. Made for active days and long commutes.' },
  { productId: 'rose', eyebrow: 'Floral · Gentle care', title: 'Soft as a', highlight: 'rose.', text: 'A gentle rose-infused crystal stick that glides on clear, with no white marks.' },
];

// Dummy offer shown on the product page — confirm with client
export const offer = { title: 'Buy 2 sticks, get the 3rd FREE!', note: 'Offer applied automatically at checkout.' };

export const packs = [
  { id: 1, label: 'Single', note: '1 stick', multiplier: 1, off: 0 },
  { id: 2, label: 'Pack of 2', note: 'Save 10%', multiplier: 2, off: 0.1 },
  { id: 3, label: 'Pack of 3', note: 'Save 15%', multiplier: 3, off: 0.15 },
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
    ['Marketed by', 'AI Enterprises, [ADDRESS]'],
    ['Manufactured by', '[MANUFACTURER NAME & ADDRESS]'],
    ['MRP', '₹999 (incl. of all taxes)'],
    ['Country of origin', '[COUNTRY]'],
    ['Net quantity', '[NET WEIGHT]'],
    ['Best before', '[EXPIRY DETAILS]'],
  ],
  faqs: [
    { q: 'Is the Drifton stick just alum?', a: 'The base is a natural alum crystal. Each variant also includes a botanical extract such as Palash, charcoal, rose or lavender. [Confirm full ingredient list with the client.]' },
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
  { rating: 5, title: 'Good value', text: 'One stick lasts a long time. Will buy again.', productId: 'lavender' },
  { rating: 4, title: 'Takes a day to get used to', text: 'You have to wet it first, but once you get the habit it works well.', productId: 'palash' },
];

export const getProductBySlug = (slug) => products.find((p) => p.slug === slug);
export const getProductById = (id) => products.find((p) => p.id === id);
export const formatINR = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
export const discount = (p) => Math.round((1 - p.price / p.mrp) * 100);

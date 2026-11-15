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

// ===== Home hero banner (model left, product + 4 ingredients right) =====
// model: 'girl' | 'girl2' | 'boy' | 'couple' (dummy illustrations). Add modelPhoto: '/assets/images/models/x.jpg' to use a real photo.
// Ingredients are DUMMY — confirm the real 4 key ingredients for each variant with the client.
// icon: 'gem' | 'flower' | 'leaf' | 'drop' | 'hex' | 'sprig'
export const bannerSlides = [
  {
    productId: 'palash', model: 'girl', modelPhoto: null, dark: false,
    bgFrom: '#FFF6E8', bgTo: '#FFD9A8', glow: '#FFB35C', tone: 'rgba(255,255,255,.55)', top: '#E8742A', stick: '#FFD45C',
    headline: 'Fresh like a', highlight: 'Palash bloom.',
    ingredients: [
      { name: 'Natural Alum', icon: 'gem', color: '#1C2E6B', bg: '#FFFFFF' },
      { name: 'Palash Flower', icon: 'flower', color: '#E8742A', bg: '#FFF1E0' },
      { name: 'Aloe Vera', icon: 'leaf', color: '#1F8A4C', bg: '#E5F5EC' },
      { name: 'Vitamin E', icon: 'drop', color: '#C99A1B', bg: '#FFF7D6' },
    ],
  },
  {
    productId: 'charcoal', model: 'boy', modelPhoto: null, dark: true,
    bgFrom: '#3A4152', bgTo: '#12151D', glow: '#6E7891', tone: 'rgba(255,255,255,.10)', top: '#0F1A3C', stick: '#EEF1F8',
    headline: 'Deep clean.', highlight: 'All-day fresh.',
    ingredients: [
      { name: 'Natural Alum', icon: 'gem', color: '#1C2E6B', bg: '#FFFFFF' },
      { name: 'Activated Charcoal', icon: 'hex', color: '#FFFFFF', bg: '#2B2F3A' },
      { name: 'Tea Tree', icon: 'leaf', color: '#1F8A4C', bg: '#E5F5EC' },
      { name: 'Mint', icon: 'sprig', color: '#0F8C7A', bg: '#DDF5F0' },
    ],
  },
  {
    productId: 'rose', model: 'girl2', modelPhoto: null, dark: false,
    bgFrom: '#FFF1F5', bgTo: '#F9C3D3', glow: '#F28DAE', tone: 'rgba(255,255,255,.55)', top: '#C2406C', stick: '#F7A8C4',
    headline: 'Soft as a', highlight: 'rose petal.',
    ingredients: [
      { name: 'Natural Alum', icon: 'gem', color: '#1C2E6B', bg: '#FFFFFF' },
      { name: 'Rose Petals', icon: 'flower', color: '#C2406C', bg: '#FDE4EC' },
      { name: 'Glycerin', icon: 'drop', color: '#3B7BD9', bg: '#E5EFFD' },
      { name: 'Aloe Vera', icon: 'leaf', color: '#1F8A4C', bg: '#E5F5EC' },
    ],
  },
  {
    productId: 'lavender', model: 'couple', modelPhoto: null, dark: false,
    bgFrom: '#F6F2FF', bgTo: '#D6C8F7', glow: '#A88BEB', tone: 'rgba(255,255,255,.5)', top: '#6A4BC4', stick: '#D9C8FF',
    headline: 'Calm & fresh,', highlight: 'for both of you.',
    ingredients: [
      { name: 'Natural Alum', icon: 'gem', color: '#1C2E6B', bg: '#FFFFFF' },
      { name: 'Lavender', icon: 'sprig', color: '#6A4BC4', bg: '#EEE8FD' },
      { name: 'Chamomile', icon: 'flower', color: '#C99A1B', bg: '#FFF7D6' },
      { name: 'Vitamin E', icon: 'drop', color: '#C99A1B', bg: '#FFF7D6' },
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

# Drifton – Ecommerce Website (React + Vite + Tailwind CSS)

Home page and Product Details page for **Drifton by AI Enterprises**, styled with **Tailwind CSS v4**.

## Run the project

```bash
npm install
npm run dev
```

Open the link Vite shows (usually http://localhost:5173).

Production build: `npm run build` then `npm run preview`.

## Pages

| Route | Page |
|---|---|
| `/` | Home page |
| `/product/:slug` | Product details, e.g. `/product/charcoal-alum-stick` |

## Tailwind setup

- Tailwind v4 runs through the Vite plugin (`@tailwindcss/vite` in `vite.config.js`). No `tailwind.config.js` is needed.
- Brand colours, fonts and animations are defined in `src/index.css` inside `@theme`, so you can use classes like
  `bg-navy-900`, `text-brand`, `bg-mint-soft`, `border-line`, `font-head`, `animate-marquee`.
- Reusable classes (also in `src/index.css`): `container-x`, `container-wide`, `h2`, `eyebrow`,
  `btn-primary`, `btn-navy`, `btn-line`, `btn-white`, `icon-btn`, `icon-btn-outline`, `lift`, `card`.

## Folder structure

```
public/assets/images        product photos, logo, video posters
public/assets/videos        hero videos (hero-palash.mp4, hero-charcoal.mp4, hero-rose.mp4)
src/data/products.js        ALL data: products, prices, hero slides, offer, packs,
                            product-page content (details, care, FAQs), sample reviews  ← edit here
src/context/StoreContext.jsx cart, wishlist, login modal, toast (saved in localStorage)
src/components/             home page sections (one file each)
src/components/product/     product page parts: gallery, reviews block, FAQ, sticky buy bar
src/components/StepIllustrations.jsx  animated "How to use" illustrations
src/pages/                  Home, ProductDetail, NotFound
```

## Hero banner (model + product + ingredients)

`src/components/ModelBanner.jsx` – full-width banner with 4 slides (one per product):
- **Left:** the model slides in from the left (girl, boy, girl, then a couple on the last slide).
- **Right:** the product slides in from the right, with its **4 key ingredients** sliding in one by one below it.
- Everything holds for **3 seconds**, slides out, and the next slide comes in. Background colours cross-fade to match each product.
- Slide content (headline, colours, model, ingredients) is in `bannerSlides` in `src/data/products.js`.
- The models are **dummy illustrations** (`src/components/ModelIllustrations.jsx`). To use real photos,
  put them in `public/assets/images/models/` and set `modelPhoto: '/assets/images/models/girl.jpg'` on the slide.
- Ingredients are **dummy** – confirm the real 4 key ingredients per variant with the client.

## Products section

`src/components/ProductShowcase.jsx` – the 4 products are shown big and free (no cards/boxes) on one continuous
colour strip; each product sits on its own colour (peach, charcoal, rose, lavender) that blends smoothly into the
next and into the page background. Product photos are edge-faded so they melt into their colour.

## Product videos

`public/assets/videos/` holds dummy product videos (made from product photos). They are shown in the product page
gallery. `src/components/HeroVideoSlider.jsx` is kept in case you want a video hero again later.

## Product details page (phitku-style)

Gallery with vertical thumbnails + video + "1 / N" counter + lightbox · title, rating, price with % off ·
offer banner · variant pills · pack sizes · quantity "(x in cart)" · Add to cart / Buy now · pincode check ·
"Why you'll love it?" · Description · Key ingredients · How does it work · Product details table · How to use ·
Care instructions · Product information · image strip · Customer reviews with rating bars + pagination ·
FAQ's · related products · sticky bottom buy bar.

## "How to use" photos

The steps currently show animated illustrations. To show real usage photos (shower / wetting the crystal /
applying), put them in `public/assets/images/steps/` and set `photo: '/assets/images/steps/step-1.jpg'`
(etc.) in `src/components/HowToUse.jsx`. Photos must be the client's own or properly licensed.

## Replace before going live

- Prices, offer text and pack prices in `src/data/products.js`
- `[BRACKETED]` values in `productInfo` (height, weight, shelf life, manufacturer, address, etc.)
- Rose and Lavender images (currently colour-edited copies of the Palash photo)
- Sample reviews (`sampleReviews`) – replace with real, verified reviews
- Certificate details in `src/components/CertificateSection.jsx` and the real certificate image
- Stats in `src/components/Stats.jsx` – confirm with client
- Footer contact `[EMAIL] · [PHONE]`
- Login / Sign up / Checkout / Write a review are front-end demos – connect your backend.

## Deploying

SPA routing: `public/_redirects` (Netlify) and `vercel.json` (Vercel) are included.

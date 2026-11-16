import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { business } from './data/site.js';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import AuthModal from './components/AuthModal.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import Toast from './components/Toast.jsx';
import Home from './pages/Home.jsx';
import BuyNowModal from './components/BuyNowModal.jsx';
import CheckoutModal from './components/CheckoutModal.jsx';

// Lazy loading: other pages are downloaded only when someone opens them (faster first load)
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const Ingredients = lazy(() => import('./pages/InfoPages.jsx').then((m) => ({ default: m.Ingredients })));
const Terms = lazy(() => import('./pages/InfoPages.jsx').then((m) => ({ default: m.Terms })));
const Contact = lazy(() => import('./pages/InfoPages.jsx').then((m) => ({ default: m.Contact })));

const PageLoader = () => (
  <div className="flex min-h-[60svh] items-center justify-center" aria-label="Loading">
    <span className="size-10 animate-spin rounded-full border-4 border-line border-t-navy-700" />
  </div>
);

// sends the visitor to an outside site (old /track links -> Ekart)
function GoTo({ url }) {
  useEffect(() => { window.location.replace(url); }, [url]);
  return <p className="container-x py-24 text-center text-muted">Taking you to Ekart tracking… <a className="font-semibold underline" href={url}>Click here</a> if nothing happens.</p>;
}

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      // wait until the section exists (pages load lazily), then glide to it
      let tries = 0;
      const t = setInterval(() => {
        const el = document.getElementById(hash.slice(1));
        if (el || ++tries > 40) {
          clearInterval(t);
          el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // the mobile menu closes while scrolling (page shifts up) — correct the position once it has settled
          if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 650);
        }
      }, 50);
      return () => clearInterval(t);
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Header />
      <main>
        <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Navigate to="/#shop" replace />} />
          <Route path="/combo" element={<Navigate to="/#shop" replace />} />
          <Route path="/ingredients" element={<Ingredients />} />
          <Route path="/check-ingredient" element={<Navigate to="/ingredients" replace />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/track" element={<GoTo url={business.trackUrl} />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </main>
      <Footer />
      <AuthModal />
      <CartDrawer />
      <BuyNowModal />
      <CheckoutModal />
      <Toast />
    </>
  );
}

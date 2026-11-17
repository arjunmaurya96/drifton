import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { business } from './data/site.js';
import { applyStoreConfig } from './data/products.js';
import { loadStoreConfig } from './lib/api.js';
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
const Profile = lazy(() => import('./pages/Profile.jsx'));

const AdminApp = lazy(() => import('./admin/AdminApp.jsx')); // admin panel: loaded only on /admin

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
      const targetId = decodeURIComponent(hash.slice(1));
      let tries = 0;
      const t = setInterval(() => {
        const el = document.getElementById(targetId) ||
                   document.querySelector(`[data-product-id="${targetId}"]`) ||
                   document.querySelector(`[data-slug="${targetId}"]`) ||
                   (targetId.startsWith('product-') ? document.getElementById(targetId.replace('product-', '')) : null);
        if (el || ++tries > 40) {
          clearInterval(t);
          el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 650);
        }
      }, 50);
      return () => clearInterval(t);
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
}

// Prices, offers, coupons and settings saved in the admin panel (Firestore) — loaded once
function useStoreConfig() {
  const [, setVer] = useState(0);
  useEffect(() => {
    loadStoreConfig().then((cfg) => {
      if (!cfg) return;
      applyStoreConfig(cfg);
      const st = cfg.settings || {};
      if (st.email) business.email = st.email;
      if (st.phone) business.phone = st.phone;
      if (st.address) business.address = st.address;
      if (st.hours) business.hours = st.hours;
      if (st.legalName) business.legalName = st.legalName;
      if (st.announcement) business.announcement = st.announcement;
      if (st.manufacturer) business.manufacturer.name = st.manufacturer;
      if (st.manufacturerAddress) business.manufacturer.address = st.manufacturerAddress;
      if (st.licence) business.manufacturer.licence = st.licence;
      if (st.gst) business.gst = st.gst;
      setVer((v) => v + 1); // re-render with the new values
    });
  }, []);
}

export default function App() {
  const { pathname } = useLocation();
  useStoreConfig();
  if (pathname.startsWith('/admin')) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes><Route path="/admin/*" element={<AdminApp />} /></Routes>
      </Suspense>
    );
  }
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
          <Route path="/profile" element={<Profile />} />
          <Route path="/account" element={<Navigate to="/profile" replace />} />
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

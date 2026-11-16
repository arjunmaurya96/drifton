import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { business } from './data/site.js';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import AuthModal from './components/AuthModal.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import Toast from './components/Toast.jsx';
import Home from './pages/Home.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import NotFound from './pages/NotFound.jsx';
import { Combo, Ingredients, CheckIngredient, Terms, Contact } from './pages/InfoPages.jsx';
import BuyNowModal from './components/BuyNowModal.jsx';
import ComboTopBanner from './components/ComboTopBanner.jsx';
import CheckoutModal from './components/CheckoutModal.jsx';

// Combo banner on top of every inner page (not on home; the shop page has its own offer banners)
function TopBanner() {
  const { pathname } = useLocation();
  return pathname === '/' || pathname === '/shop' || pathname === '/track' ? null : <ComboTopBanner />;
}

// sends the visitor to an outside site (old /track links -> Ekart)
function GoTo({ url }) {
  useEffect(() => { window.location.replace(url); }, [url]);
  return <p className="container-x py-24 text-center text-muted">Taking you to Ekart tracking… <a className="font-semibold underline" href={url}>Click here</a> if nothing happens.</p>;
}

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) return el.scrollIntoView({ behavior: 'smooth' });
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
        <TopBanner />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Navigate to="/#shop" replace />} />
          <Route path="/combo" element={<Combo />} />
          <Route path="/ingredients" element={<Ingredients />} />
          <Route path="/check-ingredient" element={<CheckIngredient />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/track" element={<GoTo url={business.trackUrl} />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
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

import HeroBanner from '../components/HeroBanner.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import ProductMarquee from '../components/ProductMarquee.jsx';
import VariantSpotlight from '../components/VariantSpotlight.jsx';
import WhyDrifton from '../components/WhyDrifton.jsx';
import HowToUse from '../components/HowToUse.jsx';
import Reviews from '../components/Reviews.jsx';
import Stats from '../components/Stats.jsx';
import GoogleBusiness from '../components/GoogleBusiness.jsx';

export default function Home() {
  return (
    <>
      <HeroBanner />
      <ProductMarquee />
      <VariantSpotlight />
      <ProductGrid />
      <HowToUse />
      <WhyDrifton />
      <Stats />
      <GoogleBusiness />
      <Reviews />
    </>
  );
}

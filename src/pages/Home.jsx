import HeroBanner from '../components/HeroBanner.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import ProductMarquee from '../components/ProductMarquee.jsx';
import VariantSpotlight from '../components/VariantSpotlight.jsx';
import WhyDrifton from '../components/WhyDrifton.jsx';
import HowToUse from '../components/HowToUse.jsx';
import Reviews from '../components/Reviews.jsx';
import Stats from '../components/Stats.jsx';
import ReferEarn from '../components/ReferEarn.jsx';
import GoogleBusiness from '../components/GoogleBusiness.jsx';

export default function Home() {
  return (
    <>
      <HeroBanner />
      <VariantSpotlight />
      <ProductGrid />
      <HowToUse />
      <WhyDrifton />
      <ProductMarquee />
      <Stats />
      <ReferEarn />
      <GoogleBusiness />
      <Reviews />
    </>
  );
}

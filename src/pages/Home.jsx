import HeroBanner from '../components/HeroBanner.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import ProductMarquee from '../components/ProductMarquee.jsx';
import ServiceCards from '../components/ServiceCards.jsx';
import WhyDrifton from '../components/WhyDrifton.jsx';
import HowToUse from '../components/HowToUse.jsx';
import AlumSection from '../components/AlumSection.jsx';
import CertificateSection from '../components/CertificateSection.jsx';
import Reviews from '../components/Reviews.jsx';
import Stats from '../components/Stats.jsx';
import ReferEarn from '../components/ReferEarn.jsx';

export default function Home() {
  return (
    <>
      <HeroBanner />
      <ProductGrid />
      <ProductMarquee />
      <ServiceCards />
      <div className="h-24" />
      <WhyDrifton />
      <HowToUse />
      <AlumSection />
      <CertificateSection />
      <Reviews />
      <Stats />
      <ReferEarn />
    </>
  );
}

import { FeaturesSection, HeroSection } from "../../components";
import { LandingWrapper } from "../../hoc";

const Landing = () => {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
    </>
  );
};

const WrappedLanding = LandingWrapper(Landing);
export default WrappedLanding;

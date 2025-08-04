import { FeaturesSection } from "../../components";
import { LandingWrapper } from "../../hoc";

const Features = () => {
  return (
    <>
      <FeaturesSection />
    </>
  );
};

const WrappedFeatures = LandingWrapper(Features);
export default WrappedFeatures;

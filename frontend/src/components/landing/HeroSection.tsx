import { Link } from "react-router-dom";

const HeroSection = () => {
  const isLoggedIn = false;

  return (
    <div className="w-full h-[80svh] flex flex-col items-center justify-center overflow-hidden">
      <span className="w-full sm:w-2/3 flex flex-col items-center justify-center">
        <h1 className="text-3xl sm:text-7xl font-extrabold text-center text-textColor">
          Make Sense of What Users are Saying
        </h1>
        <p className="w-full sm:w-2/3 mt-4 text-xl sm:text-2xl text-center opacity-75">
          Unifeed helps you analyze, categorize, and visualize user feedback
          across platforms. Turn noise into insights and prioritize what truly
          matters.
        </p>

        <span className="w-2/3 mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link
            to={isLoggedIn ? "/dashboard" : "/login"}
            className="px-6 py-2 text-2xl font-bold cursor-pointer bg-indigo-500 hover:bg-indigo-600 transition-all text-white rounded-2xl"
          >
            Get Started
          </Link>
          <Link
            to="/docs"
            className="px-6 py-2 text-2xl font-bold cursor-pointer text-textColor rounded-2xl"
          >
            Learn More
          </Link>
        </span>
      </span>
    </div>
  );
};

export default HeroSection;

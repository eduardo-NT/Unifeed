import { LandingWrapper } from "../../hoc";

const Docs = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center px-4 sm:px-12 py-24 text-slate-300 text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-indigo-400 mb-6">
        Documentation Coming Soon
      </h1>
      <p className="text-lg sm:text-xl max-w-2xl opacity-80">
        We're working on a comprehensive guide to help you integrate and use
        Unifeed with ease. Stay tuned!
      </p>
    </div>
  );
};

const WrappedDocs = LandingWrapper(Docs);
export default WrappedDocs;

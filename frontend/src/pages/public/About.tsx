import React from "react";
import { LandingWrapper } from "../../hoc";

const About = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center px-4 sm:px-12 py-16 text-slate-300">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-indigo-400 mb-6">
        About Unifeed
      </h1>

      <p className="max-w-4xl text-lg sm:text-xl text-center leading-relaxed opacity-90">
        Unifeed is a unified platform that helps teams turn scattered user
        feedback into meaningful product insights. Whether it’s from app
        reviews, social media, or customer surveys — we bring all that noise
        together, clean it up, and help you discover what users truly care
        about.
      </p>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-md backdrop-blur-sm">
          <h2 className="text-2xl font-semibold text-indigo-300 mb-2">
            Why Unifeed?
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Most feedback tools focus on collection. Unifeed focuses on
            understanding. We categorize, prioritize, and visualize feedback so
            product decisions can be made with clarity — not guesswork.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-md backdrop-blur-sm">
          <h2 className="text-2xl font-semibold text-indigo-300 mb-2">
            Who is it for?
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Unifeed is built for product teams, designers, founders, and anyone
            who wants to deeply understand their users. Whether you're a solo
            indie hacker or part of a growing org, we help you stay in tune with
            user needs.
          </p>
        </div>
      </div>
    </div>
  );
};

const WrappedAbout = LandingWrapper(About);
export default WrappedAbout;

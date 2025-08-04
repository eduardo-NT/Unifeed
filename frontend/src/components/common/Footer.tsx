import { Link } from "react-router-dom";
import { FaGithub, FaLinkedin, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full mt-12 border-t border-slate-700 bg-slate-900 text-slate-300">
      <div className="w-full flex flex-col md:flex-row px-12 py-10 gap-8">
        {/* Left - About Unifeed */}
        <div className="md:w-1/3 flex flex-col items-start justify-center space-y-4">
          <h1 className="text-2xl font-bold text-indigo-400">
            <Link to="/">Unifeed</Link>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Unifeed helps teams understand and act on user feedback from
            multiple sources. Discover trends, categorize insights, and make
            informed product decisions — all in one unified dashboard.
          </p>
          <div className="flex gap-4 mt-2">
            <a
              href=""
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-indigo-400 text-xl transition-colors"
            >
              <FaGithub />
            </a>
            <a
              href=""
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-indigo-400 text-xl transition-colors"
            >
              <FaLinkedin />
            </a>
            <a
              href=""
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-indigo-400 text-xl transition-colors"
            >
              <FaYoutube />
            </a>
          </div>
        </div>

        {/* Right - Quick Links */}
        <div className="md:w-2/3 flex flex-row justify-center gap-4 sm:gap-8">
          <div className="flex flex-col gap-2 text-sm text-slate-400">
            <h2 className="font-semibold mb-2 text-xl text-slate-100">Product</h2>
            <Link to="/features" className="hover:text-indigo-400 transition-colors">
              Features
            </Link>
            <Link to="/overview" className="hover:text-indigo-400 transition-colors">
              Dashboard Overview
            </Link>
            <Link to="/integrations" className="hover:text-indigo-400 transition-colors">
              Integrations
            </Link>
          </div>
          <div className="flex flex-col gap-2 text-sm text-slate-400">
            <h2 className="font-semibold mb-2 text-xl text-slate-100">Support</h2>
            <Link to="/docs" className="hover:text-indigo-400 transition-colors">
              Documentation
            </Link>
            <Link to="/faq" className="hover:text-indigo-400 transition-colors">
              FAQ
            </Link>
            <Link to="/contact" className="hover:text-indigo-400 transition-colors">
              Contact
            </Link>
          </div>
          <div className="flex flex-col gap-2 text-sm text-slate-400">
            <h2 className="font-semibold mb-2 text-xl text-slate-100">Company</h2>
            <Link to="/team" className="hover:text-indigo-400 transition-colors">
              About Us
            </Link>
            <Link to="/acknowledgements" className="hover:text-indigo-400 transition-colors">
              Acknowledgements
            </Link>
            <Link to="/credits" className="hover:text-indigo-400 transition-colors">
              Credits
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full py-4 flex items-center justify-center border-t border-slate-800">
        <p className="text-sm text-slate-500">
          © 2025 Unifeed Team. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

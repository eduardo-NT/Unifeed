import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MenuIcon, X } from "lucide-react";

const links = [
  { id: 1, link: "/about", title: "About" },
  { id: 2, link: "/features", title: "Features" },
  { id: 4, link: "/docs", title: "Docs" },
];

const LogoBox = () => (
  <div className="flex items-center justify-center">
    <Link to="/">
      <img src="/logo.png" alt="logo" className="w-24" />
    </Link>
  </div>
);

const LinkBox = () => (
  <div className="hidden sm:flex items-center justify-center gap-6 ml-24">
    {links.map(({ id, link, title }) => (
      <span
        key={id}
        className="font-bold text-slate-400 text-xl hover:text-indigo-400 transition-colors duration-200"
      >
        <Link to={link}>{title}</Link>
      </span>
    ))}
  </div>
);

const LoginBtn = () => (
  <>
    <span className="px-4 py-2 rounded-xl">
      <Link
        to="/login"
        className="font-bold text-slate-300 text-xl hover:text-indigo-400"
      >
        Log In
      </Link>
    </span>
    <Link
      to="/signup"
      className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-xl transition-colors"
    >
      <p className="text-white font-bold">Sign Up</p>
    </Link>
  </>
);

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isLoggedIn = false;
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      alert("logout");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <>
      <nav className="w-full h-24 flex items-center justify-between px-4 sm:px-8 text-slate-100">
        <LogoBox />
        <LinkBox />

        {/* Desktop Buttons */}
        <div className="hidden sm:flex items-center gap-2 ml-4">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-xl transition-colors"
            >
              <p className="text-white font-bold">Log out</p>
            </button>
          ) : (
            <LoginBtn />
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="sm:hidden">
          <button onClick={() => setIsMenuOpen(true)}>
            <MenuIcon size={32} color="#cbd5e1" /> {/* slate-300 */}
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-full bg-slate-900 transition-transform duration-300 z-50 ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-6 px-6 pt-6 border-b border-slate-700">
          <LogoBox />
          <button onClick={() => setIsMenuOpen(false)}>
            <X size={28} color="#cbd5e1" />
          </button>
        </div>

        <div className="flex flex-col px-6 py-4 gap-4 text-slate-300">
          {links.map(({ id, link, title }) => (
            <Link
              key={id}
              to={link}
              onClick={() => setIsMenuOpen(false)}
              className="hover:text-indigo-400 text-center text-3xl font-semibold transition-colors"
            >
              {title}
            </Link>
          ))}

          <section className="flex-col w-full py-6 gap-4 text-center bg-white/5 backdrop-blur-lg rounded-2xl shadow-xl mt-8 flex items-center justify-center border border-white/10">
            {!isLoggedIn ? (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <p className="text-slate-200 text-3xl font-bold hover:text-indigo-400">
                    Log In
                  </p>
                </Link>
                <Link
                  to="/signup"
                  className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-xl text-white text-2xl font-bold transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-xl text-2xl text-white font-bold transition-colors"
              >
                Log out
              </button>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default NavBar;

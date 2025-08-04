import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { LandingWrapper } from "../../hoc";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    setLoading(true);
    try {
      // const user = await loginWithEmail(email, password);
      setSuccessMsg("Login successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      setErrorMsg(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-8 sm:p-10">
        <h2 className="text-3xl font-extrabold text-center text-textColor mb-6">
          Welcome Back 👋
        </h2>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block mb-1 font-semibold text-textColor"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 rounded-xl bg-white/20 text-textColor placeholder:text-textColor/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-accentColor"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label
              htmlFor="password"
              className="block mb-1 font-semibold text-textColor"
            >
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="w-full px-4 py-2 pr-10 rounded-xl bg-white/20 text-textColor placeholder:text-textColor/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-accentColor"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-textColor/60 hover:text-textColor transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Error or Success */}
          {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}
          {successMsg && <p className="text-green-400 text-sm">{successMsg}</p>}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-accentColor hover:bg-accentColor/90 text-white bg-[#1b2638] hover:opacity-75 font-bold py-2 cursor-pointer rounded-xl transition-all"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
};

const WrappedLogin = LandingWrapper(Login);
export default WrappedLogin;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { LandingWrapper } from "../../hoc";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // await signupWithEmail(email, password);
      setShowModal(true);
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
          Create Your Account
        </h2>

        <form onSubmit={handleSignup} className="space-y-6">
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
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label
              htmlFor="confirm-password"
              className="block mb-1 font-semibold text-textColor"
            >
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="confirm-password"
              className="w-full px-4 py-2 pr-10 rounded-xl bg-white/20 text-textColor placeholder:text-textColor/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-accentColor"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-textColor/60 hover:text-textColor"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Error */}
          {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-accentColor hover:bg-accentColor/90 text-white bg-[#1b2638] hover:opacity-70 cursor-pointer font-bold py-2 rounded-xl transition-all"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
      </div>

      {/* ✅ Email Verification Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg w-[90%] max-w-sm text-center space-y-4">
            <h3 className="text-xl font-bold text-accentColor">
              Verify Your Email
            </h3>
            <p className="text-gray-700 text-sm">
              A verification link has been sent to{" "}
              <span className="font-semibold">{email}</span>. Please check your
              inbox to complete the signup process.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-4 bg-accentColor hover:bg-accentColor/90 text-white px-4 py-2 rounded-xl font-semibold"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const WrappedSignup = LandingWrapper(Signup);
export default WrappedSignup;

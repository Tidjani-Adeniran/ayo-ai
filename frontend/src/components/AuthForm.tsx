"use client";

import { useState } from "react";

interface AuthFormProps {
  isAuthMode: "login" | "register";
  setIsAuthMode: (mode: "login" | "register") => void;
  authUsername: string;
  setAuthUsername: (val: string) => void;
  authPassword: string;
  setAuthPassword: (val: string) => void;
  authError: string;
  setAuthError: (val: string) => void;
  handleAuth: (e: React.FormEvent, extraData?: { email: string }) => void;
}

export default function AuthForm({
  isAuthMode,
  setIsAuthMode,
  authUsername,
  setAuthUsername,
  authPassword,
  setAuthPassword,
  authError,
  setAuthError,
  handleAuth,
}: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");

    // Call parent handler
    handleAuth(e, { email });

    // If registering, set success message upon form submit
    if (isAuthMode === "register") {
      setSuccessMsg("Thank you for registering with ayo-ai! Your account has been created successfully. Please log in to continue.");
    }
  };

  const toggleMode = (mode: "login" | "register") => {
    setIsAuthMode(mode);
    setAuthError("");
    setSuccessMsg("");
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 overflow-y-auto w-full">
      <div className="w-full max-w-sm space-y-4 bg-slate-900/80 p-6 sm:p-8 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-md">
        
        {/* Title */}
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-amber-400">
            {isAuthMode === "login" ? "Welcome Back" : "Create an Account"}
          </h2>
          <p className="text-xs text-slate-400">
            {isAuthMode === "login"
              ? "Sign in to access your wellbeing conversation"
              : "Join ayo-ai for personalized guidance"}
          </p>
        </div>

        {/* Error Alert */}
        {authError && (
          <div className="p-3 bg-red-950/60 border border-red-700/60 rounded-xl text-xs text-red-200 text-center animate-in fade-in duration-200">
            {authError}
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 bg-emerald-950/60 border border-emerald-600/60 rounded-xl text-xs text-emerald-200 text-center leading-relaxed animate-in fade-in duration-200 shadow-lg">
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-3.5">
          
          {/* Username Field */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Username
            </label>
            <input
              type="text"
              required
              placeholder="Enter your username"
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              value={authUsername}
              onChange={(e) => setAuthUsername(e.target.value)}
            />
          </div>

          {/* Email Field (Only in Register Mode) */}
          {isAuthMode === "register" && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          {/* Password Field with Show/Hide Toggle */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 text-xs transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs sm:text-sm py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] mt-2"
          >
            {isAuthMode === "login" ? "Sign In" : "Register Account"}
          </button>
        </form>

        {/* Mode Switch Link */}
        <p className="text-center text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800/80">
          {isAuthMode === "login" ? "Don't have an account?" : "Already registered?"}{" "}
          <button
            type="button"
            onClick={() => toggleMode(isAuthMode === "login" ? "register" : "login")}
            className="text-amber-400 font-semibold underline hover:text-amber-300 ml-1 transition-colors"
          >
            {isAuthMode === "login" ? "Register here" : "Log In"}
          </button>
        </p>

      </div>
    </div>
  );
}
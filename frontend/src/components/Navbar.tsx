"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Helper to sync token from localStorage
  const checkAuthToken = () => {
    const savedToken = localStorage.getItem("ayo_access_token");
    setToken(savedToken);
  };

  useEffect(() => {
    checkAuthToken();

    // Listen for custom auth events and localStorage updates
    window.addEventListener("auth-changed", checkAuthToken);
    window.addEventListener("storage", checkAuthToken);

    return () => {
      window.removeEventListener("auth-changed", checkAuthToken);
      window.removeEventListener("storage", checkAuthToken);
    };
  }, [pathname]);

  const confirmLogout = () => {
    localStorage.removeItem("ayo_access_token");
    setToken(null);
    setIsMobileMenuOpen(false);
    setShowLogoutConfirm(false);

    // Notify all components that authentication state has changed
    window.dispatchEvent(new Event("auth-changed"));
    window.location.href = "/chat";
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Chat & AI", href: "/chat" },
    { name: "About Developer", href: "/about" },
  ];

  return (
    <>
      <nav className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 transition-all">
        {/* Full-width container across edge-to-edge viewports */}
        <div className="w-full px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Cultural African Mental Health Tagline */}
          <Link 
            href="/" 
            className="flex items-center space-x-3 group"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
              🌿
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-white leading-tight">
                ayo<span className="text-amber-500">-ai</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                African Mental Health & Wellbeing
              </span>
            </div>
          </Link>

          {/* Desktop Links & Auth Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Desktop Dynamic Auth Buttons */}
            <div className="pl-3 border-l border-slate-800 flex items-center gap-2">
              {token ? (
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Log Out
                </button>
              ) : (
                <Link
                  href="/chat"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-5 py-2 rounded-lg text-sm transition-all shadow-md shadow-amber-500/10"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            type="button"
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none border border-slate-800"
            aria-label="Toggle Navigation Menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

        </div>

        {/* Mobile Menu Collapse Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Mobile Auth Actions */}
            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              {token ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="w-full text-center bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Log Out
                </button>
              ) : (
                <Link
                  href="/chat"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-2.5 rounded-lg text-sm transition-all shadow-md shadow-amber-500/10"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-xs w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="text-3xl">🚪</div>
            <h3 className="text-base font-semibold text-slate-100">Log Out</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to log out of your session?
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-2 text-xs bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors font-medium shadow-lg"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
"use client";

interface AuthFormProps {
  isAuthMode: "login" | "register";
  setIsAuthMode: (mode: "login" | "register") => void;
  authUsername: string;
  setAuthUsername: (val: string) => void;
  authPassword: string;
  setAuthPassword: (val: string) => void;
  authError: string;
  setAuthError: (val: string) => void;
  handleAuth: (e: React.FormEvent) => void;
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
  return (
    <div className="flex-1 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold text-amber-400 text-center">
          {isAuthMode === "login" ? "Sign In to ayo-ai" : "Create an Account"}
        </h2>

        {authError && (
          <div className="p-3 bg-red-900/40 border border-red-700/50 rounded-lg text-xs text-red-200 text-center">
            {authError}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Username
            </label>
            <input
              type="text"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              value={authUsername}
              onChange={(e) => setAuthUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm py-2 rounded-lg transition-colors mt-2"
          >
            {isAuthMode === "login" ? "Log In" : "Register"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-4">
          {isAuthMode === "login" ? "Don't have an account?" : "Already registered?"}{" "}
          <button
            onClick={() => {
              setIsAuthMode(isAuthMode === "login" ? "register" : "login");
              setAuthError("");
            }}
            className="text-amber-400 underline hover:text-amber-300"
          >
            {isAuthMode === "login" ? "Register" : "Log In"}
          </button>
        </p>
      </div>
    </div>
  );
}
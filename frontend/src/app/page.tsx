"use client";

import { useState, useEffect } from "react";

interface StructuredResponse {
  greeting: string;
  reflection: string;
  actionable_suggestion?: string;
  culturally_grounded_wisdom?: string;
  suggested_followups: string[];
}

interface Message {
  sender: "user" | "ayo";
  text?: string;
  structured?: StructuredResponse;
}

export default function Home() {
  // Auth state
  const [token, setToken] = useState<string | null>(null);
  const [isAuthMode, setIsAuthMode] = useState<"login" | "register">("login");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Chat state
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ayo",
      text: "Warm greetings! I am ayo-ai. Please log in or register to begin our wellbeing conversation.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Load token from localStorage on client render
  useEffect(() => {
    const savedToken = localStorage.getItem("ayo_access_token");
    if (savedToken) {
      setToken(savedToken);
      setMessages([
        {
          sender: "ayo",
          text: "Welcome back! I am ayo-ai, your wellbeing companion. How are you feeling today?",
        },
      ]);
    }
  }, []);

  // Handle Authentication (Login / Register)
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const endpoint =
      isAuthMode === "login"
        ? "http://127.0.0.1:8000/api/auth/login/"
        : "http://127.0.0.1:8000/api/auth/register/";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: authUsername,
          password: authPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || data.detail || "Authentication failed.");
        return;
      }

      if (isAuthMode === "register") {
        // Automatically switch to login after registration
        setIsAuthMode("login");
        setAuthError("Account created successfully! Please log in.");
        return;
      }

      // Save JWT access token
      if (data.access) {
        localStorage.setItem("ayo_access_token", data.access);
        setToken(data.access);
        setMessages([
          {
            sender: "ayo",
            text: `Welcome back, ${authUsername}! How are you feeling today?`,
          },
        ]);
      }
    } catch (err) {
      setAuthError("Unable to connect to the server.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("ayo_access_token");
    setToken(null);
    setConversationId(null);
    setMessages([
      {
        sender: "ayo",
        text: "Warm greetings! I am ayo-ai. Please log in or register to begin our wellbeing conversation.",
      },
    ]);
  };

  // Send Message with JWT Authorization
  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading || !token) return;

    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: textToSend }]);
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: textToSend,
          conversation_id: conversationId,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        // Token expired
        handleLogout();
        setAuthError("Your session expired. Please log in again.");
        return;
      }

      if (res.ok) {
        if (data.conversation_id) {
          setConversationId(data.conversation_id);
        }

        if (data.structured_data) {
          const parsed: StructuredResponse = JSON.parse(data.structured_data);
          setMessages((prev) => [
            ...prev,
            { sender: "ayo", structured: parsed },
          ]);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "ayo", text: data.error || "Something went wrong." },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "ayo", text: "Server connection error." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4">
      {/* Header */}
      <header className="w-full max-w-2xl py-4 border-b border-slate-800 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-amber-500">ayo-ai</h1>
          <p className="text-xs text-slate-400">
            Culturally Grounded Wellbeing Companion
          </p>
        </div>
        {token && (
          <button
            onClick={handleLogout}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            Log Out
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <section className="w-full max-w-2xl flex-1 bg-slate-800 rounded-xl shadow-xl border border-slate-700 flex flex-col overflow-hidden h-[600px]">
        {!token ? (
          /* Auth Form Card */
          <div className="flex-1 flex flex-col justify-center items-center p-6">
            <div className="w-full max-w-md space-y-4">
              <h2 className="text-xl font-semibold text-amber-400 text-center">
                {isAuthMode === "login"
                  ? "Sign In to ayo-ai"
                  : "Create an Account"}
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
                {isAuthMode === "login"
                  ? "Don't have an account?"
                  : "Already registered?"}{" "}
                <button
                  onClick={() => {
                    setIsAuthMode(
                      isAuthMode === "login" ? "register" : "login"
                    );
                    setAuthError("");
                  }}
                  className="text-amber-400 underline hover:text-amber-300"
                >
                  {isAuthMode === "login" ? "Register" : "Log In"}
                </button>
              </p>
            </div>
          </div>
        ) : (
          /* Authenticated Chat Interface */
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-sm ${
                      msg.sender === "user"
                        ? "bg-amber-600 text-white rounded-br-none"
                        : "bg-slate-700 text-slate-100 rounded-bl-none border border-slate-600 space-y-3"
                    }`}
                  >
                    {msg.text && <p>{msg.text}</p>}

                    {msg.structured && (
                      <div className="space-y-3">
                        {msg.structured.greeting && (
                          <p className="font-semibold text-amber-400">
                            {msg.structured.greeting}
                          </p>
                        )}

                        {msg.structured.reflection && (
                          <p className="text-slate-200">
                            {msg.structured.reflection}
                          </p>
                        )}

                        {/* Render Wisdom block only if non-empty */}
                        {msg.structured.culturally_grounded_wisdom?.trim() && (
                          <div className="bg-slate-800/60 p-3 rounded-lg border-l-4 border-amber-500 text-xs text-slate-300 italic">
                            "{msg.structured.culturally_grounded_wisdom}"
                          </div>
                        )}

                        {/* Render Suggestion block only if non-empty */}
                        {msg.structured.actionable_suggestion?.trim() && (
                          <div className="bg-amber-950/40 p-3 rounded-lg border border-amber-800/40 text-xs text-amber-200">
                            <strong>Suggestion:</strong>{" "}
                            {msg.structured.actionable_suggestion}
                          </div>
                        )}

                        {msg.structured.suggested_followups?.length > 0 && (
                          <div className="pt-2 border-t border-slate-600/50 flex flex-wrap gap-2">
                            {msg.structured.suggested_followups.map(
                              (chip, cIdx) => (
                                <button
                                  key={cIdx}
                                  onClick={() => sendMessage(chip)}
                                  className="text-xs bg-slate-800 hover:bg-slate-600 text-amber-300 border border-slate-600 px-3 py-1.5 rounded-full transition-colors text-left"
                                >
                                  💬 {chip}
                                </button>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 text-slate-400 rounded-2xl px-4 py-3 text-sm animate-pulse border border-slate-600">
                    ayo-ai is reflecting...
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-slate-700 bg-slate-850 flex gap-2">
              <input
                type="text"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                placeholder="Express what's on your mind..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
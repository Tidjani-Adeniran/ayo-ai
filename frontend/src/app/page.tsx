"use client";

import { useState, useEffect, useRef } from "react";
import AuthForm from "@/components/AuthForm";
import ChatBubble, {
  Message,
  StructuredResponse,
} from "@/components/ChatBubble";
import ChatInput from "@/components/ChatInput";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthMode, setIsAuthMode] = useState<"login" | "register">("login");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ayo",
      text: "Warm greetings! I am ayo-ai. Please log in or register to begin our wellbeing conversation.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Invisible DOM Ref target for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom every time messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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
        setIsAuthMode("login");
        setAuthError("Account created successfully! Please log in.");
        return;
      }

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
          <AuthForm
            isAuthMode={isAuthMode}
            setIsAuthMode={setIsAuthMode}
            authUsername={authUsername}
            setAuthUsername={setAuthUsername}
            authPassword={authPassword}
            setAuthPassword={setAuthPassword}
            authError={authError}
            setAuthError={setAuthError}
            handleAuth={handleAuth}
          />
        ) : (
          <>
            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <ChatBubble key={idx} msg={msg} sendMessage={sendMessage} />
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 text-slate-400 rounded-2xl px-4 py-3 text-sm animate-pulse border border-slate-600">
                    ayo-ai is reflecting...
                  </div>
                </div>
              )}

              {/* Scroll Anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <ChatInput
              input={input}
              setInput={setInput}
              sendMessage={sendMessage}
              loading={loading}
            />
          </>
        )}
      </section>
    </main>
  );
}

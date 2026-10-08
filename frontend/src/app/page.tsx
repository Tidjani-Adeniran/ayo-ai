"use client";

import { useState } from "react";

interface StructuredResponse {
  greeting: string;
  reflection: string;
  actionable_suggestion: string;
  culturally_grounded_wisdom: string;
  suggested_followups: string[];
}

interface Message {
  sender: "user" | "ayo";
  text?: string;
  structured?: StructuredResponse;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ayo",
      text: "Warm greetings! I am ayo-ai. How are you feeling today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: textToSend }]);
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await response.json();

      if (response.ok && data.structured_data) {
        const parsed: StructuredResponse = JSON.parse(data.structured_data);
        setMessages((prev) => [...prev, { sender: "ayo", structured: parsed }]);
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
      <header className="w-full max-w-2xl py-6 border-b border-slate-800 mb-6 text-center">
        <h1 className="text-3xl font-bold text-amber-500">ayo-ai</h1>
        <p className="text-xs text-slate-400 mt-1">
          Structured Wellbeing Companion
        </p>
      </header>

      <section className="w-full max-w-2xl flex-1 bg-slate-800 rounded-xl shadow-xl border border-slate-700 flex flex-col overflow-hidden h-[600px]">
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
                    <p className="font-semibold text-amber-400">
                      {msg.structured.greeting}
                    </p>
                    <p className="text-slate-200">
                      {msg.structured.reflection}
                    </p>

                    <div className="bg-slate-800/60 p-3 rounded-lg border-l-4 border-amber-500 text-xs text-slate-300 italic">
                      "{msg.structured.culturally_grounded_wisdom}"
                    </div>

                    <div className="bg-amber-950/40 p-3 rounded-lg border border-amber-800/40 text-xs text-amber-200">
                      <strong>Suggestion:</strong>{" "}
                      {msg.structured.actionable_suggestion}
                    </div>

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
                          ),
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
                ayo-ai is structuring a response...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
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
      </section>
    </main>
  );
}

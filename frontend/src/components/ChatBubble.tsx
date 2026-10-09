"use client";

import React, { useState } from "react";

export interface CitationSource {
  title: string;
  score: number;
}

export interface StructuredResponse {
  greeting: string;
  reflection: string;
  actionable_suggestion?: string;
  culturally_grounded_wisdom?: string;
  suggested_followups: string[];
}

export interface Message {
  sender: "user" | "ayo";
  text?: string;
  structured?: StructuredResponse;
  sources?: CitationSource[];
}

interface ChatBubbleProps {
  msg: Message;
  sendMessage: (text: string) => void;
}

export default function ChatBubble({ msg, sendMessage }: ChatBubbleProps) {
  const [showSources, setShowSources] = useState(false);
  const isUser = msg.sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl p-4 text-sm ${
          isUser
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
              <p className="text-slate-200">{msg.structured.reflection}</p>
            )}

            {msg.structured.culturally_grounded_wisdom?.trim() && (
              <div className="bg-slate-800/60 p-3 rounded-lg border-l-4 border-amber-500 text-xs text-slate-300 italic">
                "{msg.structured.culturally_grounded_wisdom}"
              </div>
            )}

            {msg.structured.actionable_suggestion?.trim() && (
              <div className="bg-amber-950/40 p-3 rounded-lg border border-amber-800/40 text-xs text-amber-200">
                <strong>Suggestion:</strong>{" "}
                {msg.structured.actionable_suggestion}
              </div>
            )}

            {msg.structured.suggested_followups?.length > 0 && (
              <div className="pt-2 border-t border-slate-600/50 flex flex-wrap gap-2">
                {msg.structured.suggested_followups.map((chip, cIdx) => (
                  <button
                    key={cIdx}
                    onClick={() => sendMessage(chip)}
                    className="text-xs bg-slate-800 hover:bg-slate-600 text-amber-300 border border-slate-600 px-3 py-1.5 rounded-full transition-colors text-left"
                  >
                    💬 {chip}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Source Citations Drawer */}
        {!isUser && msg.sources && msg.sources.length > 0 && (
          <div className="pt-2 border-t border-slate-600/50">
            <button
              onClick={() => setShowSources(!showSources)}
              className="text-[11px] text-amber-400/90 hover:text-amber-300 flex items-center gap-1 font-medium transition"
            >
              <span>📚</span>
              <span>
                {showSources
                  ? "Hide Sources"
                  : `Grounded in ${msg.sources.length} Document Source${
                      msg.sources.length > 1 ? "s" : ""
                    }`}
              </span>
              <span className="text-[9px]">{showSources ? "▲" : "▼"}</span>
            </button>

            {showSources && (
              <div className="mt-2 space-y-1.5">
                {msg.sources.map((src, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-[11px] bg-slate-800/80 border border-slate-600/50 rounded-lg px-2.5 py-1.5 text-slate-300"
                  >
                    <span className="truncate max-w-[200px] font-medium text-slate-200">
                      📄 {src.title}
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
                      {src.score}% match
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} my-1.5`}>
      <div
        className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-sm ${
          isUser
            ? "bg-amber-600 text-white rounded-br-none"
            : "bg-slate-700 text-slate-100 rounded-bl-none border border-slate-600 space-y-3"
        }`}
      >
        {/* Standard Text Response - Formatted with Markdown */}
        {msg.text && (
          <div className={isUser ? "whitespace-pre-wrap" : "prose prose-invert max-w-none text-xs sm:text-sm prose-p:my-1.5 prose-p:leading-relaxed prose-headings:text-amber-400 prose-headings:font-bold prose-strong:text-amber-300 prose-ul:my-1.5 prose-ul:list-disc prose-ul:pl-4 prose-ol:my-1.5 prose-ol:list-decimal prose-ol:pl-4 prose-li:my-0.5"}>
            {isUser ? (
              msg.text
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.text}
              </ReactMarkdown>
            )}
          </div>
        )}

        {/* Structured AI Responses */}
        {msg.structured && (
          <div className="space-y-3">
            {msg.structured.greeting && (
              <div className="font-semibold text-amber-400 text-sm sm:text-base">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.structured.greeting}
                </ReactMarkdown>
              </div>
            )}

            {msg.structured.reflection && (
              <div className="text-slate-200 prose prose-invert max-w-none text-xs sm:text-sm prose-p:my-1 prose-strong:text-amber-300">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.structured.reflection}
                </ReactMarkdown>
              </div>
            )}

            {msg.structured.culturally_grounded_wisdom?.trim() && (
              <div className="bg-slate-800/80 p-3 rounded-lg border-l-4 border-amber-500 text-xs text-slate-300 italic shadow-inner">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {`"${msg.structured.culturally_grounded_wisdom}"`}
                </ReactMarkdown>
              </div>
            )}

            {msg.structured.actionable_suggestion?.trim() && (
              <div className="bg-amber-950/40 p-3 rounded-lg border border-amber-800/50 text-xs text-amber-200 prose prose-invert max-w-none prose-strong:text-amber-300">
                <strong className="text-amber-400">Suggestion:</strong>{" "}
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.structured.actionable_suggestion}
                </ReactMarkdown>
              </div>
            )}

            {msg.structured.suggested_followups &&
              msg.structured.suggested_followups.length > 0 && (
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
              <div className="mt-2 space-y-1.5 animate-in fade-in duration-150">
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
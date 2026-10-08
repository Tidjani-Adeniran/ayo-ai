"use client";

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
}

interface ChatBubbleProps {
  msg: Message;
  sendMessage: (text: string) => void;
}

export default function ChatBubble({ msg, sendMessage }: ChatBubbleProps) {
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
      </div>
    </div>
  );
}

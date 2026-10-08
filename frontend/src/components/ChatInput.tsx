"use client";

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  sendMessage: () => void;
  loading: boolean;
}

export default function ChatInput({
  input,
  setInput,
  sendMessage,
  loading,
}: ChatInputProps) {
  return (
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
  );
}

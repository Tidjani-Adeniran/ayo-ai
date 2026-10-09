"use client";

import React, { useEffect, useState } from "react";

export interface ConversationItem {
  id: number;
  title: string;
  created_at: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
  activeConversationId: number | null;
  onSelectConversation: (id: number) => void;
  onNewChat: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  token,
  activeConversationId,
  onSelectConversation,
  onNewChat,
}: SidebarProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  // Track which conversation ID is currently asking for confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const fetchConversations = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/conversations/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!token) return;

    setDeletingId(id);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/conversations/${id}/delete/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setConversations((prev) => prev.filter((conv) => conv.id !== id));
        if (id === activeConversationId) {
          onNewChat();
        }
      }
    } catch (err) {
      console.error("Error deleting conversation:", err);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  useEffect(() => {
    if (isOpen && token) {
      fetchConversations();
    }
  }, [isOpen, token, activeConversationId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          setConfirmDeleteId(null);
          onClose();
        }}
      />

      {/* Drawer */}
      <div className="relative z-10 w-80 bg-slate-800 border-r border-slate-700 h-full p-4 flex flex-col justify-between shadow-2xl text-slate-100">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-4">
            <h2 className="font-bold text-amber-500 text-lg flex items-center gap-2">
              💬 Chat History
            </h2>
            <button
              onClick={() => {
                setConfirmDeleteId(null);
                onClose();
              }}
              className="text-slate-400 hover:text-slate-200 text-sm p-1"
            >
              ✕
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => {
              setConfirmDeleteId(null);
              onNewChat();
              onClose();
            }}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl mb-4 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>+</span> Start New Chat
          </button>

          {/* Conversation List */}
          <div className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
            {loading ? (
              <p className="text-xs text-slate-400 p-2 italic">Loading history...</p>
            ) : conversations.length === 0 ? (
              <p className="text-xs text-slate-500 p-2">No past conversations yet.</p>
            ) : (
              conversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                const isDeleting = deletingId === conv.id;
                const isConfirming = confirmDeleteId === conv.id;

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      if (!isConfirming) {
                        onSelectConversation(conv.id);
                        onClose();
                      }
                    }}
                    className={`group w-full text-left p-3 rounded-xl text-xs transition border flex items-center justify-between cursor-pointer ${
                      isActive
                        ? "bg-slate-700 border-amber-500/60 text-amber-300 font-medium"
                        : "bg-slate-900/40 border-slate-700/60 hover:bg-slate-700/50 text-slate-300"
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="truncate font-medium">{conv.title}</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {conv.created_at}
                      </p>
                    </div>

                    {/* Delete Controls with Inline Confirmation */}
                    <div className="flex items-center gap-1">
                      {isConfirming ? (
                        <div className="flex items-center gap-1 bg-red-950/80 border border-red-800/80 rounded-lg p-1">
                          <button
                            onClick={(e) => handleConfirmDelete(e, conv.id)}
                            disabled={isDeleting}
                            title="Confirm Delete"
                            className="text-emerald-400 hover:text-emerald-300 px-1 font-bold text-xs"
                          >
                            {isDeleting ? "..." : "✓"}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(null);
                            }}
                            title="Cancel"
                            className="text-slate-400 hover:text-slate-200 px-1 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(conv.id);
                          }}
                          title="Delete Conversation"
                          className="opacity-60 group-hover:opacity-100 hover:text-red-400 text-slate-400 p-1 rounded-md transition-colors text-sm"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
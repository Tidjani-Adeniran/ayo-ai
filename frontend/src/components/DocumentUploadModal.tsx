"use client";

import React, { useState } from "react";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
  onUploadSuccess?: (chunkCount: number, title: string) => void;
}

export default function DocumentUploadModal({
  isOpen,
  onClose,
  token,
  onUploadSuccess,
}: DocumentUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        setError("Only PDF files are supported.");
        setSelectedFile(null);
        return;
      }
      setError(null);
      setSelectedFile(file);
      if (!docTitle) {
        // Auto-fill title with filename (without extension)
        setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !token) {
      setError("Please select a valid PDF document.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", docTitle || selectedFile.name);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/documents/upload/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData, // FormData automatically sets multipart/form-data content type
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to upload and process PDF.");
        return;
      }

      const chunkCount = data.chunks_created || 0;
      setSuccessMessage(
        `Document uploaded! Successfully extracted and created ${chunkCount} vector embeddings.`
      );

      if (onUploadSuccess) {
        onUploadSuccess(chunkCount, docTitle || selectedFile.name);
      }

      // Reset form after 2 seconds and close modal
      setTimeout(() => {
        setSelectedFile(null);
        setDocTitle("");
        setSuccessMessage(null);
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Network error. Ensure Django backend is running.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-5 text-slate-100 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <h2 className="text-lg font-semibold text-amber-500">
              Train ayo-ai with Documents
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1 transition"
          >
            ✕
          </button>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleUpload} className="space-y-4">
          {/* Document Title Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Document Title
            </label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="e.g. Mental Health Guidelines 2026"
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 transition"
              required
            />
          </div>

          {/* PDF File Dropzone / Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              PDF Document
            </label>
            <div className="border-2 border-dashed border-slate-700 hover:border-amber-500 bg-slate-900/50 rounded-xl p-4 text-center cursor-pointer transition">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="pdf-upload-input"
              />
              <label htmlFor="pdf-upload-input" className="cursor-pointer block">
                {selectedFile ? (
                  <div className="text-amber-400 font-medium text-sm truncate">
                    📎 {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-slate-400 text-xs">
                      Click to browse or drop your <strong className="text-slate-200">PDF file</strong> here
                    </p>
                    <p className="text-[10px] text-slate-500">Selectable text PDFs only</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-red-200 text-xs">
              ⚠️ {error}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-xl text-emerald-200 text-xs">
              ✅ {successMessage}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-xl transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs rounded-xl transition disabled:opacity-50 disabled:bg-slate-800"
            >
              {uploading ? "Processing & Embedding..." : "Upload & Train"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
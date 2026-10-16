import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 py-12 px-6 sm:px-12">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-stone-200 p-8 sm:p-12">
        
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center text-white justify-center text-2xl font-bold shadow-inner">
            TA
          </div>
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Tidjani Adeniran</h1>
            <p className="text-amber-700 font-medium">Full-Stack Software & AI Engineer</p>
          </div>
        </div>

        {/* Bio summary */}
        <div className="space-y-4 text-stone-600 leading-relaxed">
          <p>
            Hello! I am a bilingual (French & English) software engineer with a Bachelor of Science in Computer Science from West End University College. My technical focus lies at the intersection of full-stack web architecture and applied artificial intelligence.
          </p>
          <p>
            I built <strong className="text-stone-800">ayo-ai</strong> to explore how culturally grounded, non-clinical wellbeing systems can leverage dual-engine RAG (Knowledge RAG + Personal RAG) and agentic tool execution using Python, Django, Neon PostgreSQL (<code className="bg-stone-100 px-1 py-0.5 rounded text-sm">pgvector</code>), and the Google Gemini API.
          </p>
        </div>

        {/* Tech Stack Grid */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-stone-900 mb-3">Core Technical Stack</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <span className="bg-stone-100 px-3 py-2 rounded-lg font-medium text-stone-700">Python & Django / DRF</span>
            <span className="bg-stone-100 px-3 py-2 rounded-lg font-medium text-stone-700">Next.js & TypeScript</span>
            <span className="bg-stone-100 px-3 py-2 rounded-lg font-medium text-stone-700">Neon PostgreSQL (pgvector)</span>
            <span className="bg-stone-100 px-3 py-2 rounded-lg font-medium text-stone-700">Google GenAI SDK (Gemini)</span>
            <span className="bg-stone-100 px-3 py-2 rounded-lg font-medium text-stone-700">Docker & Linux</span>
            <span className="bg-stone-100 px-3 py-2 rounded-lg font-medium text-stone-700">Tailwind CSS</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 pt-6 border-t border-stone-100 flex flex-wrap gap-4">
          <Link href="/chat" className="bg-amber-700 hover:bg-amber-800 text-white font-medium px-6 py-3 rounded-xl transition shadow-sm">
            Experience ayo-ai Chat
          </Link>
          <a href="https://github.com/your-github" target="_blank" rel="noopener noreferrer" className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium px-6 py-3 rounded-xl transition">
            GitHub Profile
          </a>
        </div>

      </div>
    </div>
  );
}
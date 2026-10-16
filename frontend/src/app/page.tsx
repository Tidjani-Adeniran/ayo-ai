import Link from "next/link";

export default function Home() {
  return (
    <main className="relative overflow-hidden bg-slate-950 min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-6 py-16">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl text-center z-10 space-y-8">
        {/* Status Badge */}
        <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <span>🌿</span>
          <span>Non-Clinical Wellbeing AI Companion</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          Culturally Grounded Guidance powered by{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
            Dual-Engine RAG
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
          Experience a warm, empathetic wellbeing space integrating public knowledge bases with private, user-isolated journal reflections and agentic tool execution.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link
            href="/chat"
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-8 py-4 rounded-xl shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5"
          >
            Launch Chat App →
          </Link>
          <Link
            href="/about"
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold px-8 py-4 rounded-xl transition-all"
          >
            Meet the Developer
          </Link>
        </div>

        {/* Architectural Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 text-left">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
            <div className="text-amber-400 text-2xl mb-2">🧠</div>
            <h3 className="text-white font-bold mb-1">Knowledge RAG</h3>
            <p className="text-slate-400 text-sm">
              Semantic vector retrieval across evidence-based wellbeing guides.
            </p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
            <div className="text-amber-400 text-2xl mb-2">🔒</div>
            <h3 className="text-white font-bold mb-1">Personal RAG</h3>
            <p className="text-slate-400 text-sm">
              Isolated private journal embeddings with pgvector cosine similarity.
            </p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
            <div className="text-amber-400 text-2xl mb-2">🛠️</div>
            <h3 className="text-white font-bold mb-1">Agentic Tools</h3>
            <p className="text-slate-400 text-sm">
              Autonomous function calling for logging mood reflections via Gemini.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
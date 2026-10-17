import Link from "next/link";

export default function Home() {
  return (
    <main className="relative overflow-x-hidden bg-slate-950 min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 py-8 sm:py-16">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[500px] h-[280px] sm:h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl text-center z-10 space-y-6 sm:space-y-8 my-auto">
        {/* Status Badge */}
        <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-amber-400 text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
          <span>🌿</span>
          <span>Non-Clinical Wellbeing AI Companion</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
          Culturally Grounded Guidance powered by{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
            Dual-Engine RAG
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed px-2">
          Experience a warm, empathetic wellbeing space integrating public knowledge bases with private, user-isolated journal reflections and agentic tool execution.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 w-full sm:w-auto px-4 sm:px-0">
          <Link
            href="/chat"
            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 sm:hover:-translate-y-0.5 text-center text-sm sm:text-base"
          >
            Launch Chat App →
          </Link>
          <Link
            href="/about"
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl transition-all text-center text-sm sm:text-base"
          >
            Meet the Developer
          </Link>
        </div>

        {/* Architectural Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-8 sm:pt-12 text-left">
          <div className="bg-slate-900/60 border border-slate-800/80 p-5 sm:p-6 rounded-2xl backdrop-blur-sm">
            <div className="text-amber-400 text-xl sm:text-2xl mb-2">🧠</div>
            <h3 className="text-white font-bold text-sm sm:text-base mb-1">Knowledge RAG</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Semantic vector retrieval across evidence-based wellbeing guides.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-5 sm:p-6 rounded-2xl backdrop-blur-sm">
            <div className="text-amber-400 text-xl sm:text-2xl mb-2">🔒</div>
            <h3 className="text-white font-bold text-sm sm:text-base mb-1">Personal RAG</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Isolated private journal embeddings with pgvector cosine similarity.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-5 sm:p-6 rounded-2xl backdrop-blur-sm">
            <div className="text-amber-400 text-xl sm:text-2xl mb-2">🛠️</div>
            <h3 className="text-white font-bold text-sm sm:text-base mb-1">Agentic Tools</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Autonomous function calling for logging mood reflections via Gemini.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
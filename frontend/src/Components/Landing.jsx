import React from "react";
import { PlayCircle, MessageSquare, Zap, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Background ambient gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-2xl tracking-tight">
          <Sparkles className="w-7 h-7 text-indigo-500" />
          <span>TubeChat</span>
        </div>
        <button
          onClick={() => navigate("/chat")}
          className="px-6 py-2.5 text-sm font-bold text-indigo-700 bg-white/60 backdrop-blur-md border border-white hover:bg-white hover:shadow-lg hover:shadow-indigo-500/10 rounded-full transition-all duration-300"
        >
          Try Chatting
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-xl border border-white shadow-sm text-sm font-semibold text-slate-700 mb-8 hover:scale-105 transition-transform cursor-default">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
          </span>
          Powered by Gemini 2.5
        </div> */}

        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tighter text-slate-900 mb-8 leading-[1.1]">
          Don't just watch videos. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500">
            Converse with them.
          </span>
        </h1>

        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
          Instantly extract insights, summarize long tutorials, and ask highly specific
          questions about any YouTube video. Just drop a link and start the conversation.
        </p>

        <button
          onClick={() => navigate("/chat")}
          className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 font-bold text-white bg-slate-900 rounded-full overflow-hidden shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_0_60px_-15px_rgba(79,70,229,0.5)] hover:bg-indigo-600 hover:-translate-y-1 transition-all duration-300"
        >
          <span className="text-lg">Start Analyzing Now</span>
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
        </button>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-32 text-left">
          {[
            {
              icon: PlayCircle,
              title: "Universal Support",
              desc: "Works seamlessly with almost any YouTube video that has closed captions available.",
              color: "text-blue-500",
              bg: "bg-blue-50",
            },
            {
              icon: Zap,
              title: "Lightning Fast",
              desc: "Powered by advanced vector search and FastAPI for near-instantaneous AI responses.",
              color: "text-amber-500",
              bg: "bg-amber-50",
            },
            {
              icon: MessageSquare,
              title: "Deep Context",
              desc: "Our AI model understands the full context of the video transcript, missing no detail.",
              color: "text-emerald-500",
              bg: "bg-emerald-50",
            },
          ].map((feature, idx) => (
             <div
              key={idx}
              className="group p-8 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-xl shadow-slate-200/40 hover:bg-white hover:-translate-y-2 transition-all duration-400"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-500 text-base leading-relaxed font-medium">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
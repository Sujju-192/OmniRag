import React from "react";
import {
  FileText,
  Video,
  BrainCircuit,
  ArrowRight,
  Search,
  Zap,
  Layers,
  UploadCloud,
  MessageSquare,
  Database,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
      {/* Sticky Navbar with backdrop blur */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="flex items-center gap-2.5 font-black text-2xl tracking-tighter text-slate-900">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span>OmniRAG</span>
        </div>

        {/* Optional nav links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How it works</a>
          <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/chat")}
            className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-200 transition-all hover:shadow-md"
          >
            Launch Workspace
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <div className="pt-20 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6">
              <BrainCircuit className="w-4 h-4" />
              <span>Multimodal AI Assistant</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
              Chat with your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                PDFs
              </span>{" "}
              and{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">
                Videos
              </span>
              .
            </h1>

            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
              Upload dense documents or paste YouTube links. Our Retrieval-Augmented
              Generation (RAG) engine instantly analyzes the content so you can extract
              answers, summaries, and insights in seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/pdf-chat")}
                className="flex items-center justify-center gap-2 px-8 py-4 font-bold text-slate-900 bg-white border-2 border-slate-200 hover:border-blue-400 rounded-xl transition-all shadow-sm hover:shadow-md"
              >
                <FileText className="w-5 h-5 text-blue-600" />
                Upload a PDF
              </button>
              <button
                onClick={() => navigate("/youtube-chat")}
                className="flex items-center justify-center gap-2 px-8 py-4 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Video className="w-5 h-5 text-red-500" />
                Analyze Video
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>

            <div className="mt-8 flex items-center gap-4 text-sm text-slate-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Free to start</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>No credit card required</span>
            </div>
          </div>

          {/* Right column – Product screenshot placeholder */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Placeholder for an actual product screenshot/image */}
              <div className="aspect-[4/3] rounded-2xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="text-center text-slate-400">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                  <p className="font-medium">Product screenshot placeholder</p>
                  <p className="text-sm">Add your dashboard or demo image here</p>
                </div>
              </div>

              {/* Decorative floating elements */}
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-blue-100 rounded-2xl -z-10" />
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-slate-100 rounded-full -z-10" />
            </div>
          </div>
        </div>

        {/* How it works section */}
        <div id="how-it-works" className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              How it works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Three simple steps to unlock insights from any document or video.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: UploadCloud,
                title: "1. Upload or Link",
                desc: "Drag & drop a PDF or paste a YouTube URL. We handle the rest.",
                color: "text-blue-600 bg-blue-50",
              },
              {
                icon: Database,
                title: "2. Processing",
                desc: "Our RAG engine chunks, indexes, and vectorizes the content in seconds.",
                color: "text-amber-600 bg-amber-50",
              },
              {
                icon: MessageSquare,
                title: "3. Chat & Extract",
                desc: "Ask questions and get precise, citation-backed answers instantly.",
                color: "text-emerald-600 bg-emerald-50",
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="relative p-8 bg-white border border-slate-200 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mb-6`}
                >
                  <step.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features section (existing grid but refined) */}
        <div id="features" className="py-20 border-t border-slate-200">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              Powerful features
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to turn static content into interactive conversations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: FileText,
                title: "PDF Extraction",
                desc: "Automatically chunks and indexes multi-page documents into a highly searchable vector database.",
                iconBg: "bg-blue-100",
                iconColor: "text-blue-600",
              },
              {
                icon: Video,
                title: "Video Transcripts",
                desc: "Bypasses the video to instantly read and process YouTube closed captions for exact context.",
                iconBg: "bg-red-100",
                iconColor: "text-red-600",
              },
              {
                icon: Search,
                title: "Semantic Search",
                desc: "Goes beyond keyword matching to understand the actual meaning behind your questions.",
                iconBg: "bg-emerald-100",
                iconColor: "text-emerald-600",
              },
              {
                icon: Zap,
                title: "Instant Answers",
                desc: "Powered by FastAPI and LangChain to deliver accurate, citation-backed responses instantly.",
                iconBg: "bg-amber-100",
                iconColor: "text-amber-600",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group p-6 bg-white border border-slate-200 rounded-2xl hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="py-20">
          <div className="bg-slate-900 rounded-3xl p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 text-white relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />

            <div className="relative">
              <h3 className="text-3xl md:text-4xl font-black mb-3">
                Ready to accelerate your research?
              </h3>
              <p className="text-slate-300 text-lg">
                Stop scrubbing through timelines and scrolling through pages.
              </p>
            </div>
            <button
              onClick={() => navigate("/chat")}
              className="relative shrink-0 px-8 py-4 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl transition-colors shadow-lg"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <div className="w-6 h-6 bg-slate-900 rounded-md flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            OmniRAG
          </div>
          <div className="text-sm text-slate-500">
            © 2024 OmniRAG. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-slate-600">
            <a href="#" className="hover:text-slate-900">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900">Terms of Service</a>
            <a href="#" className="hover:text-slate-900">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
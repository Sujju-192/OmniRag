import React, { useState } from "react";
import { ArrowLeft, Sparkles, Video, MessageCircle, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function YouTubeChat() {
  const navigate = useNavigate();
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setAnswer("");

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      setError("Please enter a valid YouTube URL.");
      return;
    }
    if (!query.trim()) {
      setError("Please enter a question.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_id: videoId, query: query }),
      });

      if (!response.ok) throw new Error("Server error. Ensure FastAPI is running.");

      const data = await response.json();
      setAnswer(data.answer);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-b from-indigo-100 to-transparent blur-[120px] rounded-full opacity-60 pointer-events-none"></div>

      <div className="max-w-2xl w-full mx-auto relative z-10">
        {/* Header navigation */}
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-8 transition-colors font-bold text-sm bg-white/50 px-4 py-2 rounded-full border border-slate-200 backdrop-blur-sm w-fit shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        {/* Main Interface Card */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 p-8 sm:p-10 transition-all">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Ask the AI</h2>
              <p className="text-slate-500 font-medium text-sm">Analyze any video in seconds.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                <Video className="w-4 h-4 text-red-500" /> Video URL
              </label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-base shadow-inner"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                <MessageCircle className="w-4 h-4 text-blue-500" /> Your Question
              </label>
              <input
                type="text"
                placeholder="e.g. What are the 3 main points discussed?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-base shadow-inner"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-[0_4px_14px_0_rgba(15,23,42,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 disabled:shadow-none disabled:transform-none flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-indigo-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-slate-500">Processing Transcript...</span>
                </>
              ) : (
                "Extract Answer"
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-semibold flex items-center gap-3 animate-fade-in">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-500 flex-shrink-0">!</div>
              <p>{error}</p>
            </div>
          )}

          {/* AI Response Area */}
          {answer && (
            <div className="mt-10 relative animate-fade-in">
              {/* Fancy AI border gradient */}
              <div className="absolute -inset-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-[1.5rem] opacity-20 blur-sm"></div>
              
              <div className="relative p-8 bg-white rounded-[1.5rem] shadow-sm border border-indigo-50">
                <div className="flex items-center gap-2 mb-5">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">
                    AI Response
                  </h3>
                </div>
                <div className="prose prose-slate max-w-none text-slate-700 leading-loose font-medium">
                  {/* Rendering standard text, preserving line breaks */}
                  {answer.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
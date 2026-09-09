import React, { useEffect, useState } from "react";

import {
  ArrowLeft,
  Sparkles,
  Video,
  MessageCircle,
  Bot,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function YouTubeChat() {
  const navigate = useNavigate();

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");

  const [uploading, setUploading] = useState(false);
  const [asking, setAsking] = useState(false);

  const [videoUploaded, setVideoUploaded] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // 30 SECOND UPLOAD COOLDOWN
  // ==========================================

  const COOLDOWN_SECONDS = 30;

  const [cooldown, setCooldown] = useState(() => {
    const lastUpload = localStorage.getItem("youtube_last_upload");

    if (!lastUpload) return 0;

    const elapsed = Math.floor(
      (Date.now() - Number(lastUpload)) / 1000
    );

    return elapsed < COOLDOWN_SECONDS
      ? COOLDOWN_SECONDS - elapsed
      : 0;
  });

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const apiUrl =
    import.meta.env.VITE_API_URL || "http://localhost:8000";

  // ==========================================
  // Extract YouTube Video ID
  // ==========================================

  const extractVideoId = (url) => {
    try {
      const parsedUrl = new URL(url);

      // youtube.com/watch?v=VIDEO_ID
      if (parsedUrl.hostname.includes("youtube.com")) {
        return parsedUrl.searchParams.get("v");
      }

      // youtu.be/VIDEO_ID
      if (parsedUrl.hostname === "youtu.be") {
        return parsedUrl.pathname.substring(1);
      }

      return null;
    } catch {
      return null;
    }
  };

  // ==========================================
  // STEP 1: Upload / Process Video
  // ==========================================

  const handleVideoUpload = async (e) => {
    e.preventDefault();

    setError("");
    setAnswer("");

    // ------------------------------------------
    // Check 30 second cooldown
    // ------------------------------------------

    if (cooldown > 0) {
      setError(
        `Please wait ${cooldown} seconds before processing another video.`
      );
      return;
    }

    const videoId = extractVideoId(youtubeUrl);

    if (!videoId) {
      setError("Please enter a valid YouTube URL.");
      return;
    }

    setUploading(true);
    setVideoUploaded(false);

    try {
      console.log("📤 Sending video to backend...");
      console.log("🎥 Video ID:", videoId);

      const response = await fetch(`${apiUrl}/uploadLink`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_id: videoId,
        }),
      });

      const data = await response.json();

      console.log("📥 Backend response:", data);

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to process the YouTube video."
        );
      }

      console.log("✅ Video processed successfully");

      setVideoUploaded(true);

      // ------------------------------------------
      // Start 30 second cooldown
      // ------------------------------------------

      localStorage.setItem(
        "youtube_last_upload",
        Date.now().toString()
      );

      setCooldown(COOLDOWN_SECONDS);

    } catch (err) {
      console.error("❌ Upload error:", err);

      setError(
        err.message ||
          "Failed to process the video. Please try again."
      );

      setVideoUploaded(false);

    } finally {
      setUploading(false);
    }
  };

  // ==========================================
  // STEP 2: Ask Question
  // ==========================================

  const handleAskQuestion = async (e) => {
    e.preventDefault();

    setError("");
    setAnswer("");

    if (!videoUploaded) {
      setError("Please process a YouTube video first.");
      return;
    }

    if (!query.trim()) {
      setError("Please enter a question.");
      return;
    }

    setAsking(true);

    try {
      console.log("💬 Sending question to backend...");
      console.log("❓ Question:", query);

      const response = await fetch(`${apiUrl}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
        }),
      });

      const data = await response.json();

      console.log("📥 Answer response:", data);

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to get an answer."
        );
      }

      setAnswer(data.answer);

    } catch (err) {
      console.error("❌ Question error:", err);

      setError(
        err.message ||
          "Failed to get an answer. Please try again."
      );

    } finally {
      setAsking(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">

      {/* Background Glow */}

      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-b from-indigo-100 to-transparent blur-[120px] rounded-full opacity-60 pointer-events-none" />

      <div className="max-w-2xl w-full mx-auto relative z-10">

        {/* Header */}

        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-8 transition-colors font-bold text-sm bg-white/50 px-4 py-2 rounded-full border border-slate-200 backdrop-blur-sm w-fit shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        {/* Main Card */}

        <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 p-8 sm:p-10 transition-all">

          {/* Title */}

          <div className="flex items-center gap-4 mb-8">

            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">

              <Bot className="w-6 h-6 text-white" />

            </div>

            <div>

              <h2 className="text-2xl font-extrabold text-slate-900">
                Ask the AI
              </h2>

              <p className="text-slate-500 font-medium text-sm">
                Analyze any video in seconds.
              </p>

            </div>

          </div>

          {/* ==========================================
              VIDEO UPLOAD FORM
          ========================================== */}

          <form
            onSubmit={handleVideoUpload}
            className="space-y-4"
          >

            <div className="space-y-1.5">

              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">

                <Video className="w-4 h-4 text-red-500" />

                Video URL

              </label>

              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => {
                  setYoutubeUrl(e.target.value);
                  setVideoUploaded(false);
                  setAnswer("");
                  setError("");
                }}
                className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-base shadow-inner"
                required
              />

            </div>

            <button
              type="submit"
              disabled={uploading || cooldown > 0}
              className="w-full py-4 bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-[0_4px_14px_0_rgba(15,23,42,0.39)] flex items-center justify-center gap-3"
            >

              {uploading ? (
                <>
                  <svg
                    className="animate-spin h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />

                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />

                  </svg>

                  Processing Transcript...
                </>
              ) : cooldown > 0 ? (
                `Please wait ${cooldown}s`
              ) : (
                "Process Video"
              )}

            </button>

          </form>

          {/* Cooldown message */}

          {cooldown > 0 && !uploading && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-sm font-semibold text-center">
              ⏳ You can process another video in{" "}
              <span className="font-extrabold">
                {cooldown} seconds
              </span>
            </div>
          )}

          {/* Success Message */}

          {videoUploaded && (
            <div className="mt-5 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-600 text-sm font-semibold">
              ✓ Video processed successfully. You can now ask questions.
            </div>
          )}

          {/* ==========================================
              QUESTION FORM
          ========================================== */}

          <form
            onSubmit={handleAskQuestion}
            className="mt-8 space-y-4"
          >

            <div className="space-y-1.5">

              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">

                <MessageCircle className="w-4 h-4 text-blue-500" />

                Your Question

              </label>

              <input
                type="text"
                placeholder="e.g. What are the 3 main points discussed?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={!videoUploaded}
                className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-base shadow-inner disabled:opacity-50"
              />

            </div>

            <button
              type="submit"
              disabled={asking || !videoUploaded}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-lg rounded-2xl transition-all duration-300 flex items-center justify-center gap-3"
            >

              {asking ? (
                <>
                  <svg
                    className="animate-spin h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />

                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />

                  </svg>

                  Thinking...
                </>
              ) : (
                "Ask Question"
              )}

            </button>

          </form>

          {/* Error */}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-semibold flex items-center gap-3">

              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-500 flex-shrink-0">
                !
              </div>

              <p>{error}</p>

            </div>
          )}

          {/* ==========================================
              AI RESPONSE
          ========================================== */}

          {answer && (
            <div className="mt-10 relative">

              <div className="absolute -inset-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-[1.5rem] opacity-20 blur-sm" />

              <div className="relative p-8 bg-white rounded-[1.5rem] shadow-sm border border-indigo-50">

                <div className="flex items-center gap-2 mb-5">

                  <Sparkles className="w-5 h-5 text-indigo-500" />

                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">
                    AI Response
                  </h3>

                </div>

                <div className="prose prose-slate max-w-none text-slate-700 leading-loose font-medium">

                  {answer.split("\n").map((line, i) => (
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
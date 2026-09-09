import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./Components/Landing.jsx";
import YouTubeChat from "./Components/YoutubeChat.jsx";
import PDFChat from "./Components/PDFChat.jsx"; // Make sure to import this!

export default function App() {
  return (
    <Router>
      <div className="font-sans antialiased text-slate-900 bg-slate-50 selection:bg-indigo-200 selection:text-indigo-900">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/youtube-chat" element={<YouTubeChat />} />
          <Route path="/pdf-chat" element={<PDFChat />} />
        </Routes>
      </div>
    </Router>
  );
}
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./Components/Landing";
import YouTubeChat from "./Components/YouTubeChat";

export default function App() {
  return (
    <Router>
      <div className="font-sans antialiased text-slate-900 bg-slate-50 selection:bg-indigo-200 selection:text-indigo-900">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/chat" element={<YouTubeChat />} />
        </Routes>
      </div>
    </Router>
  );
}
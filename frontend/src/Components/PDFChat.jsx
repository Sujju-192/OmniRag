import React, { useState, useRef, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  FileText,
  Upload,
  Send,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  MessageSquare,
  Trash2,
  Paperclip,
  Loader2,
} from "lucide-react";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const PDFChat = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [documentId, setDocumentId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState("");

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const viewerContainerRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  const onFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      // Create object URL for PDF viewer
      const url = URL.createObjectURL(selectedFile);
      setFileUrl(url);
      setPageNumber(1);
      await handleUpload(selectedFile);
    } else {
      alert("Please select a valid PDF file.");
    }
  };

  const handleUpload = async (pdfFile) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", pdfFile);

    try {
      const response = await fetch(`${apiUrl}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setDocumentId(data.document_id);
        setMessages([
          {
            role: "bot",
            content: `PDF "${data.filename}" uploaded successfully! I've analyzed the document. Ask me anything about its content.`,
          },
        ]);
      } else {
        alert(data.detail || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to connect to the server.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !documentId) return;

    const userMessage = inputMessage.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const response = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_id: documentId, message: userMessage }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages((prev) => [...prev, { role: "bot", content: data.answer }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content: "Sorry, I encountered an error answering that.",
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Network error. Please try again." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset) => {
    setPageNumber((prev) => Math.min(Math.max(1, prev + offset), numPages || 1));
  };

  const jumpToPage = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= numPages) {
      setPageNumber(value);
    }
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
  const fitWidth = () => {
    if (viewerContainerRef.current) {
      const containerWidth = viewerContainerRef.current.clientWidth - 64; // padding
      const pageWidth = 600; // approximate base width; you can adjust
      setScale(containerWidth / pageWidth);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-bold text-slate-800">PDF Chat</h1>
          {fileName && (
            <span className="ml-4 text-sm text-slate-500 truncate max-w-[200px]">
              {fileName}
            </span>
          )}
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors"
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {isUploading ? "Uploading..." : "Upload PDF"}
        </button>
      </header>

      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf"
        className="hidden"
        onChange={onFileChange}
        disabled={isUploading}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - PDF Viewer */}
        <div className="w-1/2 min-w-[400px] border-r border-slate-200 flex flex-col bg-white">
          {/* PDF Toolbar */}
          <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={() => changePage(-1)}
                disabled={!numPages || pageNumber <= 1}
                className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center text-sm">
                <input
                  type="number"
                  min="1"
                  max={numPages || 1}
                  value={pageNumber}
                  onChange={jumpToPage}
                  className="w-12 px-1 py-0.5 text-center border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="mx-1 text-slate-500">/</span>
                <span className="text-slate-600">{numPages || "-"}</span>
              </div>
              <button
                onClick={() => changePage(1)}
                disabled={!numPages || pageNumber >= numPages}
                className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={zoomOut}
                className="p-1.5 rounded hover:bg-slate-200"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-500 w-10 text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={zoomIn}
                className="p-1.5 rounded hover:bg-slate-200"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={fitWidth}
                className="p-1.5 rounded hover:bg-slate-200"
                title="Fit width"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PDF Viewer Area */}
          <div
            ref={viewerContainerRef}
            className="flex-1 overflow-auto bg-slate-200 p-4 flex justify-center"
          >
            {fileUrl ? (
              <Document
                file={fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Loading PDF...
                  </div>
                }
                error={
                  <div className="flex items-center justify-center h-full text-red-500">
                    Failed to load PDF.
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  scale={scale}
                  className="shadow-lg"
                />
              </Document>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <FileText className="w-16 h-16 mb-4" />
                <p className="text-lg font-medium">No document loaded</p>
                <p className="text-sm">Upload a PDF to start viewing and chatting</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Select PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Chat */}
        <div className="w-1/2 min-w-[400px] flex flex-col bg-white">
          {/* Chat Header */}
          <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-semibold text-slate-700">AI Assistant</h2>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-red-500 transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <MessageSquare className="w-12 h-12 mb-3 text-slate-300" />
                <p className="text-center text-sm">
                  Upload a PDF and ask questions about its content.
                  <br />
                  For example: "Summarize the main points" or "What are the key findings?"
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-white text-slate-800 rounded-bl-md border border-slate-200"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-500 p-3 rounded-2xl rounded-bl-md border border-slate-200 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={!documentId}
                  placeholder={
                    documentId
                      ? "Ask a question about the document..."
                      : "Upload a document first..."
                  }
                  className="w-full px-4 py-2.5 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-400"
                />
                <Paperclip className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              <button
                type="submit"
                disabled={!documentId || !inputMessage.trim()}
                className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFChat;
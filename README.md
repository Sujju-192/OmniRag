# 🎥 TubeChat – Conversational AI for YouTube Videos

TubeChat is a full-stack Retrieval-Augmented Generation (RAG) application that lets users interact directly with YouTube video content. Instead of watching hours of video, users can simply paste a YouTube URL, ask specific questions, and receive accurate, context-aware answers extracted directly from the video's transcript.

---

## ✨ Features

- **Instant Transcript Retrieval:** Automatically fetches and processes closed captions from YouTube videos.
- **Context-Aware Q&A:** Uses vector similarity search to find the most relevant video sections before answering.
- **Hallucination Prevention:** Grounded prompting ensures answers come strictly from the transcript context.
- **Sleek Light UI:** Modern, responsive interface built with React, Tailwind CSS, and frosted glass design elements.
- **Fast API Integration:** Powered by FastAPI for asynchronous request handling and fast response times.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** React.js (Vite)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Routing:** React Router (`react-router-dom`)

### **Backend**
- **Framework:** FastAPI & Uvicorn
- **Orchestration:** LangChain (LCEL)
- **AI Models:** Google Gemini 2.5 Flash (Generation) & Gemini Embedding 001
- **Vector Database:** ChromaDB
- **Transcript Extraction:** YouTube Transcript API

---

## 🏗️ Architecture Flow

1. **User Input:** User pastes a YouTube URL and submits a query via the React UI.
2. **Transcript Processing:** FastAPI backend fetches the video transcript, splits it into semantic chunks using `RecursiveCharacterTextSplitter`, and embeds the text using Google Generative AI Embeddings.
3. **Vector Search:** Embeddings are stored in ChromaDB to retrieve the top $k$ relevant context chunks matching the query.
4. **Response Generation:** Gemini 2.5 Flash generates a accurate response strictly using the retrieved context.

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v18+)
- Python (v3.10+)
- Google Gemini API Key

---

### **1. Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn langchain langchain-google-genai langchain-chroma youtube-transcript-api python-dotenv pydantic

# Create a .env file and add your API key
echo "GOOGLE_API_KEY=your_gemini_api_key_here" > .env

# Start the FastAPI server
uvicorn main:app --reload --port 8000
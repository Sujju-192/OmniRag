import io
import uuid
import os
import traceback
from typing import Dict
import time

from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.output_parsers import StrOutputParser
from pydantic import BaseModel
from dotenv import load_dotenv

# PDF & LangChain Imports
from PyPDF2 import PdfReader
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.messages import HumanMessage,AIMessage, SystemMessage

# Updated imports for modern LangChain structure
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate, PromptTemplate

from langchain_core.runnables import RunnablePassthrough, RunnableParallel, RunnableLambda

# YouTube Imports
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.proxies import GenericProxyConfig

load_dotenv()

YOUTUBE_PROXY_HOST = os.getenv("YOUTUBE_PROXY_HOST")
YOUTUBE_PROXY_PORT = os.getenv("YOUTUBE_PROXY_PORT")
YOUTUBE_PROXY_USERNAME = os.getenv("YOUTUBE_PROXY_USERNAME")
YOUTUBE_PROXY_PASSWORD = os.getenv("YOUTUBE_PROXY_PASSWORD")

if all([
    YOUTUBE_PROXY_HOST,
    YOUTUBE_PROXY_PORT,
    YOUTUBE_PROXY_USERNAME,
    YOUTUBE_PROXY_PASSWORD
]):
    youtube_proxy_config = GenericProxyConfig(
        http_url=f"http://{YOUTUBE_PROXY_USERNAME}:{YOUTUBE_PROXY_PASSWORD}@{YOUTUBE_PROXY_HOST}:{YOUTUBE_PROXY_PORT}",
        https_url=f"http://{YOUTUBE_PROXY_USERNAME}:{YOUTUBE_PROXY_PASSWORD}@{YOUTUBE_PROXY_HOST}:{YOUTUBE_PROXY_PORT}"
    )
else:
    youtube_proxy_config = None

embedding_model = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
llm_model = ChatGoogleGenerativeAI(model="gemini-2.5-flash")

parser = StrOutputParser()

app = FastAPI(title="OmniRAG Gemini API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chroma_stores: Dict[str, Chroma] = {}

class ChatRequest(BaseModel):
    document_id: str
    message: str

class YouTubeRequest(BaseModel):
    video_id: str
    query: str

class ChatResponse(BaseModel):
    answer: str
    
    
@app.get("/")
def test():
    return {
        "status": "success",
        "message": "Backend is running"
    }

# ==========================================
#         PDF RAG ENDPOINTS
# ==========================================

def process_pdf(file_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(file_bytes))
    raw_text = "".join([page.extract_text() + "\n" for page in reader.pages if page.extract_text()])

    if not raw_text.strip():
        raise ValueError("No extractable text found in the PDF.")

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=150)
    chunks = text_splitter.split_text(raw_text)

    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable is not set.")
    
    document_id = str(uuid.uuid4())
    vectorstore = Chroma.from_texts(
        texts=chunks, 
        embedding=embedding_model, 
        collection_name=f"doc_{document_id}"
    )
    
    chroma_stores[document_id] = vectorstore
    return document_id

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    try:
        contents = await file.read()
        document_id = process_pdf(contents)
        return {"document_id": document_id, "filename": file.filename}
    except Exception as e:
        print("\n" + "="*50)
        print("🚨 ERROR DURING UPLOAD:")
        traceback.print_exc()
        print("="*50 + "\n")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=ChatResponse)
async def chat_with_pdf(request: ChatRequest):
    if request.document_id not in chroma_stores:
        raise HTTPException(status_code=404, detail="Document not found or session expired.")
    try:
        vectorstore = chroma_stores[request.document_id]
        retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
        
        api_key = os.getenv("GOOGLE_API_KEY")
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash", 
            temperature=0.3,
            google_api_key=api_key
        )
        
        system_prompt = (
            "You are an assistant for question-answering tasks. "
            "Use the following pieces of retrieved context to answer "
            "the question. If you don't know the answer, say that you "
            "don't know.\n\n"
            "{context}"
        )
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}"),
        ])
        
        combine_docs_chain = create_stuff_documents_chain(llm, prompt)
        rag_chain = create_retrieval_chain(retriever, combine_docs_chain)
        
        response = rag_chain.invoke({"input": request.message})
        return ChatResponse(answer=response["answer"])
        
    except Exception as e:
        print("\n" + "="*50)
        print("🚨 ERROR DURING CHAT:")
        traceback.print_exc()
        print("="*50 + "\n")
        raise HTTPException(status_code=500, detail=str(e))






# ==========================================
#         YOUTUBE RAG ENDPOINT
# ==========================================

UPLOAD_COOLDOWN = 30  # seconds

last_upload_time = {}

class YouTubeUploadRequest(BaseModel):
    video_id: str


class YouTubeAskRequest(BaseModel):
    query: str


video_vector_store = Chroma(
    embedding_function=embedding_model,
    collection_name="video-vector-store"
)

video_retriever = video_vector_store.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 4}
)


def format_doc(results):
    return "\n\n".join(
        result.page_content
        for result in results
    )


video_summarizing_prompt = PromptTemplate(
    template="""
Answer the user's question using ONLY the provided context.

If the context does not contain enough information to answer the question,
say:

"Video has no information related to this question."

Context:
{context}

Question:
{question}
""",
    input_variables=["question", "context"]
)


@app.post("/uploadLink")
async def upload_video_link(
    request: YouTubeUploadRequest,
    http_request: Request
):
    try:
        client_ip = http_request.client.host

        current_time = time.time()

        # Check cooldown
        if client_ip in last_upload_time:
            elapsed = current_time - last_upload_time[client_ip]

            if elapsed < UPLOAD_COOLDOWN:
                remaining = int(UPLOAD_COOLDOWN - elapsed)

                raise HTTPException(
                    status_code=429,
                    detail=f"Please wait {remaining} seconds before processing another video."
                )

        # Start cooldown immediately when request is accepted
        last_upload_time[client_ip] = current_time

        video_id = request.video_id

        if not video_id:
            raise HTTPException(
                status_code=400,
                detail="YouTube video ID is required."
            )

        if youtube_proxy_config:
            yt_api = YouTubeTranscriptApi(
                proxy_config=youtube_proxy_config
            )
        else:
            yt_api = YouTubeTranscriptApi()

        transcript_list = yt_api.fetch(
            video_id,
            languages=["en-IN", "en"]
        )

        transcript = " ".join(
            chunk.text for chunk in transcript_list
        )

        if not transcript.strip():
            raise HTTPException(
                status_code=400,
                detail="No transcript found for this video."
            )

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=2000,
            chunk_overlap=250
        )

        chunks = text_splitter.create_documents([transcript])

        video_vector_store.add_documents(chunks)

        return {
            "message": "Video uploaded successfully.",
            "video_id": video_id,
            "chunks_added": len(chunks)
        }

    except HTTPException:
        raise

    except Exception as e:
        print("\n" + "=" * 50)
        print("🚨 ERROR DURING VIDEO UPLOAD:")
        traceback.print_exc()
        print("=" * 50 + "\n")

        raise HTTPException(
            status_code=500,
            detail=f"Failed to process video: {str(e)}"
        )


@app.post("/ask")
async def ask_youtube(request: YouTubeAskRequest):
    try:
        collection_data = video_vector_store.get()
        if not collection_data["ids"]:
            raise HTTPException(
                status_code=404,
                detail="No YouTube video has been uploaded yet."
            )

        parallel_chain = RunnableParallel({
            "question": RunnablePassthrough(),
            "context": video_retriever | RunnableLambda(format_doc)
        })

        video_summarizing_chain = (video_summarizing_prompt | llm_model | StrOutputParser())
        full_video_chain = (parallel_chain | video_summarizing_chain)
        
        result = full_video_chain.invoke(request.query)
        return {"answer": result}

    except HTTPException:
        raise

    except Exception as e:
        print("\n" + "=" * 50)
        print("🚨 ERROR DURING YOUTUBE CHAT:")
        traceback.print_exc()
        print("=" * 50 + "\n")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to answer question: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
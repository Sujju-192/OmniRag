import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from youtube_transcript_api import YouTubeTranscriptApi
from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableParallel, RunnableLambda
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    video_id: str
    query: str

def format_doc(results):
    return "\n\n".join(result.page_content for result in results)

@app.get("/")
async def root():
    return {"message": "TubeChat API is running!"}

@app.post("/ask")
async def ask_question(request: QueryRequest):
    try:
        # Fetching Transcript
        yt_api = YouTubeTranscriptApi()
        try:
            transcript_data = yt_api.fetch(request.video_id, languages=["hi"])
        except Exception:
            try:
                transcript_data = yt_api.fetch(request.video_id)
            except Exception:
                transcript_data = yt_api.fetch(request.video_id)

        # Extract text robustly whether items are dicts or objects
        transcript_parts = []
        for item in transcript_data:
            if isinstance(item, dict):
                transcript_parts.append(item.get("text", ""))
            elif hasattr(item, "text"):
                transcript_parts.append(item.text)
        
        transcript = " ".join(transcript_parts)

        # Splitting Transcript
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=2000, chunk_overlap=150)
        chunks = text_splitter.create_documents([transcript])

        # Models & Vector Store
        generation_model = ChatGoogleGenerativeAI(model="gemini-2.5-flash")
        embedding_model = GoogleGenerativeAIEmbeddings(model="gemini-embedding-001")

        vector_store = Chroma.from_documents(
            documents=chunks,
            embedding=embedding_model,
        )

        retriever = vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 4}
        )

        # Chain Execution
        prompt = PromptTemplate(
            template="You are a helpful assistant. Help me to generate a correct output for the given question:\n{question}\nAnswer only from the given context:\n{context}\nIf there is not enough information in the context, say 'I don't know' but don't hallucinate.",
            input_variables=["question", "context"]
        )
        parser = StrOutputParser()

        parallel_chain = RunnableParallel({
            'question': RunnablePassthrough(),
            'context': retriever | RunnableLambda(format_doc),
        })
        
        result_summarizer_chain = prompt | generation_model | parser
        merging_chain = parallel_chain | result_summarizer_chain

        ans = merging_chain.invoke(request.query)

        return {"answer": ans}

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
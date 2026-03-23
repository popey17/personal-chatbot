# LeoDroid - Personal AI Chatbot

LeoDroid is an intelligent, RAG-based (Retrieval-Augmented Generation) personal assistant. It allows you to upload documents (PDF/TXT), which are then chunked and embedded to provide context-aware AI responses.

## 🏗️ Architecture

The project consists of three main components:
- **Frontend**: A modern React web application built with Vite.
- **Backend**: A Node.js Express server handling file processing, embeddings, and AI communication.
- **Database/Storage**: Supabase handles user authentication, document metadata storage, and vector similarity search.

## ✨ Features

- **Real-time AI Chat**: Ask questions and get answers based on your uploaded documents.
- **Document Management**: Upload, view, and delete PDF/Text documents.
- **Leo Context**: Special handling for queries about its creator, Aung Myat Kyaw (Leo).
- **Glassmorphism UI**: Beautiful, modern interface with smooth animations (Framer Motion).
- **Rate Limiting**: Protected API endpoints to prevent abuse.

## 🛠️ Tech Stack

### Frontend
- React 19 + Vite 8
- Framer Motion (Animations)
- Lucide React (Icons)
- Axios (API Calls)
- React Router DOM (Navigation)

### Backend
- Node.js + Express 5
- OpenAI SDK (Embeddings & GPT-3.5 Turbo)
- Supabase JS SDK
- Multer (File Uploads)
- PDF-Parse (Text Extraction)
- Dotenv (Configuration)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- A Supabase account and project
- An OpenAI API Key

### 2. Environment Setup

Create a `.env` file in the **root** (for reference) or in the respective directories:

#### Backend (`backend/.env`)
```env
PORT=5001
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

#### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5001/api/v1
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup (Supabase)

Run the following SQL in the Supabase SQL Editor to set up the required tables and the similarity search function:

```sql
-- 1. Create Documents Table
CREATE TABLE documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Document Sections (Chunks) Table
-- Note: Requires pgvector extension enabled
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_sections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  metadata JSONB,
  embedding VECTOR(1536) -- Match OpenAI embedding dimension
);

-- 3. Create Similarity Search Function
CREATE OR REPLACE FUNCTION match_document_sections (
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_sections.id,
    document_sections.content,
    document_sections.metadata,
    1 - (document_sections.embedding <=> query_embedding) AS similarity
  FROM document_sections
  WHERE 1 - (document_sections.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
```

### 4. Running the Application

Open two terminal windows/tabs:

**Terminal 1: Backend**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2: Frontend**
```bash
cd frontend
npm install
npm run dev
```

The application should now be accessible at `http://localhost:5173` (default Vite port).

---

## 👨‍💻 Author
Created by **Aung Myat Kyaw (Leo)**.  
Email: contact.popey17@gmail.com

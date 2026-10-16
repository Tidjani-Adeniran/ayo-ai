# 🌿 ayo-ai — Culturally Grounded AI Wellbeing Companion

> **Ayo AI is an AI-powered wellbeing companion designed to support reflection, personal growth, and access to trusted wellbeing information through culturally aware, personalized AI interactions.**

Ayo AI combines Retrieval-Augmented Generation (RAG), semantic search, private journaling, and agentic tool calling to provide context-aware conversations while keeping personal journal data isolated between users.

Built with Django, Next.js, PostgreSQL, pgvector, and Google's Gemini API, the project explores how modern AI engineering can be applied to a meaningful, real-world problem.

**Important:** Ayo AI is a non-clinical wellbeing companion, not a psychologist, therapist, diagnostic system, or replacement for qualified professional care.

---

## ✨ Key Features

### 🧠 Dual-Engine RAG

Ayo AI uses two retrieval systems to provide relevant context for its responses.

- **Knowledge RAG:** Retrieves semantically relevant passages from a curated collection of wellbeing documents and resources.
- **Personal RAG:** Retrieves relevant information from a user's own journal entries to support personalized reflection.
- **Vector search:** Uses embeddings and PostgreSQL with pgvector to find semantically similar content.
- **Conversational query rewriting:** Rewrites follow-up questions into standalone queries to improve retrieval relevance.

### 🤖 Agentic AI and Tool Calling

- Integrates Google's Gemini API for AI-powered conversations.
- Uses automatic function calling to let the model invoke supported application tools.
- Supports journal-related actions through defined tool functions.
- Connects model-generated decisions with backend application logic.

### 🔐 Authentication and Data Isolation

- JWT-based authentication and user registration.
- Protected API endpoints.
- User-specific journal access.
- Database queries scoped to the authenticated user to help prevent unauthorized access to private records.

Security depends on correct implementation and testing of these controls.

### 📋 Structured AI Responses

- Uses Pydantic schemas to validate structured model outputs.
- Provides predictable response formats for frontend rendering.
- Makes it easier to build reliable interfaces around AI-generated content.

### 🌍 Built for Responsible Wellbeing Support

- Encourages self-reflection and general wellbeing education.
- Supports access to curated information and resources.
- Avoids presenting AI-generated responses as clinical diagnoses or professional treatment.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Python, Django, Django REST Framework |
| Authentication | JWT, SimpleJWT |
| Database | PostgreSQL |
| Vector Search | pgvector, embedding similarity search |
| AI / LLM | Google Gemini API, `google-genai` |
| Validation | Pydantic |
| Deployment | Vercel for frontend; compatible Python hosting for backend |
| Database Hosting | Neon PostgreSQL |

*The technologies and deployment providers listed should reflect the versions and services actually used in the repository.*

---

## 🏗️ Architecture Overview

```text
                         User
                           |
                           v
                    Next.js Frontend
                           |
                           v
                     Django REST API
                           |
                Authentication / JWT
                           |
                           v
                    AI Application
                           |
                +----------+----------+
                |          |          |
                v          v          v
           Knowledge    Personal    Gemini
              RAG          RAG       Tools
                |          |          |
                +----------+----------+
                           |
                           v
                   PostgreSQL + pgvector
                           |
                           v
                    Contextual Response
                           |
                           v
                    Next.js Frontend
```

### RAG Pipeline

```text
User Question
      |
      v
Generate Query Embedding
      |
      v
Retrieve Relevant Chunks
      |
      v
Build Contextual Prompt
      |
      v
Generate Response with Gemini
      |
      v
Return Response to User
```

### Agentic Tool-Calling Pipeline

```text
User Message
      |
      v
Gemini Model
      |
      v
Determine Whether a Tool Is Needed
      |
      v
Execute an Approved Backend Tool
      |
      v
Return Tool Result to Model
      |
      v
Generate Final Response
```

---

## 📁 Project Structure

The following illustrates the backend structure; adapt it to match the actual repository.

```text
ayo-ai/
├── frontend/                  # Next.js application
│
├── backend/                   # Django project
│   ├── ai_core/
│   │   ├── models.py          # Application data models
│   │   ├── views.py           # API endpoints
│   │   ├── serializers.py     # API validation and serialization
│   │   ├── tools.py           # Supported AI tools
│   │   └── utils.py            # Embeddings and retrieval utilities
│   │
│   ├── manage.py
│   └── requirements.txt
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Install the following:

- Python
- Node.js and npm
- Git
- PostgreSQL with pgvector, or access to a compatible hosted database
- A Google Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ayo-ai.git
cd ayo-ai
```

Replace `YOUR_USERNAME` with the actual GitHub username or organization that owns the repository.

### 2. Set Up the Backend

Navigate to the directory containing `manage.py`:

```powershell
cd backend
```

Create a Python virtual environment:

```powershell
python -m venv venv
```

Activate it on Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install the backend dependencies:

```powershell
python -m pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a local `.env` file in the backend directory, following the configuration expected by the application.

For example:

```env
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_postgresql_connection_string
SECRET_KEY=your_django_secret_key
DEBUG=True
```

These are illustrative variable names; use the exact names expected by your code.

**Security:** Never commit `.env` files, API keys, database credentials, or production secrets to GitHub.

### 4. Apply Database Migrations

```powershell
python manage.py migrate
```

Ensure PostgreSQL and the required pgvector extension are configured before running migrations that depend on vector fields.

### 5. Start the Backend

```powershell
python manage.py runserver
```

The Django development server typically runs at:

`http://127.0.0.1:8000/`

### 6. Set Up the Frontend

Open a second terminal and navigate to the actual Next.js frontend directory:

```powershell
cd frontend
npm install
```

Configure the frontend API URL using the environment variable expected by your application. For example:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Only use this example if your frontend code reads `NEXT_PUBLIC_API_URL`. Do not put private API keys in `NEXT_PUBLIC_` variables because they are exposed to the browser.

Start Next.js:

```powershell
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🔒 Security and Privacy

Ayo AI is designed around privacy-aware handling of personal information.

Key considerations include:

- Authentication and authorization for protected endpoints.
- Enforcing user-level access restrictions for private journal data.
- Keeping API keys and database credentials on the server.
- Validating inputs and structured model outputs.
- Restricting tool execution to explicitly supported operations.
- Avoiding unnecessary storage of sensitive conversational information.
- Testing authorization boundaries and prompt-injection defenses.

The application should not be considered production-secure until these controls have been reviewed and tested.

---

## 🗺️ Roadmap

Potential areas for continued development include:

- [ ] Refined, responsive Next.js interface
- [ ] Developer profile and project information page
- [ ] Production frontend and backend deployment
- [ ] Improved source citations for RAG responses
- [ ] Automated retrieval and answer-quality evaluation
- [ ] Safety testing and wellbeing-resource escalation
- [ ] Usage monitoring, latency tracking, and cost controls
- [ ] Expanded curated resources and localization
- [ ] Improved accessibility and mobile experience

---

## 👨‍💻 About the Developer

**Tidjani Adeniran**  
*Software Developer · AI Enthusiast · Tech Entrepreneur*

I am a bilingual software developer with a background in computer science and an interest in building useful technology through AI, full-stack engineering, and applied research.

I built Ayo AI to explore how RAG, embeddings, vector search, and agentic systems can work together in a real application—with an emphasis on privacy, responsible AI, and practical user value.

- **Portfolio:** [adenirantidjani.com](https://adenirantidjani.com)
- **GitHub:** [Tidjani-Adeniran](https://github.com/Tidjani-Adeniran)
- **LinkedIn:** [Adeniran Tidjani](https://www.linkedin.com/in/adeniran-tidjani-3a6a0224a)

---

## 📄 License

A license has not yet been specified. Add a `LICENSE` file and update this section once you have chosen the terms under which others may use, modify, and distribute the project.

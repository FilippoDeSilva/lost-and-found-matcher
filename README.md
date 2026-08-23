# 🔍 The Lost & Found Matcher

A smart campus Lost & Found report matching application built for university environments. The application automates the comparison between student "Lost" item reports and "Found" item reports using an explainable multi-factor scoring engine.

---

## 🌟 Key Features

- **Multi-Factor Matching Engine**: Scores matches across Category, Keyword/Semantic Similarity, Campus Location Proximity, and Temporal Relevance.
- **Explainable Match Scores**: Displays detailed visual confidence bars and human-readable explanations ("Matched location zone: Library Area", "Color match: Black / Dark").
- **Interactive UI**: Modern Glassmorphism layout with side-by-side report comparison modals.
- **Pre-populated University Scenarios**: Includes test cases from the prompt (AirPods case, Library backpack, Gym water bottle) for instant evaluation.
- **Custom Report Submissions**: Form inputs to add new Lost or Found reports on the fly.

---

## 🧠 Approach & Matching System

### How Matching Works

The algorithm compares every **Lost Item** with every **Found Item** across four dimensions:

1. **Category Match (25% Weight)**: Direct match or taxonomy distance between categories (e.g. *Electronics*, *Bags*, *Keys*, *Personal Items*).
2. **Text & Semantic Similarity (35% Weight)**: 
   - Tokenizes descriptions, titles, and tags.
   - Applies synonym expansion (e.g., `AirPods` $\leftrightarrow$ `wireless earbuds`, `dark` $\leftrightarrow$ `black`).
   - Calculates Jaccard token overlap + fuzzy string similarity.
3. **Location Proximity (20% Weight)**:
   - Uses a Campus Zone Graph (e.g., *Dining Zone*, *Library Zone*, *Sports Complex*).
   - Near-adjacent locations (e.g., *Cafeteria* and *Coffee Shop*) receive high proximity scores.
4. **Temporal Decay (20% Weight)**:
   - Calculates time elapsed between Lost date and Found date.
   - Ideal case: Found 0–24 hours after Lost (100% score).
   - Decays gradually over days/weeks.
   - If Found date precedes Lost date by more than a margin, temporal score is set to 0.

### Confidence Thresholds
- **High Confidence ($\ge 75\%$)**: Strong candidate match.
- **Medium Confidence ($50\% - 74\%$)**: Potential match, worth reviewing.
- **Low Confidence ($< 50\%$)**: Weak match.

---

## 🛠️ Setup & Running Instructions

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm

### Running Locally
```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Run test suite
npm run test
```

---

## 💡 Important Assumptions & Technical Decisions

- **Client-Side Architecture**: Built as a pure React application with local state & localStorage persistence to keep the project lightweight and easily runnable without complex backend setup.
- **Deterministic Scoring over Black-Box AI**: Used a transparent, weighted heuristic algorithm instead of raw black-box LLM APIs to ensure 100% predictability, speed, zero latency, and explainable breakdowns.
- **Campus Zone Topology**: Modeled standard university layout zones (Dining, Academic, Library, Sports, Student Union) to map loose human descriptions like "near cafeteria" and "beside coffee shop".

---

## 🚫 Intentionally Omitted Features

- **User Authentication / OAuth**: Omitted to keep review effortless (no login required).
- **Backend Database**: In-memory + LocalStorage handles the core assessment scope cleanly.
- **Computer Vision Image Analysis**: Text and metadata matching provided high accuracy within the time budget.

---

## 🔮 Future Improvements

- **Vector Embeddings / LLM Tagging**: Integrate vector embeddings (e.g., OpenAI/Gemini embeddings) for richer semantic comprehension of unstructured student descriptions.
- **Automated Notifications**: Email / Push alerts when high-confidence matches are found for a newly submitted Lost report.
- **QR Code / Smart Tag System**: Allow item registration via unique IDs or QR tags.

---

## 🤖 AI Usage Log

- **UI & Boilerplate Setup**: Generated initial Vite + React structure and CSS design system.
- **Synonym & Location Map Design**: Used AI to build campus zone distance matrices and synonym dictionaries.
- **Refinement**: Adjusted temporal decay formula and Jaccard token weights to balance precision vs recall.

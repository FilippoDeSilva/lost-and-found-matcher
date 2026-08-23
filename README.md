# 🎓 The Campus Lost & Found Matcher

An intelligent, multilingual Lost & Found item matching platform built for university environments using **Next.js 16 (App Router)**, **TypeScript**, **shadcn/ui**, **Tailwind CSS v4**, **Prisma 7 ORM**, **PostgreSQL (`found-lost`)**, **Live Dynamic Translation**, and **pnpm**.

---

## 🌟 Key Features

- **Multi-Factor Matching Engine**: Scores matches across Category/Concept (25%), Keyword/Semantic Similarity & Color (35%), Campus Location Proximity (20%), and Temporal Relevance (20%).
- **Live Dynamic Translation**: Translates lost & found reports dynamically on the fly into the student's active UI language (English 🇺🇸, Spanish 🇪🇸, French 🇫🇷, Amharic 🇪🇹) via `/api/translate`.
- **Database Persistence & Seeding**: Connects directly to local PostgreSQL (`found-lost`) or production **Supabase** via Prisma 7 ORM and `@prisma/adapter-pg`.
- **Full End-to-End Match Resolution Flow**: Confirm potential matches, reveal direct owner/finder contact cards (Email + Phone), follow campus safe handover instructions, and mark items as returned & resolved in PostgreSQL DB.
- **Explainable Match Breakdown**: Side-by-side modal analysis showing visual scoring sliders and human-readable rationale checklists.
- **100% Verified Test Suite**: Automated unit test suite with 14 comprehensive tests covering prompt scenarios, edge cases, reporting delay buffers, future date anomalies, and 100-run determinism (`pnpm run test`).
- **Mobile-First Responsive UI**: Modern dark mode layout with custom shadcn/ui components (`Button`, `Card`, `Badge`, `Input`) optimized for all viewports from small mobile screens to desktop displays.

---

## 🧠 Matching Algorithm & System Architecture

### 1. Weighted Multi-Factor Scoring

The algorithm compares every **Lost Item** with every **Found Item** across four weighted dimensions:

1. **Category & Concept Score (25% Weight)**: Category alignment + dynamic concept cluster extraction (`AUDIO_EARBUDS`, `BACKPACK_BAG`, `WATER_BOTTLE`, `SMARTPHONE`, `KEYS_KEYCHAIN`, `STUDENT_ID_CARDS`).
2. **Text & Color Semantic Similarity (35% Weight)**: 
   - Normalizes text with diacritic stripping (`sac à dos` $\rightarrow$ `sac a dos`).
   - Levenshtein distance metrics for fuzzy typo handling (`airpods` $\leftrightarrow$ `aerpods`).
   - Color profile matching (`BLACK_DARK`, `WHITE_LIGHT`, `BLUE`, `RED`, `GREEN`).
3. **Location Proximity (20% Weight)**: Uses a campus zone topology graph (`LIBRARY_COMPLEX`, `CAFETERIA_DINING`, `STUDENT_UNION`, `SPORTS_GYM`, `ACADEMIC_QUAD`). Adjacent zones receive partial proximity scores.
4. **Temporal Relevance & Decay (20% Weight)**:
   - Evaluates time delta between Lost date and Found date.
   - Ideal case: Found 0–24 hours after Lost (100% score).
   - Gracefully handles reporting delay buffers when found date slightly precedes lost date.

### 2. Confidence Classifications
- 🟢 **High Confidence ($\ge 75\%$)**: Strong candidate match.
- 🟡 **Medium Confidence ($50\% - 74\%$)**: Potential match.
- 🔴 **Low Confidence ($< 50\%$)**: Weak match (automatically filtered out to prevent feed noise).

---

## 🛠️ Setup & Running Instructions

### Prerequisites
- Node.js (v18+ recommended)
- `pnpm` (v11+)
- PostgreSQL (Database named `found-lost`)

### 1. Installation & Environment Configuration
```bash
# Install dependencies using pnpm
pnpm install

# Verify or edit .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/found-lost?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Database Migration & Seeding
```bash
# Push Prisma schema to local PostgreSQL
pnpm exec prisma db push

# Seed campus reports
pnpm exec prisma db seed
```

### 3. Start Development Server
```bash
pnpm run dev
# Open http://localhost:3000
```

### 4. Run Test Suite
```bash
pnpm run test
# Executes tsx src/lib/matcher/engine.test.ts (14/14 tests passing)
```

---

## 🐳 Docker Deployment

The application includes multi-stage `Dockerfile` and `docker-compose.yml` for production containerization:

```bash
# Build and run containers
docker-compose up --build
```

---

## 🤖 AI Usage Log & Human Engineering Direction

This project was built through a collaborative pair-programming workflow, where **Human Engineering Leadership** provided overall architecture, strict edge-case guidelines, technology selection, and domain-specific rules, while **AI Assistance** accelerated code generation and component refactoring:

### 👤 Human Engineering Direction & Decisions
- **Architecture & Framework Selection**: Directed the complete transition to Next.js 16 (App Router), TypeScript, pnpm v11, Prisma 7 ORM (`@prisma/adapter-pg`), and local PostgreSQL (`found-lost`) / Supabase.
- **Dynamic Translation over Static Tables**: Specified live dynamic translation (`/api/translate` & `useTranslatedReport`) to replace hardcoded dictionary tables and support infinite language scaling.
- **Match Resolution & Contact Action Plan**: Designed the complete handover lifecycle (Confirming matches, revealing direct owner/finder email/phone cards, safe campus meeting steps, and updating report statuses to `RESOLVED` in DB).
- **Edge Case & Anomaly Rules**: Defined strict evaluation rules for missing date fallbacks, reporting delay buffers ($\le 24\text{h}$ found-before-lost), future date inversions ($+7\text{ days}$), and low-confidence match noise filtering ($\ge 50\%$).
- **LIFO Latest-First Ordering**: Specified newest-first sorting for both report grids and potential match pairs.
- **Build Approvals & Deployment Setup**: Directed non-interactive `pnpm approve-builds` handling in Docker and Vercel `postinstall` prisma generation hooks.

### 🤖 AI Assistance & Code Execution
- **Component & Style Generation**: Accelerated creation of React 19 components with shadcn/ui primitives (`Button`, `Card`, `Badge`, `Input`) and Tailwind CSS v4 styling.
- **Engine Implementation**: Implemented weighted scoring algorithms, Levenshtein distance metrics, and NFD diacritic stripping functions based on human specification.
- **Automated Test Suite Creation**: Built the 14-scenario automated test runner (`pnpm run test`) validating determinism and edge cases.

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
- `pnpm` (v9+ or v11+)
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

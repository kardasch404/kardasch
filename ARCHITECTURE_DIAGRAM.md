# Portfolio Architecture Diagram

## 🏗️ Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         KARDASCH PORTFOLIO                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                           FRONTEND                               │
│                    (Next.js 14 + Redux)                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│   User Interface     │
│   (App Router)       │
├──────────────────────┤
│  • Home (Hero)       │
│  • Projects Grid     │
│  • Project Detail    │
│  • About             │
│  • Contact Form      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Components         │
├──────────────────────┤
│  UI Layer:           │
│  • Button            │
│  • Card              │
│  • Badge             │
│  • Input             │
│                      │
│  Layout:             │
│  • Navbar            │
│  • Footer            │
│                      │
│  Forms:              │
│  • ContactForm       │
│    (RHF + Zod)       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   State Management   │
│   (Redux Toolkit)    │
├──────────────────────┤
│  • uiSlice           │
│    - theme           │
│    - navOpen         │
│    - activeSection   │
│                      │
│  • projectsSlice     │
│    - selectedTech    │
│    - searchQuery     │
│                      │
│  • contactSlice      │
│    - status          │
│    - error           │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Data Layer         │
├──────────────────────┤
│  JSON Files:         │
│  • bio.json          │
│  • projects.json     │
│  • skills.json       │
│  • experience.json   │
│  • certifications    │
│                      │
│  Validated by:       │
│  • Zod Schemas       │
│    (Build Time)      │
└──────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      DATA FLOW                                   │
└─────────────────────────────────────────────────────────────────┘

Build Time:
  JSON Files → Zod Validation → TypeScript Types → Static HTML

Runtime:
  User Action → Redux Dispatch → State Update → Component Re-render

Form Submission:
  User Input → RHF Validation → Zod Schema → Redux State → API (Future)


┌─────────────────────────────────────────────────────────────────┐
│                   TECH STACK LAYERS                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│   Framework         │  Next.js 14 App Router
└─────────────────────┘
           │
┌─────────────────────┐
│   State             │  Redux Toolkit
└─────────────────────┘
           │
┌─────────────────────┐
│   Validation        │  Zod + React Hook Form
└─────────────────────┘
           │
┌─────────────────────┐
│   Styling           │  Tailwind CSS
└─────────────────────┘
           │
┌─────────────────────┐
│   Language          │  TypeScript (Strict)
└─────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                   KEY FEATURES FLOW                              │
└─────────────────────────────────────────────────────────────────┘

1. THEME TOGGLE
   User clicks theme button
   → useTheme hook
   → dispatch(toggleTheme())
   → uiSlice updates
   → Tailwind classes change
   → UI re-renders

2. PROJECT FILTER
   User clicks tech badge
   → dispatch(setFilter(tech))
   → projectsSlice updates
   → Navigate to /projects
   → useFilter hook reads state
   → Filtered projects display

3. CONTACT FORM
   User fills form
   → React Hook Form validates
   → Zod schema checks
   → dispatch(setContactStatus())
   → Submit to API (future)
   → Success/Error message

4. BUILD-TIME VALIDATION
   npm run build
   → getData() reads JSON
   → Zod validates schema
   → Invalid = Build fails ✅
   → Valid = Static pages generated


┌─────────────────────────────────────────────────────────────────┐
│                   FILE STRUCTURE                                 │
└─────────────────────────────────────────────────────────────────┘

frontend/
│
├── src/
│   ├── app/                    # Pages (App Router)
│   │   ├── layout.tsx          # Root + Redux Provider
│   │   ├── page.tsx            # Home
│   │   ├── projects/
│   │   │   ├── page.tsx        # Grid + Filters
│   │   │   └── [slug]/page.tsx # Detail
│   │   ├── about/page.tsx
│   │   └── contact/page.tsx
│   │
│   ├── components/
│   │   ├── ui/                 # Atomic components
│   │   ├── layout/             # Navbar, Footer
│   │   └── forms/              # ContactForm
│   │
│   ├── store/
│   │   ├── index.ts            # Store config
│   │   ├── slices/             # Redux slices
│   │   └── hooks/typed.ts      # Typed hooks
│   │
│   ├── data/                   # JSON files
│   ├── schemas/                # Zod schemas
│   ├── lib/                    # Utilities
│   ├── hooks/                  # Custom hooks
│   └── types/                  # TypeScript types
│
├── public/images/              # Static assets
└── [config files]


┌─────────────────────────────────────────────────────────────────┐
│                   DEPLOYMENT FLOW                                │
└─────────────────────────────────────────────────────────────────┘

Development:
  npm run dev → http://localhost:3000

Build:
  npm run build
  → Validates JSON with Zod
  → Generates static pages
  → Outputs to out/ directory

Deploy:
  out/ directory → Vercel/Netlify/GitHub Pages
  → Pure HTML/CSS/JS
  → No server needed
  → Global CDN


┌─────────────────────────────────────────────────────────────────┐
│                   BEST PRACTICES                                 │
└─────────────────────────────────────────────────────────────────┘

✅ Type Safety
   • Zod validates external data
   • TypeScript strict mode
   • Typed Redux hooks

✅ Performance
   • Static generation
   • Code splitting
   • Optimized images

✅ Developer Experience
   • Full autocomplete
   • Clear error messages
   • Hot reload

✅ Maintainability
   • Modular components
   • Clear separation
   • Documented code

✅ Scalability
   • Easy to extend
   • Backend-ready
   • Reusable patterns

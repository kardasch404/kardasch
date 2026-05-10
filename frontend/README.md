# Portfolio Frontend

Modern portfolio built with Next.js 14, Redux Toolkit, Zod validation, and Tailwind CSS.

## Architecture

```
├── src/
│   ├── app/                     # Next.js App Router pages
│   ├── components/              # React components
│   │   ├── ui/                  # Atomic: Button, Badge, Card, Input
│   │   ├── sections/            # Hero, Skills, Experience
│   │   ├── layout/              # Navbar, Footer
│   │   └── forms/               # ContactForm with RHF+Zod
│   ├── store/                   # Redux Toolkit
│   │   ├── slices/              # uiSlice, projectsSlice, contactSlice
│   │   └── hooks/               # Typed Redux hooks
│   ├── data/                    # JSON data files
│   ├── schemas/                 # Zod validation schemas
│   ├── lib/                     # Utilities
│   ├── hooks/                   # Custom React hooks
│   └── types/                   # TypeScript types
```

## Tech Stack

- **Framework:** Next.js 14 App Router
- **State Management:** Redux Toolkit
- **Validation:** Zod + React Hook Form
- **Styling:** Tailwind CSS + Framer Motion
- **Language:** TypeScript (strict mode)
- **Data:** JSON files validated with Zod at build time

## Key Features

### 🔒 Type-Safe Build-Time Validation
All JSON data is validated through Zod schemas in `getData.ts`. Invalid data fails the build, not runtime.

### 🎯 Redux for Global State Only
- `uiSlice`: theme, navigation state
- `projectsSlice`: tech filters (persists across pages)
- `contactSlice`: form submission status

### 📝 Contact Form with Zod
Schema-driven validation with React Hook Form. Backend-ready — just swap the submit handler.

### ⚡ Static Site Generation
All pages use `generateStaticParams` + `getData()`. Pure HTML/CSS/JS output.

### 🎨 Cross-Page Tech Filter
Click a tech badge on any page → navigate to projects → filtered list ready.

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
```

### Export Static Site

```bash
npm run build
```

Output in `out/` directory — deploy anywhere.

## Data Management

Edit JSON files in `src/data/`:
- `bio.json` - Personal information
- `projects.json` - Project portfolio
- `skills.json` - Technical skills
- `experience.json` - Work history
- `certifications.json` - Certifications

All data is validated at build time through Zod schemas.

## Redux Best Practices

✅ Always use typed hooks from `store/hooks/typed.ts`
✅ Never use raw `useSelector` or `useDispatch`
✅ Keep server data in Next.js, not Redux
✅ Only global UI state goes in Redux

## Deployment

Works on any static host:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## License

MIT

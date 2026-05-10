# Kardasch Portfolio

Full-stack portfolio application with modern architecture.

## 📁 Repository Structure

```
kardasch/
├── frontend/          # Next.js 14 + Redux Toolkit + Zod
└── backend/           # (Ready for your backend implementation)
```

## 🎯 Frontend - Production Ready

Elite Next.js 14 portfolio with:
- ✅ Redux Toolkit state management
- ✅ Zod validation (build-time)
- ✅ React Hook Form
- ✅ Tailwind CSS + Dark mode
- ✅ TypeScript strict mode
- ✅ Static site generation

### Quick Start

```bash
cd frontend
npm install
npm run dev
```

Visit: http://localhost:3000

### Documentation

- `frontend/README.md` - Full architecture
- `frontend/QUICKSTART.md` - Setup guide
- `frontend/ARCHITECTURE.md` - Implementation details

## 🏗️ Architecture Highlights

### Type-Safe Everything
- Zod validates JSON at build time
- TypeScript strict mode
- Typed Redux hooks (no `any`)

### Redux - Elite Pattern
```typescript
// ✅ Always use typed hooks
import { useAppDispatch, useAppSelector } from '@/store/hooks/typed';

// ❌ Never use raw hooks
import { useDispatch, useSelector } from 'react-redux';
```

### Build-Time Validation
```typescript
// getData.ts validates JSON with Zod
const projects = getData('projects.json', projectsArraySchema);
// Invalid JSON = build fails ✅
```

### Contact Form - Backend Ready
```typescript
// Schema shared between frontend + backend
export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(5),
  message: z.string().min(10),
});
```

## 🚀 Features

### Implemented ✅
- Dark/Light theme toggle
- Project filtering by technology
- Cross-page state persistence (Redux)
- Contact form with validation
- Responsive design
- Static site generation
- SEO-friendly

### Ready to Add
- Skills section
- Experience timeline
- Certifications display
- Blog integration
- Analytics
- Backend API integration

## 📦 Tech Stack

### Frontend
- **Framework:** Next.js 14 App Router
- **State:** Redux Toolkit
- **Validation:** Zod + React Hook Form
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion (ready)
- **Language:** TypeScript

### Backend (Ready for Implementation)
- Your choice of framework
- Can reuse Zod schemas from frontend

## 🎨 Customization

### 1. Update Your Data
Edit JSON files in `frontend/src/data/`:
- `bio.json` - Personal info
- `projects.json` - Your projects
- `skills.json` - Technical skills
- `experience.json` - Work history
- `certifications.json` - Certifications

### 2. Customize Theme
Edit `frontend/tailwind.config.ts`:
```typescript
colors: {
  primary: {
    500: '#0ea5e9',  // Change to your brand color
    600: '#0284c7',
    700: '#0369a1',
  },
}
```

### 3. Add Images
Place images in `frontend/public/images/`

## 📖 Documentation

Each folder has detailed documentation:

### Frontend
- `README.md` - Architecture overview
- `QUICKSTART.md` - Setup instructions
- `ARCHITECTURE.md` - Implementation details

## 🔥 Why This Architecture?

### 1. Type Safety
- Zod validates external data
- TypeScript catches errors at compile time
- No runtime surprises

### 2. Performance
- Static site generation
- No server needed
- Deploy anywhere

### 3. Developer Experience
- Full autocomplete
- Typed Redux hooks
- Schema-driven forms

### 4. Maintainability
- Clear separation of concerns
- Minimal Redux usage
- Reusable components

### 5. Scalability
- Easy to add new pages
- Backend-ready schemas
- Modular architecture

## 🚢 Deployment

### Frontend
```bash
cd frontend
npm run build
```

Deploy `out/` directory to:
- Vercel (recommended)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Backend
Ready for your implementation in `backend/` folder.

## 📝 Next Steps

1. **Customize Data**
   - Edit JSON files with your info
   - Add project images

2. **Customize Styling**
   - Update Tailwind colors
   - Add custom fonts

3. **Add Sections**
   - Skills showcase
   - Experience timeline
   - Blog posts

4. **Backend Integration**
   - Implement contact form API
   - Add authentication
   - Database integration

5. **Deploy**
   - Push to GitHub
   - Deploy to Vercel
   - Set up custom domain

## 🤝 Contributing

This is a personal portfolio template. Feel free to fork and customize!

## 📄 License

MIT

---

**Built with ❤️ using Next.js, Redux Toolkit, and TypeScript**

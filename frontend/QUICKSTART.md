# Quick Start Guide

## 1. Install Dependencies

```bash
cd frontend
npm install
```

## 2. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## 3. Customize Your Portfolio

### Update Personal Info
Edit `src/data/bio.json`:
```json
{
  "name": "Your Name",
  "title": "Your Title",
  "email": "your@email.com"
}
```

### Add Projects
Edit `src/data/projects.json`:
```json
[
  {
    "id": "1",
    "slug": "my-project",
    "title": "My Project",
    "description": "Description here",
    "tech": ["React", "Node.js"],
    "featured": true
  }
]
```

### Customize Theme
Edit `tailwind.config.ts` to change colors.

## 4. Build for Production

```bash
npm run build
```

Static files will be in the `out/` directory.

## Features Working Out of the Box

✅ Dark/Light theme toggle
✅ Project filtering by technology
✅ Contact form with validation
✅ Responsive design
✅ Type-safe with TypeScript
✅ Redux state management
✅ Static site generation

## Next Steps

1. Replace placeholder data in JSON files
2. Add your project images to `public/images/`
3. Customize colors in `tailwind.config.ts`
4. Deploy to Vercel/Netlify

## Need Help?

Check the main README.md for detailed architecture documentation.

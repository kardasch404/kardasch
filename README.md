# Zakaria Kardache — Engineering Archive Portfolio

> Cloud-Native Architecture · Distributed Backend Engineering · Interactive 3D Case Study

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-3D%20Room-black?style=flat&logo=three.js)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

---

## 📂 Repository Structure

```
kardasch/
├── .gitignore          # Root Git ignore rules
├── README.md           # Project documentation and deployment guide
├── backend/            # Future backend services & API gateway (.gitkeep)
└── frontend/           # Next.js 16 SSG + Three.js Portfolio Application
    ├── public/         # Static assets (photos, 3D room textures, CV)
    │   ├── cv.html     # Standalone CV view & printable dossier
    │   ├── photos/     # High-resolution gallery & profile portraits
    │   └── room/       # 3D canvas textures & detective study maps
    ├── src/
    │   ├── app/        # Next.js App Router pages (/, /about, /projects, /talks, /newspaper)
    │   ├── components/ # Interactive 3D study, Redux board, dossier modals, chess
    │   ├── data/       # Typed JSON datasets (projects, bio, translations EN/DE/FR)
    │   └── schemas/    # Zod validation schemas
    ├── package.json    # Dependencies & build scripts
    └── next.config.js  # Static export configuration (output: 'export')
```

---

## 🚀 Quickstart

### Prerequisites
- **Node.js**: v18.18+ or v20+
- **npm**: v9+

### Installation & Development

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the 3D interactive detective study room.

---

## 🏗️ Production Build & Static Export

The application is pre-configured for static export (`output: 'export'`), producing a standalone distribution ready for deployment on **Vercel**, **Netlify**, **Cloudflare Pages**, or **GitHub Pages**:

```bash
cd frontend
npm run build
```

Compiled static output is generated in `frontend/out/`.

---

## 🌐 Features

- **Interactive 3D Detective Room**: Full Three.js canvas with orbit controls, interactive desk lamp lighting, vintage terminal, and red-string crime board investigation dossier.
- **Multilingual Support**: Instant locale switching (DE, EN, FR) with automatic browser locale detection.
- **10 Full Case Studies**: In-depth architecture dossiers including the GamingZone 12-microservices ecosystem, Ostora, ARCH-X7, scanOCR, and more.
- **A4 CV Lebenslauf**: 1-click printable and downloadable CV dossier.
- **Microservice Architecture Matrix**: Direct links and technical breakdowns across all microservices and repositories.

---

## 👤 Author

**Zakaria Kardache**  
- **Role**: Software Conception & Application Developer · Cloud & Backend Engineer  
- **Location**: Casablanca, Morocco  
- **LinkedIn**: [linkedin.com/in/zakaria-kardache](https://www.linkedin.com/in/zakaria-kardache/)  
- **GitHub**: [github.com/kardasch404](https://github.com/kardasch404)  
- **Xing**: [xing.com/profile/Zakaria_Kardache081184](https://www.xing.com/profile/Zakaria_Kardache081184)

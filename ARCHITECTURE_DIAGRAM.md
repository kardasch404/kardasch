# Kardasch Engineering Portfolio — System Architecture

## 🏛️ High-Level Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ZAKARIA KARDACHE ARCHIVE                        │
│                Cloud Infrastructure · Distributed Backend              │
└────────────────────────────────────────────────────────────────────────┘

                         ┌─────────────────────┐
                         │   Next.js 16 SSG    │
                         │   App Router & Redux│
                         └──────────┬──────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│ 3D Detective Room │     │ Dynamic Dossiers  │     │ A4 CV Lebenslauf  │
│ Three.js + Canvas │     │ /projects/[slug]  │     │ html2canvas+jsPDF │
│ Interactive Study │     │ 12-Repo Matrix    │     │ 1-Click Download  │
└─────────┬─────────┘     └─────────┬─────────┘     └─────────┬─────────┘
          │                         │                         │
          └─────────────────────────┼─────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Type-Safe Data & Content Core                      │
│            Zod Build-Time Schemas (projects, general, bio)             │
│            Multilingual i18n Engine (German, English, French)          │
│            Smart Location & Device Language Auto-Detection             │
└────────────────────────────────────────────────────────────────────────┘
```

## 🧩 Architectural Modules

1. **Interactive 3D Study Canvas (`Three.js`)**:
   - Procedural lighting, OrbitControls (mouse/touch rotation, panning, zoom-to-cursor up to 45 units).
   - Burnt-edge parchment case cards with dynamic elevation, hover, and selection badges.
   - Vintage atlas with coordinate-mapped location pins (Casablanca, Youssoufia, Germany).
   - Interactive CRT terminal and chess simulation table.

2. **Case File & Microservices Matrix**:
   - Detailed technical dossiers: The Problem, Architecture Nodes, Technical Decisions, Backend Engineering, and Repository Links.
   - Highlights the 12-repository **GamingZone** microservices ecosystem and **TrackRoute** telemetry platform.

3. **AssistiveTouch HUD**:
   - Floating draggable orb providing language switching, room reset, camera quick-jumps (`Tafel`, `Büro`, `Schach`, `Raum`), and social badge links.

4. **Production Build & Export**:
   - Fully static HTML/CSS/JS export via Next.js (`output: 'export'`) ready for any static CDN, Vercel, Netlify, or Docker deployment.

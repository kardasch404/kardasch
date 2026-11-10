'use client';

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import type { Bio } from '@/schemas/bio.schema';
import type { Project } from '@/schemas/project.schema';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { RoomFile, RoomEvent } from './InteractiveStudy';
import type { GeneralData } from '@/schemas/general.schema';
import JourneyMap from './JourneyMap';
import EventDocument from './EventDocument';
import ArchiveJournal from './ArchiveJournal';
import { PortfolioTerminal } from './PortfolioTerminal';
import CvLebenslauf, { type Locale } from './CvLebenslauf';
import translations from '@/data/translations.json';

const ChessGame = dynamic(() => import('./ChessGame'), { ssr: false });
const InteractiveStudy = dynamic(() => import('./InteractiveStudy'), { ssr: false });

type Experience = {
  id: string;
  company: string;
  location: string;
  role: string;
  type: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  bullets: string[];
  stack: string[];
};
type Education = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
};
type Certification = {
  id: string;
  name: string;
  issuer: string;
  year: number;
  date: string;
  credentialUrl: string | null;
  description: string;
  tags: string[];
  inProgress?: boolean;
};
type Props = {
  general: GeneralData;
  bio: Bio;
  projects: Project[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  events: RoomEvent[];
};
type OpenFile = RoomFile;
type RoomStyle = CSSProperties & { '--light-x': string; '--light-y': string };

const projectImages: Record<string, string> = {
  ostora: '/room/projects/ostora.png',
  'arch-x7': '/room/projects/arch-x7.png',
};

function dateRange(entry: Experience | Education, locale: Locale = 'de', presentLabel = 'heute') {
  const format = (date: string) =>
    new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
      new Date(`${date}-01T00:00:00Z`)
    );
  return `${format(entry.startDate)} — ${
    entry.current ? presentLabel : entry.endDate ? format(entry.endDate) : ''
  }`;
}

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function detectSmartLocale(): Locale {
  try {
    const manual = window.localStorage.getItem('kardache-locale-manual') as Locale | null;
    if (manual === 'de' || manual === 'en' || manual === 'fr') return manual;

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (/Berlin|Vienna|Zurich|Vaduz|Busingen/i.test(tz)) return 'de';
    if (/Casablanca|Paris|Brussels|Monaco|Algiers|Tunis|Luxembourg|Montreal/i.test(tz)) return 'fr';

    const langs = navigator.languages?.length ? navigator.languages : [navigator.language || ''];
    for (const l of langs) {
      const code = l.toLowerCase();
      if (code.startsWith('de')) return 'de';
      if (code.startsWith('fr')) return 'fr';
      if (code.startsWith('en')) return 'en';
    }
  } catch {}
  return 'de';
}

export function DetectiveRoom({
  general,
  bio,
  projects,
  education,
  certifications,
  events,
}: Props) {
  const [studyReady, setStudyReady] = useState(false);
  const [lampOn, setLampOn] = useState(true);
  const [computerOn, setComputerOn] = useState(true);
  const [chessVisited, setChessVisited] = useState(false);
  const [stringsOn, setStringsOn] = useState(true);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [cameraView, setCameraView] = useState<{ preset: 'board' | 'desk' | 'chess' | 'room'; seq: number }>({
    preset: 'board',
    seq: 0,
  });
  const [openFile, setOpenFile] = useState<OpenFile | null>(null);
  const [locale, setLocale] = useState<Locale>('de');

  // AssistiveTouch floating orb state
  const [assistiveOpen, setAssistiveOpen] = useState(false);
  const [orbPos, setOrbPos] = useState<{ x: number; y: number } | null>(null);
  const orbDragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    moved: boolean;
  } | null>(null);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const selectedProject =
    openFile?.kind === 'project' ? projects.find((p) => p.id === openFile.id) : undefined;
  const selectedEvent =
    openFile?.kind === 'event' ? events.find((event) => event.id === openFile.id) : undefined;
  const t = translations[locale].ui;
  const projectTranslations = translations[locale].projects as Record<
    string,
    {
      category?: string;
      shortDescription?: string;
      tagline?: string;
      problem?: string;
      architecture?: string;
      technicalDecisions?: { tech: string; reason: string }[];
      backendEngineering?: string[];
    }
  >;

  // Smart Country + Device Language Detection on mount
  useEffect(() => {
    const detected = detectSmartLocale();
    setLocale(detected);
    try {
      window.localStorage.setItem('kardache-locale', detected);
    } catch {}

    // If user hasn't manually locked a language, refine via Geo-IP country lookup
    try {
      const manual = window.localStorage.getItem('kardache-locale-manual');
      if (!manual) {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 3500);
        fetch('https://ipwho.is/', { signal: controller.signal })
          .then((res) => res.json())
          .then((data: { country_code?: string }) => {
            window.clearTimeout(timeoutId);
            const cc = (data?.country_code || '').toUpperCase();
            if (!cc) return;
            let geoLang: Locale | null = null;
            if (['DE', 'AT', 'CH', 'LI'].includes(cc)) geoLang = 'de';
            else if (['FR', 'MA', 'BE', 'MC', 'LU', 'SN', 'TN', 'DZ', 'CI'].includes(cc)) {
              // Check if device language is explicitly German or English; otherwise use country language
              const devLang = (navigator.language || '').toLowerCase();
              if (devLang.startsWith('de')) geoLang = 'de';
              else if (devLang.startsWith('en')) geoLang = 'en';
              else geoLang = 'fr';
            } else if (['US', 'GB', 'CA', 'AU', 'IE', 'NZ'].includes(cc)) {
              geoLang = 'en';
            }
            if (geoLang && !window.localStorage.getItem('kardache-locale-manual')) {
              setLocale(geoLang);
              window.localStorage.setItem('kardache-locale', geoLang);
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, []);

  function changeLocale(next: Locale) {
    setLocale(next);
    try {
      window.localStorage.setItem('kardache-locale', next);
      window.localStorage.setItem('kardache-locale-manual', next);
    } catch {}
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!openFile || !dialog) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      openerRef.current?.focus({ preventScroll: true });
    };
  }, [openFile]);

  function open(file: OpenFile) {
    if (!openFile) openerRef.current = document.activeElement as HTMLElement | null;
    if (file.kind === 'chess') setChessVisited(true);
    setAssistiveOpen(false);
    setOpenFile(file);
  }

  // Draggable AssistiveTouch orb handlers
  function onOrbPointerDown(e: PointerEvent<HTMLButtonElement>) {
    if (e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const curX = orbPos?.x ?? rect.left;
    const curY = orbPos?.y ?? rect.top;
    orbDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: curX,
      origY: curY,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onOrbPointerMove(e: PointerEvent<HTMLButtonElement>) {
    const drag = orbDragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (Math.hypot(dx, dy) > 6) drag.moved = true;
    if (!drag.moved) return;
    const maxX = window.innerWidth - 68;
    const maxY = window.innerHeight - 68;
    setOrbPos({
      x: Math.max(12, Math.min(maxX, drag.origX + dx)),
      y: Math.max(12, Math.min(maxY, drag.origY + dy)),
    });
  }

  function onOrbPointerUp(e: PointerEvent<HTMLButtonElement>) {
    const drag = orbDragRef.current;
    orbDragRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (drag && !drag.moved) {
      setAssistiveOpen((prev) => !prev);
    } else if (drag?.moved && orbPos) {
      // Snap gently toward nearest left or right screen edge like iOS AssistiveTouch
      const snapX = orbPos.x + 29 < window.innerWidth / 2 ? 18 : window.innerWidth - 76;
      setOrbPos({ x: snapX, y: orbPos.y });
    }
  }

  const roomStyle: RoomStyle = { '--light-x': '67%', '--light-y': '40%' };

  return (
    <main
      className={`investigation is-fullscreen-study ${lampOn ? 'is-lit' : 'is-dark'}`}
      style={roomStyle}
      suppressHydrationWarning
    >
      <section
        id="room-files"
        className="room-experience is-pure-3d"
        aria-label="The investigation room"
        tabIndex={-1}
        suppressHydrationWarning
      >
        <div
          className={`detective-stage is-pure-3d-stage ${openFile ? 'has-open-file' : ''} ${
            studyReady ? 'study-active' : ''
          } study-requested`}
          suppressHydrationWarning
        >
          <InteractiveStudy
            general={general}
            bio={bio}
            projects={projects}
            events={events}
            locale={locale}
            resetTrigger={resetTrigger}
            cameraView={cameraView}
            lampOn={lampOn}
            computerOn={computerOn}
            onPowerToggle={() => setComputerOn((value) => !value)}
            stringsOn={stringsOn}
            onLampToggle={() => setLampOn((value) => !value)}
            onOpen={open}
            onReady={setStudyReady}
          />
        </div>
      </section>

      {/* iOS AssistiveTouch-Style Floating Button */}
      <button
        type="button"
        className={`assistive-touch-orb ${assistiveOpen ? 'is-open' : ''}`}
        style={orbPos ? { left: `${orbPos.x}px`, top: `${orbPos.y}px`, right: 'auto', bottom: 'auto' } : undefined}
        onPointerDown={onOrbPointerDown}
        onPointerMove={onOrbPointerMove}
        onPointerUp={onOrbPointerUp}
        aria-label="Open Investigator Assistive Hub"
        aria-expanded={assistiveOpen}
      >
        <span className="assistive-ring-outer">
          <span className="assistive-ring-mid">
            <span className="assistive-ring-core">{locale.toUpperCase()}</span>
          </span>
        </span>
      </button>

      {/* iOS AssistiveTouch-Style Rounded Grid Popover Menu */}
      {assistiveOpen && (
        <div
          className="assistive-overlay-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAssistiveOpen(false);
          }}
        >
          <div className="assistive-touch-menu" role="dialog" aria-label={t.assistiveHubTitle}>
            {/* Top Language Bar inside AssistiveTouch */}
            <div className="assistive-lang-bar">
              {(['de', 'en', 'fr'] as Locale[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  className={`assistive-lang-btn ${locale === lang ? 'is-active' : ''}`}
                  onClick={() => changeLocale(lang)}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* 3x3 AssistiveTouch Icon Grid (matching reference image) */}
            <div className="assistive-grid">
              <button type="button" className="assistive-item" onClick={() => open({ kind: 'resume' })}>
                <span className="assistive-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="8" y1="13" x2="16" y2="13" />
                    <line x1="8" y1="17" x2="14" y2="17" />
                  </svg>
                </span>
                <span className="assistive-label">{t.assistiveCv}</span>
              </button>

              <button type="button" className="assistive-item" onClick={() => open({ kind: 'archive' })}>
                <span className="assistive-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </span>
                <span className="assistive-label">
                  {t.assistiveCases} ({projects.length})
                </span>
              </button>

              <button type="button" className="assistive-item" onClick={() => open({ kind: 'events' })}>
                <span className="assistive-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <circle cx="8.5" cy="9.5" r="1.5" />
                    <polyline points="21 15 16 10 5 20" />
                  </svg>
                </span>
                <span className="assistive-label">{t.assistiveEvents}</span>
              </button>

              <button type="button" className="assistive-item" onClick={() => open({ kind: 'map', city: 'casablanca' })}>
                <span className="assistive-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                    <line x1="8" y1="2" x2="8" y2="18" />
                    <line x1="16" y1="6" x2="16" y2="22" />
                  </svg>
                </span>
                <span className="assistive-label">{t.assistiveMap}</span>
              </button>

              <button type="button" className="assistive-item is-home-core" onClick={() => open({ kind: 'contact' })}>
                <span className="assistive-icon is-home-circle">
                  <span className="assistive-home-inner" />
                </span>
                <span className="assistive-label">{t.assistiveContact}</span>
              </button>

              <button type="button" className="assistive-item" onClick={() => open({ kind: 'chess' })}>
                <span className="assistive-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <path d="M8 21h8M12 17v4M7 17h10l-1-7 2-3-3-2-3 2-3-2-3 2 2 3-1 7z" />
                  </svg>
                </span>
                <span className="assistive-label">{t.assistiveChess}</span>
              </button>

              <button
                type="button"
                className={`assistive-item ${lampOn ? 'is-active-toggle' : ''}`}
                onClick={() => setLampOn((v) => !v)}
              >
                <span className="assistive-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
                  </svg>
                </span>
                <span className="assistive-label">{lampOn ? t.assistiveLampOn : t.assistiveLampOff}</span>
              </button>

              <button
                type="button"
                className={`assistive-item ${stringsOn ? 'is-active-toggle' : ''}`}
                onClick={() => setStringsOn((v) => !v)}
              >
                <span className="assistive-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <circle cx="5" cy="6" r="2.5" />
                    <circle cx="19" cy="6" r="2.5" />
                    <circle cx="12" cy="18" r="2.5" />
                    <line x1="7.2" y1="7.2" x2="16.8" y2="7.2" />
                    <line x1="6.4" y1="8.2" x2="10.8" y2="15.8" />
                    <line x1="17.6" y1="8.2" x2="13.2" y2="15.8" />
                  </svg>
                </span>
                <span className="assistive-label">
                  {stringsOn ? t.assistiveStringsOn : t.assistiveStringsOff}
                </span>
              </button>

              <button
                type="button"
                className="assistive-item"
                onClick={() => {
                  setLampOn(true);
                  setStringsOn(true);
                  setResetTrigger((c) => c + 1);
                  setAssistiveOpen(false);
                }}
              >
                <span className="assistive-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                </span>
                <span className="assistive-label">{t.assistiveReset}</span>
              </button>
            </div>

            {/* Camera Focus Quick-Jump Row (Board / Desk / Chess / Full Room) */}
            <div className="assistive-cam-strip">
              <button
                type="button"
                className="assistive-cam-btn"
                onClick={() => {
                  setCameraView((c) => ({ preset: 'board', seq: c.seq + 1 }));
                  setAssistiveOpen(false);
                }}
              >
                🎯 {locale === 'de' ? 'Tafel' : locale === 'fr' ? 'Tableau' : 'Board'}
              </button>
              <button
                type="button"
                className="assistive-cam-btn"
                onClick={() => {
                  setCameraView((c) => ({ preset: 'desk', seq: c.seq + 1 }));
                  setAssistiveOpen(false);
                }}
              >
                🪑 {locale === 'de' ? 'Büro / CV' : locale === 'fr' ? 'Bureau' : 'Desk'}
              </button>
              <button
                type="button"
                className="assistive-cam-btn"
                onClick={() => {
                  setCameraView((c) => ({ preset: 'chess', seq: c.seq + 1 }));
                  setAssistiveOpen(false);
                }}
              >
                ♟ {locale === 'de' ? 'Schach' : locale === 'fr' ? 'Échecs' : 'Chess'}
              </button>
              <button
                type="button"
                className="assistive-cam-btn"
                onClick={() => {
                  setCameraView((c) => ({ preset: 'room', seq: c.seq + 1 }));
                  setAssistiveOpen(false);
                }}
              >
                🏠 {locale === 'de' ? 'Raum' : locale === 'fr' ? 'Pièce' : 'Room'}
              </button>
            </div>

            {/* Direct Real SVG Social Icons Strip at bottom of AssistiveTouch */}
            <div className="assistive-social-strip">
              <a
                href="https://www.linkedin.com/in/zakaria-kardache/"
                target="_blank"
                rel="noreferrer"
                title="LinkedIn"
                className="assistive-social-pill"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
                </svg>
                <span>LinkedIn</span>
              </a>
              <a
                href="https://github.com/kardasch404"
                target="_blank"
                rel="noreferrer"
                title="GitHub"
                className="assistive-social-pill"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
                </svg>
                <span>GitHub</span>
              </a>
              <a
                href="https://www.xing.com/profile/Zakaria_Kardache081184"
                target="_blank"
                rel="noreferrer"
                title="Xing"
                className="assistive-social-pill"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                  <path d="M18.188 0c-.517 0-.741.325-.927.66 0 0-7.455 13.224-7.702 13.657.015.024 4.919 9.023 4.919 9.023.17.308.436.66.967.66h3.454c.211 0 .375-.078.463-.22.089-.151.089-.346-.009-.536l-4.879-8.916c-.004-.006-.004-.016 0-.022L22.139.756c.095-.191.097-.387.006-.535C22.056.078 21.894 0 21.686 0h-3.498zM3.648 4.74c-.211 0-.385.074-.473.216-.09.149-.078.339.02.531l2.34 4.05c.004.01.004.016 0 .021L1.86 16.051c-.099.188-.093.381 0 .529.085.142.239.234.45.234h3.461c.518 0 .766-.348.945-.667l3.734-6.609-2.378-4.155c-.172-.315-.434-.659-.962-.659H3.648v.016z" />
                </svg>
                <span>Xing</span>
              </a>
              <a
                href="mailto:kardasch.zakaria@outlook.de"
                title="Email"
                className="assistive-social-pill"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z" />
                </svg>
                <span>Mail</span>
              </a>
            </div>
          </div>
        </div>
      )}

      <dialog
        ref={dialogRef}
        className={`case-document-dialog ${openFile?.kind === 'resume' ? 'is-resume' : ''} ${
          openFile?.kind === 'computer' ? 'is-terminal' : ''
        } ${openFile?.kind === 'chess' ? 'is-chess' : ''}`}
        aria-labelledby="document-title"
        onCancel={(event) => {
          event.preventDefault();
          setOpenFile(null);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpenFile(null);
        }}
      >
        <div className="case-document">
          {openFile?.kind !== 'resume' && (
            <div className="document-toolbar">
              <span>
                THE KARDACHE FILES /{' '}
                {selectedProject
                  ? `CASE ${String(projects.findIndex((p) => p.id === selectedProject.id) + 1).padStart(
                      3,
                      '0'
                    )}`
                  : t.archiveSubtitle}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="room-lang-switcher" role="group" aria-label="Language selector">
                  {(['de', 'en', 'fr'] as Locale[]).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      className={`lang-switch-btn ${locale === lang ? 'is-active' : ''}`}
                      onClick={() => changeLocale(lang)}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
                <button onClick={() => setOpenFile(null)} aria-label="Close document">
                  {t.closeBtn} <span aria-hidden="true">×</span>
                </button>
              </div>
            </div>
          )}

          {openFile?.kind === 'computer' && (
            <>
              <div className="computer-power">
                <span>
                  {t.computerHeader} / {computerOn ? t.computerOnline : t.computerOffline}
                </span>
                <button onClick={() => setComputerOn((value) => !value)}>
                  {computerOn ? t.objPowerOff : t.objPowerOn}
                </button>
              </div>
              {computerOn ? (
                <PortfolioTerminal bio={bio} projects={projects} events={events} onOpen={open} />
              ) : (
                <div className="computer-off">
                  <h2 id="document-title">{t.computerOffTitle}</h2>
                  <p>{t.computerOffDesc}</p>
                </div>
              )}
            </>
          )}

          {chessVisited && <ChessGame visible={openFile?.kind === 'chess'} />}

          {openFile?.kind === 'education' && (
            <article className="document-content education-dossier">
              <div className="dossier-header-bar">
                <span className="dossier-kicker">{t.eduKicker}</span>
                <span className="dossier-status-stamp">{t.eduStamp}</span>
              </div>
              <h2 id="document-title">{t.eduTitle}</h2>
              <p className="document-deck">{t.eduDeck}</p>
              <div className="education-cards-stack">
                {education.map((entry) => {
                  const eduLoc = (
                    translations[locale].educationItems as Record<
                      string,
                      {
                        institution?: string;
                        degree?: string;
                        location?: string;
                        description?: string;
                        photoCaption?: string;
                      }
                    >
                  )?.[entry.id];
                  const eduMedia =
                    general.education.find((item) => item.id === entry.id)?.media.images ?? [];
                  const eduIcon = entry.id.includes('alx')
                    ? '/icons/alx.webp'
                    : entry.id.includes('youcode')
                      ? '/icons/youcode.png'
                      : entry.id.includes('hassan2') || entry.id.includes('benmsik')
                        ? '/icons/scbenMsik_icon.png'
                        : null;
                  return (
                    <section
                      className={`education-dossier-card ${entry.current ? 'is-current-edu' : ''}`}
                      key={entry.id}
                    >
                      <div className="edu-card-header">
                        {eduIcon && (
                          <div
                            className={`edu-institution-logo ${
                              entry.id.includes('alx') ? 'is-dark-logo' : ''
                            }`}
                          >
                            <img src={eduIcon} alt={eduLoc?.institution ?? entry.institution} />
                          </div>
                        )}
                        <div className="edu-header-text">
                          <div className="edu-badges-row">
                            <span className="edu-date-badge">
                              {dateRange(entry, locale, t.presentLabel)}
                            </span>
                            {entry.current && (
                              <span className="edu-active-badge">{t.eduCurrentBadge}</span>
                            )}
                          </div>
                          <h3>{eduLoc?.degree ?? entry.degree}</h3>
                          <p className="resume-place">
                            {eduLoc?.institution ?? entry.institution} ·{' '}
                            {eduLoc?.location ?? entry.location}
                          </p>
                        </div>
                      </div>
                      <p className="edu-description">{eduLoc?.description ?? entry.description}</p>
                      {eduMedia.map((photo) => (
                        <figure key={photo.id} className="edu-photo-frame">
                          <img
                            className="education-photo"
                            src={photo.src}
                            alt={photo.alt}
                            loading="lazy"
                          />
                          <figcaption>{eduLoc?.photoCaption ?? photo.caption}</figcaption>
                        </figure>
                      ))}
                    </section>
                  );
                })}
              </div>
              <h3>{t.eduCertsTitle}</h3>
              <div className="certifications-dossier-grid">
                {certifications.map((cert) => {
                  const certLoc = (
                    translations[locale].certificationItems as Record<
                      string,
                      { name?: string; issuer?: string; description?: string }
                    >
                  )?.[cert.id];
                  return (
                    <div key={cert.id} className="cert-dossier-card">
                      <div className="cert-card-top">
                        <span className="cert-year">{cert.year}</span>
                        {cert.inProgress && (
                          <span className="cert-progress-tag">{t.certInProgress}</span>
                        )}
                      </div>
                      <strong>{certLoc?.name ?? cert.name}</strong>
                      <span className="cert-issuer">{certLoc?.issuer ?? cert.issuer}</span>
                      {(certLoc?.description ?? cert.description) && (
                        <p>{certLoc?.description ?? cert.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </article>
          )}

          {openFile?.kind === 'map' && (
            <JourneyMap
              key={`${openFile.city ?? 'all'}-${locale}`}
              data={general}
              initialCity={openFile.city}
              locale={locale}
              onOpen={open}
            />
          )}

          {openFile?.kind === 'events' && (
            <ArchiveJournal events={events} locale={locale} onOpen={open} />
          )}

          {selectedEvent && <EventDocument event={selectedEvent} locale={locale} onOpen={open} />}

          {selectedProject &&
            (() => {
              const caseIndex = projects.findIndex((p) => p.id === selectedProject.id);
              const caseId = `CASE-${String(caseIndex + 1).padStart(3, '0')}`;
              const prevProject = projects[(caseIndex - 1 + projects.length) % projects.length];
              const nextProject = projects[(caseIndex + 1) % projects.length];
              const generalProject = general.projects.find(
                (project) => project.id === selectedProject.id
              );
              const pLoc = projectTranslations[selectedProject.id];
              const categoryText =
                pLoc?.category ?? selectedProject.category ?? 'Software Engineering';
              const shortDescText =
                pLoc?.shortDescription ?? selectedProject.shortDescription ?? selectedProject.tagline;
              const problemText =
                pLoc?.problem ?? selectedProject.problem ?? selectedProject.description;
              const archText = pLoc?.architecture ?? selectedProject.architecture;
              const archNodes = selectedProject.architectureNodes?.length
                ? selectedProject.architectureNodes
                : selectedProject.stack.slice(0, 5);
              const decisions = pLoc?.technicalDecisions?.length
                ? pLoc.technicalDecisions
                : (selectedProject.technicalDecisions ?? []);
              const backendPoints = pLoc?.backendEngineering?.length
                ? pLoc.backendEngineering
                : selectedProject.backendEngineering?.length
                  ? selectedProject.backendEngineering
                  : selectedProject.highlights;

              return (
                <article className="document-content case-dossier">
                  <div className="dossier-header-bar">
                    <span className="dossier-kicker">
                      {caseId} · {categoryText.toUpperCase()}
                    </span>
                    <span className="dossier-status-stamp">{t.caseVerifiedStamp}</span>
                  </div>

                  <div className="dossier-title-row">
                    <h2 id="document-title">{selectedProject.name}</h2>
                    {selectedProject.github && (
                      <a
                        className="dossier-github-hero-btn"
                        href={selectedProject.github}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.92.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.27 5.67.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
                        </svg>
                        <span>GitHub Repository ↗</span>
                      </a>
                    )}
                  </div>
                  <p className="document-deck">{shortDescText}</p>

                  <div className="case-index-strip">
                    <div>
                      <small>{t.projectIdLabel}</small>
                      <strong>{caseId}</strong>
                    </div>
                    <div>
                      <small>{t.categoryLabel}</small>
                      <strong>{categoryText}</strong>
                    </div>
                    <div>
                      <small>{t.coreStackLabel}</small>
                      <strong>{selectedProject.stack.slice(0, 4).join(' · ')}</strong>
                    </div>
                  </div>

                  {selectedProject.metrics && selectedProject.metrics.length > 0 && (
                    <div className="case-metrics-grid">
                      {selectedProject.metrics.map((m) => (
                        <div key={m.label} className="case-metric-box">
                          <small>{m.label}</small>
                          <strong>{m.value}</strong>
                        </div>
                      ))}
                    </div>
                  )}

                  {projectImages[selectedProject.id] && (
                    <figure className="dossier-visual-frame">
                      <img
                        className="document-project-image"
                        src={projectImages[selectedProject.id]}
                        alt={`${selectedProject.name} evidence`}
                      />
                      <figcaption>
                        EVIDENCE EXHIBIT A — {selectedProject.name.toUpperCase()} FIELD RECORD
                      </figcaption>
                    </figure>
                  )}

                  {generalProject?.media.images.map((photo) => (
                    <figure key={photo.id} className="dossier-visual-frame">
                      <img
                        className="document-project-image"
                        src={photo.src}
                        alt={photo.alt}
                      />
                      <figcaption>{photo.caption}</figcaption>
                    </figure>
                  ))}

                  <section className="case-investigation-section">
                    <h3>{t.secProblem}</h3>
                    <p className="case-problem-text">{problemText}</p>
                  </section>

                  <section className="case-investigation-section">
                    <h3>{t.secArchitecture}</h3>
                    <div className="case-arch-diagram" aria-label="System architecture flow">
                      {archNodes.map((node, idx) => (
                        <div key={node} className="case-arch-step">
                          <span className="case-arch-node">{node}</span>
                          {idx < archNodes.length - 1 && (
                            <span className="case-arch-arrow" aria-hidden="true">
                              ──►
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    {archText && <p className="case-arch-summary">{archText}</p>}
                  </section>

                  {decisions.length > 0 && (
                    <section className="case-investigation-section">
                      <h3>{t.secDecisions}</h3>
                      <div className="case-decisions-table">
                        {decisions.map((item) => (
                          <div key={item.tech} className="case-decision-row">
                            <strong className="case-decision-tech">{item.tech}</strong>
                            <span className="case-decision-reason">{item.reason}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  <section className="case-investigation-section">
                    <h3>{t.secBackend}</h3>
                    <ul className="case-backend-list">
                      {backendPoints.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </section>

                  {selectedProject.repositories && selectedProject.repositories.length > 0 && (
                    <section className="case-investigation-section">
                      <h3>
                        {t.secRepositories} ({selectedProject.repositories.length})
                      </h3>
                      <div className="case-repos-grid">
                        {selectedProject.repositories.map((repo) => (
                          <a
                            key={repo.name}
                            href={repo.url}
                            target="_blank"
                            rel="noreferrer"
                            className="case-repo-card"
                          >
                            <div className="case-repo-top">
                              <span className="case-repo-title-wrap">
                                <svg
                                  viewBox="0 0 16 16"
                                  width="14"
                                  height="14"
                                  fill="currentColor"
                                  aria-hidden="true"
                                  className="case-repo-gh-icon"
                                >
                                  <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
                                </svg>
                                <strong>{repo.name}</strong>
                                <span className="case-repo-visibility">
                                  {repo.visibility ?? 'Public'}
                                </span>
                              </span>
                              <Arrow />
                            </div>
                            {repo.role && <p>{repo.role}</p>}
                            {repo.topics && repo.topics.length > 0 && (
                              <div className="case-repo-topics">
                                {repo.topics.map((topic) => (
                                  <span key={topic} className="case-repo-topic-pill">
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="case-repo-footer">
                              {repo.language && (
                                <span className="case-repo-lang">
                                  <span
                                    className="case-repo-lang-dot"
                                    style={{
                                      background:
                                        repo.language === 'Groovy' ? '#4298b8' : '#3178c6',
                                    }}
                                  />
                                  {repo.language}
                                </span>
                              )}
                              {typeof repo.stars === 'number' && (
                                <span className="case-repo-stars">★ {repo.stars}</span>
                              )}
                              {repo.updated && (
                                <span className="case-repo-updated">{repo.updated}</span>
                              )}
                            </div>
                          </a>
                        ))}
                      </div>
                    </section>
                  )}

                  <div className="document-actions case-primary-actions">
                    <Link
                      className="open-case-file-btn"
                      href={`/projects/${selectedProject.slug}`}
                    >
                      {t.openCaseFileBtn} <Arrow />
                    </Link>
                    {selectedProject.github && (
                      <a href={selectedProject.github} target="_blank" rel="noreferrer">
                        {t.sourceCodeBtn} <Arrow />
                      </a>
                    )}
                    {selectedProject.demo && (
                      <a href={selectedProject.demo} target="_blank" rel="noreferrer">
                        {t.liveDemoBtn} <Arrow />
                      </a>
                    )}
                    <button onClick={() => setOpenFile({ kind: 'archive' })}>
                      {t.allCaseFilesBtn.replace('{count}', String(projects.length))}
                    </button>
                  </div>

                  <div className="dossier-case-nav">
                    <button onClick={() => setOpenFile({ kind: 'project', id: prevProject.id })}>
                      <small>{t.prevCaseLabel}</small>
                      <strong>{prevProject.name}</strong>
                    </button>
                    <button onClick={() => setOpenFile({ kind: 'project', id: nextProject.id })}>
                      <small>{t.nextCaseLabel}</small>
                      <strong>{nextProject.name}</strong>
                    </button>
                  </div>
                </article>
              );
            })()}

          {openFile?.kind === 'archive' && (
            <div className="document-content">
              <p className="document-kicker">
                {t.archiveKicker.replace('{count}', String(projects.length))}
              </p>
              <h2 id="document-title">{t.archiveTitle}</h2>
              <p className="document-deck">{t.archiveDeck}</p>
              <div className="archive-list">
                {projects.map((project, index) => {
                  const pLoc = projectTranslations[project.id];
                  return (
                    <button
                      key={project.id}
                      onClick={() => setOpenFile({ kind: 'project', id: project.id })}
                    >
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <span>
                        <strong>{project.name}</strong>
                        <small>
                          {pLoc?.shortDescription ?? project.shortDescription ?? project.tagline}
                        </small>
                        <em>{project.stack.slice(0, 4).join(' · ')}</em>
                      </span>
                      <Arrow />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {openFile?.kind === 'contact' && (
            <div className="document-content">
              <p className="document-kicker">{t.contactKicker}</p>
              <h2 id="document-title">{bio.name}</h2>
              <p className="document-deck">{translations[locale].cv.title}</p>

              <div className="contact-file-links is-social-grid">
                <a
                  href="https://www.linkedin.com/in/zakaria-kardache/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <small className="contact-link-meta">
                    <span className="social-badge-icon is-archive-ink" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
                      </svg>
                    </span>
                    <span>{t.contactLinkedin}</span>
                  </small>
                  <span className="contact-link-val">linkedin.com/in/zakaria-kardache</span>
                  <Arrow />
                </a>
                <a href="https://github.com/kardasch404" target="_blank" rel="noreferrer">
                  <small className="contact-link-meta">
                    <span className="social-badge-icon is-archive-dark" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                        <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
                      </svg>
                    </span>
                    <span>{t.contactGithub}</span>
                  </small>
                  <span className="contact-link-val">github.com/kardasch404</span>
                  <Arrow />
                </a>
                <a
                  href="https://www.xing.com/profile/Zakaria_Kardache081184"
                  target="_blank"
                  rel="noreferrer"
                >
                  <small className="contact-link-meta">
                    <span className="social-badge-icon is-archive-bronze" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M18.188 0c-.517 0-.741.325-.927.66 0 0-7.455 13.224-7.702 13.657.015.024 4.919 9.023 4.919 9.023.17.308.436.66.967.66h3.454c.211 0 .375-.078.463-.22.089-.151.089-.346-.009-.536l-4.879-8.916c-.004-.006-.004-.016 0-.022L22.139.756c.095-.191.097-.387.006-.535C22.056.078 21.894 0 21.686 0h-3.498zM3.648 4.74c-.211 0-.385.074-.473.216-.09.149-.078.339.02.531l2.34 4.05c.004.01.004.016 0 .021L1.86 16.051c-.099.188-.093.381 0 .529.085.142.239.234.45.234h3.461c.518 0 .766-.348.945-.667l3.734-6.609-2.378-4.155c-.172-.315-.434-.659-.962-.659H3.648v.016z" />
                      </svg>
                    </span>
                    <span>XING</span>
                  </small>
                  <span className="contact-link-val">xing.com/profile/Zakaria_Kardache</span>
                  <Arrow />
                </a>
                <a href={`mailto:${bio.contact.email}`}>
                  <small className="contact-link-meta">
                    <span className="social-badge-icon is-archive-crimson" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z" />
                      </svg>
                    </span>
                    <span>{t.contactEmail}</span>
                  </small>
                  <span className="contact-link-val">{bio.contact.email}</span>
                  <Arrow />
                </a>
                <a href="https://kardasch.me/" target="_blank" rel="noreferrer">
                  <small className="contact-link-meta">
                    <span className="social-badge-icon is-archive-ink" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="9.5" />
                        <path d="M2.5 12h19M12 2.5a14.5 14.5 0 0 1 0 19M12 2.5a14.5 14.5 0 0 0 0 19" />
                      </svg>
                    </span>
                    <span>PORTFOLIO</span>
                  </small>
                  <span className="contact-link-val">kardasch.me</span>
                  <Arrow />
                </a>
                <a href={`tel:${bio.contact.phone.replace(/[^+\d]/g, '')}`}>
                  <small className="contact-link-meta">
                    <span className="social-badge-icon is-archive-forest" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                        <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.01l-2.2 2.2Z" />
                      </svg>
                    </span>
                    <span>{t.contactPhone}</span>
                  </small>
                  <span className="contact-link-val">{bio.contact.phone}</span>
                  <Arrow />
                </a>
              </div>

              <div className="document-actions" style={{ marginTop: '22px' }}>
                <button
                  type="button"
                  className="open-case-file-btn"
                  onClick={() => setOpenFile({ kind: 'resume' })}
                >
                  {t.navCv} (DE / EN / FR) <Arrow />
                </button>
                <button
                  type="button"
                  onClick={() => setOpenFile({ kind: 'archive' })}
                >
                  {t.allCaseFilesBtn.replace('{count}', String(projects.length))}
                </button>
              </div>

              <p className="contact-location">{t.contactLocationNote}</p>
            </div>
          )}

          {openFile?.kind === 'resume' && (
            <CvLebenslauf
              locale={locale}
              onChangeLocale={changeLocale}
              onClose={() => setOpenFile(null)}
            />
          )}

          {openFile?.kind !== 'resume' && (
            <div className="document-bottom">
              <span>
                {bio.name} / {t.portfolioLabel}
              </span>
              <span>{t.endOfFile}</span>
            </div>
          )}
        </div>
      </dialog>
    </main>
  );
}

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Bio } from '@/schemas/bio.schema';
import type { Project } from '@/schemas/project.schema';

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

type CaseBoardProps = {
  bio: Bio;
  projects: Project[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
};

type Position = { x: number; y: number };
type Layout = { x: number; y: number; rot: number };

type CaseItem = {
  id: string;
  layout: Layout;
  title: string;
  num: string;
  status: string;
  statusClass: 'active' | 'classified' | 'closed';
  desc: string;
  tags: string[];
  featured?: boolean;
};

const MIN_SCALE = 0.24;
const MAX_SCALE = 1.65;
const DEFAULT_PAN = { x: -380, y: -90 };
const DEFAULT_SCALE = 0.56;

const caseLayouts: Layout[] = [
  { x: 1260, y: 260, rot: 1.5 },
  { x: 1180, y: 610, rot: -2 },
  { x: 400, y: 580, rot: 1 },
  { x: 1600, y: 900, rot: 2 },
  { x: 310, y: 950, rot: -1.5 },
  { x: 700, y: 1120, rot: 1 },
  { x: 1100, y: 1190, rot: -2 },
];

const worldSize = { width: 3600, height: 2400 };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatDateRange(startDate: string, endDate: string | null, current: boolean) {
  const start = startDate.replace('-', '/');
  if (current) return `${start} -> Present`;
  return `${start} -> ${(endDate ?? '').replace('-', '/')}`;
}

export function CaseBoard({
  bio,
  projects,
  experience,
  education,
  certifications,
}: CaseBoardProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState(DEFAULT_PAN);
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [stringsVisible, setStringsVisible] = useState(true);
  const [clock, setClock] = useState('--:--:--');
  const [modalCase, setModalCase] = useState<CaseItem | null>(null);

  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  const activeDragIdRef = useRef<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const movedRef = useRef(false);

  const panRef = useRef(pan);
  const scaleRef = useRef(scale);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  const cases = useMemo<CaseItem[]>(() => {
    return projects.slice(0, 7).map((project, idx) => ({
      id: `ci-${project.id}`,
      layout: caseLayouts[idx] ?? { x: 900 + idx * 130, y: 650 + idx * 70, rot: 0 },
      title: `${project.name} - ${project.tagline}`,
      num: `CASE #${String(idx + 1).padStart(3, '0')}`,
      status: project.featured ? 'ACTIVE' : 'CLOSED',
      statusClass: project.featured ? (idx < 2 ? 'classified' : 'active') : 'closed',
      desc: project.description,
      tags: project.stack.slice(0, 8),
      featured: project.featured,
    }));
  }, [projects]);

  const staticLayouts = useMemo(() => {
    const entries: Array<{ id: string; layout: Layout }> = [
      { id: 'dossier', layout: { x: 800, y: 300, rot: -1 } },
      { id: 'map', layout: { x: 620, y: 300, rot: -0.5 } },
      { id: 'note-stack', layout: { x: 500, y: 190, rot: 2.8 } },
      { id: 'note-certs', layout: { x: 1540, y: 280, rot: -2 } },
      { id: 'note-languages', layout: { x: 250, y: 370, rot: 1.5 } },
      { id: 'report-exp', layout: { x: 1750, y: 510, rot: 1 } },
      { id: 'report-edu', layout: { x: 250, y: 790, rot: -1 } },
      { id: 'note-contact', layout: { x: 1680, y: 1100, rot: 2 } },
      { id: 'note-interest', layout: { x: 1910, y: 900, rot: -2.5 } },
    ];

    return entries;
  }, []);

  const initialPositions = useMemo<Record<string, Position>>(() => {
    const data: Record<string, Position> = {};
    for (const item of cases) {
      data[item.id] = { x: item.layout.x, y: item.layout.y };
    }
    for (const item of staticLayouts) {
      data[item.id] = { x: item.layout.x, y: item.layout.y };
    }
    return data;
  }, [cases, staticLayouts]);

  const [positions, setPositions] = useState<Record<string, Position>>(initialPositions);

  useEffect(() => {
    setPositions(initialPositions);
  }, [initialPositions]);

  useEffect(() => {
    const updateClock = () => {
      const time = new Intl.DateTimeFormat('en', {
        timeZone: 'Africa/Casablanca',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(new Date());
      setClock(`CASABLANCA: ${time}`);
    };

    updateClock();
    const timer = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      if (activeDragIdRef.current) {
        const rect = viewport.getBoundingClientRect();
        const wx = (event.clientX - rect.left - panRef.current.x) / scaleRef.current;
        const wy = (event.clientY - rect.top - panRef.current.y) / scaleRef.current;

        setPositions((prev) => ({
          ...prev,
          [activeDragIdRef.current as string]: {
            x: wx - dragOffsetRef.current.x,
            y: wy - dragOffsetRef.current.y,
          },
        }));
        movedRef.current = true;
        return;
      }

      if (!isPanning) return;
      setPan({
        x: event.clientX - panStartRef.current.x,
        y: event.clientY - panStartRef.current.y,
      });
    };

    const onMouseUp = () => {
      activeDragIdRef.current = null;
      setIsPanning(false);
      window.setTimeout(() => {
        movedRef.current = false;
      }, 0);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isPanning]);

  const startPan = (event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('.board-item')) return;
    setIsPanning(true);
    panStartRef.current = {
      x: event.clientX - panRef.current.x,
      y: event.clientY - panRef.current.y,
    };
  };

  const startDrag = (id: string, event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.stopPropagation();

    const viewport = viewportRef.current;
    const item = event.currentTarget;
    if (!viewport || !item) return;

    const rect = item.getBoundingClientRect();
    activeDragIdRef.current = id;
    movedRef.current = false;

    dragOffsetRef.current = {
      x: (event.clientX - rect.left) / scaleRef.current,
      y: (event.clientY - rect.top) / scaleRef.current,
    };
  };

  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();

    const viewport = viewportRef.current;
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;
    const wx = (mx - panRef.current.x) / scaleRef.current;
    const wy = (my - panRef.current.y) / scaleRef.current;

    const factor = event.deltaY > 0 ? 0.92 : 1.08;
    const nextScale = clamp(scaleRef.current * factor, MIN_SCALE, MAX_SCALE);

    setScale(nextScale);
    setPan({
      x: mx - wx * nextScale,
      y: my - wy * nextScale,
    });
  };

  const zoomBy = (factor: number) => {
    setScale((prev) => clamp(prev * factor, MIN_SCALE, MAX_SCALE));
  };

  const resetView = () => {
    setPan(DEFAULT_PAN);
    setScale(DEFAULT_SCALE);
  };

  const lines = useMemo(() => {
    const defs = [
      ['ci-ostora', 'ci-arch-x7', '#c0392b'],
      ['ci-arch-x7', 'ci-scan-ocr', '#c0392b'],
      ['ci-ostora', 'ci-eventra', '#2d5a8b'],
      ['ci-healthpulse', 'ci-loughat', '#c0392b'],
      ['ci-loughat', 'ci-walletly', '#9b7d5a'],
      ['ci-eventra', 'ci-walletly', '#2d5a8b'],
      ['ci-arch-x7', 'ci-eventra', '#c0392b'],
    ] as const;

    return defs
      .map(([from, to, color], idx) => {
        const a = positions[from];
        const b = positions[to];
        if (!a || !b) return null;

        const p1 = { x: a.x + 110, y: a.y + 18 };
        const p2 = { x: b.x + 110, y: b.y + 18 };
        const cpX = (p1.x + p2.x) / 2 + Math.sin(idx * 1.3) * 50;
        const cpY = Math.min(p1.y, p2.y) - 40 - Math.cos(idx * 0.8) * 30;

        return {
          id: `${from}-${to}`,
          d: `M${p1.x},${p1.y} Q${cpX},${cpY} ${p2.x},${p2.y}`,
          color,
        };
      })
      .filter(Boolean) as Array<{ id: string; d: string; color: string }>;
  }, [positions]);

  const exp = experience[0];
  const certs = certifications.slice(0, 3);

  return (
    <div className="caseboard-root">
      <div className="caseboard-hud">
        <div className="caseboard-hud-left">CLASSIFIED - CASE BOARD / ZK97</div>
        <div className="caseboard-hud-center">DRAG TO EXPLORE / SCROLL TO ZOOM / CLICK CASES FOR INTEL</div>
        <div className="caseboard-hud-right">{clock}</div>
      </div>

      <div className="caseboard-controls">
        <button className="caseboard-btn" onClick={resetView}>RESET VIEW</button>
        <div className="caseboard-sep" />
        <button className="caseboard-btn" onClick={() => zoomBy(1.15)}>ZOOM +</button>
        <div className="caseboard-zoom">{Math.round(scale * 100)}%</div>
        <button className="caseboard-btn" onClick={() => zoomBy(0.87)}>ZOOM -</button>
        <div className="caseboard-sep" />
        <button className="caseboard-btn" onClick={() => setStringsVisible((prev) => !prev)}>
          STRINGS: {stringsVisible ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="caseboard-hint">DRAG THE BOARD TO INVESTIGATE / SCROLL TO FOCUS</div>

      <div
        ref={viewportRef}
        className={`caseboard-viewport ${isPanning ? 'is-grabbing' : ''}`}
        onMouseDown={startPan}
        onWheel={onWheel}
      >
        <div
          className="caseboard-world"
          style={{
            width: `${worldSize.width}px`,
            height: `${worldSize.height}px`,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          }}
        >
          <div className="caseboard-cork" />

          <svg className="caseboard-strings" aria-hidden="true">
            {stringsVisible &&
              lines.map((line) => (
                <path
                  key={line.id}
                  d={line.d}
                  stroke={line.color}
                  strokeWidth="1.8"
                  fill="none"
                  opacity="0.75"
                  strokeDasharray="4 3"
                />
              ))}
          </svg>

          <div
            className="board-item dossier-card"
            onMouseDown={(e) => startDrag('dossier', e)}
            style={{
              left: `${positions.dossier?.x ?? 0}px`,
              top: `${positions.dossier?.y ?? 0}px`,
              transform: `rotate(${staticLayouts.find((x) => x.id === 'dossier')?.layout.rot ?? 0}deg)`,
            }}
          >
            <div className="dos-header">
              <div className="dos-meta">FILE: ZK-2026-0001<br />CLEARANCE: TOP</div>
              <div className="dos-agency">ZK97</div>
            </div>
            <div className="dos-name">{bio.name}</div>
            <div className="dos-body">
              <div className="dos-photo">PROFILE</div>
              <div className="dos-fields">
                <div className="dos-label">Specialization</div>
                <div className="dos-val">{bio.title}</div>
                <div className="dos-label">Location</div>
                <div className="dos-val">{bio.location.city}, {bio.location.country}</div>
                <div className="dos-label">Target</div>
                <div className="dos-val dos-green">{bio.location.relocationTarget}</div>
                <div className="dos-label">Tagline</div>
                <div className="dos-val">{bio.tagline}</div>
              </div>
            </div>
            <div className="dos-badge">
              <span className="pulse-dot" />
              {bio.availableForWork ? 'AVAILABLE FOR HIRE - OPEN TO RELOCATION' : 'CURRENTLY UNAVAILABLE'}
            </div>
            <div className="dos-stamp">CLEARED</div>
          </div>

          {cases.map((item) => (
            <div
              key={item.id}
              className={`board-item case-card ${item.featured ? 'is-featured' : ''}`}
              onMouseDown={(e) => startDrag(item.id, e)}
              onClick={() => {
                if (!movedRef.current) setModalCase(item);
              }}
              style={{
                left: `${positions[item.id]?.x ?? item.layout.x}px`,
                top: `${positions[item.id]?.y ?? item.layout.y}px`,
                transform: `rotate(${item.layout.rot}deg)`,
              }}
            >
              <div className="pin"><span className="pin-head" /><span className="pin-shaft" /></div>
              <div className="case-tab">
                <span className="case-num">{item.num}</span>
                <span className={`case-status status-${item.statusClass}`}>{item.status}</span>
              </div>
              <div className="case-body">
                <div className="case-title">{item.title}</div>
                <div className="case-desc">{item.desc}</div>
                <div className="case-tags">
                  {item.tags.slice(0, 6).map((tag) => (
                    <span key={tag} className="case-tag">{tag}</span>
                  ))}
                </div>
                {item.featured && <div className="case-stamp">FEATURED</div>}
              </div>
            </div>
          ))}

          <div
            className="board-item note-card"
            onMouseDown={(e) => startDrag('note-stack', e)}
            style={{
              left: `${positions['note-stack']?.x ?? 0}px`,
              top: `${positions['note-stack']?.y ?? 0}px`,
              transform: `rotate(${staticLayouts.find((x) => x.id === 'note-stack')?.layout.rot ?? 0}deg)`,
            }}
          >
            <strong>Primary Arsenal</strong>
            {projects[0]?.stack.slice(0, 8).map((tech) => (
              <div key={tech}>{tech}</div>
            ))}
          </div>

          <div
            className="board-item note-card is-alt"
            onMouseDown={(e) => startDrag('note-certs', e)}
            style={{
              left: `${positions['note-certs']?.x ?? 0}px`,
              top: `${positions['note-certs']?.y ?? 0}px`,
              transform: `rotate(${staticLayouts.find((x) => x.id === 'note-certs')?.layout.rot ?? 0}deg)`,
            }}
          >
            <strong>Clearances Held</strong>
            {certs.map((cert) => (
              <div key={cert.id}>{cert.name} ({cert.year})</div>
            ))}
          </div>

          <div
            className="board-item note-card is-paper"
            onMouseDown={(e) => startDrag('note-languages', e)}
            style={{
              left: `${positions['note-languages']?.x ?? 0}px`,
              top: `${positions['note-languages']?.y ?? 0}px`,
              transform: `rotate(${staticLayouts.find((x) => x.id === 'note-languages')?.layout.rot ?? 0}deg)`,
            }}
          >
            <strong>Languages</strong>
            {bio.languages.map((lang) => (
              <div key={lang.code}>{lang.name} - {lang.level}</div>
            ))}
          </div>

          <div
            className="board-item report-card"
            onMouseDown={(e) => startDrag('report-exp', e)}
            style={{
              left: `${positions['report-exp']?.x ?? 0}px`,
              top: `${positions['report-exp']?.y ?? 0}px`,
              transform: `rotate(${staticLayouts.find((x) => x.id === 'report-exp')?.layout.rot ?? 0}deg)`,
            }}
          >
            <div className="report-head">FIELD REPORT</div>
            {exp && (
              <>
                <div className="report-line"><strong>ROLE:</strong> {exp.role}</div>
                <div className="report-line"><strong>TEAM:</strong> {exp.company}</div>
                <div className="report-line"><strong>TYPE:</strong> {exp.type}</div>
                <div className="report-line report-hot"><strong>PERIOD:</strong> {formatDateRange(exp.startDate, exp.endDate, exp.current)}</div>
                {exp.bullets.slice(0, 2).map((bullet) => (
                  <div key={bullet} className="report-line">- {bullet}</div>
                ))}
              </>
            )}
          </div>

          <div
            className="board-item report-card"
            onMouseDown={(e) => startDrag('report-edu', e)}
            style={{
              left: `${positions['report-edu']?.x ?? 0}px`,
              top: `${positions['report-edu']?.y ?? 0}px`,
              transform: `rotate(${staticLayouts.find((x) => x.id === 'report-edu')?.layout.rot ?? 0}deg)`,
            }}
          >
            <div className="report-head">TRAINING RECORDS</div>
            {education.slice(0, 4).map((entry) => (
              <div key={entry.id} className="report-line">
                {entry.degree} - {entry.institution}
              </div>
            ))}
          </div>

          <div
            className="board-item note-card is-contact"
            onMouseDown={(e) => startDrag('note-contact', e)}
            style={{
              left: `${positions['note-contact']?.x ?? 0}px`,
              top: `${positions['note-contact']?.y ?? 0}px`,
              transform: `rotate(${staticLayouts.find((x) => x.id === 'note-contact')?.layout.rot ?? 0}deg)`,
            }}
          >
            <strong>Contact Intel</strong>
            <div>{bio.contact.email}</div>
            <div>{bio.contact.phone}</div>
            <div>{bio.contact.github.replace('https://', '')}</div>
            <div>{bio.contact.linkedin.replace('https://', '')}</div>
          </div>

          <div
            className="board-item note-card is-green"
            onMouseDown={(e) => startDrag('note-interest', e)}
            style={{
              left: `${positions['note-interest']?.x ?? 0}px`,
              top: `${positions['note-interest']?.y ?? 0}px`,
              transform: `rotate(${staticLayouts.find((x) => x.id === 'note-interest')?.layout.rot ?? 0}deg)`,
            }}
          >
            <strong>Subject Interests</strong>
            {bio.interests.slice(0, 5).map((interest) => (
              <div key={interest.label}>{interest.label}</div>
            ))}
          </div>

          <div
            className="board-item map-card"
            onMouseDown={(e) => startDrag('map', e)}
            style={{
              left: `${positions.map?.x ?? 0}px`,
              top: `${positions.map?.y ?? 0}px`,
              transform: `rotate(${staticLayouts.find((x) => x.id === 'map')?.layout.rot ?? 0}deg)`,
            }}
          >
            <div className="map-inner">
              <span className="map-ring ring-a" />
              <span className="map-ring ring-b" />
              <span className="map-ring ring-c" />
            </div>
            <div className="map-label">OPERATION ZONES - {bio.location.city.toUpperCase()} TO {bio.location.relocationTarget.toUpperCase()}</div>
          </div>
        </div>
      </div>

      {modalCase && (
        <div className="case-modal" onClick={() => setModalCase(null)}>
          <div className="case-modal-inner" onClick={(e) => e.stopPropagation()}>
            <div className="case-modal-header">
              <div className="case-modal-title">{modalCase.title}</div>
              <button className="case-modal-close" onClick={() => setModalCase(null)}>CLOSE</button>
            </div>
            <div className="case-modal-body">
              <div className="case-modal-num">{modalCase.num}</div>
              <p className="case-modal-desc">{modalCase.desc}</p>
              <div className="case-modal-tags">
                {modalCase.tags.map((tag) => (
                  <span key={tag} className="case-tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

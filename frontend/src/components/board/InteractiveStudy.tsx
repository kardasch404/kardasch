'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { chessPiece } from './chess-pieces';
import { Chess } from 'chess.js';
import type { Bio } from '@/schemas/bio.schema';
import type { Project } from '@/schemas/project.schema';
import type { GeneralData, GeneralEntry } from '@/schemas/general.schema';
import { mapPoint } from './JourneyMap';
import type { Locale } from './CvLebenslauf';
import translations from '@/data/translations.json';

export type RoomEvent = { id: string; title: string; description: string; date: string | null; venue: string | null; city?: string | null; locationId?: string | null; recordType?: 'presentations' | 'events'; outline?: string[]; topics?: string[]; team?: string[]; projectId?: string; links?: GeneralEntry['links']; videos?: GeneralEntry['media']['videos']; photos: { url: string; alt: string; caption: string }[] };
export type RoomFile = { kind: 'project'; id: string } | { kind: 'event'; id: string } | { kind: 'map'; city?: string } | { kind: 'resume' | 'archive' | 'contact' | 'computer' | 'events' | 'education' | 'chess' };
type Props = { general: GeneralData; bio: Bio; projects: Project[]; events: RoomEvent[]; locale?: Locale; resetTrigger?: number; cameraView?: { preset: 'board' | 'desk' | 'chess' | 'room'; seq: number }; lampOn: boolean; stringsOn: boolean; computerOn: boolean; onPowerToggle: () => void; onLampToggle: () => void; onOpen: (file: RoomFile) => void; onReady: (ready: boolean) => void };
type ItemInfo = { id: string; label: string; surface: 'board' | 'desk' | 'floor'; file?: RoomFile; isLamp?: boolean; seat?: boolean };
type Entity = ItemInfo & { root: THREE.Group; home: THREE.Vector3; rotation: THREE.Euler; size?: [number, number] };
type Runtime = { select: (id: string) => void; take: () => void; turn: (direction: number) => void; move: (x: number, y: number) => void; reset: () => void; view: () => void; board: () => void; desk: () => void; chess: () => void; sit: () => void };
const savedLayoutKey = 'kardache-interactive-study-v15';

export default function InteractiveStudy({ general, bio, projects, events, locale = 'de', resetTrigger = 0, cameraView, lampOn, stringsOn, computerOn, onPowerToggle, onLampToggle, onOpen, onReady }: Props) {
  const canvasHost = useRef<HTMLDivElement>(null);
  const runtime = useRef<Runtime | null>(null);
  const callbacks = useRef({ lampOn, stringsOn, computerOn, onPowerToggle, onOpen, onReady, onLampToggle });
  const [selected, setSelected] = useState<ItemInfo | null>(null);
  const [held, setHeld] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [objectList, setObjectList] = useState<ItemInfo[]>([]);
  const t = translations[locale].ui;
  const projectLocs = translations[locale].projects as Record<string, { category?: string; shortDescription?: string; tagline?: string }>;
  const eventLocs = translations[locale].events as Record<string, { title?: string; description?: string }>;
  const cvData = translations[locale].cv;
  useEffect(() => { callbacks.current = { lampOn, stringsOn, computerOn, onPowerToggle, onOpen, onReady, onLampToggle }; }, [lampOn, stringsOn, computerOn, onPowerToggle, onOpen, onReady, onLampToggle]);
  useEffect(() => { if (resetTrigger > 0) { runtime.current?.reset(); runtime.current?.board(); } }, [resetTrigger]);
  useEffect(() => {
    if (!cameraView || cameraView.seq === 0) return;
    if (cameraView.preset === 'board') runtime.current?.board();
    else if (cameraView.preset === 'desk') runtime.current?.desk();
    else if (cameraView.preset === 'chess') runtime.current?.chess();
    else if (cameraView.preset === 'room') runtime.current?.view();
  }, [cameraView]);

  useEffect(() => {
    const host = canvasHost.current;
    if (!host) return;
    let disposed = false;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' }); }
    catch { setFailed(true); callbacks.current.onReady(false); return; }
    // Never drop below 1: browser zoom-out (Ctrl -) lowers devicePixelRatio and made the 3D canvas blurry/pixelated.
    const sharpPixelRatio = () => THREE.MathUtils.clamp(window.devicePixelRatio || 1, 1, 1.75);
    renderer.setPixelRatio(sharpPixelRatio());
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.domElement.setAttribute('aria-label', 'Interactive 3D detective room. Use the object menu below for keyboard controls.');
    renderer.domElement.setAttribute('role', 'img');
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#111610');
    // Fog/far plane pushed back so zooming far out keeps the room visible instead of fading into fog.
    scene.fog = new THREE.Fog('#111610', 38, 80);
    const camera = new THREE.PerspectiveCamera(44, 1, .1, 120);
    const defaultCamera = new THREE.Vector3(.2, 6.9, 17.2);
    const defaultTarget = new THREE.Vector3(0, 5.7, -1.2);
    camera.position.copy(defaultCamera);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(defaultTarget);
    controls.enableDamping = true;
    controls.dampingFactor = .085;
    controls.enablePan = true;
    controls.screenSpacePanning = true;
    controls.panSpeed = 1.0;
    controls.rotateSpeed = .75;
    controls.zoomSpeed = 1.35;
    controls.enableZoom = true;
    controls.zoomToCursor = true; // wheel/pinch zooms toward the card under the mouse
    controls.minDistance = 2.0;
    controls.maxDistance = 45;
    controls.minPolarAngle = Math.PI * .05;
    controls.maxPolarAngle = Math.PI * .75;
    controls.minAzimuthAngle = -1.8;
    controls.maxAzimuthAngle = 1.8;
    controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
    controls.mouseButtons.MIDDLE = THREE.MOUSE.DOLLY;
    controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
    controls.touches.ONE = THREE.TOUCH.ROTATE;
    controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
    const materials = new Set<THREE.Material>();
    const textures = new Set<THREE.Texture>();
    const entities: Entity[] = [];
    let active: Entity | null = null;
    let picked: Entity | null = null;
    let pickedFrom: THREE.Vector3 | null = null;
    let drag: { entity: Entity; plane: THREE.Plane; offset: THREE.Vector3; x: number; y: number; moved: boolean } | null = null;
    let threadsDirty = true;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const hit = new THREE.Vector3();
    const motions = new Map<Entity, { position: THREE.Vector3; quaternion: THREE.Quaternion }>();
    let cameraMove: { position: THREE.Vector3; target: THREE.Vector3 } | null = null;
    function material(options: THREE.MeshStandardMaterialParameters) { const mat = new THREE.MeshStandardMaterial(options); materials.add(mat); return mat; }
    function mesh(geometry: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D, position: [number, number, number] = [0, 0, 0]) {
      const object = new THREE.Mesh(geometry, mat); object.position.set(...position); object.castShadow = true; object.receiveShadow = true; parent.add(object); return object;
    }
    function box(w: number, h: number, d: number, mat: THREE.Material, parent: THREE.Object3D, p: [number, number, number]) { return mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(w, h, d, .24) * .15), mat, parent, p); }
    function texture(canvas: HTMLCanvasElement) { const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8); textures.add(map); return map; }
    function patternedTexture(kind: 'wood' | 'cork') {
      const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = kind === 'wood' ? '#66432a' : '#8e6840'; ctx.fillRect(0, 0, 512, 512);
      let seed = 17;
      const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      for (let i = 0; i < (kind === 'wood' ? 1700 : 12000); i++) {
        ctx.fillStyle = `rgba(${random() > .5 ? '16,7,2' : '220,174,112'},${random() * .23})`;
        const x = random() * 512, y = random() * 512;
        ctx.fillRect(x, y, kind === 'wood' ? 25 + random() * 260 : 1 + random() * 3, kind === 'wood' ? .3 + random() * 1.5 : 1 + random() * 3);
      }
      const map = texture(canvas); map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(kind === 'wood' ? 2 : 3, kind === 'wood' ? 2 : 2); return map;
    }
    const wood = material({ map: patternedTexture('wood'), color: '#b5a082', roughness: .65 });
    const darkWood = material({ color: '#302116', roughness: .65 });
    const brass = material({ color: '#ae8644', metalness: .78, roughness: .28 });
    const black = material({ color: '#161c18', metalness: .3, roughness: .4 });
    const cream = material({ color: '#aca58c', roughness: .7 });
    const paperEdge = material({ color: '#c9bd9e', roughness: 1 });
    const wall = material({ color: '#45503b', roughness: 1 });
    box(24, 14, .3, wall, scene, [0, 6, -2.2]);
    box(.3, 14, 15, wall, scene, [-11.8, 6, 4]);
    box(.3, 14, 15, wall, scene, [11.8, 6, 4]);
    const floorMesh = box(24, .15, 16, wood, scene, [0, -.25, 4]);
    floorMesh.userData.roomSurface = 'floor';
    for (let x = -8; x <= 8; x += .8) box(.012, .006, 16, darkWood, scene, [x, -.168, 4]);
    for (const x of [-8.6, 8.6]) box(.15, .22, 14, darkWood, scene, [x, -.04, 4]);
    box(18, .22, .15, darkWood, scene, [0, -.04, -1.98]);
    box(.2, 4.1, 2.1, darkWood, scene, [8.55, 1.9, 5.8]);
    box(.21, 3.8, 1.8, wood, scene, [8.42, 1.9, 5.8]);
    mesh(new THREE.SphereGeometry(.08, 16, 12), brass, scene, [8.25, 1.8, 5.2]);
    box(.22, .32, .04, cream, scene, [-5.3, .8, -1.98]);
    for (const x of [-5.34, -5.26]) box(.018, .055, .045, black, scene, [x, .82, -1.95]);
    const cable = new THREE.CatmullRomCurve3([new THREE.Vector3(-5.3,.8,-1.92),new THREE.Vector3(-5.1,.3,-1),new THREE.Vector3(-4.7,.7,.1),new THREE.Vector3(-4.6,1.7,.2)]);
    mesh(new THREE.TubeGeometry(cable, 32, .022, 7, false), black, scene);
    const boardWidth = Math.max(general.board.width, 17.2), boardHeight = general.board.height, boardCenter = general.board.centerY;
    const board = box(boardWidth, boardHeight, .15, material({ map: patternedTexture('cork'), roughness: 1 }), scene, [0, boardCenter, -1.95]);
    board.receiveShadow = true;
    board.userData.roomSurface = 'board';
    for (const y of [boardCenter - boardHeight / 2 - .1, boardCenter + boardHeight / 2 + .1]) box(boardWidth + .4, .2, .32, wood, scene, [0, y, -1.9]);
    for (const x of [-boardWidth / 2 - .1, boardWidth / 2 + .1]) box(.2, boardHeight + .4, .32, wood, scene, [x, boardCenter, -1.9]);
    const deskTop = box(19.2, .25, 4, wood, scene, [0, 1.24, .6]);
    deskTop.userData.roomSurface = 'desk';
    for (const x of [-8.5, 8.5]) for (const z of [-.8, 2]) box(.25, 1.3, .25, darkWood, scene, [x, .5, z]);
    for (const x of [-10.35, 10.35]) {
      box(1.65, 7.6, .1, darkWood, scene, [x, 3.7, -1.8]);
      for (const shelfY of [.8, 2.4, 4, 5.6, 7.2]) {
        box(1.8, .11, 1.1, wood, scene, [x, shelfY, -1.45]);
        for (let j = 0; j < 5; j++) {
          const bookMat = material({ color: ['#4b4630', '#3b3329', '#555443', '#543329', '#28372e'][j], roughness: .85 });
          const book = box(.18 + (j % 2) * .06, .7 + (j % 3) * .15, .6, bookMat, scene, [x - .65 + j * .28, shelfY + .5, -1.4]);
          book.rotation.z = (j - 2) * .03;
        }
      }
    }
    const ambient = new THREE.HemisphereLight('#d2dec4', '#362416', 1.8); scene.add(ambient);
    const fill = new THREE.DirectionalLight('#d4d4bb', 1.7); fill.position.set(-6, 7, 7); scene.add(fill);
    const spot = new THREE.SpotLight('#ffd397', 95, 20, Math.PI / 3.2, .65, 1.5);
    spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -.0002; spot.shadow.normalBias = .015; spot.shadow.radius = 3;
    spot.target.position.set(0, 4, -1.85); scene.add(spot.target);
    const screenLight = new THREE.PointLight('#85d0a5', 4, 4, 2); screenLight.position.set(-4.6, 2.6, 1.5); scene.add(screenLight);

    function register(info: ItemInfo, root: THREE.Group, position: [number, number, number], size?: [number, number]) {
      root.position.set(...position); scene.add(root);
      const entity: Entity = { ...info, root, home: root.position.clone(), rotation: root.rotation.clone(), size };
      root.userData.entity = entity; entities.push(entity); return entity;
    }
    function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number) {
      let line = '', count = 0;
      for (const word of text.split(/\s+/)) {
        if (ctx.measureText(`${line}${word} `).width > maxWidth && line) {
          ctx.fillText(line.trim(), x, y); y += lineHeight; line = ''; count++;
          if (count >= maxLines) return y;
        }
        line += `${word} `;
      }
      if (line && count < maxLines) ctx.fillText(line.trim(), x, y);
      return y + lineHeight;
    }
    const cardRedraws = new Map<string, (isSelected: boolean, isHovered: boolean) => void>();

    function drawBurntVintagePaper(ctx: CanvasRenderingContext2D, w: number, h: number, isSelected: boolean, isHovered: boolean) {
      // Warm vintage parchment base
      ctx.fillStyle = isSelected ? '#f5ebd6' : isHovered ? '#f1e5ce' : '#eadbc0';
      ctx.fillRect(0, 0, w, h);

      // Subtle paper diagonal crease & warm lighting gradient
      const crease = ctx.createLinearGradient(0, 0, w, h);
      crease.addColorStop(0, 'rgba(255, 250, 238, 0.38)');
      crease.addColorStop(0.46, 'rgba(210, 185, 145, 0.08)');
      crease.addColorStop(0.5, 'rgba(130, 95, 55, 0.16)');
      crease.addColorStop(0.54, 'rgba(255, 248, 232, 0.22)');
      crease.addColorStop(1, 'rgba(145, 108, 65, 0.25)');
      ctx.fillStyle = crease;
      ctx.fillRect(0, 0, w, h);

      // Burnt / aged vignette around edges (matching reference image)
      const vignette = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.34, w * 0.5, h * 0.5, Math.max(w, h) * 0.73);
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(0.72, 'rgba(120, 82, 42, 0.16)');
      vignette.addColorStop(0.92, 'rgba(78, 48, 22, 0.48)');
      vignette.addColorStop(1, 'rgba(38, 20, 8, 0.78)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      // Dark singed outer rim
      ctx.strokeStyle = '#3b2412';
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, w - 10, h - 10);

      // Inner investigation frame
      if (isSelected) {
        ctx.strokeStyle = '#8e2418';
        ctx.lineWidth = 5;
        ctx.strokeRect(24, 24, w - 48, h - 48);
        ctx.strokeStyle = '#c89d3c';
        ctx.lineWidth = 2;
        ctx.strokeRect(32, 32, w - 64, h - 64);
      } else if (isHovered) {
        ctx.strokeStyle = '#8e2418';
        ctx.lineWidth = 3.5;
        ctx.strokeRect(24, 24, w - 48, h - 48);
      } else {
        ctx.strokeStyle = 'rgba(92, 68, 40, 0.55)';
        ctx.lineWidth = 2;
        ctx.strokeRect(26, 26, w - 52, h - 52);
      }
    }

    function addPaper(info: ItemInfo, title: string, subtitle: string, footer: string, position: [number, number, number], size: [number, number], angle = 0, imageUrl?: string, project?: Project, caseIndex = 0) {
      const root = new THREE.Group(); root.rotation.z = angle;
      const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = Math.round(768 * size[1] / size[0]);
      const ctx = canvas.getContext('2d')!;
      const map = texture(canvas);

      const draw = (isSelected = false, isHovered = false) => {
        const w = canvas.width, h = canvas.height;
        drawBurntVintagePaper(ctx, w, h, isSelected, isHovered);

        if (info.id === 'profile') {
          ctx.fillStyle = '#7c2418';
          ctx.font = 'bold 17px monospace';
          ctx.fillText(t.cardSubjectHeader, 40, 46);
          ctx.fillStyle = '#5c4832';
          ctx.font = 'bold 16px monospace';
          ctx.fillText('CASABLANCA, MA', w - 185, 46);

          ctx.fillStyle = '#1b120a';
          ctx.font = 'bold 48px Georgia, serif';
          ctx.fillText(title, 40, 102);

          ctx.fillStyle = '#3f2e1d';
          ctx.font = 'bold 19px monospace';
          wrap(ctx, footer, 40, 136, w - 80, 24, 1);

          // Real vector brand icons in warm archive palette (LinkedIn, GitHub, Xing, Mail)
          const badges = [
            {
              label: 'LinkedIn',
              bg: '#2b1e14',
              path: 'M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z',
            },
            {
              label: 'GitHub',
              bg: '#1f1914',
              path: 'M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z',
            },
            {
              label: 'Xing',
              bg: '#382a1b',
              path: 'M18.188 0c-.517 0-.741.325-.927.66 0 0-7.455 13.224-7.702 13.657.015.024 4.919 9.023 4.919 9.023.17.308.436.66.967.66h3.454c.211 0 .375-.078.463-.22.089-.151.089-.346-.009-.536l-4.879-8.916c-.004-.006-.004-.016 0-.022L22.139.756c.095-.191.097-.387.006-.535C22.056.078 21.894 0 21.686 0h-3.498zM3.648 4.74c-.211 0-.385.074-.473.216-.09.149-.078.339.02.531l2.34 4.05c.004.01.004.016 0 .021L1.86 16.051c-.099.188-.093.381 0 .529.085.142.239.234.45.234h3.461c.518 0 .766-.348.945-.667l3.734-6.609-2.378-4.155c-.172-.315-.434-.659-.962-.659H3.648v.016z',
            },
            {
              label: 'Contact & CV',
              bg: '#7c2418',
              path: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z',
            },
          ];
          let bx = 40;
          const by = h - 66;
          const bh = 42;
          for (const b of badges) {
            ctx.font = 'bold 16.5px monospace';
            const textW = ctx.measureText(b.label).width;
            const bw = 44 + textW + 18;
            ctx.fillStyle = 'rgba(246, 236, 214, 0.96)';
            ctx.strokeStyle = '#7a5c38';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.rect(bx, by, bw, bh);
            ctx.fill();
            ctx.stroke();

            // Warm archive-toned icon box with real vector SVG path
            ctx.fillStyle = b.bg;
            ctx.fillRect(bx + 5, by + 5, 32, bh - 10);
            ctx.save();
            ctx.translate(bx + 9, by + 9);
            ctx.scale(1.0, 1.0);
            ctx.fillStyle = '#f7ecd5';
            ctx.fill(new Path2D(b.path));
            ctx.restore();

            // Label
            ctx.fillStyle = '#1e150c';
            ctx.font = 'bold 16px monospace';
            ctx.fillText(b.label, bx + 44, by + 27);
            bx += bw + 11;
          }
          map.needsUpdate = true;
          return;
        }

        if (h / w < .65) {
          const fontSize = Math.min(44, h * .21);
          ctx.fillStyle = '#7c2418'; ctx.font = `bold ${Math.min(18, h * .11)}px monospace`; ctx.fillText(t.cardSubjectHeader, 44, h * .2);
          ctx.fillStyle = '#1f160e'; ctx.font = `bold ${fontSize}px Georgia`; wrap(ctx, title, 44, h * .46, w - 88, fontSize * 1.12, 2);
          ctx.fillStyle = '#4e3b26'; ctx.font = `bold ${Math.min(21, h * .12)}px monospace`; wrap(ctx, footer, 44, h * .86, w - 88, 24, 1);
          map.needsUpdate = true;
          return;
        }

        if (project) {
          const pLoc = projectLocs?.[project.id];
          // 1. Project ID (CASE-001) & Selected badge
          const caseCode = `CASE-${String(caseIndex + 1).padStart(3, '0')}`;
          ctx.fillStyle = '#8e2216';
          ctx.font = 'bold 30px monospace';
          ctx.fillText(caseCode, 48, 86);

          if (isSelected) {
            ctx.fillStyle = '#8e2216';
            ctx.fillRect(w - 235, 54, 187, 40);
            ctx.fillStyle = '#fff8eb';
            ctx.font = 'bold 20px monospace';
            ctx.fillText(t.cardSelectedBadge, w - 215, 81);
          } else if (project.repositories && project.repositories.length > 0) {
            ctx.fillStyle = '#2b1e14';
            ctx.strokeStyle = '#d4af37';
            ctx.lineWidth = 2;
            ctx.fillRect(w - 265, 54, 217, 38);
            ctx.strokeRect(w - 265, 54, 217, 38);
            ctx.fillStyle = '#f4e8ce';
            ctx.font = 'bold 17px monospace';
            ctx.fillText(`${project.repositories.length} MICROSERVICES`, w - 251, 79);
          }

          // 2. Category (e.g. Backend Engineering)
          const categoryLabel = (pLoc?.category || project.category || project.type || 'Engineering').toUpperCase();
          ctx.fillStyle = '#5a4328';
          ctx.font = 'bold 22px monospace';
          ctx.fillText(categoryLabel, 48, 128);

          // Divider line
          ctx.strokeStyle = 'rgba(90, 67, 40, 0.45)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(48, 150);
          ctx.lineTo(w - 48, 150);
          ctx.stroke();

          // 3. Project Name (Large & Crystal Clear from afar)
          ctx.fillStyle = '#181109';
          const titleFontSize = title.length > 11 ? 66 : 76;
          ctx.font = `bold ${titleFontSize}px Georgia, serif`;
          let y = wrap(ctx, title, 48, 232, w - 96, titleFontSize * 1.08, 2) + 12;

          // 4. Concise Description (Large & Readable)
          const cleanDesc = pLoc?.shortDescription || project.shortDescription || subtitle;
          ctx.fillStyle = '#362718';
          ctx.font = '36px Georgia, serif';
          y = wrap(ctx, cleanDesc, 48, y + 6, w - 96, 46, 2) + 20;

          // 5. Stack (Top 3 technologies separated by middle dot)
          const stackLine = project.stack.slice(0, 3).join(' · ');
          ctx.fillStyle = '#253627';
          ctx.font = 'bold 26px monospace';
          wrap(ctx, stackLine, 48, h - 165, w - 96, 34, 2);

          // 6. Action Button (OPEN CASE FILE ->)
          const btnX = 48, btnY = h - 116, btnW = w - 96, btnH = 68;
          ctx.fillStyle = (isSelected || isHovered) ? '#8e2216' : '#dfd0b2';
          ctx.strokeStyle = (isSelected || isHovered) ? '#d4af37' : '#3a2817';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.rect(btnX, btnY, btnW, btnH);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = (isSelected || isHovered) ? '#fff9ed' : '#24180c';
          ctx.font = 'bold 26px monospace';
          ctx.fillText(t.cardOpenCaseBtn, btnX + 28, btnY + 43);
        } else {
          ctx.fillStyle = '#7b5439'; ctx.font = 'bold 20px monospace';
          ctx.fillText(t.cardArchiveHeader, 48, 74);
          let y = 140;
          ctx.fillStyle = '#20170e'; ctx.font = 'bold 58px Georgia';
          y = wrap(ctx, title, 48, y, w - 96, 64, 2) + 16;
          ctx.fillStyle = '#3d2e1e'; ctx.font = '30px Georgia';
          wrap(ctx, subtitle, 48, y, w - 96, 38, 3);
          ctx.fillStyle = '#5c4b32'; ctx.font = 'bold 22px monospace';
          wrap(ctx, footer, 48, h - 105, w - 96, 28, 2);
          ctx.fillStyle = '#8e2216'; ctx.font = 'bold 22px monospace';
          ctx.fillText(t.cardOpenDossierBtn, 48, h - 46);
        }
        map.needsUpdate = true;
      };

      draw(false, false);
      cardRedraws.set(info.id, draw);

      const mat = material({ map, roughness: .92, side: THREE.DoubleSide });
      const paper = box(size[0], size[1], .02, mat, root, [0, 0, 0]);
      paper.receiveShadow = true;
      paper.castShadow = true;
      const pin = mesh(new THREE.SphereGeometry(.052, 16, 12), material({ color: '#b52b1d', roughness: .28, metalness: .25 }), root, [0, size[1] / 2 - .07, .07]);
      pin.castShadow = true;
      root.userData.anchor = pin;
      return register(info, root, position, size);
    }
    const cardZ = -1.75;
    addPaper({ id: 'profile', label: bio.name, surface: 'board', file: { kind: 'contact' } }, bio.name, cvData.title, cvData.title, [0, 10.05, cardZ + .12], [3.95, 1.24], -.012);
    const projSpacing = projects.length > 8 ? 14.7 / Math.max(1, projects.length - 1) : 1.77;
    const projStartX = projects.length > 8 ? -7.35 : -6.2;
    const projCardW = projects.length > 8 ? 1.54 : 1.65;
    const projCardH = projects.length > 8 ? 1.58 : 1.6;
    projects.forEach((project, index) => {
      addPaper(
        { id: `project-${project.id}`, label: project.name, surface: 'board', file: { kind: 'project', id: project.id } },
        project.name,
        project.tagline,
        project.stack.slice(0, 3).join(' · '),
        [projStartX + index * projSpacing, 2.62 + index % 2 * .06, cardZ + .14],
        [projCardW, projCardH],
        (index % 2 ? 1 : -1) * .025,
        undefined,
        project,
        index
      );
    });
    const mapRoot = new THREE.Group();
    const mapCanvas = document.createElement('canvas'); mapCanvas.width = 1200; mapCanvas.height = 1300; const mapContext = mapCanvas.getContext('2d')!;
    mapContext.fillStyle = '#ba935e'; mapContext.fillRect(0, 0, 1200, 1300);
    const mapTexture = texture(mapCanvas);
    const actualMap = new Image();
    const complyImg = new Image();
    const alxImg = new Image();
    const youcodeImg = new Image();
    const fsbmImg = new Image();

    const mapPixel = (location: GeneralData['locations'][number]) => {
      const point = mapPoint(location.coordinates.latitude, location.coordinates.longitude, general.map.viewport);
      return { x: point.x * 12, y: point.y * 13 };
    };

    function drawBadgeCard(x: number, y: number, w: number, h: number, img: HTMLImageElement | null, title: string, subtitle: string, isDarkIcon = false) {
      mapContext.save();
      mapContext.shadowColor = 'rgba(28, 18, 10, 0.35)';
      mapContext.shadowBlur = 8;
      mapContext.shadowOffsetY = 3;
      mapContext.fillStyle = 'rgba(248, 243, 230, 0.96)';
      mapContext.strokeStyle = '#8b7355';
      mapContext.lineWidth = 1.8;
      const r = 7;
      mapContext.beginPath();
      mapContext.moveTo(x + r, y); mapContext.lineTo(x + w - r, y);
      mapContext.quadraticCurveTo(x + w, y, x + w, y + r);
      mapContext.lineTo(x + w, y + h - r);
      mapContext.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      mapContext.lineTo(x + r, y + h);
      mapContext.quadraticCurveTo(x, y + h, x, y + h - r);
      mapContext.lineTo(x, y + r);
      mapContext.quadraticCurveTo(x, y, x + r, y);
      mapContext.closePath();
      mapContext.fill();
      mapContext.shadowColor = 'transparent';
      mapContext.stroke();

      const iconSize = 40;
      const iconX = x + 8;
      const iconY = y + (h - iconSize) / 2;
      if (isDarkIcon) {
        mapContext.fillStyle = '#0f1210';
        mapContext.beginPath();
        mapContext.rect(iconX, iconY, iconSize, iconSize);
        mapContext.fill();
      }
      if (img && img.complete && img.naturalWidth > 0) {
        try {
          if (isDarkIcon) mapContext.drawImage(img, iconX + 3, iconY + 3, iconSize - 6, iconSize - 6);
          else mapContext.drawImage(img, iconX, iconY, iconSize, iconSize);
        } catch {}
      }
      mapContext.fillStyle = '#1c150c';
      mapContext.font = 'bold 15px Georgia, serif';
      mapContext.fillText(title, x + 56, y + 23);
      mapContext.fillStyle = '#5c4832';
      mapContext.font = 'italic 12px Georgia, serif';
      mapContext.fillText(subtitle, x + 56, y + 42);
      mapContext.restore();
    }

    function renderMap() {
      if (disposed) return;
      if (actualMap.complete && actualMap.naturalWidth > 0) {
        mapContext.drawImage(actualMap, 0, 0, 1200, 1300);
      }
      for (const location of general.locations) {
        const point = mapPixel(location);
        const future = location.status === 'future-goal';
        const isCurrent = location.id === 'casablanca' || location.current;

        if (future) {
          mapContext.strokeStyle = '#673a28'; mapContext.lineWidth = 3;
          for (let pass = 0; pass < 2; pass++) {
            mapContext.beginPath();
            for (let i = 0; i <= 90; i++) {
              const angle = i / 90 * Math.PI * 2;
              const radius = 93 + Math.sin(angle * 3 + pass) * 5 + pass * 6;
              const x = point.x + Math.cos(angle) * radius, y = point.y + Math.sin(angle) * radius * 1.2;
              if (i) mapContext.lineTo(x, y); else mapContext.moveTo(x, y);
            }
            mapContext.stroke();
          }
          mapContext.font = 'italic bold 39px Georgia'; mapContext.fillStyle = '#302219';
          mapContext.fillText(location.label, point.x + 30, point.y - 35);
          mapContext.font = 'italic 24px Georgia'; mapContext.fillText(t.mapFutureGoalLabel, point.x + 30, point.y + 5);
        } else if (isCurrent) {
          mapContext.font = 'italic bold 40px Georgia'; mapContext.fillStyle = '#26170f';
          mapContext.fillText(location.label, point.x + 28, point.y + 6);

          mapContext.save();
          const stampX = point.x + 28, stampY = point.y - 74, stampW = 248, stampH = 32;
          mapContext.shadowColor = 'rgba(157, 43, 31, 0.45)';
          mapContext.shadowBlur = 8;
          mapContext.shadowOffsetY = 3;
          mapContext.fillStyle = '#9d2b1f';
          mapContext.strokeStyle = '#d4af37';
          mapContext.lineWidth = 2;
          mapContext.beginPath();
          mapContext.rect(stampX, stampY, stampW, stampH);
          mapContext.fill();
          mapContext.shadowColor = 'transparent';
          mapContext.stroke();
          mapContext.fillStyle = '#fff9eb';
          mapContext.font = 'bold 13.5px monospace';
          mapContext.fillText(t.mapCurrentBaseBadge, stampX + 12, stampY + 21);
          mapContext.restore();

          mapContext.save();
          mapContext.setLineDash([5, 4]);
          mapContext.strokeStyle = '#8e2b1f';
          mapContext.lineWidth = 2;
          mapContext.beginPath();
          mapContext.moveTo(point.x + 235, point.y - 6);
          mapContext.lineTo(536, 1073);
          mapContext.stroke();
          mapContext.restore();

          drawBadgeCard(540, 985, 290, 52, complyImg, 'COMPLY WORLD', t.mapBadgeComplySub);
          drawBadgeCard(540, 1047, 290, 52, alxImg, 'ALX AFRICA', t.mapBadgeAlxSub, true);
          drawBadgeCard(540, 1109, 290, 52, fsbmImg, 'FACULTÉ SC. BEN M\'SIK', t.mapBadgeFsbmSub);
        } else if (location.id === 'youssoufia') {
          mapContext.font = 'italic bold 38px Georgia'; mapContext.fillStyle = '#26170f';
          mapContext.fillText(location.label, point.x + 28, point.y + 12);

          mapContext.save();
          mapContext.setLineDash([5, 4]);
          mapContext.strokeStyle = '#8e2b1f';
          mapContext.lineWidth = 2;
          mapContext.beginPath();
          mapContext.moveTo(point.x + 225, point.y + 4);
          mapContext.lineTo(536, 1218);
          mapContext.stroke();
          mapContext.restore();

          drawBadgeCard(540, 1192, 290, 52, youcodeImg, 'YOUCODE (UM6P)', t.mapBadgeYoucodeSub, true);
        }
      }
      mapTexture.needsUpdate = true;
    }

    const onImgLoad = () => { if (!disposed) { renderMap(); } };
    actualMap.onload = onImgLoad;
    complyImg.onload = onImgLoad;
    alxImg.onload = onImgLoad;
    youcodeImg.onload = onImgLoad;
    fsbmImg.onload = onImgLoad;

    actualMap.src = general.map.viewport.image;
    complyImg.src = '/icons/complyworld.png';
    alxImg.src = '/icons/alx.webp';
    youcodeImg.src = '/icons/youcode.png';
    fsbmImg.src = '/icons/scbenMsik_icon.png';
    const mapWidth = 4.5, mapHeight = 4.875;
    const mapGeometry = new THREE.PlaneGeometry(mapWidth, mapHeight, 24, 26);
    const vertices = mapGeometry.attributes.position;
    for (let i = 0; i < vertices.count; i++) { const x = vertices.getX(i), y = vertices.getY(i); vertices.setZ(i, .018 * Math.sin(x * 5) + .009 * Math.sin(y * 8) + .025 * Math.exp(-Math.abs(x) * 15)); }
    mapGeometry.computeVertexNormals();
    mesh(mapGeometry, material({ map: mapTexture, roughness: 1, side: THREE.DoubleSide }), mapRoot);
    register({ id: 'map', label: 'Vintage atlas / Morocco and Germany', surface: 'board', file: { kind: 'map' } }, mapRoot, [0, 6.55, cardZ + .08], [mapWidth, mapHeight]);
    const mapPins = new Map<string, THREE.Object3D>();
    for (const location of general.locations.filter(item => general.map.visibleLocationIds.includes(item.id))) {
      const point = mapPixel(location);
      const pinX = (point.x / 1200 - .5) * mapWidth;
      const pinY = (.5 - point.y / 1300) * mapHeight;
      const isCurrent = location.id === 'casablanca' || location.current;
      const pin = mesh(new THREE.SphereGeometry(.048, 16, 10), material({ color: isCurrent ? '#ba2d1d' : '#a93727', metalness: .35, roughness: .3 }), mapRoot, [pinX, pinY, .09]);
      pin.userData.city = location.label; mapPins.set(location.id, pin);
      if (isCurrent) {
        mesh(new THREE.TorusGeometry(.075, .01, 12, 32), material({ color: '#d4af37', metalness: .85, roughness: .25 }), mapRoot, [pinX, pinY, .085]);
      }
    }
    const routeStart = mapPins.get(general.map.futureGoal.originId ?? ''), routeEnd = mapPins.get(general.map.futureGoal.destinationId);
    let futureThread: THREE.Mesh | undefined;
    if (routeStart && routeEnd) {
      const a = routeStart.position.clone(), b = routeEnd.position.clone(); const middle = a.clone().lerp(b, .5); middle.x -= .06; middle.z += .045;
      futureThread = mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, middle, b), 32, .012, 7, false), material({ color: '#9d3324', roughness: 1 }), mapRoot);
    }
    addPaper({ id: 'education', label: t.qaEducation, surface: 'board', file: { kind: 'education' } }, t.eduBoardTitle, '', t.eduBoardFooter, [0, 3.78, cardZ + .18], [3.6, .65], .015);
    const topicPositions: Record<string, [number, number, number, number]> = {
      'rest-api-graphql': [3.5, 8.4, 2.15, .8],
      'react-testing-library-jest': [-4.8, 8.35, 4.4, .8],
      'express-validator-joi': [-3.6, 4.75, 1.9, .85],
      'authentication-authorization': [-3.55, 6.65, 2.1, 1.7],
      'devops-jenkins-docker': [3.6, 4.75, 1.9, .85],
      'stealth-scraping-cicd-workshop': [6, 5.75, 2.2, .72],
      'application-data-modelling': [-6, 3.7, 2.2, .65],
      'youcode-sofrecom-hackathon': [6, 8.3, 2.2, .7],
      'collaborative-coding': [-6, 5.75, 2.2, .72],
    };
    events.forEach((entry, index) => {
      const [x,y,w,h] = topicPositions[entry.id] ?? [-6 + index % 2 * 12, 5.7, 2.1, .75];
      const eLoc = eventLocs?.[entry.id];
      const localizedEventTitle = eLoc?.title ?? entry.title;
      addPaper({ id: `event-${entry.id}`, label: localizedEventTitle, surface: 'board', file: { kind: 'event', id: entry.id } }, localizedEventTitle, entry.topics?.join(' / ') ?? '', entry.city ?? t.cardSubjectHeader, [x,y,cardZ + .19], [w,h], index % 2 ? -.02 : .025);
    });
    general.mediaLibrary.forEach((photo, index) => {
      const layout = general.board.photos.find(item => item.id === photo.id) ?? { x: -6, y: 9 - index * 1.5, width: 2.2, angle: 0 };
      const width = layout.width, height = width * (photo.height ?? 3) / (photo.width ?? 4);
      const event = events.find(entry => entry.photos.some(image => image.url === photo.src));
      const school = general.education.find(entry => entry.media.images.some(image => image.id === photo.id));
      const file: RoomFile = event ? { kind: 'event', id: event.id } : school ? { kind: 'education' } : { kind: 'events' };
      const root = new THREE.Group(); root.rotation.z = layout.angle;
      const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = Math.round(1024 * height / width);
      const ctx = canvas.getContext('2d')!; const imageMap = texture(canvas);
      const photograph = new Image(); photograph.onload = () => { if (!disposed) { ctx.drawImage(photograph, 0, 0, canvas.width, canvas.height); imageMap.needsUpdate = true; } }; photograph.src = photo.src;
      box(width, height, .014, material({ map: imageMap, roughness: .72, side: THREE.DoubleSide }), root, [0,0,0]);
      const pin = mesh(new THREE.SphereGeometry(.046, 16, 10), material({ color: '#aa3326', roughness: .35, metalness: .2 }), root, [0, height / 2 - .055, .07]);
      root.userData.anchor = pin; root.userData.photoId = photo.id; root.userData.relatedEvent = event?.id;
      root.userData.locationId = event?.locationId ?? school?.locationId ?? null;
      register({ id: `photo-${photo.id}`, label: `Photo / ${photo.caption}`, surface: 'board', file }, root, [layout.x, layout.y, cardZ + .3], [width,height]);
    });
    const album = addPaper({ id: 'album', label: t.ctrlEvents, surface: 'desk', file: { kind: 'events' } }, t.albumDeskTitle, t.albumDeskSub, t.albumDeskFooter.replace('{count}', String(events.length)), [2.45, 1.48, 1.15], [1.6, 1.9]);
    album.root.rotation.set(-Math.PI / 2, 0, -.16); album.rotation.copy(album.root.rotation);

    const monitor = new THREE.Group();
    box(2.25, 1.9, 1.2, cream, monitor, [0, 1.05, 0]);
    box(1.99, 1.58, .07, black, monitor, [0, 1.12, .64]);
    const screenCanvas = document.createElement('canvas'); screenCanvas.width = 768; screenCanvas.height = 560;
    const screenCtx = screenCanvas.getContext('2d')!;
    const screenMap = texture(screenCanvas);
    const screenMat = new THREE.MeshBasicMaterial({ map: screenMap, toneMapped: false }); materials.add(screenMat);
    box(1.75, 1.3, .015, screenMat, monitor, [0, 1.15, .69]);
    const powerButton = mesh(new THREE.SphereGeometry(.055, 16, 10), brass, monitor, [.91, .3, .66]); powerButton.userData.action = 'power';
    box(2.4, .15, 1.1, cream, monitor, [0, .06, 1]);
    for (let row = 0; row < 4; row++) for (let col = 0; col < 12; col++) box(.14, .035, .14, black, monitor, [-.96 + col * .174, .16, .6 + row * .19]);
    register({ id: 'computer', label: 'Computer / portfolio terminal', surface: 'desk', file: { kind: 'computer' } }, monitor, [-8.1, 1.42, .55]);
    monitor.rotation.y = .1;
    const lamp = new THREE.Group();
    mesh(new THREE.CylinderGeometry(.48, .58, .11, 32), brass, lamp, [0, .06, 0]);
    const lampButton = mesh(new THREE.SphereGeometry(.07, 16, 10), black, lamp, [.24, .13, .25]); lampButton.userData.action = 'lamp';
    function rod(start: THREE.Vector3, end: THREE.Vector3, radius: number, parent: THREE.Object3D) { const obj = mesh(new THREE.CylinderGeometry(radius, radius, start.distanceTo(end), 12), brass, parent); obj.position.copy(start).add(end).multiplyScalar(.5); obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize()); }
    rod(new THREE.Vector3(0, .1, 0), new THREE.Vector3(.25, 1.3, 0), .045, lamp);
    rod(new THREE.Vector3(.25, 1.3, 0), new THREE.Vector3(-.5, 2.35, -.15), .045, lamp);
    mesh(new THREE.SphereGeometry(.11, 16, 10), brass, lamp, [.25, 1.3, 0]);
    const shade = mesh(new THREE.ConeGeometry(.59, .55, 32, 1, true), material({ color: '#253426', metalness: .65, roughness: .3, side: THREE.DoubleSide }), lamp, [-.5, 2.17, -.15]);
    shade.rotation.z = -.25;
    shade.castShadow = false;
    const bulbMat = material({ color: '#ffe9b9', emissive: '#ffd397', emissiveIntensity: 3 });
    mesh(new THREE.SphereGeometry(.12, 16, 10), bulbMat, lamp, [-.45, 1.99, -.15]).castShadow = false;
    spot.position.set(-.45, 1.95, -.18); lamp.add(spot);
    register({ id: 'lamp', label: 'Desk lamp', surface: 'desk', isLamp: true }, lamp, [8.1, 1.42, .3]);

    const mug = new THREE.Group();
    mesh(new THREE.CylinderGeometry(.25, .21, .45, 32, 1, true), material({ color: '#b8b49a', roughness: .7, side: THREE.DoubleSide }), mug, [0, .23, 0]);
    mesh(new THREE.CylinderGeometry(.225, .225, .01, 32), material({ color: '#21130b', roughness: .2 }), mug, [0, .4, 0]);
    const handle = mesh(new THREE.TorusGeometry(.16, .045, 10, 24), cream, mug, [.29, .24, 0]); handle.rotation.y = Math.PI / 2;
    register({ id: 'coffee', label: 'Coffee cup', surface: 'desk' }, mug, [-2.5, 1.42, .2]);
    const phone = new THREE.Group();
    box(1.1, .22, .8, black, phone, [0, .15, 0]);
    const dial = mesh(new THREE.CylinderGeometry(.25, .25, .035, 32), brass, phone, [.1, .28, .1]);
    for (let i = 0; i < 10; i++) mesh(new THREE.CylinderGeometry(.028, .028, .04, 10), black, phone, [.1 + Math.cos(i / 10 * Math.PI * 2) * .17, .31, .1 + Math.sin(i / 10 * Math.PI * 2) * .17]);
    box(1.15, .16, .22, black, phone, [0, .42, -.2]);
    for (const x of [-.48, .48]) mesh(new THREE.SphereGeometry(.17, 16, 10), black, phone, [x, .36, -.2]);
    dial.receiveShadow = true;
    register({ id: 'telephone', label: 'Telephone / Contact', surface: 'desk', file: { kind: 'contact' } }, phone, [3.5, 1.42, -.2]);
    // Exact A4 cv.html Lebenslauf Sheet lying on the desk ("in mein Büro") — no leather folder card
    const cvDeskGroup = new THREE.Group();
    const cvCanvas = document.createElement('canvas'); cvCanvas.width = 1024; cvCanvas.height = 1448;
    const cvCtx = cvCanvas.getContext('2d')!;
    const cvTex = texture(cvCanvas);
    const cvProfileImg = new Image();

    function drawDeskCvSheet() {
      if (disposed) return;
      cvCtx.fillStyle = '#ffffff';
      cvCtx.fillRect(0, 0, 1024, 1448);

      // Left gradient accent bar (#1a3a6b -> #8b1a1a) from cv.html
      const grad = cvCtx.createLinearGradient(0, 0, 0, 1448);
      grad.addColorStop(0, '#1a3a6b');
      grad.addColorStop(1, '#8b1a1a');
      cvCtx.fillStyle = grad;
      cvCtx.fillRect(0, 0, 20, 1448);

      // Header
      cvCtx.fillStyle = '#111827';
      cvCtx.font = 'bold 54px Arial, sans-serif';
      cvCtx.fillText(cvData.name.toUpperCase(), 54, 88);

      cvCtx.fillStyle = '#1a3a6b';
      cvCtx.font = 'bold 24px Arial, sans-serif';
      cvCtx.fillText(cvData.title, 54, 126);

      cvCtx.fillStyle = '#333333';
      cvCtx.font = '18px Arial, sans-serif';
      cvCtx.fillText(`+212 613-450-087  ·  kardasch.zakaria@outlook.de  ·  ${cvData.location}`, 54, 160);
      cvCtx.fillStyle = '#1a3a6b';
      cvCtx.fillText('linkedin.com/in/zakaria-kardache  ·  github.com/kardasch404  ·  kardasch.me', 54, 188);

      // Profile Photo on top-right
      const px = 790, py = 36, pw = 180, ph = 180;
      cvCtx.fillStyle = '#ffffff';
      cvCtx.fillRect(px, py, pw, ph);
      if (cvProfileImg.complete && cvProfileImg.naturalWidth > 0) {
        try { cvCtx.drawImage(cvProfileImg, px, py, pw, ph); } catch {}
      }

      // Header bottom rule
      cvCtx.strokeStyle = '#111827';
      cvCtx.lineWidth = 3;
      cvCtx.beginPath(); cvCtx.moveTo(54, 232); cvCtx.lineTo(970, 232); cvCtx.stroke();

      let y = 268;
      function secTitle(title: string) {
        cvCtx.fillStyle = '#1a3a6b';
        cvCtx.font = 'bold 19px Arial, sans-serif';
        cvCtx.fillText(title, 54, y);
        cvCtx.strokeStyle = '#1a3a6b';
        cvCtx.lineWidth = 2;
        cvCtx.beginPath(); cvCtx.moveTo(54, y + 7); cvCtx.lineTo(970, y + 7); cvCtx.stroke();
        y += 32;
      }

      // SKILLS
      secTitle(cvData.secSkills);
      for (const s of cvData.skills) {
        cvCtx.fillStyle = '#111827'; cvCtx.font = 'bold 18px Arial, sans-serif';
        cvCtx.fillText(s.label, 54, y);
        const kw = cvCtx.measureText(s.label).width;
        cvCtx.fillStyle = '#333333'; cvCtx.font = '18px Arial, sans-serif';
        cvCtx.fillText(s.val, 54 + kw + 8, y);
        y += 26;
      }

      y += 10;
      secTitle(cvData.secExperience);
      for (const job of cvData.jobs) {
        cvCtx.fillStyle = '#111827'; cvCtx.font = 'bold 21px Arial, sans-serif';
        cvCtx.fillText(`${job.role} — ${job.company}`, 54, y);
        cvCtx.fillStyle = '#555555'; cvCtx.font = 'italic 17px Georgia, serif';
        cvCtx.fillText(job.dates, 770, y);
        y += 24;
        cvCtx.fillStyle = '#1f2937'; cvCtx.font = '17px Georgia, serif';
        for (const b of job.bullets.slice(0, 3)) {
          cvCtx.fillText(`– ${b.slice(0, 92)}${b.length > 92 ? '…' : ''}`, 64, y);
          y += 23;
        }
        y += 8;
      }

      y += 4;
      secTitle(cvData.secProjects);
      for (const p of cvData.projects) {
        cvCtx.fillStyle = '#111827'; cvCtx.font = 'bold 19px Arial, sans-serif';
        cvCtx.fillText(p.name, 54, y); y += 21;
        cvCtx.fillStyle = '#555555'; cvCtx.font = 'italic 16px Georgia, serif';
        cvCtx.fillText(p.tech.slice(0, 105), 54, y); y += 25;
      }

      y += 8;
      secTitle(cvData.secEducation);
      for (const ed of cvData.education) {
        cvCtx.fillStyle = '#111827'; cvCtx.font = 'bold 18px Arial, sans-serif';
        cvCtx.fillText(ed.degree, 54, y);
        cvCtx.fillStyle = '#555555'; cvCtx.font = 'italic 16.5px Georgia, serif';
        cvCtx.fillText(ed.dates, 770, y);
        y += 26;
      }

      y += 8;
      secTitle(cvData.secMore);
      cvCtx.fillStyle = '#111827'; cvCtx.font = 'bold 18px Arial, sans-serif';
      cvCtx.fillText(`${cvData.languagesLabel} `, 54, y);
      const lw = cvCtx.measureText(`${cvData.languagesLabel} `).width;
      cvCtx.fillStyle = '#333333'; cvCtx.font = '18px Arial, sans-serif';
      cvCtx.fillText(cvData.languagesVal, 54 + lw, y);
      y += 25;
      cvCtx.fillStyle = '#111827'; cvCtx.font = 'bold 18px Arial, sans-serif';
      cvCtx.fillText(`${cvData.strengthsLabel} `, 54, y);
      const sw = cvCtx.measureText(`${cvData.strengthsLabel} `).width;
      cvCtx.fillStyle = '#333333'; cvCtx.font = '18px Arial, sans-serif';
      cvCtx.fillText(`${cvData.strengthsVal}   |   ${cvData.interestsLabel} ${cvData.interestsChess}${cvData.interestsRest}`, 54 + sw, y);

      cvTex.needsUpdate = true;
    }

    cvProfileImg.onload = () => { if (!disposed) drawDeskCvSheet(); };
    cvProfileImg.src = '/photos/kardache-zakaria.jpg';
    drawDeskCvSheet();

    const cvPageMesh = box(1.82, 2.57, .016, material({ map: cvTex, roughness: .72, side: THREE.DoubleSide }), cvDeskGroup, [0, 0, 0]);
    cvPageMesh.castShadow = true;
    cvPageMesh.receiveShadow = true;
    cvDeskGroup.rotation.set(-Math.PI / 2, 0, 0);
    const cvSheetEntity = register(
      { id: 'cv-lebenslauf-sheet', label: 'Lebenslauf / CV (Zakaria Kardache)', surface: 'desk', file: { kind: 'resume' } },
      cvDeskGroup,
      [-.15, 1.48, .55],
      [1.82, 2.57]
    );
    cvSheetEntity.rotation.copy(cvDeskGroup.rotation);

    function chair(id: string, label: string, x: number, z: number, angle = 0) {
      const root = new THREE.Group();
      box(1.1, .16, 1.1, wood, root, [0, .85, 0]);
      box(1.1, 1.15, .13, wood, root, [0, 1.5, .48]);
      for (const px of [-.45, .45]) for (const pz of [-.44, .44]) box(.11, .85, .11, darkWood, root, [px, .4, pz]);
      root.rotation.y = angle;
      register({ id, label, surface: 'floor', seat: true }, root, [x, 0, z]);
    }
    chair('desk-chair', 'Office chair / sit at the computer', -8.1, 3.5);
    const chessTable = new THREE.Group();
    box(3.05, .18, 3.05, wood, chessTable, [0, 1.22, 0]);
    for (const x of [-1.25, 1.25]) for (const z of [-1.25, 1.25]) box(.16, 1.2, .16, darkWood, chessTable, [x, .6, z]);
    const ivory = material({ color: '#e2cfaa', roughness: .4 });
    const ebony = material({ color: '#242e28', roughness: .35 });
    const initialChess = new Chess();
    for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) {
      box(.29, .025, .29, (row + col) % 2 ? darkWood : cream, chessTable, [(col - 3.5) * .29, 1.33, (row - 3.5) * .29]);
      const piece = initialChess.board()[row][col];
      if (piece) { const model = chessPiece(piece.type, piece.color === 'w' ? ivory : ebony); model.scale.setScalar(.46); model.position.set((col - 3.5) * .29, 1.35, (row - 3.5) * .29); if (piece.color === 'b') model.rotation.y = Math.PI; chessTable.add(model); }
    }
    box(.95, .32, .3, darkWood, chessTable, [0, 1.48, -1.32]);
    for (const x of [-.23, .23]) box(.35, .16, .01, cream, chessTable, [x, 1.49, -1.16]);
    register({ id: 'chess', label: 'Chess table / play a game', surface: 'floor', file: { kind: 'chess' } }, chessTable, [3, 0, 5.6]);
    chair('chess-chair-white', 'Chess chair / white side', 3, 7.7);
    chair('chess-chair-black', 'Chess chair / black side', 3, 3.5, Math.PI);
    const originalRotations = new Map(entities.map(entity => [entity, entity.root.rotation.clone()]));

    const threads: { line: THREE.Mesh; a: Entity; b: Entity; pin?: THREE.Object3D }[] = [];
    const redThread = material({ color: '#87251b', roughness: 1 });
    function connect(aId: string, bId: string, pin?: THREE.Object3D) {
      const a = entities.find(entity => entity.id === aId), b = entities.find(entity => entity.id === bId);
      if (!a || !b) return;
      const line = new THREE.Mesh(new THREE.BufferGeometry(), redThread); line.castShadow = true; scene.add(line); threads.push({ line, a, b, pin });
    }
    // Keep links local to related evidence and route project threads cleanly pin-to-pin above card faces.
    for (const photo of entities.filter(entity => entity.root.userData.photoId)) {
      const eventId = photo.root.userData.relatedEvent;
      connect(photo.id, eventId ? `event-${eventId}` : 'education');
    }
    connect('map', 'education', mapPins.get('youssoufia'));
    for (let i = 0; i < projects.length - 1; i++) {
      connect(`project-${projects[i].id}`, `project-${projects[i + 1].id}`);
    }
    function anchor(entity: Entity) {
      const pin = entity.root.userData.anchor as THREE.Object3D | undefined;
      return pin ? pin.getWorldPosition(new THREE.Vector3()) : entity.root.localToWorld(new THREE.Vector3(0, (entity.size?.[1] ?? 1) / 2 - .08, .08));
    }
    function updateThreads() {
      for (const { line, a, b, pin } of threads) {
        line.visible = callbacks.current.stringsOn && picked !== a && picked !== b;
        const start = pin ? pin.getWorldPosition(new THREE.Vector3()) : anchor(a);
        const end = anchor(b);
        const isProjectChain = a.id.startsWith('project-') && b.id.startsWith('project-');
        const middle = start.clone().lerp(end, .5);
        // Arch project threads slightly ABOVE the pushpins so they never cover card titles or text
        middle.y = isProjectChain ? Math.max(start.y, end.y) + .08 : middle.y - .04;
        middle.z = Math.min(start.z, end.z) - .005;
        line.geometry.dispose(); line.geometry = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(start, middle, end), 24, .0085, 6, false);
      }
      threadsDirty = false;
    }
    function saveLayout() {
      try { localStorage.setItem(savedLayoutKey, JSON.stringify(Object.fromEntries(entities.map(e => { const target = motions.get(e); const position = e === picked && pickedFrom ? pickedFrom : target?.position ?? e.root.position; const rotation = e === picked ? e.rotation : target ? new THREE.Euler().setFromQuaternion(target.quaternion) : e.root.rotation; return [e.id, { position: position.toArray(), rotation: [rotation.x, rotation.y, rotation.z] }]; })))); } catch { /* Room remains usable without storage. */ }
    }
    function clampPosition(entity: Entity, value: THREE.Vector3) {
      if (entity.surface === 'floor') { value.x = THREE.MathUtils.clamp(value.x, -9, 9); value.y = entity.home.y; value.z = THREE.MathUtils.clamp(value.z, 3, 9); return; }
      value.x = THREE.MathUtils.clamp(value.x, entity.surface === 'board' ? -boardWidth / 2 + .1 + (entity.size?.[0] ?? 1) / 2 : -8.1, entity.surface === 'board' ? boardWidth / 2 - .1 - (entity.size?.[0] ?? 1) / 2 : 8.1);
      if (entity.surface === 'board') { value.y = THREE.MathUtils.clamp(value.y, boardCenter - boardHeight / 2 + .1 + (entity.size?.[1] ?? 1) / 2, boardCenter + boardHeight / 2 - .1 - (entity.size?.[1] ?? 1) / 2); value.z = entity.home.z; }
      else { value.y = entity.home.y; value.z = THREE.MathUtils.clamp(value.z, -.6, 2); }
    }
    try {
      const saved = JSON.parse(localStorage.getItem(savedLayoutKey) || '{}');
      for (const entity of entities) {
        const state = saved[entity.id];
        if (Array.isArray(state?.position) && state.position.length === 3 && state.position.every((n: unknown) => typeof n === 'number' && Number.isFinite(n))) { entity.root.position.fromArray(state.position); clampPosition(entity, entity.root.position); }
        if (Array.isArray(state?.rotation) && state.rotation.length === 3 && state.rotation.every((n: unknown) => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) <= Math.PI * 4)) entity.root.rotation.set(...state.rotation as [number, number, number]);
      }
    } catch { /* Ignore stale or invalid local layouts. */ }
    let hovered: Entity | null = null;
    function refreshCardStates(prevActive: Entity | null, prevHovered: Entity | null) {
      const changed = new Set<Entity>();
      if (prevActive) changed.add(prevActive);
      if (active) changed.add(active);
      if (prevHovered) changed.add(prevHovered);
      if (hovered) changed.add(hovered);
      for (const ent of changed) {
        const redraw = cardRedraws.get(ent.id);
        if (redraw) redraw(ent === active, ent === hovered);
      }
      threadsDirty = true;
    }
    function select(entity: Entity) {
      const prev = active;
      active = entity;
      refreshCardStates(prev, hovered);
      setSelected({ id: entity.id, label: entity.label, surface: entity.surface, file: entity.file, isLamp: entity.isLamp, seat: entity.seat });
    }
    function finishMotion(entity: Entity) { const target = motions.get(entity); if (target) { entity.root.position.copy(target.position); entity.root.quaternion.copy(target.quaternion); motions.delete(entity); } }
    function putDown() {
      if (picked && pickedFrom) motions.set(picked, { position: pickedFrom.clone(), quaternion: new THREE.Quaternion().setFromEuler(picked.rotation) });
      picked = null; pickedFrom = null; setHeld(false); threadsDirty = true; saveLayout();
    }
    let surfaceClickStart: { x: number; y: number; moved: boolean } | null = null;
    runtime.current = {
      select(id) { const entity = entities.find(e => e.id === id); if (entity) { if (picked && picked !== entity) putDown(); select(entity); } },
      take() {
        if (picked) { putDown(); return; }
        if (!active) return;
        finishMotion(active); picked = active; pickedFrom = active.root.position.clone();
        active.rotation.copy(active.root.rotation);
        const direction = camera.getWorldDirection(new THREE.Vector3());
        motions.set(active, { position: camera.position.clone().addScaledVector(direction, active.size ? 4 : 5), quaternion: camera.quaternion.clone() });
        setHeld(true); threadsDirty = true;
      },
      turn(direction) { if (!active) return; finishMotion(active); if (active.size) active.root.rotation.z += direction * .12; else active.root.rotation.y += direction * .15; threadsDirty = true; if (!picked) saveLayout(); },
      move(x, y) { if (!active || picked) return; finishMotion(active); active.root.position.x += x; if (active.surface === 'board') active.root.position.y += y; else active.root.position.z -= y; clampPosition(active, active.root.position); threadsDirty = true; saveLayout(); },
      reset() { motions.clear(); picked = null; pickedFrom = null; setHeld(false); for (const e of entities) { e.root.position.copy(e.home); e.root.rotation.copy(originalRotations.get(e)!); } threadsDirty = true; cameraMove = { position: defaultCamera.clone(), target: defaultTarget.clone() }; try { localStorage.removeItem(savedLayoutKey); } catch {} },
      view() { cameraMove = { position: new THREE.Vector3(1.2, 8.5, Math.max(22, defaultCamera.z + 5.5)), target: new THREE.Vector3(0, 4.8, .5) }; },
      board() { cameraMove = { position: defaultCamera.clone(), target: defaultTarget.clone() }; },
      desk() { cameraMove = { position: new THREE.Vector3(0, 5.4, 5.2), target: new THREE.Vector3(0, 1.48, .55) }; },
      chess() { cameraMove = { position: new THREE.Vector3(3, 5.2, 9.8), target: new THREE.Vector3(3, 1.35, 5.6) }; },
      sit() { if (!active?.seat) return; if (picked) putDown(); cameraMove = { position: active.root.position.clone().add(new THREE.Vector3(0, 2.4, .1)), target: active.id === 'desk-chair' ? monitor.position.clone().add(new THREE.Vector3(0, 1, 0)) : chessTable.position.clone().add(new THREE.Vector3(0, 1.3, 0)) }; if (active.id.startsWith('chess')) callbacks.current.onOpen({ kind: 'chess' }); },
    };
    setObjectList(entities.map(({ id, label, surface, file, isLamp }) => ({ id, label, surface, file, isLamp })));
    function point(event: globalThis.PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect(); pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1); raycaster.setFromCamera(pointer, camera);
    }
    function intersection() {
      const intersections = raycaster.intersectObjects(entities.map(e => e.root), true);
      for (const item of intersections) { let parent: THREE.Object3D | null = item.object; while (parent && !parent.userData.entity) parent = parent.parent; if (parent) return { entity: parent.userData.entity as Entity, point: item.point, city: item.object.userData.city as string | undefined, action: item.object.userData.action }; }
      return null;
    }
    function down(event: globalThis.PointerEvent) {
      if (event.button !== 0) return;
      cameraMove = null;
      point(event);
      const target = intersection();
      if (!target) {
        surfaceClickStart = { x: event.clientX, y: event.clientY, moved: false };
        return;
      }
      surfaceClickStart = null;
      if (target.city) { callbacks.current.onOpen({ kind: 'map', city: target.city }); return; }
      if (target.action === 'power') { callbacks.current.onPowerToggle(); return; }
      if (target.action === 'lamp') { callbacks.current.onLampToggle(); return; }
      if (picked && picked !== target.entity) putDown();
      select(target.entity); motions.delete(target.entity); controls.enabled = false;
      const normal = target.entity.surface === 'board' || picked === target.entity ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
      const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(normal, target.entity.root.position);
      raycaster.ray.intersectPlane(plane, hit);
      drag = { entity: target.entity, plane, offset: hit.clone().sub(target.entity.root.position), x: event.clientX, y: event.clientY, moved: false };
      renderer.domElement.setPointerCapture(event.pointerId);
    }
    function move(event: globalThis.PointerEvent) {
      point(event);
      if (surfaceClickStart && Math.hypot(event.clientX - surfaceClickStart.x, event.clientY - surfaceClickStart.y) > 6) {
        surfaceClickStart.moved = true;
      }
      if (!drag) {
        const hitTarget = intersection();
        const nextHover = hitTarget?.entity ?? null;
        if (nextHover !== hovered) {
          const prevHover = hovered;
          hovered = nextHover;
          refreshCardStates(active, prevHover);
        }
        renderer.domElement.style.cursor = hitTarget ? 'pointer' : 'grab';
        return;
      }
      if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 6) drag.moved = true;
      if (!drag.moved || !raycaster.ray.intersectPlane(drag.plane, hit)) return;
      drag.entity.root.position.copy(hit).sub(drag.offset);
      if (!picked) { clampPosition(drag.entity, drag.entity.root.position); if (drag.entity.surface === 'board') drag.entity.root.position.z += .22; else drag.entity.root.position.y += .12; }
      renderer.domElement.style.cursor = 'grabbing'; threadsDirty = true;
    }
    function up(event: globalThis.PointerEvent) {
      if (surfaceClickStart && !surfaceClickStart.moved) {
        point(event);
        const surfHits = raycaster.intersectObjects([board, deskTop, floorMesh], false);
        if (surfHits.length > 0) {
          const hitSurf = surfHits[0];
          const p = hitSurf.point;
          const kind = hitSurf.object.userData.roomSurface as string;
          if (kind === 'desk') {
            const tx = THREE.MathUtils.clamp(p.x, -6.5, 6.5);
            cameraMove = { position: new THREE.Vector3(tx, 5.2, 5.0), target: new THREE.Vector3(tx, 1.48, .55) };
          } else if (kind === 'board') {
            const tx = THREE.MathUtils.clamp(p.x, -5.8, 5.8);
            const ty = THREE.MathUtils.clamp(p.y, 3.2, 9.2);
            cameraMove = { position: new THREE.Vector3(tx, ty + .4, defaultCamera.z), target: new THREE.Vector3(tx, ty, -1.75) };
          } else if (kind === 'floor') {
            const tx = THREE.MathUtils.clamp(p.x, -6.5, 6.5);
            const tz = THREE.MathUtils.clamp(p.z, 0, 6);
            cameraMove = { position: new THREE.Vector3(tx, 6.4, tz + 8.5), target: new THREE.Vector3(tx, 2.5, tz) };
          }
        }
      }
      surfaceClickStart = null;
      const clickedEntity = drag && !drag.moved ? drag.entity : null;
      if (drag?.moved && !picked) { clampPosition(drag.entity, drag.entity.root.position); saveLayout(); threadsDirty = true; }
      drag = null; controls.enabled = true; if (renderer.domElement.hasPointerCapture(event.pointerId)) renderer.domElement.releasePointerCapture(event.pointerId);
      if (clickedEntity) {
        if (clickedEntity.seat) runtime.current?.sit();
        else if (clickedEntity.isLamp) callbacks.current.onLampToggle();
        else if (clickedEntity.file) callbacks.current.onOpen(clickedEntity.file);
      }
    }
    function doubleClick(event: MouseEvent) { point(event as globalThis.PointerEvent); const target = intersection(); if (target?.action) return; if (target?.entity.seat) { select(target.entity); runtime.current?.sit(); } else if (target?.entity.isLamp) callbacks.current.onLampToggle(); else if (target?.entity.file) callbacks.current.onOpen(target.entity.file); }
    const preventMenu = (event: Event) => event.preventDefault();
    // A running camera glide used to override the mouse wheel until it finished — wheel now cancels it.
    const cancelGlide = () => { cameraMove = null; };
    const canvas = renderer.domElement;
    canvas.addEventListener('wheel', cancelGlide, { passive: true });
    canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up); canvas.addEventListener('dblclick', doubleClick); canvas.addEventListener('contextmenu', preventMenu);
    let firstResize = true;
    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      const viewingBoard = firstResize || camera.position.distanceTo(defaultCamera) < .2;
      renderer.setPixelRatio(sharpPixelRatio()); // browser zoom changes DPR at runtime
      renderer.setSize(width, height);
      const aspect = width / Math.max(1, height);
      camera.aspect = aspect;

      if (aspect < 0.78) {
        // Phone portrait: comfortable close distance so cards & desk CV are readable, swipe to pan/rotate
        camera.fov = 50;
        defaultCamera.set(0, 6.4, 17.8);
        defaultTarget.set(0, 5.5, -1.2);
      } else if (aspect < 1.25) {
        // Tablet / narrow laptop: balanced framing of corkboard + desk
        camera.fov = 46;
        defaultCamera.set(.1, 6.7, 18.2);
        defaultTarget.set(0, 5.6, -1.2);
      } else {
        // Laptop & Desktop: fit full 10-card corkboard + desk cleanly
        camera.fov = 44;
        const fitDistance = (boardWidth * 1.07) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * aspect);
        defaultCamera.set(.2, 6.8, THREE.MathUtils.clamp(fitDistance - .6, 15.8, 19.2));
        defaultTarget.set(0, 5.65, -1.2);
      }

      if (viewingBoard) {
        camera.position.copy(defaultCamera);
        controls.target.copy(defaultTarget);
      }
      camera.updateProjectionMatrix();
      firstResize = false;
    };
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    let frame = 0, lastScreen = -1, lastFrame = -100;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function render(time: number) {
      if (disposed) return; frame = requestAnimationFrame(render);
      if (document.hidden || time - lastFrame < 1000 / 30 || document.querySelector('dialog[open]')) return;
      lastFrame = time;
      const ease = reducedMotion.matches ? 1 : .14;
      if (cameraMove) { camera.position.lerp(cameraMove.position, ease); controls.target.lerp(cameraMove.target, ease); if (camera.position.distanceTo(cameraMove.position) < .015) cameraMove = null; }
      const cameraChanged = controls.update();
      controls.target.x = THREE.MathUtils.clamp(controls.target.x, -7.2, 7.2);
      controls.target.y = THREE.MathUtils.clamp(controls.target.y, 1.1, 10.2);
      controls.target.z = THREE.MathUtils.clamp(controls.target.z, -2.0, 5.8);
      let elevationAnimating = false;
      for (const entity of entities) {
        if (entity.surface === 'board' && entity !== picked && (!drag || drag.entity !== entity) && !motions.has(entity)) {
          const targetZ = entity.home.z + (entity === active ? .26 : entity === hovered ? .16 : 0);
          const targetScale = entity === active ? 1.065 : entity === hovered ? 1.035 : 1;
          if (Math.abs(entity.root.position.z - targetZ) > .002 || Math.abs(entity.root.scale.x - targetScale) > .002) {
            entity.root.position.z = THREE.MathUtils.lerp(entity.root.position.z, targetZ, .18);
            const nextScale = THREE.MathUtils.lerp(entity.root.scale.x, targetScale, .18);
            entity.root.scale.set(nextScale, nextScale, 1);
            elevationAnimating = true;
            threadsDirty = true;
          }
        }
      }
      if (!cameraChanged && !cameraMove && !drag && !motions.size && !threadsDirty && !elevationAnimating && Math.floor(time / 650) === lastScreen && Math.abs(spot.intensity - (callbacks.current.lampOn ? 95 : 0)) < .1) return;
      for (const [entity, target] of motions) { entity.root.position.lerp(target.position, ease); entity.root.quaternion.slerp(target.quaternion, ease); threadsDirty = true; if (entity.root.position.distanceTo(target.position) < .003 && entity.root.quaternion.angleTo(target.quaternion) < .003) { entity.root.position.copy(target.position); entity.root.quaternion.copy(target.quaternion); motions.delete(entity); if (!picked) saveLayout(); } }
      const lit = callbacks.current.lampOn;
      spot.intensity = THREE.MathUtils.lerp(spot.intensity, lit ? 95 : 0, .08);
      ambient.intensity = THREE.MathUtils.lerp(ambient.intensity, lit ? 1.8 : .16, .06);
      fill.intensity = THREE.MathUtils.lerp(fill.intensity, lit ? 1.7 : .13, .06);
      screenLight.intensity = callbacks.current.computerOn ? 4 : 0;
      screenLight.position.copy(monitor.position).add(new THREE.Vector3(0, 1.2, 1));
      bulbMat.emissiveIntensity = lit ? 3 : 0;
      if (threadsDirty) { updateThreads(); renderer.shadowMap.needsUpdate = true; }
      for (const thread of threads) thread.line.visible = callbacks.current.stringsOn && picked !== thread.a && picked !== thread.b;
      if (futureThread) futureThread.visible = callbacks.current.stringsOn;
      if (Math.floor(time / 650) !== lastScreen) {
        lastScreen = Math.floor(time / 650); screenCtx.fillStyle = '#071b13'; screenCtx.fillRect(0, 0, 768, 560); screenCtx.fillStyle = '#a4d6ad'; screenCtx.font = '22px monospace';
        const lines = ['KARDACHE SYSTEMS / PERSONAL TERMINAL', '-----------------------------------', '', '> projects     Browse case files', '> events       Talks & photographs', '> about        Read personnel file', '> contact      Start a conversation', '', `SYSTEM ONLINE  ·  ${projects.length} PROJECTS`, '', `> ${lastScreen % 2 ? '_' : ''}`];
        if (callbacks.current.computerOn) lines.forEach((line, index) => screenCtx.fillText(line, 32, 55 + index * 43));
        else { screenCtx.fillStyle = '#050706'; screenCtx.fillRect(0, 0, 768, 560); }
        screenCtx.fillStyle = '#00000022'; for (let y = 0; y < 560; y += 4) screenCtx.fillRect(0, y, 768, 1);
        screenMap.needsUpdate = true;
      }
      renderer.render(scene, camera);
    }
    frame = requestAnimationFrame(render); setReady(true); callbacks.current.onReady(true);
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect(); controls.dispose(); runtime.current = null;
      canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', up); canvas.removeEventListener('dblclick', doubleClick); canvas.removeEventListener('contextmenu', preventMenu); canvas.removeEventListener('wheel', cancelGlide);
      scene.traverse(object => { if (object instanceof THREE.Mesh) object.geometry.dispose(); });
      for (const mat of materials) mat.dispose(); for (const map of textures) map.dispose(); renderer.dispose(); canvas.remove();
    };
  }, [general, bio, projects, events, locale]);

  if (failed) return <div className="study-fallback-notice">3D is unavailable in this browser.</div>;
  return <div className={`interactive-study ${ready ? 'study-ready' : ''}`}>
    <div ref={canvasHost} className="study-canvas" />
    {!ready && <div className="study-loading">Opening the study…</div>}
  </div>;
}

'use client';
import { useEffect, useRef, useState } from 'react';
import { Chess, type Square, type PieceSymbol } from 'chess.js';
import * as THREE from 'three';
import { chessPiece } from './chess-pieces';

const symbols: Record<string, string> = { wk: '♔', wq: '♕', wr: '♖', wb: '♗', wn: '♘', wp: '♙', bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟' };
const pieceNames: Record<PieceSymbol, string> = { k: 'king', q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn' };
const squares = Array.from({ length: 64 }, (_, i) => `${'abcdefgh'[i % 8]}${8 - Math.floor(i / 8)}` as Square);
function timeLabel(ms: number) { const seconds = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; }

function ChessBoard3D({ fen, selected, legal, visible, onSquare }: { fen: string; selected: Square | null; legal: Square[]; visible: boolean; onSquare: (square: Square) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef({ fen, selected, legal, visible, onSquare });
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => { state.current = { fen, selected, legal, visible, onSquare }; }, [fen, selected, legal, visible, onSquare]);
  useEffect(() => {
    if (!host.current) return;
    const element = host.current;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true }); } catch { setUnavailable(true); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = true; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.5;
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene(); scene.background = new THREE.Color('#1b2118');
    const camera = new THREE.PerspectiveCamera(40, 1, .1, 30); camera.position.set(0, 7.7, 8.1); camera.lookAt(0, 0, 0);
    const light = new THREE.DirectionalLight('#ffe4ba', 3.2); light.position.set(-3, 8, 4); light.castShadow = true; light.shadow.mapSize.set(1024, 1024); light.shadow.camera.left = -5; light.shadow.camera.right = 5; light.shadow.camera.top = 5; light.shadow.camera.bottom = -5; light.shadow.normalBias = .025; scene.add(light); scene.add(new THREE.HemisphereLight('#dfebd5', '#5e432d', 2));
    const mats = [new THREE.MeshStandardMaterial({ color: '#d3bd8e', roughness: .6 }), new THREE.MeshStandardMaterial({ color: '#524231', roughness: .65 }), new THREE.MeshStandardMaterial({ color: '#ead7ad', roughness: .38 }), new THREE.MeshStandardMaterial({ color: '#263129', roughness: .33 }), new THREE.MeshStandardMaterial({ color: '#342618', roughness: .6 })];
    const frame = new THREE.Mesh(new THREE.BoxGeometry(5.4, .24, 5.4), mats[4]); frame.position.y = -.17; frame.receiveShadow = true; scene.add(frame);
    const tiles: THREE.Mesh[] = [];
    for (const [index, square] of squares.entries()) { const tile = new THREE.Mesh(new THREE.BoxGeometry(.625, .04, .625), mats[(Math.floor(index / 8) + index % 8) % 2]); tile.position.set((index % 8 - 3.5) * .625, -.03, (Math.floor(index / 8) - 3.5) * .625); tile.userData.square = square; tile.receiveShadow = true; scene.add(tile); tiles.push(tile); }
    const pieces = new THREE.Group(); scene.add(pieces); const markers = new THREE.Group(); scene.add(markers);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: '#b8d577', transparent: true, opacity: .75 });
    const selectedMaterial = new THREE.MeshBasicMaterial({ color: '#d6bb68', transparent: true, opacity: .42 });
    const clear = (group: THREE.Group) => { group.traverse(object => { if (object instanceof THREE.Mesh) object.geometry.dispose(); }); group.clear(); };
    let lastFen = '', lastSelection = '', raf = 0, needsRender = true;
    function render() {
      raf = requestAnimationFrame(render); if (!state.current.visible || document.hidden) return;
      if (lastFen !== state.current.fen) {
        clear(pieces); const game = new Chess(state.current.fen);
        for (const square of squares) { const piece = game.get(square); if (!piece) continue; const group = chessPiece(piece.type, mats[piece.color === 'w' ? 2 : 3]); const file = square.charCodeAt(0) - 97; const rank = 8 - Number(square[1]); group.position.set((file - 3.5) * .625, .015, (rank - 3.5) * .625); if (piece.color === 'b') group.rotation.y = Math.PI; group.userData.square = square; pieces.add(group); }
        lastFen = state.current.fen; renderer.shadowMap.needsUpdate = true; needsRender = true;
      }
      const selectionKey = `${state.current.selected}:${state.current.legal.join(',')}`;
      if (selectionKey !== lastSelection) {
        clear(markers);
        for (const square of [state.current.selected, ...state.current.legal].filter(Boolean) as Square[]) { const isSelected = square === state.current.selected; const marker = new THREE.Mesh(isSelected ? new THREE.PlaneGeometry(.62, .62) : new THREE.CircleGeometry(.1, 24), isSelected ? selectedMaterial : markerMaterial); marker.rotation.x = -Math.PI / 2; marker.position.set((square.charCodeAt(0) - 100.5) * .625, .018, (4.5 - Number(square[1])) * .625); markers.add(marker); }
        lastSelection = selectionKey; needsRender = true;
      }
      if (needsRender) { renderer.render(scene, camera); needsRender = false; }
    }
    const ray = new THREE.Raycaster(); const pointer = new THREE.Vector2();
    function click(event: MouseEvent) { const rect = renderer.domElement.getBoundingClientRect(); pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1); ray.setFromCamera(pointer, camera); const hit = ray.intersectObjects([...tiles, ...pieces.children], true)[0]; if (!hit) return; let obj: THREE.Object3D | null = hit.object; while (obj && !obj.userData.square) obj = obj.parent; if (obj) state.current.onSquare(obj.userData.square); }
    renderer.domElement.addEventListener('click', click);
    const resize = () => { const rect = element.getBoundingClientRect(); if (!rect.width || !rect.height) return; renderer.setSize(rect.width, rect.height); camera.aspect = rect.width / rect.height; camera.updateProjectionMatrix(); needsRender = true; }; const observer = new ResizeObserver(resize); observer.observe(element); resize(); render();
    return () => { cancelAnimationFrame(raf); observer.disconnect(); renderer.domElement.removeEventListener('click', click); scene.traverse(object => { if (object instanceof THREE.Mesh) object.geometry.dispose(); }); [...mats, markerMaterial, selectedMaterial].forEach(mat => mat.dispose()); renderer.dispose(); renderer.domElement.remove(); };
  }, []);
  return <div ref={host} className="chess-canvas" role="img" aria-label="Playable 3D chessboard">{unavailable && <p>Use the accessible board below to play.</p>}</div>;
}

export default function ChessGame({ visible }: { visible: boolean }) {
  const engine = useRef(new Chess());
  const clock = useRef({ w: 300000, b: 300000, running: false, stamp: 0, flagged: '' });
  const [fen, setFen] = useState(() => new Chess().fen());
  const [flagged, setFlagged] = useState(false);
  const [selected, setSelected] = useState<Square | null>(null);
  const [legal, setLegal] = useState<Square[]>([]);
  const [times, setTimes] = useState({ w: 300000, b: 300000 });
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState('White to move. Start the clock to play.');
  const [history, setHistory] = useState<string[]>([]);
  const [promotion, setPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [minutes, setMinutes] = useState(5);
  function settleClock() {
    const now = Date.now(); const current = clock.current;
    if (current.running) { const turn = engine.current.turn(); current[turn] = Math.max(0, current[turn] - (now - current.stamp)); if (current[turn] === 0) { current.running = false; current.flagged = turn; setRunning(false); setStatus(`${turn === 'w' ? 'White' : 'Black'} ran out of time. ${turn === 'w' ? 'Black' : 'White'} wins.`); } }
    current.stamp = now; setTimes({ w: current.w, b: current.b }); setFlagged(!!current.flagged);
  }
  useEffect(() => { const timer = window.setInterval(settleClock, 150); return () => window.clearInterval(timer); }, []);
  useEffect(() => { if (!visible) { settleClock(); clock.current.running = false; setRunning(false); } }, [visible]);
  function updatePosition() {
    const game = engine.current; setFen(game.fen()); setHistory(game.history()); setSelected(null); setLegal([]); setPromotion(null);
    if (game.isCheckmate()) setStatus(`Checkmate. ${game.turn() === 'w' ? 'Black' : 'White'} wins.`);
    else if (game.isStalemate()) setStatus('Draw by stalemate.');
    else if (game.isDraw()) setStatus('Draw.');
    else setStatus(`${game.turn() === 'w' ? 'White' : 'Black'} to move${game.isCheck() ? ' — check' : ''}.`);
    if (game.isGameOver()) { clock.current.running = false; setRunning(false); }
  }
  function makeMove(from: Square, to: Square, promote: PieceSymbol = 'q') {
    settleClock(); if (!clock.current.running || clock.current.flagged || engine.current.isGameOver()) return;
    try { engine.current.move({ from, to, promotion: promote }); updatePosition(); } catch { setStatus('That move is not legal. Choose a highlighted square.'); }
  }
  function choose(square: Square) {
    if (promotion || clock.current.flagged || engine.current.isGameOver()) return;
    if (!clock.current.running) { setStatus('Start or resume the clock before moving.'); return; }
    if (selected && legal.includes(square)) {
      const options = engine.current.moves({ square: selected, verbose: true }).filter(move => move.to === square);
      if (options.some(move => move.isPromotion())) setPromotion({ from: selected, to: square }); else makeMove(selected, square);
      return;
    }
    const piece = engine.current.get(square);
    if (piece?.color === engine.current.turn()) { setSelected(square); setLegal(engine.current.moves({ square, verbose: true }).map(move => move.to)); }
    else { setSelected(null); setLegal([]); }
  }
  function toggleClock() {
    settleClock(); if (engine.current.isGameOver() || clock.current.flagged) return;
    clock.current.running = !clock.current.running; clock.current.stamp = Date.now(); setRunning(clock.current.running);
    setStatus(clock.current.running ? `${engine.current.turn() === 'w' ? 'White' : 'Black'} to move.` : 'Clock paused. Resume to continue.');
  }
  function reset(duration = minutes) { setFlagged(false); engine.current.reset(); clock.current = { w: duration * 60000, b: duration * 60000, running: false, stamp: Date.now(), flagged: '' }; setTimes({ w: duration * 60000, b: duration * 60000 }); setRunning(false); updatePosition(); setStatus('White to move. Start the clock to play.'); }
  const board = new Chess(fen);
  return <section className="chess-game" hidden={!visible}>
    <div className="chess-heading"><div><p className="document-kicker">THE OTHER KIND OF STRATEGY</p><h2 id={visible ? 'document-title' : 'chess-title'}>A seat at the board.</h2></div><span>Two players · Local game</span></div>
    <div className="chess-clocks"><div className={board.turn() === 'b' && running ? 'clock-active' : ''}><span>BLACK</span><strong data-clock="b">{timeLabel(times.b)}</strong></div><div className={board.turn() === 'w' && running ? 'clock-active' : ''}><span>WHITE</span><strong data-clock="w">{timeLabel(times.w)}</strong></div></div>
    <ChessBoard3D fen={fen} selected={selected} legal={legal} visible={visible} onSquare={choose} />
    <p className="chess-status" role="status">{status}</p>
    {promotion && <div className="chess-promotion"><span>Promote pawn to:</span>{(['q', 'r', 'b', 'n'] as PieceSymbol[]).map(piece => <button key={piece} onClick={() => makeMove(promotion.from, promotion.to, piece)}>{pieceNames[piece]}</button>)}</div>}
    <div className="chess-controls"><button onClick={toggleClock} disabled={board.isGameOver() || flagged}>{running ? 'Pause clock' : 'Start / resume clock'}</button><button onClick={() => reset()}>Reset game</button><label>Time<select aria-label="Time per player" value={minutes} disabled={running || history.length > 0} onChange={event => { const value = Number(event.target.value); setMinutes(value); reset(value); }}><option value={5}>5 minutes</option><option value={10}>10 minutes</option><option value={15}>15 minutes</option></select></label></div>
    <details className="chess-accessible"><summary>Accessible board & move history</summary><div className="chess-flat-board" aria-label="Accessible chessboard">{squares.map((square, index) => { const piece = board.get(square); return <button key={square} data-square={square} aria-label={`${square}${piece ? ` ${piece.color === 'w' ? 'White' : 'Black'} ${pieceNames[piece.type]}` : ' empty'}${legal.includes(square) ? ', legal move' : ''}`} aria-pressed={selected === square} className={`${(Math.floor(index / 8) + index % 8) % 2 ? 'dark-square' : 'light-square'} ${legal.includes(square) ? 'legal-square' : ''}`} onClick={() => choose(square)}><small>{square}</small>{piece ? symbols[piece.color + piece.type] : ''}</button>; })}</div><p className="chess-history">{history.length ? history.map((move, i) => `${i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ''}${move}`).join(' ') : 'No moves yet.'}</p></details>
    <p className="chess-note">Select a piece, then a highlighted square. The clock pauses when you leave the table. Castling, en passant and promotion are supported.</p>
  </section>;
}

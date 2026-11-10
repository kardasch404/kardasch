import * as THREE from 'three';
import type { PieceSymbol } from 'chess.js';

// Turned wooden pieces, shared by the room table and the playable board.
export function chessPiece(type: PieceSymbol, material: THREE.Material) {
  const group = new THREE.Group();
  const add = (geometry: THREE.BufferGeometry, y: number, x = 0, z = 0) => { const mesh = new THREE.Mesh(geometry, material); mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh; };
  const height = { p: .43, r: .52, n: .59, b: .65, q: .73, k: .8 }[type];
  add(new THREE.CylinderGeometry(.16, .2, .07, 24), .035);
  add(new THREE.CylinderGeometry(.145, .17, .045, 24), .09);
  const profile = [[.13, .11], [.13, .15], [.08, .2], [.055, height * .65], [.11, height * .73], [.12, height * .78]].map(([x, y]) => new THREE.Vector2(x, y));
  add(new THREE.LatheGeometry(profile, 24), 0);
  if (type === 'p') add(new THREE.SphereGeometry(.115, 20, 14), height - .08);
  if (type === 'b') { const head = add(new THREE.SphereGeometry(.12, 20, 14), height - .08); head.scale.y = 1.45; add(new THREE.SphereGeometry(.035, 12, 8), height + .08); }
  if (type === 'r') { add(new THREE.CylinderGeometry(.15, .12, .12, 24), height - .04); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; const crenel = add(new THREE.BoxGeometry(.065, .075, .065), height + .045, Math.cos(a) * .12, Math.sin(a) * .12); crenel.rotation.y = -a; } }
  if (type === 'q') { add(new THREE.CylinderGeometry(.15, .07, .16, 24), height - .06); for (let i = 0; i < 7; i++) { const a = i * Math.PI * 2 / 7; add(new THREE.SphereGeometry(.032, 10, 8), height + .035, Math.cos(a) * .13, Math.sin(a) * .13); } add(new THREE.SphereGeometry(.055, 16, 10), height + .07); }
  if (type === 'k') { add(new THREE.SphereGeometry(.09, 20, 12), height - .06); add(new THREE.BoxGeometry(.055, .23, .055), height + .09); add(new THREE.BoxGeometry(.17, .055, .055), height + .13); }
  if (type === 'n') {
    const shape = new THREE.Shape(); shape.moveTo(-.1, .24); shape.bezierCurveTo(-.2, .44, -.11, .67, .04, .72); shape.lineTo(.09, .63); shape.lineTo(.2, .51); shape.lineTo(.18, .43); shape.lineTo(.03, .48); shape.lineTo(.07, .26); shape.closePath();
    const head = add(new THREE.ExtrudeGeometry(shape, { depth: .15, bevelEnabled: true, bevelThickness: .025, bevelSize: .025, bevelSegments: 3, steps: 1 }), 0); head.position.z = -.075;
  }
  return group;
}

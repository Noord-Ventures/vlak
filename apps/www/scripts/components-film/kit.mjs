import * as THREE from 'three';
import { TTFLoader } from 'three/addons/loaders/TTFLoader.js';
import { Font } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import opentype from 'three/addons/libs/opentype.module.js';

export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const mix = (a, b, p) => a + (b - a) * p;
export const ease = x => { x = clamp(x); return x * x * x * (x * (x * 6 - 15) + 10); };
export const spring = x => { x = Math.max(0, x); return 1 - Math.exp(-7.8 * x) * (Math.cos(10 * x) + .4 * Math.sin(10 * x)); };
export const pulse = (t, at, speed = 19) => t < at ? 0 : Math.sin((t - at) * speed) * Math.exp(-(t - at) * 8);

function path(w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  const s = new THREE.Shape();
  s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);
  s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);
  s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);
  s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
  return s;
}

export async function createKit(materials) {
  const data = await (await fetch('/film/Inter-580-clean.ttf')).arrayBuffer();
  const font = new Font(new TTFLoader().parse(data.slice(0)));
  const sourceFont = opentype.parse(data);
  const cache = new Map();
  const glyphs = new Map();
  function extrude(shape, depth, bevel = .016) {
    bevel = Math.min(bevel, depth * .23);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: depth - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 12, steps: 1 });
    geometry.translate(0, 0, -depth / 2 + bevel);
    return geometry;
  }
  function box(w, h, depth, material = materials.paper, radius = .045) {
    const key = [w,h,depth,radius].join(':');
    if (!cache.has(key)) cache.set(key, extrude(path(w,h,radius), depth, Math.min(.014,radius*.3)));
    const mesh = new THREE.Mesh(cache.get(key), material);
    mesh.castShadow = true; mesh.receiveShadow = true;
    return mesh;
  }
  function frame(w, h, depth, material = materials.gray, radius = .045, thickness = .026) {
    const shape = path(w,h,radius);
    shape.holes.push(path(w-thickness*2,h-thickness*2,Math.max(.001,radius-thickness)));
    const mesh = new THREE.Mesh(extrude(shape,depth,Math.min(.005,thickness*.13)), material);
    mesh.castShadow = true;mesh.receiveShadow = true;
    return mesh;
  }
  function text(value, em = .32, material = materials.ink, depth = .014, tracking = -.015) {
    if (typeof material === 'number' || typeof material === 'string') material = new THREE.MeshStandardMaterial({color:material,roughness:.6});
    const group = new THREE.Group();
    let advance = 0;
    for (let i=0;i<value.length;i++) {
      const character = value[i];
      const size = em * .72;
      const key = character+':'+size+':'+depth;
      if (!glyphs.has(key)) glyphs.set(key, new TextGeometry(character, {font,size,depth,curveSegments:8,bevelEnabled:depth>.025,bevelThickness:Math.min(.006,depth*.12),bevelSize:Math.min(.004,depth*.1),bevelSegments:2}));
      const mesh = new THREE.Mesh(glyphs.get(key), material);
      mesh.position.x = advance;
      mesh.castShadow = true;
      group.add(mesh);
      const glyph = sourceFont.charToGlyph(character);
      const next = sourceFont.charToGlyph(value[i+1] ?? ' ');
      advance += ((glyph.advanceWidth ?? 0) + (i < value.length-1 ? sourceFont.getKerningValue(glyph,next) : 0)) / sourceFont.unitsPerEm * em + tracking * em;
    }
    const bounds = new THREE.Box3().setFromObject(group);
    const center = bounds.getCenter(new THREE.Vector3());
    for (const child of group.children) child.position.sub(center);
    group.userData.width = bounds.max.x-bounds.min.x;
    group.userData.height = bounds.max.y-bounds.min.y;
    return group;
  }
  function label(parent, value, size, x, y, z, material = materials.ink, align = 'center') {
    const mesh = text(value,size,material);
    mesh.position.set(x+(align==='left'?mesh.userData.width/2:0),y,z);
    parent.add(mesh);return mesh;
  }
  function tile(w,h,labelValue,options={}) {
    const group = new THREE.Group();
    const body = box(w,h,options.depth??.12,options.ink?materials.ink:materials.paper,options.radius??.055);
    const border = frame(w-.014,h-.014,.02,options.ink?materials.ink:materials.gray,options.radius??.055,.018);
    border.position.z = (options.depth??.12)/2+.006;
    group.add(body,border);
    if(labelValue) label(group,labelValue,options.fontSize??.32,0,0,(options.depth??.12)/2+.024,options.ink?materials.paper:materials.ink);
    group.userData.body=body;return group;
  }
  function line(points, radius=.018, material=materials.ink) {
    const curve = new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(16,points.length*8),radius,6,false),material);
    mesh.castShadow=true;return mesh;
  }
  return {box,frame,text,label,tile,line,extrude,materials};
}

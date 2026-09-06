import * as THREE from 'three';
import { createStudio } from './studio.mjs';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const mix = (a, b, t) => a + (b - a) * t;
const settle = x => { x = clamp(x); return 1 - Math.exp(-8 * x) * (Math.cos(7 * x) + .45 * Math.sin(7 * x)); };

export async function createFilm(manifest) {
  const { scene, camera, renderer, makePanel, materials, dispose } = createStudio(innerWidth, innerHeight);
  document.querySelector('#stage').append(renderer.domElement);
  const loader = new THREE.TextureLoader();
  const panels = new Map();
  for (const asset of manifest.panels) {
    const texture = await loader.loadAsync('/textures/' + asset.id + '.png');
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const width = asset.width / 72;
    const object = makePanel(texture, width, asset.height / 72, .12);
    scene.add(object);
    panels.set(asset.id, { object, width, height: asset.height / 72, asset });
  }

  // The opening reconstructs the captured Waveform's 128 amplitudes as solid ink.
  const wave = new THREE.Group();
  const carrier = makePanel(null, 20, 5.2, .17, { physicalFace: true });
  carrier.position.z = -.24;
  wave.add(carrier);
  const bars = [];
  for (let index = 0; index < 128; index++) {
    const amplitude = .08 + Math.abs(Math.sin(index * .37) * Math.cos(index * .13)) * .88;
    const geometry = new THREE.BoxGeometry(.071, Math.max(.05, amplitude * 3.65), .36);
    const bar = new THREE.Mesh(geometry, index < 49 ? materials.ink : materials.graphite ?? materials.ink);
    bar.castShadow = true;
    bar.receiveShadow = true;
    bar.position.set((index - 63.5) * .146, 0, .18);
    wave.add(bar);
    bars.push(bar);
  }
  const playhead = new THREE.Mesh(new THREE.BoxGeometry(.028, 4.25, .045), materials.ink);
  playhead.position.z = .6;
  wave.add(playhead);
  scene.add(wave);

  const fragments = [];
  if (manifest.fragments) {
    for (const asset of manifest.fragments) {
      const texture = await loader.loadAsync('/textures/' + asset.id + '.png');
      texture.colorSpace = THREE.SRGBColorSpace;
      const mesh = makePanel(texture, asset.width / 72, asset.height / 72, .18);
      mesh.visible = false;
      scene.add(mesh);
      fragments.push({ mesh, asset });
    }
  }

  const caption = document.querySelector('#caption');
  const eyebrow = document.querySelector('#eyebrow');
  const heading = document.querySelector('#heading');
  const title = document.querySelector('#title');
  const veil = document.querySelector('#veil');
  const noise = document.querySelector('#grain');
  const sub = document.querySelector('#endnote');
  const titleWord = document.querySelector('#title span');
  await document.fonts.ready;
  titleWord.style.fontSize = (400 * innerWidth * .93 / titleWord.getBoundingClientRect().width) + 'px';

  function place(id, position, rotation, scale, progress = 1, delay = 0) {
    const entry = panels.get(id);
    if (!entry) return;
    const p = settle(clamp((progress - delay) / .85));
    const object = entry.object;
    object.visible = true;
    object.position.set(position[0] + (1 - p) * 1.7, position[1] - (1 - p) * 1.5, position[2] + (1 - p) * 4);
    object.rotation.set(rotation[0] + (1 - p) * .16, rotation[1] - (1 - p) * .25, rotation[2] + (1 - p) * .11);
    object.scale.setScalar(scale * (.93 + .07 * p));
  }
  function cameraAt(a, b, progress, target = [0, .4, 0]) {
    const p = smooth(progress);
    camera.position.set(...a.map((v, i) => mix(v, b[i], p)));
    camera.lookAt(...target);
  }
  function copy(kicker, text, local, duration) {
    eyebrow.textContent = kicker;
    heading.textContent = text;
    const alpha = smooth(local / .35) * (1 - smooth((local - duration + .4) / .4));
    caption.style.opacity = alpha;
    caption.style.transform = 'translateY(' + (1 - alpha) * 12 + 'px)';
  }

  function step(frame) {
    const time = frame / 30;
    for (const { object } of panels.values()) object.visible = false;
    for (const { mesh } of fragments) mesh.visible = false;
    wave.visible = false;
    caption.style.opacity = '0';
    title.style.opacity = '0';
    sub.style.opacity = '0';
    veil.style.opacity = '0';
    noise.style.opacity = '.025';
    document.body.classList.remove('inverse');

    if (time < 4.5) {
      const t = time / 4.5;
      wave.visible = true;
      wave.position.set(.4, 1.2, .25);
      wave.rotation.set(-.30 + .12 * t, -.13 + .2 * t, -.16 + .06 * t);
      for (const [i, bar] of bars.entries()) {
        const p = settle(clamp(time * 1.2 - i * .006));
        bar.position.z = .18 + (1 - p) * (1.7 + Math.sin(i * .3) * .5);
        bar.scale.z = 1 + Math.sin(i * .18 + time * 1.8) * .18;
      }
      playhead.position.x = -7.5 + 14.6 * smooth(t);
      cameraAt([-5, 5.4, 12.5], [2.2, 4, 23.5], t, [0, .65, 0]);
      copy('Vlak', '40 new components', time, 4.5);
    } else if (time < 9.5) {
      const t = time - 4.5;
      place('files', [-4.6, 2.3, .4], [-.16, .19, -.06], 1.13, t);
      place('properties', [5.7, 2.5, -.5], [-.16, -.22, .025], .88, t, .13);
      place('query', [2.4, -1.8, 2.2], [-.11, .1, -.035], .76, t, .27);
      cameraAt([.8, 3, 24], [-.4, 1.8, 22.8], t / 5);
      copy('File browser · Property grid · Query builder', 'Files & structure', t, 5);
    } else if (time < 12) {
      const t = time - 9.5;
      place('kanban', [0, 1.7, .5], [-.19, -.19, -.055], 1.2, t);
      cameraAt([-.7, 3.5, 26], [1.5, 1.7, 24], t / 2.5, [0, .45, 0]);
      fragments.slice(0, 2).forEach(({ mesh }, i) => {
        mesh.visible = t > .65;
        mesh.position.set(-4 + i * 9 + smooth((t - .65) / 1.5) * .6, -1.1 + i * .45, 3.8 + Math.sin(clamp(t - .65) * Math.PI) * .6);
        mesh.rotation.set(-.1, -.1, -.045 + i * .03);
        mesh.scale.setScalar(.85);
      });
      copy('Kanban board', 'Work in motion', t, 2.5);
    } else if (time < 14.5) {
      const t = time - 12;
      place('scheduler', [-2.4, 2.45, .4], [-.16, .16, -.05], 1.03, t);
      place('progress', [6.6, 2.25, -.1], [-.12, -.18, .03], .78, t, .12);
      place('composer', [3.7, -1.7, 2.45], [-.16, -.13, -.015], .81, t, .24);
      cameraAt([.6, 2.8, 26], [-1, 1.8, 24.8], t / 2.5, [0, .6, 0]);
      copy('Scheduler · Task progress · Message composer', 'Plan & create', t, 2.5);
    } else if (time < 19) {
      const t = time - 14.5;
      place('audio', [0, 3.4, 1.25], [-.1, .08, -.035], .88, t);
      place('selection', [-5.3, -1.1, .1], [-.12, .18, -.045], .84, t, .14);
      place('metrics', [5.3, -.8, .8], [-.08, -.12, .03], .91, t, .22);
      cameraAt([.5, 3.2, 25], [-1.3, 1.1, 23], t / 4.5);
      copy('Waveform · Transfer list · Metric', 'Media & controls', t, 4.5);
    } else {
      const t = time - 19;
      const grid = [
        ['kanban', -7.7, 5.65, .79], ['scheduler', 2.3, 5.65, .79],
        ['properties', 10.2, 5.65, .79], ['files', -9.1, -.9, .81],
        ['selection', -1.05, -.9, .81], ['progress', 5.6, -.9, .79],
        ['metrics', 11.6, -.9, .75], ['audio', -8.5, -6.2, .79],
        ['query', 1.5, -6.2, .79], ['composer', 10.6, -6.2, .79],
      ];
      grid.forEach(([id, x, y, size], index) => {
        const p = settle(clamp((t - index * .045) / 1.35));
        place(id, [x * .86, y * .83 + 1.55, mix((index % 3) * 1.6, 0, p)],
          [mix(-.20, 0, p), mix(index % 2 ? -.18 : .18, 0, p), 0], size * .84, t, index * .045);
      });
      cameraAt([4, 7.5, 34], [0, .5, 37], clamp(t / 4), [0, .5, 0]);
      copy('114 components', 'One system', t, 4);
      if (time >= 23) {
        const end = time - 23;
        const lift = smooth(end / .75);
        veil.style.opacity = String(lift);
        title.style.opacity = String(lift);
        titleWord.style.transform = 'scale(' + mix(1.055, 1, lift) + ')';
        sub.style.opacity = String(smooth((end - .4) / .5));
        noise.style.opacity = '.055';
        // One deliberate cut to ink, then a long clean final hold.
        if (end > .9 && end < 1.45) document.body.classList.add('inverse');
      }
    }
    renderer.render(scene, camera);
  }
  step(0);
  return { step, dispose, ready: true };
}

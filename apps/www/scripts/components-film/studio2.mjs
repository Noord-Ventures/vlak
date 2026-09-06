/** Tactile monochrome studio: physical light, contact AO, and selective depth of field. */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

/**
 * createStudio(width, height, options?) returns:
 * scene, camera, renderer, materials, render(), setFocus(distance, aperture?),
 * focusAt(Vector3), setDOF(boolean), setAO(boolean, strength?), setSize(w,h),
 * setExposure(number), dispose(), backdrop, lights, passes, composer.
 *
 * IMPORTANT: call render(), not renderer.render(), to include the finish passes.
 * Units: an individual control is about 2–6 units wide; the full stage about 20.
 * The default focus is near z=0. Recompute focus after changing the camera.
 * options: ao (true), dof (true), aoScale (.65), samples (4), aperture (.0008).
 */
export function createStudio(width, height, options = {}) {
  RectAreaLightUniformsLib.init();
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.toneMappingExposure = 1.65;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xfaf8f2);
  const camera = new THREE.PerspectiveCamera(31, width / height, 0.15, 65);
  camera.position.set(0, 3, 22);
  camera.lookAt(0, 0, 0);

  // Studio reflection geometry gives metals a long white ribbon and a dark edge.
  // The environment is prefiltered once; it adds no objects to the actual film.
  const reflectionRoom = new THREE.Scene();
  reflectionRoom.background = new THREE.Color(0x383838);
  const roomGeometries = [];
  const roomMaterials = [];
  function softbox(w, h, position, energy) {
    const geometry = new THREE.PlaneGeometry(w, h);
    const material = new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(energy), side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.lookAt(0, 0, 0);
    reflectionRoom.add(mesh);
    roomGeometries.push(geometry); roomMaterials.push(material);
  }
  softbox(9, 14, [-8, 7, 10], 4.5);
  softbox(2.2, 13, [8, 2, 6], 7);
  softbox(8, 6, [1, 10, -1], 3.2);
  softbox(9, 3, [0, -7, 6], .7);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(reflectionRoom, .06, .1, 60);
  scene.environment = environment.texture;
  scene.environmentIntensity = .72;
  pmrem.dispose();
  for (const geometry of roomGeometries) geometry.dispose();
  for (const material of roomMaterials) material.dispose();

  // Deterministic microscopic grain, almost imperceptible until a close macro.
  const grainData = new Uint8Array(128 * 128);
  let seed = 73517;
  for (let i = 0; i < grainData.length; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    grainData[i] = 113 + (seed >>> 27);
  }
  const grain = new THREE.DataTexture(grainData, 128, 128, THREE.RedFormat, THREE.UnsignedByteType);
  grain.wrapS = grain.wrapT = THREE.RepeatWrapping;
  grain.repeat.set(18, 18);
  grain.magFilter = THREE.LinearFilter;
  grain.minFilter = THREE.LinearMipmapLinearFilter;
  grain.generateMipmaps = true;
  grain.needsUpdate = true;
  const materials = {
    paper: new THREE.MeshPhysicalMaterial({ color: 0xfaf8f2, roughness: .67, metalness: 0, clearcoat: .035, clearcoatRoughness: .6, bumpMap: grain, bumpScale: .009 }),
    porcelain: new THREE.MeshPhysicalMaterial({ color: 0xfffdf7, roughness: .27, metalness: 0, clearcoat: .22, clearcoatRoughness: .2 }),
    ink: new THREE.MeshPhysicalMaterial({ color: 0x080808, roughness: .55, metalness: 0, clearcoat: .025, clearcoatRoughness: .5 }),
    graphite: new THREE.MeshPhysicalMaterial({ color: 0x303030, roughness: .3, metalness: .42 }),
    silver: new THREE.MeshPhysicalMaterial({ color: 0xcacaca, roughness: .22, metalness: 1 }),
    edge: new THREE.MeshStandardMaterial({ color: 0xcdccc8, roughness: .55, metalness: .08 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: .86, metalness: 0 }),
    backdrop: new THREE.MeshStandardMaterial({ color: 0xfaf8f2, roughness: .93, metalness: 0 }),
  };

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-5, 7, 16);
  key.target.position.set(0, 0, -.8);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -15, right: 15, top: 12, bottom: -12, near: .5, far: 45 });
  key.shadow.bias = -.000055;
  key.shadow.normalBias = .008;
  key.shadow.radius = 12;
  key.shadow.blurSamples = 8;
  key.shadow.intensity = .6;
  scene.add(key, key.target);
  const largeWindow = new THREE.RectAreaLight(0xffffff, 2.8, 10, 13);
  largeWindow.position.set(-7, 7, 11); largeWindow.lookAt(0, 0, 0); scene.add(largeWindow);
  const edgeStrip = new THREE.RectAreaLight(0xffffff, 4.0, 2.0, 11);
  edgeStrip.position.set(8, 1.5, 5); edgeStrip.lookAt(0, 0, 0); scene.add(edgeStrip);
  const fill = new THREE.HemisphereLight(0xffffff, 0xa7a6a2, .27); scene.add(fill);
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(80, 60), materials.backdrop);
  backdrop.position.z = -1.7;
  backdrop.name = 'Continuous paper studio';
  backdrop.receiveShadow = true;
  scene.add(backdrop);

  const target = new THREE.WebGLRenderTarget(width, height, {
    type: THREE.HalfFloatType,
    samples: Math.min(options.samples ?? 4, renderer.capabilities.maxSamples),
    depthBuffer: true,
  });
  const composer = new EffectComposer(renderer, target);
  const beauty = new RenderPass(scene, camera);
  composer.addPass(beauty);
  const ao = new GTAOPass(scene, camera, width, height);
  ao.updateGtaoMaterial({ radius: .37, distanceExponent: 1.25, thickness: .42, distanceFallOff: .68, scale: 1.0, samples: 8, screenSpaceRadius: false });
  ao.updatePdMaterial({ lumaPhi: 8, depthPhi: 2, normalPhi: 3, radius: 5, radiusExponent: 2, rings: 2, samples: 12 });
  ao.blendIntensity = .64;
  ao.enabled = options.ao ?? true;
  composer.addPass(ao);
  const bokeh = new BokehPass(scene, camera, { focus: 22.2, aperture: options.aperture ?? .0008, maxblur: .009 });
  bokeh.enabled = options.dof ?? true;
  composer.addPass(bokeh);
  const output = new OutputPass(); composer.addPass(output);
  const aoScale = options.aoScale ?? .65;
  ao.setSize(Math.max(1, Math.round(width * aoScale)), Math.max(1, Math.round(height * aoScale)));

  function setFocus(distance, aperture) {
    bokeh.uniforms.focus.value = Math.max(.15, distance);
    if (aperture !== undefined) bokeh.uniforms.aperture.value = Math.max(0, aperture);
  }
  const viewPoint = new THREE.Vector3();
  function focusAt(point) {
    camera.updateMatrixWorld();
    viewPoint.copy(point).applyMatrix4(camera.matrixWorldInverse);
    setFocus(-viewPoint.z);
  }
  function render() { composer.render(1 / 30); }
  function setDOF(enabled) { bokeh.enabled = enabled; }
  function setAO(enabled, strength) {
    ao.enabled = enabled;
    if (strength !== undefined) ao.blendIntensity = strength;
  }
  function setExposure(exposure) { renderer.toneMappingExposure = exposure; }
  function setSize(w, h) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    composer.setSize(w, h);
    ao.setSize(Math.max(1, Math.round(w * aoScale)), Math.max(1, Math.round(h * aoScale)));
  }
  function dispose() {
    for (const material of Object.values(materials)) material.dispose();
    backdrop.geometry.dispose(); grain.dispose(); environment.dispose();
    for (const pass of [beauty, ao, bokeh, output]) pass.dispose?.();
    composer.dispose(); renderer.dispose();
  }
  return { scene, camera, renderer, materials, render, setFocus, focusAt, setDOF, setAO, setExposure, setSize, dispose, backdrop, lights: { key, largeWindow, edgeStrip, fill }, passes: { beauty, ao, bokeh, output }, composer };
}

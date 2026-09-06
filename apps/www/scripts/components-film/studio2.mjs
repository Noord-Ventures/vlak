/** Matte paper-and-ink studio: soft layer shadows and restrained depth of field. */
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
 * options: ao (true), dof (true), aoScale (.65), samples (4), aperture (.00035),
 * pixelRatio (2). Supersampling keeps moving, subpixel hairlines continuous.
 */
export function createStudio(width, height, options = {}) {
  RectAreaLightUniformsLib.init();
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
  const pixelRatio = Math.max(1, options.pixelRatio ?? 2);
  renderer.setPixelRatio(pixelRatio);
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

  // Broad, quiet illumination keeps the faces readable as flat printed surfaces.
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
  softbox(18, 18, [-6, 7, 12], 2.0);
  softbox(16, 16, [8, 2, 10], 1.0);
  softbox(16, 12, [1, 10, 3], 1.3);
  softbox(16, 9, [0, -7, 10], .8);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(reflectionRoom, .06, .1, 60);
  scene.environment = environment.texture;
  scene.environmentIntensity = .45;
  pmrem.dispose();
  for (const geometry of roomGeometries) geometry.dispose();
  for (const material of roomMaterials) material.dispose();

  // Preserve material names used by the animated parts, but give every part the
  // same diffuse finish: paper, ink and gray rather than ceramic or metal.
  const matte = color => new THREE.MeshPhysicalMaterial({
    color, roughness: 1, metalness: 0, clearcoat: 0,
    specularIntensity: 0, envMapIntensity: .45,
  });
  const materials = {
    paper: matte(0xfaf8f2),
    porcelain: matte(0xfaf8f2),
    ink: matte(0x080808),
    graphite: matte(0x242424),
    silver: matte(0xb5b4b0),
    edge: matte(0xbdbcb8),
    rubber: matte(0x0b0b0b),
    backdrop: matte(0xfaf8f2),
  };

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-4, 6, 18);
  key.target.position.set(0, 0, -.8);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -15, right: 15, top: 12, bottom: -12, near: .5, far: 45 });
  key.shadow.bias = -.000055;
  key.shadow.normalBias = .008;
  key.shadow.radius = 15;
  key.shadow.blurSamples = 8;
  key.shadow.intensity = .52;
  scene.add(key, key.target);
  const largeWindow = new THREE.RectAreaLight(0xffffff, 1.5, 18, 18);
  largeWindow.position.set(-4, 6, 14); largeWindow.lookAt(0, 0, 0); scene.add(largeWindow);
  const edgeStrip = new THREE.RectAreaLight(0xffffff, .7, 16, 14);
  edgeStrip.position.set(7, 0, 12); edgeStrip.lookAt(0, 0, 0); scene.add(edgeStrip);
  const fill = new THREE.HemisphereLight(0xffffff, 0xc5c4bf, .7); scene.add(fill);
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
  ao.updateGtaoMaterial({ radius: .20, distanceExponent: 1.25, thickness: .24, distanceFallOff: .68, scale: 1.0, samples: 8, screenSpaceRadius: false });
  ao.updatePdMaterial({ lumaPhi: 8, depthPhi: 2, normalPhi: 3, radius: 5, radiusExponent: 2, rings: 2, samples: 12 });
  ao.blendIntensity = .38;
  ao.enabled = options.ao ?? true;
  composer.addPass(ao);
  const bokeh = new BokehPass(scene, camera, { focus: 22.2, aperture: options.aperture ?? .00035, maxblur: .004 });
  bokeh.enabled = options.dof ?? true;
  composer.addPass(bokeh);
  const output = new OutputPass(); composer.addPass(output);
  const aoScale = options.aoScale ?? .65;
  // The canvas keeps its logical CSS size while all beauty passes render at the
  // physical size. Browser compositing downsamples to the requested film size.
  composer.setSize(width, height);
  ao.setSize(Math.max(1, Math.round(width * pixelRatio * aoScale)), Math.max(1, Math.round(height * pixelRatio * aoScale)));

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
    ao.setSize(Math.max(1, Math.round(w * pixelRatio * aoScale)), Math.max(1, Math.round(h * pixelRatio * aoScale)));
  }
  function dispose() {
    for (const material of Object.values(materials)) material.dispose();
    backdrop.geometry.dispose(); environment.dispose();
    for (const pass of [beauty, ao, bokeh, output]) pass.dispose?.();
    composer.dispose(); renderer.dispose();
  }
  return { scene, camera, renderer, materials, render, setFocus, focusAt, setDOF, setAO, setExposure, setSize, dispose, backdrop, lights: { key, largeWindow, edgeStrip, fill }, passes: { beauty, ao, bokeh, output }, composer };
}

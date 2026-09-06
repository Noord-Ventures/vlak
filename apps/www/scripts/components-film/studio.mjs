/**
 * Dimensional paper studio for the Vlak component film.
 * Browser module. The host supplies import-map entries for three and three/addons/.
 * UI textures retain their actual paint; bevels, backs and shadows carry the light.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const paint = {
  paper: 0xfaf8f2,
  edge: 0xe7e5de,
  ink: 0x1a1a1a,
  graphite: 0x3d3d3d,
  silver: 0xc8c8c8,
};

/** Nearly square broad faces, with a tiny physical edge that catches the softbox. */
export function bevelledPanelGeometry(width, height, depth = 0.14, bevel = 0.014) {
  const radius = Math.max(0.0001, Math.min(bevel, depth * 0.44, width * 0.025, height * 0.025));
  return new RoundedBoxGeometry(width, height, depth, 2, radius);
}

/**
 * @returns {{scene: THREE.Scene, camera: THREE.PerspectiveCamera,
 * renderer: THREE.WebGLRenderer, makePanel: Function, materials: object,
 * backdrop: THREE.Mesh, lights: object, setSize: Function, dispose: Function}}
 *
 * makePanel(texture, width, height, depth=.14, options={}) returns a Group.
 * options: bevel, edgeMaterial, faceMaterial, physicalFace, opacity, name,
 * receiveFaceShadow (default true), shadowOpacity (default .14).
 * The centered body spans ±depth/2; its face is at depth/2 + .003.
 * User textures remain caller-owned and are not disposed by this module.
 */
export function createStudio(width, height) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.93;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(paint.paper);
  const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
  camera.position.set(0, 3, 24);
  camera.lookAt(0, 0, 0);

  const room = new RoomEnvironment();
  const generator = new THREE.PMREMGenerator(renderer);
  const environment = generator.fromScene(room, 0.055);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.58;
  room.dispose();
  generator.dispose();

  const ownedMaterials = new Set();
  const ownedGeometries = new Set();
  const keepMaterial = (material) => { ownedMaterials.add(material); return material; };
  const keepGeometry = (geometry) => { ownedGeometries.add(geometry); return geometry; };
  const standard = (color, roughness, metalness = 0) => keepMaterial(new THREE.MeshStandardMaterial({ color, roughness, metalness }));
  const materials = {
    paper: standard(paint.paper, 0.76),
    edge: standard(paint.edge, 0.64),
    ink: standard(paint.ink, 0.47, 0.025),
    graphite: standard(paint.graphite, 0.34, 0.20),
    silver: standard(paint.silver, 0.23, 0.92),
    backdrop: standard(paint.paper, 0.96),
  };

  // One soft shadow caster keeps the offline WebGL/SwiftShader render economical.
  const key = new THREE.DirectionalLight(0xffffff, 2.35);
  key.position.set(-7, 10, 12);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -16;
  key.shadow.camera.right = 16;
  key.shadow.camera.top = 12;
  key.shadow.camera.bottom = -12;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 45;
  key.shadow.bias = -0.00008;
  key.shadow.normalBias = 0.012;
  key.shadow.radius = 4;
  key.shadow.blurSamples = 6;
  key.target.position.set(0, 0, -0.5);
  scene.add(key, key.target);

  const fill = new THREE.HemisphereLight(0xffffff, 0xbab8b2, 0.60);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 1.10);
  rim.position.set(8, 3, -1);
  scene.add(rim);
  const lowerBounce = new THREE.DirectionalLight(0xffffff, 0.20);
  lowerBounce.position.set(-4, -6, 8);
  scene.add(lowerBounce);

  // The receiver is a seamless sheet parallel to the UI panels, not a device frame.
  const backdrop = new THREE.Mesh(keepGeometry(new THREE.PlaneGeometry(80, 55)), materials.backdrop);
  backdrop.name = "Vlak seamless paper backdrop";
  backdrop.position.z = -3;
  backdrop.receiveShadow = true;
  scene.add(backdrop);

  function makePanel(texture, panelWidth, panelHeight, depth = 0.14, options = {}) {
    const group = new THREE.Group();
    group.name = options.name ?? "Vlak dimensional component";
    const bevel = options.bevel ?? 0.014;
    const body = new THREE.Mesh(
      keepGeometry(bevelledPanelGeometry(panelWidth, panelHeight, depth, bevel)),
      options.edgeMaterial ?? materials.edge,
    );
    body.name = "Physical paper thickness and bevel";
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.needsUpdate = true;
    }
    const opacity = options.opacity ?? 1;
    let faceMaterial = options.faceMaterial;
    if (!faceMaterial) {
      faceMaterial = options.physicalFace
        ? new THREE.MeshStandardMaterial({ map: texture ?? null, color: texture ? 0xffffff : paint.paper, roughness: 0.84, metalness: 0, envMapIntensity: 0.24, transparent: opacity < 1, opacity })
        : new THREE.MeshBasicMaterial({ map: texture ?? null, color: texture ? 0xffffff : paint.paper, toneMapped: false, transparent: opacity < 1, opacity });
      keepMaterial(faceMaterial);
    }
    const inset = Math.min(bevel * 0.72, depth * 0.20);
    const surface = new THREE.Mesh(
      keepGeometry(new THREE.PlaneGeometry(Math.max(0.001, panelWidth - inset * 2), Math.max(0.001, panelHeight - inset * 2))),
      faceMaterial,
    );
    surface.name = "Actual Vlak component face";
    surface.position.z = depth / 2 + 0.003;
    surface.receiveShadow = Boolean(options.physicalFace);
    group.add(surface);
    // A separate transparent receiver preserves exact UI ink while nearby layers
    // cast soft, physical shadows onto it. It does not write depth or cast a shadow.
    if (!options.physicalFace && options.receiveFaceShadow !== false) {
      const shadowMaterial = keepMaterial(new THREE.ShadowMaterial({
        color: 0x000000,
        opacity: options.shadowOpacity ?? 0.14,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }));
      const faceShadow = new THREE.Mesh(surface.geometry, shadowMaterial);
      faceShadow.name = "Soft shadow over exact Vlak ink";
      faceShadow.position.z = surface.position.z + 0.001;
      faceShadow.receiveShadow = true;
      group.add(faceShadow);
      group.userData.shadow = faceShadow;
    }
    group.userData.body = body;
    group.userData.surface = surface;
    return group;
  }

  function setSize(nextWidth, nextHeight) {
    renderer.setSize(nextWidth, nextHeight, false);
    camera.aspect = nextWidth / nextHeight;
    camera.updateProjectionMatrix();
  }

  function dispose() {
    for (const geometry of ownedGeometries) geometry.dispose();
    for (const material of ownedMaterials) material.dispose();
    environment.dispose();
    renderer.dispose();
  }

  return { scene, camera, renderer, makePanel, materials, backdrop, lights: { key, fill, rim, lowerBounce }, setSize, dispose };
}

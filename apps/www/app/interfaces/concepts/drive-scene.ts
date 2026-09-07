import * as THREE from "three";
import { sceneColor } from "./scene-color";
import { createDriveModel } from "./drive-model";
import { createDriveWorld } from "./drive-world";

export type DriveSceneMode = "vehicle" | "journey" | "energy";
export interface DriveSceneState { mode: DriveSceneMode; lights: boolean; navigating: boolean; paused: boolean; reducedMotion: boolean; load: number; charge: number; charging: boolean }

export function createDriveScene(host: HTMLDivElement, initial: DriveSceneState, car: THREE.Group, failed: () => void) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0,0);
  renderer.domElement.setAttribute("aria-hidden","true");
  renderer.domElement.dataset.engine = "three";
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(12, 1, .08, 180);
  const model = createDriveModel(car);scene.add(model.root);
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x999999, emissive: 0x000000, roughness: 1, metalness: 0, toneMapped: false });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(180,90),floorMaterial);floor.rotation.x=-Math.PI/2;floor.position.y=-.006;scene.add(floor);
  const headlights = new THREE.Group(); scene.add(headlights);
  const beams: THREE.SpotLight[] = [];
  const glowMaterial = new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,toneMapped:false});
  const lensMaterial = new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false});
  for(const z of [-.77,.77]) {
    const lamp = new THREE.SpotLight(0xffffff,0,13,Math.PI/8,.8,1.4);
    lamp.position.set(-2.37,1.06,z); lamp.target.position.set(-8.4,-.15,z*.8);
    headlights.add(lamp,lamp.target); beams.push(lamp);
    const lens = new THREE.Mesh(new THREE.BoxGeometry(.016,.045,.24),lensMaterial);
    lens.position.copy(lamp.position);headlights.add(lens);
    const glow = new THREE.Mesh(new THREE.ConeGeometry(1.25,6.2,48,1,true),glowMaterial);
    glow.position.set(-5.36,.61,z);glow.rotation.z=-Math.PI/2+.15;headlights.add(glow);
  }
  const world = createDriveWorld(); scene.add(world.root);
  const worldMaterials = new Map<THREE.Material, { opacity: number; transparent: boolean; depthWrite: boolean }>();
  world.root.traverse(object => {
    const drawable = object as THREE.Mesh;
    if (!drawable.material) return;
    for (const material of Array.isArray(drawable.material) ? drawable.material : [drawable.material]) {
      worldMaterials.set(material, { opacity: material.opacity, transparent: material.transparent, depthWrite: material.depthWrite });
    }
  });
  const groundMaterial = new THREE.LineBasicMaterial({color:0xb4b4b4,transparent:true,opacity:.6});
  const groundLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-3.1,0,1.18),new THREE.Vector3(3.1,0,1.18)]),groundMaterial);scene.add(groundLine);
  let state=initial,disposed=false,frame=0,last=0,visible=true,tabVisible=!document.hidden,width=1,height=1,distance=0,wheelAngle=0,flowDistance=0;
  let bodyLift=0,batteryLift=0,coverLift=0,vehicleOpacity=1,span=2.52,lightPower=0,fov=12,worldOpacity=0;
  const eye=new THREE.Vector3(0,.13,10).normalize(),target=new THREE.Vector3(0,1.02,0);
  const desiredEye=new THREE.Vector3(),desiredTarget=new THREE.Vector3();
  const palette=()=>{
    const tokens = getComputedStyle(host);
    const color=sceneColor(tokens.getPropertyValue("--text"));
    const dark=color.r+color.g+color.b>1.8;
    const paper = sceneColor(tokens.getPropertyValue("--table-alt"), tokens.getPropertyValue("--bg"));
    for (const material of [model.materials.paint, model.materials.glass, model.materials.rubber, model.materials.alloy, model.materials.trim, model.materials.lamp]) material.color.copy(paper);
    model.materials.silhouette.color.setHex(dark ? 0xb8b8b8 : 0x363636);
    model.materials.vehicleEdge.color.setHex(dark ? 0xb8b8b8 : 0x363636);
    model.materials.chargeFill.color.setHex(dark ? 0xc0c0c0 : 0x414141);
    model.materials.cell.color.copy(paper);
    model.materials.edge.color.setHex(dark ? 0xa5a5a5 : 0x4a4a4a);
    model.materials.edge.opacity = .66;
    model.materials.detail.color.setHex(dark ? 0x8a8a8a : 0x636363);
    floorMaterial.emissive.copy(paper);
    groundMaterial.color.setHex(dark?0x575757:0xb9b9b9);world.palette(paper,color);scene.fog=new THREE.Fog(paper,42,112);
    host.dataset.theme=dark?"dark":"light";host.dataset.paper=paper.getHexString();
    request();
  };
  const render=(now:number)=>{
    frame=0;if(disposed||!visible||!tabVisible||!width||!height)return;
    const dt=Math.min((now-(last||now))/1000,.05);last=now;
    const snap=state.reducedMotion||state.paused;
    const rate=snap?1:1-Math.exp(-dt*6);
    const energy=state.mode==="energy",journey=state.mode==="journey";
    desiredEye.set(journey?10:energy?-4.8:0,journey?5.2:energy?5.8:.13,journey?2.4:energy?7.6:10).normalize();
    desiredTarget.set(journey?-1.25:0,energy?.86:journey?1.05:1.03,0);
    const nextSpan=Math.max(energy?3.30:journey?10:2.52,(energy?4.25:journey?16:5.95)/(width/height));
    const nextFov=journey?48:12; fov=THREE.MathUtils.lerp(fov,nextFov,rate);
    eye.lerp(desiredEye,rate).normalize();target.lerp(desiredTarget,rate);span=THREE.MathUtils.lerp(span,nextSpan,rate);
    bodyLift=THREE.MathUtils.lerp(bodyLift,energy?.30:0,rate);batteryLift=THREE.MathUtils.lerp(batteryLift,energy?.10:0,rate);coverLift=THREE.MathUtils.lerp(coverLift,energy?.90:0,rate);
    vehicleOpacity=THREE.MathUtils.lerp(vehicleOpacity,energy?0:1,rate);
    for(const [source,material]of model.vehicleMaterials){
      const original=source as THREE.MeshBasicMaterial,copy=material as THREE.MeshBasicMaterial;
      if(original.color&&copy.color)copy.color.copy(original.color);
      const transparent=source.transparent||vehicleOpacity<.999;if(material.transparent!==transparent){material.transparent=transparent;material.needsUpdate=true;}material.opacity=vehicleOpacity*(source.transparent?source.opacity:1);material.depthWrite=vehicleOpacity>.99;
    }
    model.body.visible=model.runningGear.visible=vehicleOpacity>.003;
    model.body.position.y=bodyLift;model.battery.position.y=batteryLift;model.cover.position.y=coverLift;
    model.connectors.visible=energy;model.connectors.scale.y=.72;model.current.visible=energy;
    lightPower=THREE.MathUtils.lerp(lightPower,state.lights&&!energy?1:0,rate);
    headlights.visible=lightPower>.001;
    for(const beam of beams)beam.intensity=48*lightPower;
    glowMaterial.opacity=.006*lightPower;
    worldOpacity=THREE.MathUtils.lerp(worldOpacity,journey?1:0,rate);
    world.root.visible=worldOpacity>.002;
    for(const [material,original] of worldMaterials){
      material.opacity=original.opacity*worldOpacity;
      const transparent=original.transparent||worldOpacity<.999;
      if(material.transparent!==transparent){material.transparent=transparent;material.needsUpdate=true;}
      material.depthWrite=original.depthWrite&&worldOpacity>.99;
    }
    floor.visible=journey||headlights.visible;groundLine.visible=!journey&&!energy;
    const moving=journey&&!state.paused&&!state.reducedMotion;
    const flowing=energy&&!state.paused&&!state.reducedMotion;
    if(moving){const speed=state.navigating?6.8:2.6;wheelAngle=(wheelAngle+dt*speed/.37)%(Math.PI*2);distance+=dt*speed;}
    world.update(distance);
    for(const wheel of model.wheels)wheel.rotation.z=wheelAngle;
    for(const [index,fill]of model.moduleFills.entries()){
      const fraction=THREE.MathUtils.clamp(state.charge/100*12-index,0,1);
      fill.scale.x=Math.max(.001,fraction);fill.position.x=-.975+Math.floor(index/3)*.65-(1-fraction)*.275;
    }
    if(flowing){flowDistance=(flowDistance+dt*.10*Math.max(.4,Math.abs(state.load)))%2.38;for(const [index,dot]of model.current.children.entries()){
      const amount=(flowDistance+index*.30)%2.38;
      dot.position.x=state.charging?1.19-amount:-1.19+amount;
    }}
    camera.position.copy(eye).multiplyScalar(span/(2*Math.tan(THREE.MathUtils.degToRad(fov)/2))).add(target);camera.lookAt(target);camera.fov=fov;camera.aspect=width/height;camera.updateProjectionMatrix();
    renderer.render(scene,camera);
    host.dataset.lightPower=lightPower.toFixed(3);host.dataset.headlights=String(beams.length);host.dataset.contourWidth=String(model.materials.vehicleEdge.linewidth);host.dataset.span=span.toFixed(3);host.dataset.mode=state.mode;host.dataset.wheelAngle=wheelAngle.toFixed(4);host.dataset.bodyLift=bodyLift.toFixed(3);host.dataset.camera=camera.position.toArray().map(x=>x.toFixed(3)).join(",");host.dataset.cameraStyle=journey?"chase":energy?"battery":"side";host.dataset.worldDistance=distance.toFixed(3);host.dataset.worldVisible=String(world.root.visible);host.dataset.worldObjects=String(world.objectCount);host.dataset.worldLoop=String(world.loopLength);host.dataset.cameraFov=fov.toFixed(2);host.dataset.moving=String(moving);host.dataset.modules=String(model.moduleFills.length);host.dataset.wheels=String(model.wheels.length);host.dataset.drawCalls=String(renderer.info.render.calls);host.dataset.charge=state.charge.toFixed(1);host.dataset.vehicleOpacity=vehicleOpacity.toFixed(3);host.dataset.routeActive=String(state.navigating);host.dataset.triangles=String(renderer.info.render.triangles);host.dataset.load=state.load.toFixed(1);host.dataset.lights=String(state.lights);host.dataset.flowPhase=flowDistance.toFixed(4);host.dataset.rendered="true";
    const transitioning=Math.abs(fov-nextFov)>.002||Math.abs(worldOpacity-(journey?1:0))>.002||Math.abs(lightPower-(state.lights&&!energy?1:0))>.002||eye.distanceTo(desiredEye)>.002||target.distanceTo(desiredTarget)>.002||Math.abs(span-nextSpan)>.002||Math.abs(bodyLift-(energy?.30:0))>.002||Math.abs(coverLift-(energy?.90:0))>.002||Math.abs(vehicleOpacity-(energy?0:1))>.002;
    host.dataset.settled=String(!transitioning);
    if(transitioning||moving||flowing)request();
  };
  function request(){if(!disposed&&!frame&&visible&&tabVisible&&width&&height)frame=requestAnimationFrame(render);}
  const resize=()=>{const rect=host.getBoundingClientRect();width=Math.round(rect.width);height=Math.round(rect.height);if(width&&height){renderer.setSize(width,height,false);last=0;request();}else if(frame){cancelAnimationFrame(frame);frame=0;}};
  const observer=new ResizeObserver(resize);observer.observe(host);
  const intersection=new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);if(visible){last=0;request();}else if(frame){cancelAnimationFrame(frame);frame=0;}});intersection.observe(host);
  const visibility=()=>{tabVisible=!document.hidden;if(tabVisible){last=0;request();}else if(frame){cancelAnimationFrame(frame);frame=0;}};
  document.addEventListener("visibilitychange",visibility);
  const themeObserver=new MutationObserver(palette);themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme","style","class"]});
  const theme=matchMedia("(prefers-color-scheme: dark)");theme.addEventListener("change",palette);
  const lost=(event:Event)=>{event.preventDefault();visible=false;if(frame)cancelAnimationFrame(frame);frame=0;failed();};renderer.domElement.addEventListener("webglcontextlost",lost);
  resize();palette();
  return {
    update(next:DriveSceneState){state=next;last=0;palette();},
    dispose(){disposed=true;if(frame)cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();themeObserver.disconnect();theme.removeEventListener("change",palette);document.removeEventListener("visibilitychange",visibility);renderer.domElement.removeEventListener("webglcontextlost",lost);const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();scene.traverse(object=>{const drawable=object as THREE.Mesh;if(drawable.geometry)geometries.add(drawable.geometry);if(drawable.material)for(const item of Array.isArray(drawable.material)?drawable.material:[drawable.material])materials.add(item);});for(const geometry of geometries)geometry.dispose();for(const material of [...materials,...Object.values(model.materials)])material.dispose();model.gradient.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();},
  };
}

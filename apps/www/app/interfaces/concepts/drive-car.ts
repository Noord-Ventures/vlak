import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import type { LineMaterial } from "three/addons/lines/LineMaterial.js";

/** A sparse, three-dimensional drawing measured from tonielpro520's licensed Evoque. */
export function arrangeDriveCar(materials: {
  paint: THREE.Material; rubber: THREE.Material; vehicleEdge: LineMaterial; silhouette: THREE.Material;
}) {
  const body = new THREE.Group(), runningGear = new THREE.Group();
  const wheels = [-1.4923,1.5933].flatMap(x=>[-.9168,.9168].map(z=>{
    const wheel=new THREE.Group();wheel.position.set(x,.45,z);runningGear.add(wheel);return wheel;
  }));
  // An abstract shell follows the source silhouette and wheelbase. Keeping the
  // drawing in object space makes the side schematic and perspective views one object.
  const profile = new THREE.Shape();
  profile.moveTo(-2.39,.32);
  profile.bezierCurveTo(-2.51,.34,-2.54,.55,-2.52,.83);
  profile.bezierCurveTo(-2.51,1.01,-2.45,1.08,-2.32,1.13);
  profile.bezierCurveTo(-2.02,1.22,-1.66,1.25,-1.28,1.28);
  profile.lineTo(-.39,1.80);
  profile.quadraticCurveTo(-.25,1.86,-.06,1.86);
  profile.lineTo(1.38,1.82);
  profile.lineTo(1.90,1.78);
  profile.lineTo(1.78,1.72);
  profile.lineTo(2.18,1.31);
  profile.bezierCurveTo(2.43,1.31,2.52,1.19,2.52,.97);
  profile.lineTo(2.52,.61);
  profile.bezierCurveTo(2.52,.41,2.39,.34,2.12,.32);
  profile.lineTo(2.12,.45);
  profile.bezierCurveTo(2.12,.75,1.88,.99,1.59,.99);
  profile.bezierCurveTo(1.30,.99,1.06,.75,1.06,.45);
  profile.lineTo(1.06,.32);
  profile.lineTo(-.96,.32);
  profile.lineTo(-.96,.45);
  profile.bezierCurveTo(-.96,.75,-1.20,.99,-1.49,.99);
  profile.bezierCurveTo(-1.78,.99,-2.02,.75,-2.02,.45);
  profile.lineTo(-2.02,.32);
  profile.closePath();
  const widthAt = (y: number) => 1.035 - Math.max(0,y-1.29)*.46;
  const strokeBatches = new Map<THREE.Group, number[]>();
  const stroke = (parent: THREE.Group, points: THREE.Vector3[], closed = false) => {
    const segments: number[] = [];
    for (let i = 1; i < points.length; i++) segments.push(...points[i - 1]!.toArray(), ...points[i]!.toArray());
    if (closed) segments.push(...points[points.length - 1]!.toArray(), ...points[0]!.toArray());
    if(!strokeBatches.has(parent))strokeBatches.set(parent,[]);
    strokeBatches.get(parent)!.push(...segments);
  };
  const curve = (points: number[][], closed = false) => new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p[0], p[1], p[2])), closed, "centripetal").getPoints(Math.max(24, points.length * 10));
  const perimeter = profile.getPoints(24);
  const faceMaterial = materials.paint;
  faceMaterial.side = THREE.DoubleSide;
  for (const sign of [-1,1]) {
    const indexed = new THREE.ShapeGeometry(profile,24), source = indexed.toNonIndexed();indexed.dispose();
    const coordinates=source.getAttribute("position"), triangles:number[]=[];
    // Split at the shoulder so neither side face cuts through its own window lines.
    const clip=(polygon:THREE.Vector2[],upper:boolean)=>{
      const result:THREE.Vector2[]=[];
      for(let i=0;i<polygon.length;i++) {
        const a=polygon[i]!,b=polygon[(i+1)%polygon.length]!;
        const insideA=upper?a.y>=1.29:a.y<=1.29,insideB=upper?b.y>=1.29:b.y<=1.29;
        if(insideA)result.push(a);
        if(insideA!==insideB)result.push(a.clone().lerp(b,(1.29-a.y)/(b.y-a.y)));
      }
      return result;
    };
    for(let i=0;i<coordinates.count;i+=3) {
      const triangle=[0,1,2].map(j=>new THREE.Vector2(coordinates.getX(i+j),coordinates.getY(i+j)));
      for(const upper of [false,true]) {
        const polygon=clip(triangle,upper);
        for(let j=1;j<polygon.length-1;j++) {
          const face=sign<0?[polygon[0]!,polygon[j+1]!,polygon[j]!]:[polygon[0]!,polygon[j]!,polygon[j+1]!];
          for(const point of face)triangles.push(point.x,point.y,sign*widthAt(point.y));
        }
      }
    }
    source.dispose();
    const face=new THREE.BufferGeometry();face.setAttribute("position",new THREE.Float32BufferAttribute(triangles,3));face.computeVertexNormals();
    const mesh = new THREE.Mesh(face,faceMaterial);mesh.userData.vehicleSurface=true;body.add(mesh);
    stroke(body,perimeter.map(p=>new THREE.Vector3(p.x,p.y,sign*(widthAt(p.y)+.003))));
  }
  // Ruled surfaces keep the bonnet and roof edges continuous in every projection.
  const shell: number[] = [];
  for(let i=1;i<perimeter.length;i++)for(let j=0;j<16;j++) {
    const a=perimeter[i-1]!,b=perimeter[i]!,t=j/16,u=(j+1)/16;
    const at=(p:THREE.Vector2,v:number)=>[p.x,p.y,(v*2-1)*widthAt(p.y)];
    // The clockwise profile needs the opposite winding across the +Z extrusion.
    shell.push(...at(a,t),...at(b,u),...at(b,t),...at(a,t),...at(a,u),...at(b,u));
  }
  const shellGeometry=new THREE.BufferGeometry();shellGeometry.setAttribute("position",new THREE.Float32BufferAttribute(shell,3));shellGeometry.computeVertexNormals();
  const shellMesh=new THREE.Mesh(shellGeometry,faceMaterial);shellMesh.userData.vehicleSurface=true;body.add(shellMesh);
  const innerBody=new THREE.Mesh(new THREE.BoxGeometry(4.4,.82,1.70),faceMaterial);innerBody.position.y=.72;innerBody.userData.vehicleSurface=true;body.add(innerBody);
  const side = (points:number[][],sign:number,closed=false) => stroke(body,curve(points,closed).map(p=>new THREE.Vector3(p.x,p.y,sign*(widthAt(p.y)+.008))));
  const window = new THREE.Shape();
  window.moveTo(-1.17,1.34);window.lineTo(-.33,1.78);
  window.quadraticCurveTo(-.22,1.82,.12,1.81);
  window.lineTo(1.37,1.75);window.lineTo(1.81,1.34);window.closePath();
  for(const sign of [-1,1]) {
    stroke(body,window.getPoints(20).map(p=>new THREE.Vector3(p.x,p.y,sign*(widthAt(p.y)+.008))));
    side([[.10,1.81,0],[.02,1.34,0],[.0,.88,0],[.0,.38,0]],sign);
    side([[1.02,1.77,0],[1.30,1.34,0],[1.38,1.12,0],[1.30,.94,0]],sign);
    side([[-1.17,1.34,0],[-1.22,1.10,0],[-1.23,.94,0]],sign);
    side([[-1.28,1.24,0],[-1.14,1.25,0],[.3,1.27,0],[2.34,1.29,0]],sign);
    side([[-.84,.38,0],[.15,.38,0],[.95,.38,0]],sign);
    side([[-.33,1.18,0],[-.12,1.19,0]],sign);
    side([[.95,1.21,0],[1.16,1.22,0]],sign);
    side([[-2.44,1.05,0],[-2.18,1.08,0],[-2.04,1.13,0]],sign);
    side([[2.02,1.24,0],[2.42,1.23,0]],sign);
  }
  // The clean shell alone supplies a silhouette; none of the source trim contributes edges.
  for(const mesh of [...body.children])if(mesh instanceof THREE.Mesh && mesh !== innerBody) {
    const contour=mesh.geometry.clone(),p=contour.getAttribute("position"),n=contour.getAttribute("normal");
    for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)+n.getX(i)*.005,p.getY(i)+n.getY(i)*.005,p.getZ(i)+n.getZ(i)*.005);
    const outline=new THREE.Mesh(contour,materials.silhouette);outline.userData.vehicleContour=true;body.add(outline);
  }
  for(const sign of [-1,1]) {
    const mirror=new THREE.Shape();mirror.moveTo(-.79,1.33);mirror.lineTo(-.79,1.40);mirror.quadraticCurveTo(-.77,1.47,-.67,1.47);mirror.lineTo(-.57,1.47);mirror.quadraticCurveTo(-.52,1.47,-.52,1.40);mirror.lineTo(-.52,1.33);mirror.closePath();
    const housing=new THREE.ExtrudeGeometry(mirror,{depth:.16,bevelEnabled:false,steps:1,curveSegments:12});housing.translate(0,0,sign>0?1.03:-1.19);
    const mesh=new THREE.Mesh(housing,faceMaterial);mesh.userData.vehicleSurface=true;body.add(mesh);
    stroke(body,mirror.getPoints(16).map(p=>new THREE.Vector3(p.x,p.y,sign*1.194)));
  }
  const across = (x:number,y:number) => stroke(body,Array.from({length:33},(_,i)=>new THREE.Vector3(x,y+.005,(i/16-1)*widthAt(y))));
  across(-1.28,1.28);across(-.39,1.80);across(1.90,1.78);across(1.78,1.72);across(2.18,1.31);
  body.updateMatrixWorld(true);
  const endStroke=(points:number[][],sign:number,closed=false)=>{
    const ray=new THREE.Raycaster();
    stroke(body,curve(points,closed).map(p=>{
      ray.set(new THREE.Vector3(sign*4,p.y,p.z),new THREE.Vector3(-sign,0,0));
      const hit=ray.intersectObject(shellMesh)[0];
      if(hit)p.x=hit.point.x+sign*.008;
      return p;
    }));
  };
  // Front and rear lamp strips, and a single grille opening; no badges or grille mesh.
  endStroke([[-2.505,.95,-.80],[-2.536,.96,0],[-2.505,.95,.80],[-2.545,.80,.76],[-2.55,.80,0],[-2.545,.80,-.76]],-1,true);
  endStroke([[2.50,1.15,-.86],[2.53,1.15,0],[2.50,1.15,.86]],1);
  endStroke([[2.526,.58,-.83],[2.535,.56,0],[2.526,.58,.83]],1);
  for (const wheel of wheels) {
    const tireGeometry = new THREE.CylinderGeometry(.45,.45,.29,64,1);
    tireGeometry.rotateX(Math.PI / 2);
    const tireMesh = new THREE.Mesh(tireGeometry,materials.rubber); tireMesh.userData.vehicleSurface=true; wheel.add(tireMesh);
    for (const z of [-.147,.147]) {
      const circle = (radius: number) => Array.from({length:65},(_,i) => new THREE.Vector3(Math.cos(i/64*Math.PI*2)*radius,Math.sin(i/64*Math.PI*2)*radius,z));
      stroke(wheel,circle(.45));stroke(wheel,circle(.31));stroke(wheel,circle(.055));
      for(let i=0;i<5;i++) { const angle=i*Math.PI*2/5; stroke(wheel,[new THREE.Vector3(Math.cos(angle)*.065,Math.sin(angle)*.065,z),new THREE.Vector3(Math.cos(angle)*.30,Math.sin(angle)*.30,z)]); }
    }
  }
  for(const [parent,segments] of strokeBatches)parent.add(new LineSegments2(new LineSegmentsGeometry().setPositions(segments),materials.vehicleEdge));
  return { body, runningGear, wheels };
}

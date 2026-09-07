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
  profile.moveTo(-2.37,.32);
  profile.bezierCurveTo(-2.49,.34,-2.54,.56,-2.52,.83);
  profile.bezierCurveTo(-2.50,.98,-2.38,1.09,-2.20,1.145);
  profile.bezierCurveTo(-1.97,1.20,-1.53,1.245,-1.23,1.26);
  profile.bezierCurveTo(-1.06,1.42,-.47,1.71,-.18,1.79);
  profile.bezierCurveTo(-.05,1.815,.12,1.815,.31,1.81);
  profile.bezierCurveTo(.80,1.81,1.31,1.79,1.77,1.75);
  profile.lineTo(2.23,1.715);
  profile.lineTo(2.12,1.665);
  profile.lineTo(2.35,1.39);
  profile.bezierCurveTo(2.45,1.36,2.52,1.22,2.52,1.02);
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
  // The source has a narrow glasshouse, a rounded nose and a crowned bonnet/roof.
  const widthAt = (x: number, y: number) => 1.065-Math.max(0,y-.90)*.10-Math.max(0,y-1.22)*.38-Math.max(0,-2.02-x)*.46-Math.max(0,x-1.98)*.23;
  const crownAt = (x: number, y: number) => THREE.MathUtils.clamp((y-1.08)/.18,0,1)*(x < -1.23 ? .14 : x < -.18 ? THREE.MathUtils.lerp(.14,.10,(x+1.23)/1.05) : THREE.MathUtils.lerp(.10,.06,THREE.MathUtils.clamp((x-1.77)/.75,0,1)));
  const strokeBatches = new Map<THREE.Group, number[]>();
  const stroke = (parent: THREE.Group, points: THREE.Vector3[], closed = false) => {
    const segments: number[] = [];
    for (let i = 1; i < points.length; i++) segments.push(...points[i - 1]!.toArray(), ...points[i]!.toArray());
    if (closed) segments.push(...points[points.length - 1]!.toArray(), ...points[0]!.toArray());
    if(!strokeBatches.has(parent))strokeBatches.set(parent,[]);
    strokeBatches.get(parent)!.push(...segments);
  };
  const curve = (points: number[][], closed = false) => {
    const vertices=points.map(p=>new THREE.Vector3(p[0],p[1],p[2]));
    if(closed)return [...vertices.flatMap((point,i)=>new THREE.LineCurve3(point,vertices[(i+1)%vertices.length]!).getPoints(8).slice(0,-1)),vertices[0]!];
    return new THREE.CatmullRomCurve3(vertices,false,"centripetal").getPoints(Math.max(24,points.length*10));
  };
  const perimeter = profile.getPoints(24);
  const faceMaterial = materials.paint;
  faceMaterial.side = THREE.DoubleSide;
  for (const sign of [-1,1]) {
    const indexed = new THREE.ShapeGeometry(profile,24), source = indexed.toNonIndexed();indexed.dispose();
    const coordinates=source.getAttribute("position"), triangles:number[]=[];
    // Split at the width changes so face triangulation cannot cover a drawn detail.
    const clip=(polygon:THREE.Vector2[],axis:"x"|"y",value:number,upper:boolean)=>{
      const result:THREE.Vector2[]=[];
      for(let i=0;i<polygon.length;i++) {
        const a=polygon[i]!,b=polygon[(i+1)%polygon.length]!;
        const insideA=upper?a[axis]>=value:a[axis]<=value,insideB=upper?b[axis]>=value:b[axis]<=value;
        if(insideA)result.push(a);
        if(insideA!==insideB)result.push(a.clone().lerp(b,(value-a[axis])/(b[axis]-a[axis])));
      }
      return result;
    };
    for(let i=0;i<coordinates.count;i+=3) {
      const triangle=[0,1,2].map(j=>new THREE.Vector2(coordinates.getX(i+j),coordinates.getY(i+j)));
      for(const [left,right] of [[-Infinity,-2.02],[-2.02,1.98],[1.98,Infinity]] as const)for(const [bottom,top] of [[-Infinity,.90],[.90,1.22],[1.22,Infinity]] as const) {
        let polygon=triangle;
        for(const [axis,value,upper] of [["x",left,true],["x",right,false],["y",bottom,true],["y",top,false]] as const)if(Number.isFinite(value))polygon=clip(polygon,axis,value,upper);
        for(let j=1;j<polygon.length-1;j++) {
          const face=sign<0?[polygon[0]!,polygon[j+1]!,polygon[j]!]:[polygon[0]!,polygon[j]!,polygon[j+1]!];
          for(const point of face)triangles.push(point.x,point.y,sign*widthAt(point.x,point.y));
        }
      }
    }
    source.dispose();
    const face=new THREE.BufferGeometry();face.setAttribute("position",new THREE.Float32BufferAttribute(triangles,3));face.computeVertexNormals();
    const mesh = new THREE.Mesh(face,faceMaterial);mesh.userData.vehicleSurface=true;body.add(mesh);
    stroke(body,perimeter.map(p=>new THREE.Vector3(p.x,p.y,sign*(widthAt(p.x,p.y)+.003))));
  }
  // Ruled surfaces keep the bonnet and roof edges continuous in every projection.
  const shell: number[] = [];
  for(let i=1;i<perimeter.length;i++)for(let j=0;j<16;j++) {
    const a=perimeter[i-1]!,b=perimeter[i]!,t=j/16,u=(j+1)/16;
    const at=(p:THREE.Vector2,v:number)=>[p.x,p.y+crownAt(p.x,p.y)*(1-(v*2-1)**2),(v*2-1)*widthAt(p.x,p.y)];
    // The clockwise profile needs the opposite winding across the +Z extrusion.
    shell.push(...at(a,t),...at(b,u),...at(b,t),...at(a,t),...at(a,u),...at(b,u));
  }
  const shellGeometry=new THREE.BufferGeometry();shellGeometry.setAttribute("position",new THREE.Float32BufferAttribute(shell,3));shellGeometry.computeVertexNormals();
  const shellMesh=new THREE.Mesh(shellGeometry,faceMaterial);shellMesh.userData.vehicleSurface=true;body.add(shellMesh);
  const innerBody=new THREE.Mesh(new THREE.BoxGeometry(4.4,.82,1.70),faceMaterial);innerBody.position.y=.72;innerBody.userData.vehicleSurface=true;body.add(innerBody);
  const side = (points:number[][],sign:number,closed=false) => stroke(body,curve(points,closed).map(p=>new THREE.Vector3(p.x,p.y,sign*(widthAt(p.x,p.y)+.008))));
  const window = new THREE.Shape();
  window.moveTo(-.829,1.326);window.lineTo(-.078,1.779);
  window.bezierCurveTo(.30,1.790,.89,1.790,1.19,1.776);
  window.quadraticCurveTo(1.47,1.76,1.668,1.739);
  window.lineTo(1.961,1.447);window.quadraticCurveTo(.64,1.42,-.829,1.326);window.closePath();
  for(const sign of [-1,1]) {
    stroke(body,window.getPoints(20).map(p=>new THREE.Vector3(p.x,p.y,sign*(widthAt(p.x,p.y)+.008))));
    side([[.412,1.780,0],[.386,1.390,0],[.37,.86,0],[.33,.39,0]],sign);
    side([[.365,1.780,0],[.340,1.386,0]],sign);
    side([[1.178,1.764,0],[1.34,1.427,0],[1.38,1.18,0],[1.28,.99,0]],sign);
    side([[-.829,1.326,0],[-.88,1.13,0],[-.89,.83,0],[-.85,.40,0]],sign);
    side([[-1.12,1.26,0],[-.64,1.31,0],[.56,1.37,0],[1.96,1.42,0]],sign);
    side([[-.94,.33,0],[-.83,.41,0],[.25,.42,0],[1.01,.43,0]],sign);
    for(const [x,y] of [[.05,1.31],[1.10,1.37]] as const) {
      const handle=new THREE.Shape();handle.moveTo(x-.076,y-.015);handle.lineTo(x+.076,y-.015);handle.quadraticCurveTo(x+.087,y-.015,x+.087,y-.004);handle.lineTo(x+.087,y+.009);handle.quadraticCurveTo(x+.087,y+.020,x+.076,y+.020);handle.lineTo(x-.076,y+.020);handle.quadraticCurveTo(x-.087,y+.020,x-.087,y+.009);handle.lineTo(x-.087,y-.004);handle.quadraticCurveTo(x-.087,y-.015,x-.076,y-.015);
      stroke(body,handle.getPoints(8).map(p=>new THREE.Vector3(p.x,p.y,sign*(widthAt(p.x,p.y)+.009))));
    }
    side([[-1.13,1.25,0],[-.79,1.29,0],[-.84,1.26,0],[-1.10,1.23,0]],sign,true);
    side([[-2.42,1.045,0],[-2.20,1.08,0],[-2.03,1.155,0],[-2.10,1.075,0],[-2.23,1.035,0],[-2.42,1.006,0]],sign,true);
    side([[-2.40,1.019,0],[-2.22,1.05,0],[-2.10,1.09,0]],sign);
    side([[-2.40,.69,0],[-2.21,.71,0],[-2.21,.52,0],[-2.40,.51,0]],sign,true);
    side([[-2.38,.61,0],[-2.23,.62,0]],sign);
    side([[2.08,1.345,0],[2.40,1.315,0],[2.45,1.26,0],[2.10,1.29,0]],sign,true);
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
  const across = (x:number,y:number) => stroke(body,Array.from({length:33},(_,i)=>new THREE.Vector3(x,y+.008+crownAt(x,y)*(1-(i/16-1)**2),(i/16-1)*widthAt(x,y))));
  across(-1.23,1.26);across(-.18,1.79);across(2.23,1.715);across(2.12,1.665);
  body.updateMatrixWorld(true);
  const surfaces=body.children.filter((object):object is THREE.Mesh=>object instanceof THREE.Mesh&&object.userData.vehicleSurface);
  const endStroke=(points:number[][],sign:number,closed=false)=>{
    const ray=new THREE.Raycaster();
    let projected:THREE.Vector3[]=[];
    for(const p of curve(points,closed)) {
      ray.set(new THREE.Vector3(sign*4,p.y,p.z),new THREE.Vector3(-sign,0,0));
      const hit=ray.intersectObjects(surfaces,false)[0];
      if(hit){p.x=hit.point.x+sign*.008;projected.push(p);}
      else {stroke(body,projected);projected=[];}
    }
    stroke(body,projected);
  };
  // Characteristic openings are a few closed shapes, not the source's trim mesh.
  endStroke([[-2.5,1.02,-.60],[-2.5,1.035,0],[-2.5,1.02,.60],[-2.5,.845,.49],[-2.5,.835,0],[-2.5,.845,-.49]],-1,true);
  for(const sign of [-1,1])endStroke([[-2.5,1.055,sign*.62],[-2.5,1.11,sign*.94],[-2.5,1.015,sign*.90],[-2.5,.99,sign*.62]],-1,true);
  endStroke([[-2.5,.62,-.71],[-2.5,.63,0],[-2.5,.62,.71],[-2.5,.46,.59],[-2.5,.42,0],[-2.5,.46,-.59]],-1,true);
  endStroke([[2.3,1.69,-.65],[2.3,1.71,0],[2.3,1.69,.65],[2.3,1.45,.82],[2.3,1.44,0],[2.3,1.45,-.82]],1,true);
  for(const sign of [-1,1])endStroke([[2.5,1.315,sign*.40],[2.5,1.32,sign*.88],[2.5,1.255,sign*.88],[2.5,1.25,sign*.40]],1,true);
  endStroke([[2.5,1.22,-.83],[2.5,.70,-.81],[2.5,.66,.81],[2.5,1.22,.83]],1);
  endStroke([[2.5,1.08,-.27],[2.5,1.08,.27],[2.5,.95,.27],[2.5,.95,-.27]],1,true);
  endStroke([[2.3,1.48,-.28],[2.3,1.48,.28]],1);
  endStroke([[2.526,.48,-.83],[2.535,.44,0],[2.526,.48,.83]],1);
  for(const sign of [-1,1]) {
    const ray=new THREE.Raycaster();
    let projected:THREE.Vector3[]=[];
    for(const p of curve([[-1.88,2,sign*.73],[-1.35,2,sign*.77],[-1.48,2,sign*.65],[-1.79,2,sign*.66]],true)) {
      ray.set(new THREE.Vector3(p.x,4,p.z),new THREE.Vector3(0,-1,0));
      const hit=ray.intersectObject(shellMesh)[0];
      if(hit){p.y=hit.point.y+.008;projected.push(p);}
      else {stroke(body,projected);projected=[];}
    }
    stroke(body,projected);
  }
  for (const wheel of wheels) {
    const tireGeometry = new THREE.CylinderGeometry(.45,.45,.29,64,1);
    tireGeometry.rotateX(Math.PI / 2);
    const tireMesh = new THREE.Mesh(tireGeometry,materials.rubber); tireMesh.userData.vehicleSurface=true; wheel.add(tireMesh);
    for (const z of [-.147,.147]) {
      const circle = (radius: number) => Array.from({length:65},(_,i) => new THREE.Vector3(Math.cos(i/64*Math.PI*2)*radius,Math.sin(i/64*Math.PI*2)*radius,z));
      stroke(wheel,circle(.45));stroke(wheel,circle(.325));stroke(wheel,circle(.070));
      for(let i=0;i<5;i++) {
        const angle=i*Math.PI*2/5;
        const spoke=[[.095,-.035],[.30,-.063],[.318,-.019],[.14,.034],[.095,.028]].map(([x,y])=>new THREE.Vector3(x!*Math.cos(angle)-y!*Math.sin(angle),x!*Math.sin(angle)+y!*Math.cos(angle),z));
        stroke(wheel,spoke,true);
      }
    }
  }
  for(const [parent,segments] of strokeBatches)parent.add(new LineSegments2(new LineSegmentsGeometry().setPositions(segments),materials.vehicleEdge));
  return { body, runningGear, wheels };
}

import * as THREE from 'three';
import { createStudio } from './studio2.mjs';
import { createKit, mix, ease, spring } from './kit.mjs';
import { createControls } from './controls.mjs';
import { createMechanisms } from './mechanisms.mjs';
import { createSelection } from './selection.mjs';
import { createPlanning } from './planning.mjs';

export async function createFilm() {
  const studio=createStudio(innerWidth,innerHeight);
  const {scene,camera,renderer,materials:m}=studio;
  m.gray=new THREE.MeshStandardMaterial({color:0x3e3e3e,roughness:.85,envMapIntensity:.12});
  m.ink.roughness=.86;m.ink.metalness=0;m.ink.clearcoat=0;m.ink.envMapIntensity=.12;
  m.metal=m.silver;
  document.querySelector('#stage').append(renderer.domElement);
  const kit=await createKit(m);
  const controls=createControls(THREE,kit);
  const mechanisms=createMechanisms(THREE,kit);
  const selection=createSelection(THREE,kit);
  const planning=createPlanning(THREE,kit);
  const chapters=[controls,mechanisms,selection,planning];
  for(const chapter of chapters) scene.add(chapter.group);

  const finale=new THREE.Group();scene.add(finale);
  const logo=kit.text('Vlak.dev',5.25,[m.ink,m.graphite],.42,-.055);
  finale.add(logo);
  const letterBase=logo.children.map(letter=>letter.position.clone());
  const atoms=[];
  const words=['+','−','204','px','Send','Add','Fit','Name','Value','From','To','44','14','4','Type','Grid','Play','1','2','3','Edit','Save','Copy','100%'];
  for(let i=0;i<48;i++) {
    const word=words[i%words.length];
    const width=word.length<3?.8:word.length<5?1.7:2.0;
    const atom=kit.tile(width,.72,word,{fontSize:.24,depth:.14,ink:i%7===0,radius:.06});
    finale.add(atom);atoms.push(atom);
  }
  const endTitle=document.querySelector('#title');
  const veil=document.querySelector('#veil');
  const grain=document.querySelector('#grain');
  const endnote=document.querySelector('#endnote');
  const word=document.querySelector('#title span');
  await document.fonts.ready;
  word.style.fontSize=(400*innerWidth*.93/word.getBoundingClientRect().width)+'px';
  endnote.textContent='Vlak, in detail';

  const target=new THREE.Vector3();
  function view(from,to,p,aim=[0,0,0],focus=aim) {
    p=ease(p);
    camera.position.set(...from.map((value,i)=>mix(value,to[i],p)));
    camera.lookAt(...aim);
    studio.focusAt(target.set(...focus));
  }
  function step(frame) {
    const time=frame/30;
    const dark=time>=6&&time<12.5;
    scene.background.setHex(dark?0x10100f:0xf0efeb);
    m.backdrop.color.setHex(dark?0x080807:0xfaf8f2);
    m.backdrop.envMapIntensity=dark?.05:1;
    m.paper.color.setHex(dark?0x191918:0xfaf8f2);
    m.ink.color.setHex(dark?0xecebe7:0x080808);
    m.gray.color.setHex(dark?0x666664:0x3e3e3e);
    for(const chapter of chapters) chapter.group.visible=false;
    finale.visible=false;
    endTitle.style.opacity='0';veil.style.opacity='0';endnote.style.opacity='0';
    grain.style.opacity='.026';document.body.classList.remove('inverse');
    studio.setDOF(true);
    if(time<6) {
      const t=time;
      controls.group.visible=true;controls.update(t);
      controls.group.rotation.set(0,0,0);
      if(t<2.3) view([-8,8,11.5],[-2,6,15],t/2.3,[0,.3,1.1],[0,0,1.25]);
      else view([-2,6,15],[.8,3.4,23.7],(t-2.3)/1.55,[0,.1,.4],[0,.8,.4]);
    } else if(time<12.5) {
      const t=time-6;
      mechanisms.group.visible=true;mechanisms.update(Math.min(6,t));
      mechanisms.group.rotation.set(-.07,.04,-.025);
      mechanisms.group.position.set(0,.5,0);
      if(t<1.7) view([-4.5,5.1,19],[2.5,4.7,20.5],t/1.7,[0,.3,1.1],[0,.3,1.3]);
      else view([2.5,4.7,20.5],[-1.0,2.1,21.8],(t-1.7)/3.5,[0,.25,.6],[0,0,.5]);
    } else if(time<19) {
      const t=time-12.5;
      selection.group.visible=true;selection.update(t);
      selection.group.rotation.set(-.065,.035,-.02);
      view([-4,5,22],[2.5,3,23.5],t/6.5,[0,.2,.8],[0,.4,1.2]);
    } else if(time<26.5) {
      const t=time-19;
      planning.group.visible=true;planning.update(t);
      planning.group.rotation.set(-.04,.025,-.018);
      if(t<1.65) view([-6,5.8,12],[-1,4.8,20],t/1.65,[-2.5,1.2,1.2],[-2.5,1.8,1]);
      else if(t<3.35) view([-1,4.8,20],[1.6,3,26.5],(t-1.65)/1.7,[0,.2,.6],t<3.28?[-1,0,3.2]:[0,1,.8]);
      else view([1.6,3,26.5],[-1.2,1.2,25],(t-3.35)/4.15,[0,.1,.5],[0,0,1]);
    } else {
      const t=time-26.5;
      finale.visible=true;
      const build=ease(t/2.7);
      logo.position.set(0,.2,.4);
      logo.rotation.set(mix(-.12,0,build),mix(-.23,0,build),mix(-.028,0,build));
      logo.children.forEach((letter,i)=>{
        const p=spring(Math.max(0,t-i*.082));
        letter.position.copy(letterBase[i]);
        letter.position.z+=(1-p)*(2.5+i*.13);
        letter.position.y+=(1-p)*Math.sin(i*.8)*.5;
        letter.rotation.y=(1-p)*.5;
      });
      atoms.forEach((atom,i)=>{
        const angle=i/atoms.length*Math.PI*2+t*.12;
        const radius=mix(10.4,12.8,build);
        const x=Math.cos(angle)*radius;
        const y=Math.sin(angle)*radius*.43;
        atom.position.set(x,y,mix(-.35+Math.sin(i*.8)*.3,-.75,build));
        atom.rotation.set(Math.sin(angle)*.24*(1-build),Math.cos(angle)*.4*(1-build),angle*.2*(1-build));
        atom.scale.setScalar(mix(.75,.55,build));
      });
      view([-3,4.5,24],[0,.1,23.8],t/3,[0,.2,.5],[0,.2,.65]);
      if(t>1.6)studio.setDOF(false);
      if(time>29.55) {
        const p=ease((time-29.55)/.38);
        endTitle.style.opacity=String(p);veil.style.opacity=String(p);
        endnote.style.opacity=String(p);
        word.style.transform='scale('+mix(1.025,1,p)+')';
        grain.style.opacity='.16';
        if(time>30.35&&time<30.95)document.body.classList.add('inverse');
      }
    }
    studio.render();
  }
  step(0);
  let meshes=0,triangles=0;
  scene.traverse(object=>{if(object.isMesh){meshes++;triangles+=(object.geometry.index?.count??object.geometry.attributes.position?.count??0)/3;}});
  return {step,ready:true,stats:{meshes,triangles,screenTextures:0,chapters:4,featured:['Switch','NumberField','RangeSlider','Rating','Waveform','PlaybackControls','MediaScrubber','MultiSelect','TagInput','QueryBuilder','Scheduler','KanbanBoard']},dispose:studio.dispose};
}

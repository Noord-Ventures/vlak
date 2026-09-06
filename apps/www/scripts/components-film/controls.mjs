import { clamp, mix, ease, spring, pulse } from './kit.mjs';

export function createControls(THREE, kit) {
  const { box, frame, text, label, tile, materials: m } = kit;
  const group = new THREE.Group();
  const toggle = new THREE.Group();group.add(toggle);
  const rail = box(6.4,3.49,.25,m.paper,1.745);
  const outline = frame(6.4,3.49,.09,m.gray,1.745,.09);
  const inner = box(6.23,3.32,.08,m.ink.clone(),1.66);
  inner.material.transparent = true;inner.material.opacity=0;
  const thumb = new THREE.Group();
  const thumbBody = box(2.47,2.47,.012,m.paper,1.235);
  const thumbRim = frame(2.47,2.47,.006,m.gray,1.235,.024);
  thumb.add(thumbBody,thumbRim);
  toggle.add(rail,outline,inner,thumb);
  const visible = label(toggle,'Visible',.46,0,-2.4,.08,m.ink);

  const number = new THREE.Group();group.add(number);
  const inputBody = tile(5.4,1.45,'',{radius:.07});
  const minus = tile(1.45,1.45,'−',{fontSize:.65,radius:.07});minus.position.x=3.8;
  const plus = tile(1.45,1.45,'+',{fontSize:.65,radius:.07});plus.position.x=5.55;
  const numberLabel=label(number,'Grid module',.4,-2.7,1.2,.1,m.gray,'left');
  label(inputBody,'px',.4,1.92,0,.023,m.gray);
  number.add(inputBody,minus,plus);
  const digitStates=['184','188','196','204'].map(value=>{
    const digits=text(value,.95,m.ink,.032);
    digits.position.set(-.8,0,.023);number.add(digits);return digits;
  });

  const range = new THREE.Group();group.add(range);
  const rangeRows = [];
  for(let row=0;row<2;row++) {
    const holder = new THREE.Group();holder.position.y=-row*1.5;
    const track = box(11.6,.06,.06,m.gray,.015);
    const fill = box(11.6,.068,.009,m.ink,.015);fill.position.z=.014;
    const knob = new THREE.Group();
    const ring=box(.49,.49,.17,m.gray,.245);
    const cap=box(.39,.39,.008,m.paper,.195);cap.position.z=.014;
    knob.add(ring,cap);knob.position.z=.028;
    holder.add(track,fill,knob);
    label(holder,row===0?'From':'To',.34,-5.8,.52,.1,m.gray,'left');
    range.add(holder);rangeRows.push({holder,track,fill,knob});
  }
  const rating = new THREE.Group();group.add(rating);
  const stars=[];
  for(let i=0;i<5;i++) {
    const shape=new THREE.Shape();
    for(let j=0;j<10;j++) {
      const a=Math.PI/2+j*Math.PI/5,r=j%2?.17:.38;
      const x=Math.cos(a)*r,y=Math.sin(a)*r;
      if(j===0)shape.moveTo(x,y);else shape.lineTo(x,y);
    }
    shape.closePath();
    if(i===4) {
      const hole=new THREE.Path();
      for(let j=0;j<10;j++) {
        const a=Math.PI/2-j*Math.PI/5,r=j%2?.12:.28;
        if(j===0)hole.moveTo(Math.cos(a)*r,Math.sin(a)*r);else hole.lineTo(Math.cos(a)*r,Math.sin(a)*r);
      }hole.closePath();shape.holes.push(hole);
    }
    const star=new THREE.Mesh(kit.extrude(shape,.1,.008),m.ink);
    star.castShadow=true;star.receiveShadow=true;star.position.x=(i-2)*.92;
    rating.add(star);stars.push(star);
  }
  label(rating,'Rating',.31,0,-.8,.02,m.gray);

  function update(t) {
    const open=ease(t/.9)*(1-ease((t-1.4)/1.1));
    const pull=ease((t-2.2)/1.35);
    toggle.position.set(mix(0,-4.65,pull),mix(.2,2.0,pull),0);
    toggle.scale.setScalar(mix(1.28,.77,pull));
    toggle.rotation.set(mix(-.04,0,pull),mix(-.035,0,pull),-.018*(1-pull));
    rail.position.set(-open*.12,0,0);
    outline.position.set(open*.3,open*.08,.016+open*.63);
    inner.position.z=.014+open*.15;
    const on=clamp(spring((t-2.6)*1.6));
    inner.material.opacity=on;
    thumb.position.set(mix(-1.455,1.455,on),0,.035+open*1.65);
    thumb.rotation.z=pulse(t,2.6)*.1;
    thumbBody.position.z=0;
    thumbRim.position.set(open*.1,0,.012+open*.36);
    visible.position.z=open*.18;
    number.visible=t>2.05;
    number.position.set(mix(13,2.0,spring(Math.max(0,t-2.05))),1.8, .5+(1-pull)*2);
    number.scale.setScalar(.78);
    number.rotation.set(-.08*(1-pull),.1*(1-pull),-.015);
    const valueTimes=[0,3.3,3.72,4.14];
    const state=t<3.3?0:t<3.72?1:t<4.14?2:3;
    digitStates.forEach((digits,index)=>{
      digits.visible=index===state;
      const p=ease((t-valueTimes[index])/.22);
      digits.rotation.x=(1-p)*-.55;
      digits.position.y=(1-p)*.23;
      digits.position.z=.023+(1-p)*.16;
    });
    plus.position.z=-(Math.max(0,pulse(t,3.25))+Math.max(0,pulse(t,3.67))+Math.max(0,pulse(t,4.09)))*.16;
    minus.position.z=pulse(t,3.25)*.024;
    numberLabel.position.z=.1+(1-pull)*.5;
    range.visible=t>3.2;
    range.position.set(-.4,-1.15,mix(3,.15,ease((t-3.2)/.8)));
    range.rotation.x=(1-ease((t-3.2)/.8))*.3;
    rangeRows.forEach(({fill,knob,holder},index)=>{
      const progress=index===0?mix(.17,.37,ease((t-4.1)/.8)):mix(.9,.73,ease((t-4.35)/.8));
      knob.position.x=-5.8+11.6*progress;
      knob.position.z=.028+Math.abs(pulse(t,4.1+index*.25))*.12;
      fill.scale.x=progress;fill.position.x=-5.8*(1-progress);
      holder.rotation.z=pulse(t,4.1+index*.25)*.009;
    });
    rating.visible=t>4.1;
    rating.position.set(6,-3.75, .3);
    rating.scale.setScalar(.64);
    stars.forEach((star,i)=>{
      const p=spring(Math.max(0,t-4.1-i*.085));
      star.position.z=(1-p)*2;
      star.rotation.y=(1-p)*Math.PI;
      star.scale.setScalar(Math.max(.01,p));
    });
  }
  update(0);return {group,update};
}

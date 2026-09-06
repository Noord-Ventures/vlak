import { mix, ease, spring, pulse } from './kit.mjs';

export function createPlanning(THREE, kit) {
  const {box,frame,tile,label,materials:m}=kit;
  const group=new THREE.Group();
  const days=['Mon 7','Tue 8','Wed 9','Thu 10','Fri 11','Sat 12','Sun 13'];
  const columns=days.map((name,i)=>{
    const column=new THREE.Group();
    const rim=frame(2.38,7.1,.018,m.gray,.012,.014);rim.position.y=-.3;
    const heading=tile(2.3,.7,name,{fontSize:.27,depth:.07,radius:.01});heading.position.y=3.65;
    column.add(rim,heading);column.position.x=(i-3)*2.5;group.add(column);return column;
  });
  const cardData=[
    ['Type study','09:00–09:30',0,0],['Motion study','11:00–11:30',1,1],
    ['Layout review','09:00–10:00',2,0],['Build & test','14:00–15:00',3,2],
    ['Icon family','11:00–12:00',4,1],['Documentation','09:00–10:00',5,0],
    ['Release notes','11:00–12:00',6,1],['Collect ideas','14:00–14:30',0,2],
    ['Component craft','09:00–10:00',3,0],
  ];
  const cards=cardData.map(([title,time,day,row],i)=>{
    const card=new THREE.Group();
    const paper=box(3.65,2.1,.12,m.paper,.055);
    const rim=frame(3.65,2.1,.025,m.gray,.055,.018);
    const titleMesh=label(card,title,.30,-1.48,.62,.15,m.ink,'left');
    const timeMesh=label(card,time,.245,-1.48,.04,.15,m.gray,'left');
    const rescheduledTime=i===2?label(card,'11:30–12:30',.245,-1.48,.04,.15,m.gray,'left'):null;
    const action=tile(3.12,.48,'Reschedule',{fontSize:.22,depth:.08,radius:.04});action.position.set(0,-.65,.15);
    const status=tile(2.02,.48,['Planned','In progress','Complete'][i%3],{fontSize:.22,depth:.08,radius:.04});status.position.set(-.55,-.65,.15);card.add(status);
    const originalStatus=status.children[2];
    const movedStatus=i<2?label(status,i===0?'In progress':'Planned',.22,0,0,.064,m.ink):null;
    const up=tile(.46,.48,'',{depth:.08,radius:.04});up.position.set(.98,-.65,.15);
    const down=tile(.46,.48,'',{depth:.08,radius:.04});down.position.set(1.55,-.65,.15);
    [up,down].forEach((button,which)=>{
      const arrow=new THREE.Group();
      const stem=box(.02,.23,.02,m.ink,0);
      const left=box(.02,.13,.02,m.ink,0);left.position.set(-.045,.07,0);left.rotation.z=-.7;
      const right=box(.02,.13,.02,m.ink,0);right.position.set(.045,.07,0);right.rotation.z=.7;
      arrow.add(stem,left,right);arrow.position.z=.07;arrow.rotation.z=which*Math.PI;button.add(arrow);
    });
    const grip=new THREE.Group();
    for(let dot=0;dot<6;dot++){
      const bit=box(.031,.031,.022,m.ink,.015);bit.position.set((dot%2)*.09,Math.floor(dot/2)*.09,0);grip.add(bit);
    }grip.position.set(1.35,.47,.19);
    const strip=box(3.3,.027,.023,m.gray,.005);strip.position.set(0,-.27,.16);
    card.add(paper,rim,action,status,up,down,grip,strip);
    group.add(card);
    return {card,paper,rim,titleMesh,timeMesh,rescheduledTime,action,status,originalStatus,movedStatus,up,down,grip,strip,day,row,index:i};
  });
  const kanban=['Planned','In progress','Complete'].map((name,i)=>{
    const column=new THREE.Group();
    const border=frame(4.78,7.8,.025,m.gray,.04,.016);
    const heading=label(column,name,.37,-2.1,3.45,.05,m.ink,'left');
    label(column,'3',.31,2.05,3.45,.05,m.gray);
    column.add(border);column.position.set((i-1)*5.2,.0,0);group.add(column);return {column,border,heading};
  });
  const editor=new THREE.Group();
  const date=tile(3.7,.78,'10 / 09 / 2026',{fontSize:.28,depth:.15});
  const time=tile(2.2,.78,'11:30',{fontSize:.29,depth:.15});time.position.x=3.15;
  const save=tile(1.75,.78,'Save',{fontSize:.29,depth:.15,ink:true});save.position.x=5.35;
  editor.add(date,time,save);group.add(editor);
  label(editor,'Reschedule',.31,-1.85,.81,.12,m.ink,'left');

  function update(t){
    const morph=ease((t-3.35)/1.25);
    columns.forEach((column,i)=>{
      const build=spring(Math.max(0,t-i*.052));
      column.visible=morph<.999;
      column.position.set((i-3)*2.5,0,(1-build)*3-morph*1.2);
      column.rotation.y=morph*Math.PI*.5+(1-build)*.18;
      column.scale.x=Math.max(.001,1-morph*.9);
    });
    cards.forEach((item,i)=>{
      const {card,paper,rim,titleMesh,timeMesh,rescheduledTime,action,status,originalStatus,movedStatus,up,down,grip,strip,day,row}=item;
      const p=spring(Math.max(0,t-.16-i*.05));
      const layer=ease((t-.2-i*.035)/.55)*(1-ease((t-1.0-i*.03)/.55));
      const x0=(day-3)*2.5, y0=2.1-row*2.25;
      const moved=i===2?ease((t-2.65)/.4):0;
      const col=i%3, slot=Math.floor(i/3);
      let x1=(col-1)*5.2,y1=2.05-slot*2.5;
      const transfer=i===0?ease((t-5.05)/1):0;
      if(i===0){x1=mix(-5.2,0,transfer);y1=mix(2.05,2.05,transfer);}
      const returnMove=i===1?ease((t-5.15)/1):0;
      if(i===1)x1=mix(0,-5.2,returnMove);
      card.position.set(mix(x0+(i===2?moved*2.5:0),x1,morph),mix(y0-(i===2?moved*2.25:0),y1,morph),
        .35+(1-p)*4+Math.sin(morph*Math.PI)*(1.1+(i%3)*.3)+(i===0?Math.sin(transfer*Math.PI)*2.8:i===1?Math.sin(returnMove*Math.PI)*1.0:0));
      card.rotation.set((1-p)*.26+Math.sin(morph*Math.PI)*.12,Math.sin(morph*Math.PI)*(i%2?.23:-.23),pulse(t,4.58+i*.03)*.015+(i===0?Math.sin(transfer*Math.PI)*-.07:0));
      card.scale.setScalar(mix(.60,1,morph));
      paper.position.z=0;rim.position.z=.08+layer*.35;
      titleMesh.position.z=.15+layer*.7;
      timeMesh.position.z=.15+layer*.95;
      timeMesh.visible=morph<.95&&!(i===2&&t>2.65);
      if(rescheduledTime){rescheduledTime.visible=morph<.95&&t>2.65;rescheduledTime.position.z=timeMesh.position.z;}
      action.visible=morph<.6;
      action.position.z=.15+layer*1.1-Math.max(0,pulse(t,1.9))*(i===2?.12:0);
      status.visible=up.visible=down.visible=grip.visible=morph>.55;
      if(movedStatus){const changed=t>5.55+i*.1;originalStatus.visible=!changed;movedStatus.visible=changed;}
      strip.visible=morph>.8;
      [status,up,down].forEach((control,j)=>{control.position.z=.15+Math.max(0,1-spring(Math.max(0,t-4.12-i*.025-j*.035)))*.75;});
      grip.position.z=.19+(i===0?Math.sin(transfer*Math.PI)*.12:0);
    });
    kanban.forEach(({column,heading},i)=>{
      column.visible=morph>0;
      const p=spring(Math.max(0,t-3.35-i*.06));
      column.position.z=(1-p)*-1.6;
      column.scale.setScalar(Math.max(.001,p));
      heading.position.z=(1-p)*1.3+.05;
    });
    editor.visible=t>1.65&&t<3.28;
    const reveal=ease((t-1.65)/.32)*(1-ease((t-2.8)/.35));
    editor.position.set(-4.5,-.3,3.2+(1-reveal)*1.4);
    editor.scale.setScalar(Math.max(.001,reveal));
    editor.rotation.set(-.06,(1-reveal)*.2,-.025);
    save.position.z=-Math.max(0,pulse(t,2.55))*.12;
  }
  update(0);return {group,update};
}

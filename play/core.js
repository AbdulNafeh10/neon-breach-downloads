import {distinctLayouts} from './map-layouts.js';
import {SPAWNS} from './rules.js';
import {combatProfile,JUMP_PADS} from './systems.js';
export const WEAPONS = [
 {name:'VXR-30 ASSAULT RIFLE',short:'VXR-30',cap:30,damage:24,head:1.7,rate:.105,reload:1.65,spread:.005,pellets:1,recoil:.019,auto:true,ads:57,color:0x9cffe3},
 {name:'BREAKER COMBAT SHOTGUN',short:'BREAKER',cap:8,damage:13,head:1.3,rate:.74,reload:2,spread:.056,pellets:9,recoil:.065,auto:false,ads:65,color:0xffb77e},
 {name:'LONGBOW PRECISION RIFLE',short:'LONGBOW',cap:5,damage:80,head:1.6,rate:1.08,reload:2.25,spread:.001,pellets:1,recoil:.055,auto:false,ads:32,color:0xb7a2ff},
 {name:"VOLT COMPACT SMG",short:"VOLT",cap:36,damage:15,head:1.5,rate:.065,reload:1.4,spread:.012,pellets:1,recoil:.012,auto:true,ads:62,color:0x79d5ff},
 {name:"WARDEN HEAVY PISTOL",short:"WARDEN",cap:12,damage:38,head:1.7,rate:.3,reload:1.25,spread:.003,pellets:1,recoil:.038,auto:false,ads:52,color:0xffdb83}
];
export function weaponSpread(gun,aim){return WEAPONS[gun].spread*(aim?(gun===1?.6:.43):1);}
export function pelletPattern(gun,seed,aim){let value=seed|0;const random=()=>{value=(Math.imul(value,1664525)+1013904223)|0;return (value>>>0)/4294967296;},spread=weaponSpread(gun,aim);if(gun!==1)return [[(random()-.5)*spread*2,(random()-.5)*spread*2]];const rotation=random()*Math.PI*2;return Array.from({length:9},(_,i)=>{const angle=rotation+i*Math.PI/4,radius=i===0?spread*.08:spread*(.78+random()*.22);return [Math.cos(angle)*radius,Math.sin(angle)*radius];});}
export const WEAPON_RANGES=[[35,80,.65],[8,30,.2],[70,140,.85],[12,32,.5],[20,50,.6]];
export function damageAtRange(gun,distance){const [near,far,floor]=WEAPON_RANGES[gun],t=Math.max(0,Math.min(1,(distance-near)/(far-near)));return WEAPONS[gun].damage*(1-t*(1-floor));}
export const BLOCKS=[];
const baseBlocks=[];
const block=(x,z,w,h,d,y=0,kind='cover')=>BLOCKS.push({x,z,w,h,d,y,kind});
block(0,0,4.4,5.5,4.4,0,'reactor');
for(const side of [-1,1]){
 block(side*10,0,2.4,3.5,5.5,0,'bastion');
 block(side*18,0,7,2.2,12,0,'platform');
 block(side*18,0,2.2,1.35,3.5,2.2,'cover');
 for(const end of [-1,1]){
  block(side*6,end*7,3.4,1.55,2.4);
  block(side*8.6,end*10.6,1.4,.8,1.6,0,'crate');
  block(side*14,end*13,2,2.9,1.8,0,'pillar');
  for(let j=0;j<8;j++)block(side*18,end*(10.4-j*.55),4,.275*(j+1),.58,0,'step');
 }
}
baseBlocks.push(...BLOCKS.map(b=>({...b})));
export const MAP_EXTRAS={rift:[],foundry:[{x:-3,z:-11,w:7,h:2.1,d:1.8,kind:'crate'},{x:3,z:11,w:7,h:2.1,d:1.8,kind:'crate'},{x:-15,z:-5,w:2,h:3.5,d:6,kind:'bastion'},{x:15,z:5,w:2,h:3.5,d:6,kind:'bastion'}],citadel:[{x:0,z:-12,w:12,h:1.4,d:1.6,kind:'platform'},{x:0,z:12,w:12,h:1.4,d:1.6,kind:'platform'},{x:-7,z:0,w:1.8,h:4,d:7,kind:'pillar'},{x:7,z:0,w:1.8,h:4,d:7,kind:'pillar'}]};
export const MAP_LAYOUTS={rift:baseBlocks,foundry:[...baseBlocks.filter(b=>['reactor','platform','step'].includes(b.kind)||b.y>0),...[-1,1].flatMap(s=>[{x:s*7,z:s*5,w:2,h:3.4,d:9,y:0,kind:'bastion'},{x:s*7,z:-s*11,w:5,h:1.55,d:2,y:0,kind:'crate'},{x:s*12,z:0,w:3,h:2.1,d:3,y:0,kind:'crate'}])],citadel:[...baseBlocks.filter(b=>['reactor','platform','step'].includes(b.kind)||b.y>0),...[-1,1].flatMap(s=>[{x:s*5.5,z:0,w:1.8,h:3.4,d:8,y:0,kind:'bastion'},{x:0,z:s*12,w:10,h:1.4,d:1.8,y:0,kind:'cover'},{x:s*11,z:s*11,w:3,h:2,d:3,y:0,kind:'pillar'},{x:s*11,z:-s*11,w:3,h:2,d:3,y:0,kind:'pillar'}])]};
Object.assign(MAP_LAYOUTS,distinctLayouts(baseBlocks));
export let activeMap='rift';
export function setArenaMap(map='rift'){activeMap=Object.hasOwn(MAP_EXTRAS,map)?map:'rift';BLOCKS.splice(0,BLOCKS.length,...MAP_LAYOUTS[activeMap].map(b=>({...b})));}
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const lerp=(a,b,t)=>a+(b-a)*t;
export const angleLerp=(a,b,t)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;
export function makePlayer(side=0,spawnSlot=side){const spawn=SPAWNS[spawnSlot]||SPAWNS[0];return {x:spawn[0],y:0,z:spawn[1],vx:0,vy:0,vz:0,yaw:spawn[1]>0?0:Math.PI,pitch:0,grounded:true,dash:0,dashCd:0,dashX:0,dashZ:0,slide:0,slideCd:0,slideX:0,slideZ:0,eye:1.65,height:1.8,hp:100,score:0,dead:0,shield:1.5,gun:0,ammo:WEAPONS.map(w=>w.cap),reload:0,shotCd:0,walk:0,side,spawnSlot,life:0,hill:0,...combatProfile()};}
function overlapXZ(p,b,r=.34){return p.x+r>b.x-b.w/2&&p.x-r<b.x+b.w/2&&p.z+r>b.z-b.d/2&&p.z-r<b.z+b.d/2;}
export function movePlayer(p,input,dt){
 dt=Math.min(.05,Math.max(0,dt));p.dash=Math.max(0,p.dash-dt);p.dashCd=Math.max(0,p.dashCd-dt);p.slideCd=Math.max(0,p.slideCd-dt);p.slide=Math.max(0,p.slide-dt);p.shield=Math.max(0,p.shield-dt);p.shotCd=Math.max(0,p.shotCd-dt);
 if(p.reload>0){p.reload-=dt;if(p.reload<=0){p.reload=0;p.ammo[p.gun]=WEAPONS[p.gun].cap;}}
 if(p.dead>0)return;
 const fw=(input.forward||0),st=(input.strafe||0),len=Math.max(1,Math.hypot(fw,st));
 const ix=(Math.sin(p.yaw)*-fw+Math.cos(p.yaw)*st)/len,iz=(-Math.cos(p.yaw)*fw-Math.sin(p.yaw)*st)/len;
 if(input.dash&&p.dashCd<=0){p.dash=.16;p.dashCd=p.boost>0?1.5:3;p.dashX=(fw||st)?ix:-Math.sin(p.yaw);p.dashZ=(fw||st)?iz:-Math.cos(p.yaw);}if(input.slide&&p.grounded&&p.slideCd<=0&&Math.hypot(p.vx,p.vz)>4){p.slide=.7;p.slideCd=1.5;const vel=Math.hypot(p.vx,p.vz);p.slideX=p.vx/vel;p.slideZ=p.vz/vel;}
 if(input.jump&&p.grounded){p.vy=7.5;p.grounded=false;p.slide=0;}
 p.height=p.slide>0?1:1.8;p.eye=lerp(p.eye,p.slide>0?.85:1.65,1-Math.exp(-16*dt));
 const speed=(input.aim?4.1:input.sprint?10.4:6.7)*(p.boost>0?1.22:1),acc=p.grounded?16:5;
 const targetX=p.dash>0?p.dashX*24:p.slide>0?p.slideX*(10+4*p.slide/.7):ix*speed,targetZ=p.dash>0?p.dashZ*24:p.slide>0?p.slideZ*(10+4*p.slide/.7):iz*speed;
 p.vx=lerp(p.vx,targetX,1-Math.exp(-acc*dt));p.vz=lerp(p.vz,targetZ,1-Math.exp(-acc*dt));
 if(p.dash>0){p.vx=targetX;p.vz=targetZ;}const steps=Math.max(1,Math.ceil(Math.hypot(p.vx,p.vz)*dt/.18));
 for(let step=0;step<steps;step++){
  p.x=clamp(p.x+p.vx*dt/steps,-23.5,23.5);p.z=clamp(p.z+p.vz*dt/steps,-18.5,18.5);
  for(const b of BLOCKS){if(!overlapXZ(p,b)||p.y>=b.y+b.h-.04||p.y+p.height<=b.y+.04)continue;
   const top=b.y+b.h;if(p.grounded&&top-p.y<=.31&&top>=p.y){p.y=top;continue;}
   const ds=[p.x-(b.x-b.w/2-.34),(b.x+b.w/2+.34)-p.x,p.z-(b.z-b.d/2-.34),(b.z+b.d/2+.34)-p.z];
   const m=Math.min(...ds);const k=ds.indexOf(m);if(k===0){p.x-=m;p.vx=Math.min(0,p.vx)}if(k===1){p.x+=m;p.vx=Math.max(0,p.vx)}if(k===2){p.z-=m;p.vz=Math.min(0,p.vz)}if(k===3){p.z+=m;p.vz=Math.max(0,p.vz)}
  }
 }
 const oldY=p.y;p.vy-=22*dt;p.y+=p.vy*dt;let ground=0;
 for(const b of BLOCKS)if(overlapXZ(p,b,.29)&&oldY>=b.y+b.h-.08)ground=Math.max(ground,b.y+b.h);
 if(p.y<=ground&&p.vy<=0){p.y=ground;p.vy=0;p.grounded=true}else{p.grounded=false}
 p.padCd=Math.max(0,p.padCd-dt);if(p.padCd<=0&&p.grounded&&p.y<.2&&JUMP_PADS.some(a=>Math.hypot(p.x-a.x,p.z-a.z)<.95)){p.vy=12.5;p.grounded=false;p.padCd=1.2;p.slide=0;}
 p.walk+=Math.hypot(p.vx,p.vz)*dt;
}
export function resetLife(p){const score=p.score,hill=p.hill,stats=p.stats,side=p.side,team=p.team,spawnSlot=p.spawnSlot,life=p.life+1;Object.assign(p,makePlayer(side,spawnSlot));p.team=team;p.score=score;p.hill=hill;p.stats=stats;p.life=life;p.shield=1.5;}
export function packetPlayer(p){return {x:p.x,y:p.y,z:p.z,yaw:p.yaw,pitch:p.pitch,gun:p.gun,slide:p.slide>0,eye:p.eye,grounded:p.grounded,life:p.life};}
export function validState(p){return p&&['x','y','z','yaw','pitch'].every(k=>Number.isFinite(p[k]))&&Math.abs(p.x)<26&&Math.abs(p.z)<21&&p.y>=-.1&&p.y<12&&Math.abs(p.pitch)<2&&Number.isInteger(p.gun)&&p.gun>=0&&p.gun<WEAPONS.length;}
export function rayBox(origin,dir,b){let near=0,far=200;for(const [axis,size]of[['x','w'],['y','h'],['z','d']]){const min=axis==='y'?b.y:b[axis]-b[size]/2,max=axis==='y'?b.y+b.h:b[axis]+b[size]/2;const o=origin[axis],d=dir[axis];if(Math.abs(d)<1e-8){if(o<min||o>max)return Infinity;continue}let a=(min-o)/d,c=(max-o)/d;if(a>c)[a,c]=[c,a];near=Math.max(near,a);far=Math.min(far,c);if(near>far)return Infinity}return near;}
export function wallDistance(origin,dir){let d=150;for(const b of BLOCKS)d=Math.min(d,rayBox(origin,dir,b));for(const b of [{x:0,z:20,w:50,h:7,d:1,y:0},{x:0,z:-20,w:50,h:7,d:1,y:0},{x:25,z:0,w:1,h:7,d:40,y:0},{x:-25,z:0,w:1,h:7,d:40,y:0}])d=Math.min(d,rayBox(origin,dir,b));if(dir.y<0)d=Math.min(d,-origin.y/dir.y);return d;}
export function raySphere(o,d,c,r){const x=o.x-c.x,y=o.y-c.y,z=o.z-c.z,b=x*d.x+y*d.y+z*d.z,c2=x*x+y*y+z*z-r*r,disc=b*b-c2;if(disc<0)return Infinity;const t=-b-Math.sqrt(disc);return t>=0?t:Infinity;}
export function hitPlayer(origin,dir,p){if(p.dead>0)return null;const eye=p.slide>0?.85:1.65;const head=raySphere(origin,dir,{x:p.x,y:p.y+eye-.03,z:p.z},.255);const body=rayBox(origin,dir,{x:p.x,y:p.y+.12,z:p.z,w:.7,h:eye-.32,d:.58});const dist=Math.min(head,body);if(!Number.isFinite(dist)||dist>wallDistance(origin,dir)+.01)return null;return {distance:dist,head:head<=body};}
export function direction(yaw,pitch){return {x:-Math.sin(yaw)*Math.cos(pitch),y:Math.sin(pitch),z:-Math.cos(yaw)*Math.cos(pitch)};}

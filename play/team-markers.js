import * as T from 'three';
import {isTeamMode} from './rules.js';
import {wallDistance} from './core.js';
export function mountTeamMarkers(){
 const root=document.createElement('div');root.id='team-markers';document.body.append(root);const markers=new Map(),pos=new T.Vector3();
 return {update({players,local,camera,rules,mode,paused,name,now}){
  root.hidden=mode!=='match'||paused||!isTeamMode(rules);if(root.hidden)return;const live=new Set();
  for(const p of players){if(p===local)continue;live.add(p.side);let marker=markers.get(p.side);if(!marker){const el=document.createElement('span');root.append(el);marker={el,visibleSince:null};markers.set(p.side,marker);}const {el}=marker,dx=p.x-camera.position.x,dy=p.y+(p.eye||1.65)-camera.position.y,dz=p.z-camera.position.z,len=Math.hypot(dx,dy,dz);
   const visible=p.dead<=0&&len>.1&&len<65&&wallDistance(camera.position,{x:dx/len,y:dy/len,z:dz/len})>=len-.35;
   if(!visible){el.hidden=true;marker.visibleSince=null;continue;}if(marker.visibleSince===null)marker.visibleSince=now;
   pos.set(p.x,p.y+(p.height||1.8)+.32,p.z).project(camera);el.hidden=now-marker.visibleSince<.06||pos.z>1||pos.z< -1||Math.abs(pos.x)>1||Math.abs(pos.y)>1;if(el.hidden)continue;
   el.className=p.team===0?'team-dot-cyan':'team-dot-amber';el.setAttribute('aria-label',(p.team===local.team?'Teammate: ':'Opponent: ')+name(p.side));el.style.transform='translate('+((pos.x*.5+.5)*innerWidth)+'px,'+((-pos.y*.5+.5)*innerHeight)+'px) translate(-50%,-50%)';
  }
  for(const [side,m]of markers)if(!live.has(side)){m.el.remove();markers.delete(side);}
 }};
}

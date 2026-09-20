import {BLOCKS,arenaBounds,activeMap} from './core.js';
export function nextWaypoint(from,to){
 const stairs={foundry:{x:17,z:12,height:3.6},citadel:{x:26,z:14,height:3.35},dockyard:{x:17,z:12,height:3}}[activeMap];
 if(stairs&&to.y>2.6&&from.y<stairs.height-.1){const options=[-1,1].flatMap(x=>[-1,1].map(z=>({x:x*stairs.x,z:z*stairs.z})));options.sort((a,b)=>Math.hypot(from.x-a.x,from.z-a.z)-Math.hypot(from.x-b.x,from.z-b.z));const entry=options[0];if(Math.abs(from.x-entry.x)<1&&Math.abs(from.z)<=stairs.z+.2&&Math.abs(from.z)>4)return {x:entry.x,z:0};to=entry;}
 const start=[Math.round(from.x),Math.round(from.z)],goal=[Math.round(to.x),Math.round(to.z)];
 const height=from.y||0;const blocked=(x,z)=>Math.abs(x)>arenaBounds.x-1||Math.abs(z)>arenaBounds.z-1||BLOCKS.some(b=>b.y<height+1.7&&b.y+b.h>height+.35&&Math.abs(x-b.x)<b.w/2+.38&&Math.abs(z-b.z)<b.d/2+.38);
 const key=(x,z)=>x+','+z,queue=[start],parents=new Map([[key(...start),null]]);let nearest=start,distance=Infinity;
 for(let i=0;i<queue.length;i++){const [x,z]=queue[i],d=Math.hypot(x-goal[0],z-goal[1]);if(d<distance){distance=d;nearest=[x,z];}if(d<1.2)break;for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz,k=key(nx,nz);if(blocked(nx,nz)||parents.has(k))continue;parents.set(k,[x,z]);queue.push([nx,nz]);}}
 let node=nearest,parent=parents.get(key(...node));while(parent&&key(...parent)!==key(...start)){node=parent;parent=parents.get(key(...node));}return {x:node[0],z:node[1]};
}

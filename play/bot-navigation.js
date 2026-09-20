import {BLOCKS} from './core.js';
export function nextWaypoint(from,to){
 const start=[Math.round(from.x),Math.round(from.z)],goal=[Math.round(to.x),Math.round(to.z)];
 const blocked=(x,z)=>Math.abs(x)>23||Math.abs(z)>18||BLOCKS.some(b=>b.y<1.7&&b.h>.35&&Math.abs(x-b.x)<b.w/2+.38&&Math.abs(z-b.z)<b.d/2+.38);
 const key=(x,z)=>x+','+z,queue=[start],parents=new Map([[key(...start),null]]);let nearest=start,distance=Infinity;
 for(let i=0;i<queue.length;i++){const [x,z]=queue[i],d=Math.hypot(x-goal[0],z-goal[1]);if(d<distance){distance=d;nearest=[x,z];}if(d<1.2)break;for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz,k=key(nx,nz);if(blocked(nx,nz)||parents.has(k))continue;parents.set(k,[x,z]);queue.push([nx,nz]);}}
 let node=nearest,parent=parents.get(key(...node));while(parent&&key(...parent)!==key(...start)){node=parent;parent=parents.get(key(...node));}return {x:node[0],z:node[1]};
}

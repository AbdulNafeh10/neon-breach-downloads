const solid=(x,z,w,h,d,kind='cover',y=0)=>({x,z,w,h,d,kind,y});
export const HEALTH_LOCATIONS={rift:[[-18,2.2,4],[18,2.2,-4]],foundry:[[-18,3.6,3],[18,3.6,-3]],citadel:[[-26,3.35,3],[26,3.35,-3]],archive:[[-11,0,10],[11,0,-10]],dockyard:[[-17,3,3],[17,3,-3]]};
export const MAP_BOUNDS={rift:{x:24,z:19},foundry:{x:24,z:24},citadel:{x:32,z:19},archive:{x:24,z:19},dockyard:{x:24,z:32}};
export function mapLocation(map,p){if(map==='archive')return Math.abs(p.x)<6?'CENTRAL ATRIUM':(p.x<0?'WEST ':'EAST ')+(p.z<0?'STACKS':'LAB');if(map==='dockyard')return p.y>2.5?'LOADING GANTRY':Math.abs(p.z)>17?(p.z<0?'NORTH FREIGHT':'SOUTH FREIGHT'):'CARGO LANES';if(map==='foundry')return p.y>2.8?(p.x<0?'WEST GALLERY':'EAST GALLERY'):Math.abs(p.x)<9?'LOADING AISLE':(p.x<0?'WEST ':'EAST ')+(p.z<0?'MACHINE ROOM':'ASSEMBLY ROOM');if(map==='citadel')return p.y>2.6?(Math.abs(p.x)<21?'SKYBRIDGE':p.x<0?'WEST KEEP':'EAST KEEP'):Math.abs(p.x)>21?'LOWER KEEP':Math.abs(p.z)<3?'UNDERPASS':p.z<0?'NORTH COURTYARD':'SOUTH COURTYARD';return Math.abs(p.x)>14?'SIDE PLATFORM':p.z<0?'NORTH REACTOR':'SOUTH REACTOR';}
function stairs(x,start,count,height,spacing,sign){return Array.from({length:count},(_,i)=>solid(x,sign*(start-i*spacing),4,height*(i+1),spacing+.03,'step'));}
export function distinctLayouts(){
 const foundry=[];
 for(const side of [-1,1]){
  for(const z of [-12,0,12])foundry.push(solid(side*9,z,.65,4.8,7,'wall'));
  for(const end of [-1,1]){foundry.push(solid(side*12.5,end*6,5,3.1,.65,'wall'));foundry.push(solid(side*23,end*6,2,3.1,.65,'wall'));foundry.push(solid(side*4,end*14,3,1.4,2,'crate'));}
  foundry.push(solid(side*17,0,10,.3,10,'platform',3.3));
  for(const end of [-1,1])foundry.push(...stairs(side*17,10.5,12,.3,.48,end));
  foundry.push(solid(side*21.7,0,.35,1,9,'rampart',3.6));foundry.push(solid(side*14,0,2,1,2,'crate',3.6));foundry.push(solid(side*3.5,0,2.4,1.8,4,'crate'));foundry.push(solid(side*17,side*19,7,2.1,2,'bastion'));
 }
 const citadel=[solid(0,0,42,.35,4,'platform',3)];
 for(const side of [-1,1]){
  citadel.push(solid(side*26,0,10,.35,14,'platform',3));
  for(const end of [-1,1])citadel.push(...stairs(side*26,12,11,3.35/11,.5,end));
  citadel.push(solid(side*30.6,0,.4,1.1,13,'rampart',3.35));
  for(const end of [-1,1]){citadel.push(solid(side*22,end*6.7,2,1.1,.35,'rampart',3.35));citadel.push(solid(side*21,end*4.8,.6,2.5,3,'wall'));citadel.push(solid(side*7,end*7,3.4,6,3.4,'tower'));}
  citadel.push(solid(side*15,side*12,5,1.4,2,'cover'));citadel.push(solid(side*13,-side*3,3,1.3,2,'cover'));
 }
 const archive=[];
 for(const side of [-1,1]){
  for(const z of [-12,0,12])archive.push(solid(side*6,z,.5,4.6,7,'wall'));
  for(const end of [-1,1]){archive.push(solid(side*11,end*5,9,4.6,.5,'wall'));archive.push(solid(side*22,end*5,4,4.6,.5,'wall'));archive.push(solid(side*15,end*11,2,2.8,6,'shelf'));archive.push(solid(side*20,end*14,2,1.5,3,'crate'));archive.push(solid(side*16,end*12,15,.25,10,'ceiling',4.6));}
  archive.push(solid(side*16,0,5,1.1,2,'cover'));
 }
 const dockyard=[];
 for(const side of [-1,1]){
  for(const end of [-1,1]){dockyard.push(solid(side*6,end*4,4,2.6,6,'container'));dockyard.push(solid(side*14,end*23,5,3.4,9,'container'));dockyard.push(solid(side*4,end*26,3,1.5,3,'crate'));dockyard.push(...stairs(side*17,10.5,10,.3,.5,end));}
  dockyard.push(solid(side*17,0,8,.3,12,'platform',2.7));dockyard.push(solid(side*20.7,0,.3,1,11,'rampart',3));
 }
 return {foundry,citadel,archive,dockyard};
}

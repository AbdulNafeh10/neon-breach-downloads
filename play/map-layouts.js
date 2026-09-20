// Solid geometry is shared by collision, hitscan, radar and the rendered map.
const solid=(x,z,w,h,d,kind='cover',y=0)=>({x,z,w,h,d,kind,y});
export function distinctLayouts(base){
 const platforms=base.filter(b=>['platform','step'].includes(b.kind)||b.y>0);
 const foundry=[...platforms];
 // A central loading aisle links four machine rooms through wide doorways.
 for(const side of [-1,1]){
  for(const z of [-10,0,10])foundry.push(solid(side*9,z,.65,5.2,6,'wall'));
  for(const end of [-1,1]){
   foundry.push(solid(side*13,end*6,7,.0+5.2,.65,'wall'));
   foundry.push(solid(side*22,end*6,4,5.2,.65,'wall'));
   foundry.push(solid(side*4,end*13,3.2,1.4,2.3,'crate'));
  }
  foundry.push(solid(side*3.5,0,2.3,1.8,4,'crate'));
 }
 const citadel=[...platforms];
 // Open courtyard, four towers and staggered courtyard gates.
 for(const x of [-7,7])for(const z of [-6,6])citadel.push(solid(x,z,3.4,7,3.4,'tower'));
 for(const s of [-1,1]){
  citadel.push(solid(s*7,s*11,6,2.7,.8,'rampart'));
  citadel.push(solid(s*12,-s*7,.8,3,8,'rampart'));
  citadel.push(solid(s*4,0,2.1,1.25,2.1,'cover'));
 }
 return {foundry,citadel};
}

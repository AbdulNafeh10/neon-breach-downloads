import {SPAWNS,sameTeam} from './rules.js';
import {BLOCKS,wallDistance} from './core.js';
export function chooseSpawn(player,players,rules,random=Math.random){
 const enemies=players.filter(p=>p!==player&&p.dead<=0&&!sameTeam(player,p,rules));
 const candidates=SPAWNS.map(([x,z],slot)=>{let score=0;for(const p of players)if(p!==player&&p.dead<=0){const distance=Math.hypot(p.x-x,p.z-z);if(distance<3)score-=150;}
  for(const p of enemies){const distance=Math.hypot(p.x-x,p.z-z),dy=p.y+1.4-1.4,length=Math.hypot(distance,dy)||1;score+=Math.min(distance,30);if(distance<10)score-=(10-distance)*12;const ray={x:(p.x-x)/length,y:dy/length,z:(p.z-z)/length};if(wallDistance({x,y:1.4,z},ray)>=length-.1)score-=25;}
  if(slot===player.spawnSlot)score-=3;return {slot,x,z,score};}).filter(p=>!BLOCKS.some(b=>b.y<1.8&&b.y+b.h>.3&&Math.abs(p.x-b.x)<b.w/2+.4&&Math.abs(p.z-b.z)<b.d/2+.4));
 candidates.sort((a,b)=>b.score-a.score);const pool=candidates.filter(p=>p.score>=candidates[0].score-12);return pool[Math.min(pool.length-1,Math.floor(random()*pool.length))]?.slot??0;
}

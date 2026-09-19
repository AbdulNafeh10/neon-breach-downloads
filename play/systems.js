// Match rules run on the host. Presentation and movement prediction read these fields.
const cap=(n,a,b)=>Math.max(a,Math.min(b,n));
export const JUMP_PADS=[{x:-11,z:15},{x:11,z:-15}];
export const POWER_TYPES=['armor','haste','surge'];
export const POWER_NAMES={armor:'AEGIS · +40 ARMOR',haste:'HASTE · 12s MOBILITY',surge:'SURGE · 10s DAMAGE +25%'};
export function combatProfile(){return {armor:0,boost:0,surge:0,energy:50,streak:0,padCd:0,stats:{shots:0,hits:0,damage:0,headshots:0,deaths:0,best:0,pickups:0}};}
export function createPowerNodes(){return [{x:0,z:9,y:0,type:0,cool:8},{x:0,z:-9,y:0,type:1,cool:8}];}
export function tickPowers(p,dt){p.boost=Math.max(0,p.boost-dt);p.surge=Math.max(0,p.surge-dt);if(p.dead<=0)p.energy=cap(p.energy+dt*4,0,100);}
export function activateBoost(p){if(p.dead>0||p.energy<99.99||p.boost>0)return false;p.energy=0;p.boost=6;p.dashCd=0;return true;}
export function grantPower(p,type){if(type==='armor')p.armor=Math.min(60,p.armor+40);if(type==='haste'){p.boost=Math.max(p.boost,12);p.dashCd=0;}if(type==='surge')p.surge=10;p.stats.pickups++;}
export function applyDamage(shooter,victim,raw){const damage=Math.round(raw*(shooter.surge>0?1.25:1));const absorbed=Math.min(victim.armor,damage);victim.armor-=absorbed;const health=Math.min(victim.hp,damage-absorbed);victim.hp-=health;const actual=absorbed+health;shooter.stats.hits++;shooter.stats.damage+=actual;shooter.energy=cap(shooter.energy+actual*.12,0,100);victim.energy=cap(victim.energy+actual*.2,0,100);return {amount:actual,absorbed};}
export function awardElimination(shooter,victim,{head=false,distance=0,airborne=false}={}){const shutdown=victim.streak>=3;shooter.streak++;shooter.stats.best=Math.max(shooter.stats.best,shooter.streak);if(head)shooter.stats.headshots++;victim.stats.deaths++;victim.streak=0;victim.armor=0;victim.boost=0;victim.surge=0;shooter.energy=cap(shooter.energy+25,0,100);let reward='';if(shooter.streak===2){shooter.armor=Math.min(60,shooter.armor+25);reward='AEGIS ONLINE · +25 ARMOR';}if(shooter.streak===3){shooter.boost=Math.max(shooter.boost,12);shooter.dashCd=0;reward='MOMENTUM · 12s HASTE';}if(shooter.streak===5){shooter.surge=12;reward='UNSTOPPABLE · 12s SURGE';}const medal=shutdown?'STREAK BREAKER':airborne?'DEATH FROM ABOVE':distance>=20?'LONGSHOT':head?'PRECISION':'ELIMINATION';return {medal,reward,streak:shooter.streak};}
export function packCombat(p){return {armor:p.armor,boost:p.boost,surge:p.surge,energy:p.energy,streak:p.streak,stats:{...p.stats}};}
export function receiveCombat(p,data){if(!data)return;for(const [key,max]of[['armor',60],['boost',12],['surge',12],['energy',100],['streak',100]])if(Number.isFinite(data[key]))p[key]=cap(data[key],0,max);if(data.stats)for(const key of Object.keys(p.stats))if(Number.isFinite(data.stats[key]))p.stats[key]=cap(data.stats[key],0,100000);}
export const accuracy=p=>p.stats.shots?Math.min(100,Math.round(p.stats.hits/p.stats.shots*100)):0;

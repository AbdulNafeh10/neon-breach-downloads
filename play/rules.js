export const MODES={duel:'1v1 Duel',dm:'Deathmatch',hill:'King of the Hill',tdm:'Team Deathmatch'};
export const MAPS={rift:'Orbital Rift',foundry:'Solar Foundry',citadel:'Eclipse Citadel'};
export const TEAM_NAMES=['CYAN','AMBER'];
export const HILLS=[{x:0,z:9},{x:12,z:7},{x:0,z:-9},{x:-12,z:-7}];
export const SPAWNS=[[0,16],[0,-16],[-11,16],[11,-16],[11,16],[-11,-16],[-22,12],[22,-12]];
export function normalizeRules(value={}){const mode=Object.hasOwn(MODES,value.mode)?value.mode:'duel',map=Object.hasOwn(MAPS,value.map)?value.map:'rift';return {mode,map,capacity:mode==='duel'?2:[4,6,8].includes(+value.capacity)?+value.capacity:4,limit:mode==='hill'?60:mode==='duel'?7:mode==='tdm'?30:15};}
export function sameTeam(a,b,rules){return rules.mode==='tdm'&&a&&b&&Number.isInteger(a.team)&&a.team===b.team;}
export function teamCounts(members){return [0,1].map(team=>members.filter(p=>p.team===team).length);}
export function canJoinTeam(members,side,team,rules){return rules.mode==='tdm'&&[0,1].includes(team)&&members.some(p=>p.side===side)&&members.filter(p=>p.side!==side&&p.team===team).length<rules.capacity/2;}
// Capacity is a ceiling. Neither full nor balanced teams are required.
export function canStartRoom(members,rules){return members.length>0&&members.length<=rules.capacity&&members.every(p=>p.ready)&&(rules.mode!=='tdm'||members.every(p=>[0,1].includes(p.team))&&teamCounts(members).every(n=>n<=rules.capacity/2));}
export function points(p,rules){return rules.mode==='hill'?(p.hill||0):p.score;}
export function hillState(elapsed,players){const index=Math.floor(elapsed/30)%HILLS.length,center=HILLS[index],inside=players.filter(p=>p.dead<=0&&p.shield<=0&&p.y<1.2&&Math.hypot(p.x-center.x,p.z-center.z)<3.8);return {index,center,remaining:30-elapsed%30,owner:inside.length===1?inside[0].side:null,contested:inside.length>1};}
export function tickHill(elapsed,dt,players){const h=hillState(elapsed,players);if(h.owner!==null){const p=players.find(p=>p.side===h.owner);p.hill=Math.min(60,(p.hill||0)+dt);}return h;}

import {sameTeam,isHillMode,hillState} from './rules.js';
import {WEAPONS,movePlayer,wallDistance,direction,angleLerp,lerp} from './core.js';
import {nextWaypoint} from './bot-navigation.js';
import {activateBoost} from './systems.js';

const turnError=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
const skill=d=>({easy:{rate:.82,spread:.15,turn:2.1,awareness:.62},normal:{rate:.34,spread:.05,turn:4.1,awareness:.84},hard:{rate:.16,spread:.022,turn:6.4,awareness:1}}[d]||{rate:.34,spread:.05,turn:4.1,awareness:.84});
export function botTarget(bot,players,rules){return players.filter(p=>p!==bot&&p.dead<=0&&!sameTeam(bot,p,rules)).sort((a,b)=>{const rank=p=>Math.hypot(p.x-bot.x,p.z-bot.z)+(p.hp<=35?-9:0)+(p.shield>0?3:0);return rank(a)-rank(b);})[0]||null;}
function modeGoal(bot,target,hill,players,rules){
 if(!hill)return target;
 const allies=players.filter(p=>p!==bot&&p.dead<=0&&sameTeam(bot,p,rules));
 // Win the Hill first. Once an uncontested friendly Hill has enough defenders,
 // one bot patrols its edge instead of every bot running into the same circle.
 if(hill.contested||hill.team!==bot.team||allies.length<1)return hill.center;
 const phase=(bot.side%4)*Math.PI/2;return {x:hill.center.x+Math.cos(phase)*5,z:hill.center.z+Math.sin(phase)*5,y:0};
}
export function stepBot(bot,brain,{players,rules,elapsed,time,dt,difficulty='normal',random=Math.random}){
 if(bot.dead>0)return null;
 const ai=skill(difficulty),target=botTarget(bot,players,rules),hill=isHillMode(rules)?hillState(elapsed,players,rules):null,goal=modeGoal(bot,target,hill,players,rules);
 if(!goal){movePlayer(bot,{},dt);return null;}
 const distance=target?Math.hypot(target.x-bot.x,target.z-bot.z):Infinity,desired=target?Math.atan2(-(target.x-bot.x),-(target.z-bot.z)):bot.yaw;
 bot.pitch=lerp(bot.pitch,target?Math.atan2(target.y+target.eye-(bot.y+bot.eye),distance):0,1-Math.exp(-(target?ai.turn:3)*dt));
 const visible=!!target&&wallDistance({x:bot.x,y:bot.y+bot.eye,z:bot.z},direction(desired,bot.pitch))>distance-.6;
 if(bot.energy>=100&&visible&&distance<20)activateBoost(bot);
 const range=bot.gun===1?7:bot.gun===2?24:bot.gun===3?12:bot.gun===4?10:16,goalDistance=Math.hypot(goal.x-bot.x,goal.z-bot.z);
 const routing=(!!hill&&(goalDistance>2.15||bot.y>1.2))||!visible||!!target&&target.y-bot.y>1.2;
 if(routing&&goalDistance>.55){if(!brain.waypoint||time>(brain.pathAt||0)||Math.hypot(brain.waypoint.x-bot.x,brain.waypoint.z-bot.z)<.55){brain.waypoint=nextWaypoint(bot,goal);brain.pathAt=time+.5+(bot.side%3)*.08;}bot.yaw=angleLerp(bot.yaw,Math.atan2(-(brain.waypoint.x-bot.x),-(brain.waypoint.z-bot.z)),1-Math.exp(-10*dt));}
 else if(target)bot.yaw=angleLerp(bot.yaw,desired,1-Math.exp(-ai.turn*dt));
 if((brain.strafeUntil||0)<time){brain.strafeDir=random()<.5?-1:1;brain.strafeUntil=time+.7+random()*1.1;}
 const fighting=target&&visible&&!hill,retreat=fighting&&distance<Math.max(4,range*.48),advance=fighting&&distance>range*1.12;
 movePlayer(bot,{forward:routing&&goalDistance>.55?1:retreat?-.62:advance?.56:hill?0:.08,strafe:fighting&&distance<range+7?(brain.strafeDir||1)*.62:0,sprint:routing||advance},dt);
 if(!target||!visible||bot.shield>0||bot.reload>0||bot.shotCd>0||distance>=38||Math.abs(turnError(bot.yaw,desired))>.18)return null;
 const weapon=WEAPONS[bot.gun];if(bot.ammo[bot.gun]<=0){bot.reload=weapon.reload;return null;}if(time-(brain.lastShot??-10)<Math.max(weapon.rate,ai.rate)||random()>ai.awareness)return null;
 brain.lastShot=time;bot.ammo[bot.gun]--;bot.shotCd=weapon.rate;bot.stats.shots++;
 return {gun:bot.gun,x:bot.x,y:bot.y+bot.eye,z:bot.z,yaw:desired+(random()-.5)*ai.spread,pitch:bot.pitch+(random()-.5)*ai.spread,seed:Math.floor(random()*1e8),aim:bot.gun===2&&distance>16};
}

import {sameTeam,isHillMode,hillState} from './rules.js';
import {WEAPONS,movePlayer,wallDistance,direction,angleLerp,lerp} from './core.js';
import {nextWaypoint} from './bot-navigation.js';
import {activateBoost} from './systems.js';
export function botTarget(bot,players,rules){return players.filter(p=>p!==bot&&p.dead<=0&&!sameTeam(bot,p,rules)).sort((a,b)=>Math.hypot(a.x-bot.x,a.z-bot.z)-Math.hypot(b.x-bot.x,b.z-bot.z))[0]||null;}
export function stepBot(bot,brain,{players,rules,elapsed,time,dt,difficulty='normal',random=Math.random}){
 if(bot.dead>0)return null;const skill={easy:{rate:.85,spread:.14,turn:2},normal:{rate:.45,spread:.055,turn:3.6},hard:{rate:.22,spread:.026,turn:6}}[difficulty]||{rate:.45,spread:.055,turn:3.6};const target=botTarget(bot,players,rules),hill=isHillMode(rules)?hillState(elapsed,players,rules):null;const goal=hill?{...hill.center,y:0}:target;if(!goal){movePlayer(bot,{},dt);return null;}
 const distance=target?Math.hypot(target.x-bot.x,target.z-bot.z):Infinity,desired=target?Math.atan2(-(target.x-bot.x),-(target.z-bot.z)):bot.yaw;bot.pitch=target?lerp(bot.pitch,Math.atan2(target.y+target.eye-(bot.y+bot.eye),distance),1-Math.exp(-3*dt)):0;const see=!!target&&wallDistance({x:bot.x,y:bot.y+bot.eye,z:bot.z},direction(desired,bot.pitch))>distance-.6;
 if(bot.energy>=100&&distance<20)activateBoost(bot);const goalDistance=Math.hypot(goal.x-bot.x,goal.z-bot.z),objective=!!hill&&(goalDistance>2.2||bot.y>1.2),navigating=objective||!see||!!target&&target.y-bot.y>1.2;
 if(navigating&&goalDistance>.6){if(!brain.waypoint||time>brain.pathAt||Math.hypot(brain.waypoint.x-bot.x,brain.waypoint.z-bot.z)<.5){brain.waypoint=nextWaypoint(bot,goal);brain.pathAt=time+.65+bot.side*.025;}bot.yaw=angleLerp(bot.yaw,Math.atan2(-(brain.waypoint.x-bot.x),-(brain.waypoint.z-bot.z)),1-Math.exp(-9*dt));}else if(target)bot.yaw=angleLerp(bot.yaw,desired,1-Math.exp(-skill.turn*dt));
 const moving=navigating&&goalDistance>.6;movePlayer(bot,{forward:moving?1:hill?0:distance>15?1:distance<5?-.5:.08,strafe:!hill&&!navigating?Math.sin(time*.7+bot.side)*.6:0,sprint:moving},dt);
 if(!target||!see||bot.shield>0||bot.reload>0||bot.shotCd>0||distance>=35||time-(brain.lastShot??-10)<Math.max(skill.rate,WEAPONS[bot.gun].rate)||Math.abs(Math.atan2(Math.sin(bot.yaw-desired),Math.cos(bot.yaw-desired)))>.2)return null;
 const w=WEAPONS[bot.gun];if(bot.ammo[bot.gun]<=0){bot.reload=w.reload;return null;}brain.lastShot=time;bot.ammo[bot.gun]--;bot.shotCd=w.rate;bot.stats.shots++;return {gun:bot.gun,x:bot.x,y:bot.y+bot.eye,z:bot.z,yaw:desired+(random()-.5)*skill.spread,pitch:bot.pitch+(random()-.5)*skill.spread,seed:Math.floor(random()*1e8),aim:false};
}

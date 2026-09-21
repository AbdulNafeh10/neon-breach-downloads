import {isTeamMode,teamCounts} from './rules.js';
export function botsEditable(link){return link.host&&!link.closed&&!link.locked&&(!link.party.vote||!!link.party.vote.result);}
export function addRoomBot(link,team=0,difficulty='normal'){
 if(!botsEditable(link)||link.members.length>=link.rules.capacity||!['easy','normal','hard'].includes(difficulty))return false;if(isTeamMode(link.rules)&&(![0,1].includes(team)||teamCounts(link.members)[team]>=Math.ceil(link.rules.capacity/2)))return false;let side=1;while(link.members.some(m=>m.side===side)||link.links.has(side))side++;if(side>7)return false;
 link.members.push({side,name:['','VECTOR','NOVA','ECHO','ATLAS','EMBER','ORBIT','COMET'][side],bot:true,difficulty,team:isTeamMode(link.rules)?team:0,ready:true,skin:['mint','solar','violet','carbon'][side%4]});resetReady(link);return true;
}
export function editRoomBot(link,side,action,value){if(!botsEditable(link))return false;const bot=link.members.find(m=>m.side===side&&m.bot);if(!bot)return false;if(action==='remove'){link.party.leave(side);link.members=link.members.filter(m=>m!==bot);}else if(action==='difficulty'){if(!['easy','normal','hard'].includes(value))return false;bot.difficulty=value;}else if(action==='team'){if(!isTeamMode(link.rules)||![0,1].includes(value)||link.members.filter(m=>m!==bot&&m.team===value).length>=Math.ceil(link.rules.capacity/2))return false;bot.team=value;}else return false;resetReady(link);return true;}
function resetReady(link){for(const m of link.members)m.ready=!!m.bot;link.roster();}

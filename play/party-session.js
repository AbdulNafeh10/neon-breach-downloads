import {MAPS} from './rules.js';
import {MAP_BOUNDS} from './map-layouts.js';
// Reliable room actions. Only the host assigns authors, recipients and deadlines.
export class PartySession{
 constructor(link){this.link=link;this.reset();}
 reset(){this.vote=null;this.markers=new Map();this.lastAction=new Map();this.serial=0;}
 publish(){const l=this.link;l.send({t:'ballot',vote:this.vote});l.emit('ballot',this.vote);}
 startVote(now=Date.now()){if(!this.link.host)return;this.vote={id:++this.serial,endsAt:now+25000,votes:{},result:null};this.publish();}
 cast(map){const l=this.link;if(l.host)this.acceptVote(l.side,{map,id:this.vote?.id});else l.send({t:'vote',map,id:this.vote?.id});}
 acceptVote(side,data){if(!this.vote||this.vote.result||data.id!==this.vote.id||Date.now()>this.vote.endsAt||!MAPS[data.map]||!this.link.members.some(m=>m.side===side))return;this.vote.votes[side]=data.map;this.publish();}
 finishVote(random=Math.random){const l=this.link,v=this.vote;if(!l.host||!v||v.result)return;const counts=Object.fromEntries(Object.keys(MAPS).map(k=>[k,0]));for(const [side,map]of Object.entries(v.votes))if(l.members.some(m=>m.side===+side)&&MAPS[map])counts[map]++;const max=Math.max(...Object.values(counts));let choices=Object.keys(counts).filter(k=>counts[k]===max);if(!max)choices=choices.filter(k=>k!==l.rules.map);v.result=choices[Math.min(choices.length-1,Math.floor(random()*choices.length))];l.setRules({...l.rules,map:v.result});this.publish();}
 receive(data,side){const l=this.link;
  if(data.t==='vote'){if(l.host)this.acceptVote(side,data);return true;}
  if(data.t==='ballot'){if(!l.host){this.vote=data.vote;l.emit('ballot',this.vote);}return true;}
  if(data.t==='mark'){if(l.host)this.acceptMark(side,data);return true;}
  if(data.t==='tactical'){if(!l.host)l.emit('tactical',data);return true;}
  return false;
 }
 mark(data){if(this.link.host)this.acceptMark(this.link.side,data);else this.link.send({t:'mark',...data});}
 allies(side){const l=this.link,member=l.members.find(m=>m.side===side);return l.members.filter(m=>m.side===side||l.rules.mode==='tdm'&&m.team===member?.team);}
 relay(side,data){const l=this.link;for(const m of this.allies(side)){if(m.side===l.side)l.emit('tactical',data);else l.send(data,m.side);}}
 acceptMark(side,data,now=Date.now()){
  const l=this.link,member=l.members.find(m=>m.side===side);if(!member||!l.locked||now-(this.lastAction.get(side)||0)<600)return;
  if(data.action==='ack'){const marker=this.markers.get(data.owner);if(!marker||marker.expires<=now||!this.allies(side).some(m=>m.side===data.owner))return;this.lastAction.set(side,now);this.relay(side,{t:'tactical',action:'ack',owner:data.owner,side,name:member.name});return;}
  if(data.action==='cancel'){this.lastAction.set(side,now);this.markers.delete(side);this.relay(side,{t:'tactical',action:'cancel',side});return;}
  const b=MAP_BOUNDS[l.rules.map],p=data.point;if(!['location','danger','regroup'].includes(data.kind)||!p||!['x','y','z'].every(k=>Number.isFinite(p[k]))||Math.abs(p.x)>b.x||Math.abs(p.z)>b.z||p.y<0||p.y>10)return;
  this.lastAction.set(side,now);const marker={t:'tactical',action:'place',side,name:member.name,kind:data.kind,point:{x:p.x,y:p.y,z:p.z},expires:now+8000};this.markers.set(side,marker);this.relay(side,marker);
 }
 tick(now=Date.now()){if(this.link.host&&this.vote&&!this.vote.result&&now>=this.vote.endsAt)this.finishVote();for(const [side,p]of this.markers)if(now>=p.expires)this.markers.delete(side);}
 leave(side){if(this.link.host&&this.markers.has(side))this.relay(side,{t:'tactical',action:'cancel',side});this.markers.delete(side);this.lastAction.delete(side);if(this.link.host&&this.vote&&!this.vote.result){delete this.vote.votes[side];this.publish();}}
}

// Host-only, life-scoped damage history. Kept separate so credit rules stay testable.
export function createAssistLedger(){
 const hits=new Map(),key=p=>p.side+':'+(p.life||0);
 return {record(shooter,victim,amount,time){if(!amount||shooter===victim)return;const k=key(victim),entry=hits.get(k)||new Map(),old=entry.get(shooter.side)||{damage:0,time};old.damage+=amount;old.time=time;entry.set(shooter.side,old);hits.set(k,entry);},award(killer,victim,players,time,sameTeam){const entry=hits.get(key(victim))||new Map(),out=[];for(const [side,hit]of entry){const p=players.find(x=>x.side===side);if(p&&p!==killer&&time-hit.time<=8&&hit.damage>=25&&sameTeam(p,killer))out.push(p);}hits.delete(key(victim));return out;},clear(victim){hits.delete(key(victim));},clearAll(){hits.clear();}};
}

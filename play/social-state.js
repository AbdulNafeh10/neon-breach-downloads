export function inviteState(room) {
  if (!room?.code || room.state !== 'room') return {allowed:false, label:'CREATE A ROOM FIRST', hint:'Create or join a room, then open Invite friends in the room lobby.'};
  if (room.full) return {allowed:false, label:'ROOM FULL', hint:'Wait for a free slot before inviting another player.'};
  return {allowed:true, label:'INVITE', hint:'Send an invitation to your current room.'};
}
export function withTimeout(promise, ms=12000) {
  let timer;
  return Promise.race([promise, new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Connection timed out. Check your connection and retry.')),ms);})]).finally(()=>clearTimeout(timer));
}

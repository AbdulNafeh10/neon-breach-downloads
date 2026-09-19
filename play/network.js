// PeerJS provides encrypted WebRTC transport; room IDs are invitation secrets.
// Source and license: https://github.com/peers/peerjs (MIT), vendor/PEERJS-LICENSE.
export class DuelLink extends EventTarget {
 constructor(){super();this.peer=null;this.conn=null;this.code='';this.host=false;this.rtt=0;this.lastMessage=0;this.closed=false;this.timer=null;this.joinTimeout=null;this.seq=0;this.lastSeq=-1;this.stateChannel=null;}
 emit(type,detail){this.dispatchEvent(new CustomEvent(type,{detail}));}
 async open(isHost,code,name){
  this.close();this.closed=false;this.host=isHost;this.name=name;this.seq=0;this.lastSeq=-1;
  if(!window.Peer)throw new Error('The connection library could not load. Reload and try again.');
  this.code=isHost?this.randomCode():code.toUpperCase().replace(/[^A-Z2-9]/g,'');
  if(!/^[A-Z2-9]{8}$/.test(this.code))throw new Error('Enter the eight-character code from your friend.');
  const options={debug:0};this.peer=isHost?new Peer('nb-rift-v3-'+this.code,options):new Peer(options);
  const peer=this.peer;
  return new Promise((resolve,reject)=>{
   let opened=false;
   const timeout=this.openTimeout=setTimeout(()=>{if(!opened){reject(new Error('The room service is taking too long. Please try again.'));this.close();}},16000);
   peer.on('open',()=>{if(this.closed)return;opened=true;clearTimeout(timeout);resolve(this.code);if(!isHost){this.accept(peer.connect('nb-rift-v3-'+this.code,{reliable:true,serialization:'json',metadata:{protocol:3,name}}));this.joinTimeout=setTimeout(()=>{if(!this.conn?.open)this.fail('Could not reach the host. Check the code and keep both tabs open, then try again.');},20000)}});
   peer.on('connection',connection=>{
    if(!isHost||this.conn){connection.on('open',()=>{connection.send({t:'reject',reason:'This room already has two players.'});setTimeout(()=>connection.close(),300)});return;}
    if(connection.metadata?.protocol!==3){connection.close();return}this.accept(connection);
   });
   peer.on('error',error=>{if(this.closed||this.peer!==peer)return;const messages={'peer-unavailable':'Room not found. Ask your friend to create a room and keep the tab open.','unavailable-id':'This room code is busy. Create a new room.','network':'Could not reach the room service. Check your connection and retry.','webrtc':'The player connection failed. Try another network or create a new room.','browser-incompatible':'This browser does not support online play. Use a recent Chrome or Edge.'};if(opened&&this.conn?.open&&['network','socket-error','socket-closed','server-error'].includes(error.type)){try{if(peer.disconnected)peer.reconnect()}catch{}return;}const message=messages[error.type]||'Connection failed. Try creating a fresh room.';if(!opened){clearTimeout(timeout);reject(new Error(message));this.close()}else this.fail(message)});
   peer.on('disconnected',()=>{if(this.closed||peer.destroyed)return;if(this.conn?.open){try{peer.reconnect()}catch{}}else this.fail('Disconnected from the room service. Please create or join again.');});
  });
 }
 randomCode(){const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return Array.from(crypto.getRandomValues(new Uint8Array(8)),n=>alphabet[n%alphabet.length]).join('');}
 accept(conn){
  this.conn=conn;conn.on('open',()=>{if(this.closed)return;clearTimeout(this.joinTimeout);this.lastMessage=performance.now();
   this.send({t:'hello',protocol:3,name:this.name});
   try{const ch=conn.peerConnection.createDataChannel('snapshots',{negotiated:true,id:100,ordered:false,maxRetransmits:0});this.stateChannel=ch;ch.onmessage=event=>{try{this.receive(JSON.parse(event.data))}catch{}};}catch{}
   this.timer=setInterval(()=>{if(!conn.open)return;const now=performance.now();if(now-this.lastMessage>15000){this.fail('Your rival disconnected. Return to the lobby to start a new room.');return}this.send({t:'ping',time:now});},2000);
  });
  conn.on('data',data=>this.receive(data));conn.on('error',()=>{if(this.conn===conn)this.fail('The connection was interrupted. Create a new room and reconnect.');});
  conn.on('close',()=>{if(!this.closed&&this.conn===conn)this.fail('Your rival left the room. Create a new room to play again.');});
 }
 receive(data){
  if(!data||typeof data!=='object'||typeof data.t!=='string'||JSON.stringify(data).length>12000)return;
  this.lastMessage=performance.now();
  if(data.t==='ping'){this.send({t:'pong',time:data.time});return}if(data.t==='pong'){if(Number.isFinite(data.time))this.rtt=Math.max(0,Math.round(performance.now()-data.time));return}
  if(data.t==='reject'){this.fail(typeof data.reason==='string'?data.reason:'Room unavailable.');return}
  if(data.t==='hello'){if(data.protocol!==3){this.fail('Your games are different versions. Both players should reload.');return}this.emit('connected',{name:String(data.name||'Rival').replace(/[<>]/g,'').slice(0,16)});return}
  if(data.t==='state'){if(!Number.isInteger(data.seq)||data.seq<=this.lastSeq)return;this.lastSeq=data.seq;}
  this.emit('message',data);
 }
 send(data){if(!this.conn?.open)return false;try{this.conn.send(data);return true}catch{return false}}
 state(player,id){const packet={t:'state',id,seq:++this.seq,p:player};const ch=this.stateChannel;if(ch?.readyState==='open'){if(ch.bufferedAmount<16000)try{ch.send(JSON.stringify(packet))}catch{}}else if(this.conn?.dataChannel?.bufferedAmount<16000)this.send(packet);}
 fail(message){if(this.closed)return;this.close();this.emit('failure',message);}
 close(){this.closed=true;clearInterval(this.timer);clearTimeout(this.openTimeout);clearTimeout(this.joinTimeout);this.stateChannel?.close();this.stateChannel=null;this.conn?.close();this.conn=null;this.peer?.destroy();this.peer=null;}
}

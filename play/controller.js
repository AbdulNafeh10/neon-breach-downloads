// W3C standard mapping: DualSense in current desktop Chrome/Edge.
// The browser owns USB/Bluetooth mapping; unknown layouts are never guessed.
import {PAD_DEFAULTS} from './control-bindings.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const finite=n=>Number.isFinite(n)?n:0;
export function stick(x,y,deadzone=.14,curve=1){x=clamp(finite(x),-1,1);y=clamp(finite(y),-1,1);const m=Math.hypot(x,y),dz=clamp(finite(deadzone),.03,.4);if(m<=dz)return {x:0,y:0};const scaled=Math.pow(clamp((m-dz)/(1-dz),0,1),curve);return {x:x/m*scaled,y:y/m*scaled};}
export function readPad(pad,deadzone=.14){const values=Array.from({length:17},(_,i)=>clamp(finite(pad?.buttons?.[i]?.value)||(+!!pad?.buttons?.[i]?.pressed),0,1));return {move:stick(pad?.axes?.[0],pad?.axes?.[1],deadzone),look:stick(pad?.axes?.[2],pad?.axes?.[3],deadzone,1.55),buttons:values.map((v,i)=>v>(i===6||i===7?.18:.5)),values};}
export function padActions(sample,pressed,sprint=false,map=PAD_DEFAULTS){return {forward:-sample.move.y,strafe:sample.move.x,lookX:sample.look.x,lookY:sample.look.y,aim:sample.buttons[map.aim],fire:sample.buttons[map.fire],firePress:pressed[map.fire],jump:pressed[map.jump],slide:pressed[map.slide]||map.slide===1&&!Object.values(map).includes(11)&&pressed[11],reload:pressed[map.reload],next:pressed[map.next],dash:pressed[map.dash],boost:pressed[map.boost],sprint,ping:pressed[map.ping],regroup:pressed[map.regroup],ack:pressed[map.ack],cancelPing:pressed[map.cancelPing],menu:pressed[9],accept:pressed[0],back:pressed[1]};}
export class ControllerInput{
 constructor(read=()=>navigator.getGamepads?.()||[]){this.read=read;this.pad=null;this.previous=null;this.armed=false;this.sprinting=false;this.error='';}
 reset(){this.armed=false;this.sprinting=false;}
 poll(deadzone=.14,map=PAD_DEFAULTS){let pads=[];this.error='';try{pads=Array.from(this.read()||[]).filter(p=>p?.connected!==false&&p);}catch{this.error='Controller access is blocked here. Open the game in desktop Chrome or Edge.';}
 const supported=pads.filter(p=>p.mapping==='standard'&&p.axes?.length>=4&&p.buttons?.length>=16),pad=supported.find(p=>p.index===this.pad?.index)||supported[0]||null;
 const disconnected=!!this.pad&&!pad,changed=pad?.index!==this.pad?.index||pad?.id!==this.pad?.id;if(changed){this.previous=null;this.reset();}this.pad=pad;
 if(!pad){this.previous=null;this.reset();return {connected:false,disconnected,unsupported:pads.length>0,activity:false,actions:null,sample:null};}
 const sample=readPad(pad,deadzone),prev=this.previous,pressed=sample.buttons.map((v,i)=>v&&!prev?.buttons[i]);
 const activity=sample.buttons.some((v,i)=>v&&!prev?.buttons[i])||['move','look'].some(k=>Math.hypot(sample[k].x,sample[k].y)>.18&&(!prev||Math.hypot(sample[k].x-prev[k].x,sample[k].y-prev[k].y)>.06));
 if(!sample.buttons.some(Boolean))this.armed=true;
 if(!this.armed)pressed.fill(false);
 if(this.armed&&pressed[map.sprint])this.sprinting=!this.sprinting;
 if(Math.hypot(sample.move.x,sample.move.y)<.1)this.sprinting=false;
 this.previous=sample;const actions=padActions(sample,pressed,this.sprinting,map);if(!this.armed){actions.fire=false;actions.aim=false;}
 return {connected:true,disconnected,unsupported:false,activity,actions,sample,pressed,armed:this.armed};
 }
 rumble(strength=.25,duration=60){const h=this.pad?.vibrationActuator;if(!h?.playEffect)return;try{const result=h.playEffect('dual-rumble',{duration,startDelay:0,strongMagnitude:strength,weakMagnitude:strength*.65});result?.catch?.(()=>{});}catch{}}
}

// Pointer lock is asynchronous and may require a fresh click after browser Esc.
// Gameplay resumes only after the browser confirms capture.
export class MouseCapture{
 constructor(doc,canvas,{allowed,waiting,acquired,blocked,lost},timers=globalThis){Object.assign(this,{doc,canvas,allowed,waiting,acquired,blocked,lost,timers});this.epoch=0;this.pending=false;this.locked=false;doc.addEventListener('pointerlockchange',()=>this.changed());doc.addEventListener('pointerlockerror',()=>this.fail(this.epoch));}
 request(){if(!this.allowed()||this.pending)return;if(this.doc.pointerLockElement===this.canvas){this.locked=true;this.acquired();return;}const epoch=++this.epoch;this.pending=true;this.waiting();this.canvas.focus();this.timer=this.timers.setTimeout(()=>this.fail(epoch),1500);try{const result=this.canvas.requestPointerLock();result?.catch?.(()=>this.fail(epoch));}catch{this.fail(epoch);}}
 fail(epoch){if(epoch!==this.epoch||!this.pending)return;this.pending=false;this.timers.clearTimeout(this.timer);if(this.allowed())this.blocked();}
 changed(){if(this.doc.pointerLockElement===this.canvas){if(!this.allowed()||!this.pending&&!this.locked){this.doc.exitPointerLock?.();return;}this.pending=false;this.locked=true;this.timers.clearTimeout(this.timer);this.acquired();}else{const wasLocked=this.locked;this.locked=false;if(wasLocked)this.lost();}}
 release(){++this.epoch;this.pending=false;this.locked=false;this.timers.clearTimeout(this.timer);if(this.doc.pointerLockElement===this.canvas)this.doc.exitPointerLock?.();}
}

// Distance-based footsteps and genuine airborne landings, not stair contact flicker.
export class MovementAudio {
 constructor(){this.reset();}
 reset(){this.distance=0;this.air=0;this.peak=0;this.impact=0;this.cooldown=0;this.foot=0;}
 update(before,p,dt){this.cooldown=Math.max(0,this.cooldown-dt);const events=[];if(p.dead>0){this.reset();return events;}if(!p.grounded){this.air+=dt;this.peak=Math.max(this.peak,before.y,p.y);this.impact=Math.max(this.impact,-before.vy);return events;}
 if(!before.grounded){const drop=this.peak-p.y;if(this.air>.14&&drop>.55&&this.impact>3.5){events.push({kind:'land',volume:Math.min(.8,.28+this.impact*.025)});this.cooldown=.22;this.distance=0;}this.air=0;this.peak=p.y;this.impact=0;}
 if(p.slide>0||p.dash>0){this.distance=0;return events;}const distance=Math.hypot(p.x-before.x,p.z-before.z);if(distance>1){this.distance=0;return events;}const speed=dt>0?distance/dt:0;if(speed<1.3){this.distance=0;return events;}this.distance+=distance;const stride=speed>8?2.8:2.3;if(this.distance>=stride&&this.cooldown<=0){this.distance%=stride;events.push({kind:'step',volume:speed>8?.78:.56,pan:(this.foot++%2?1:-1)*.07});this.cooldown=.22;}return events;
 }
}

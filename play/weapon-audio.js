// Original procedural sound design: dry transients, body, action and short room reflections.
// Every source disconnects when it ends; no per-shot timers or growing audio graph.
function voices(context,noise,destination,volume,pan){
 const start=context.currentTime,panner=context.createStereoPanner();panner.pan.value=Math.max(-1,Math.min(1,pan));panner.connect(destination);let active=0;
 function connect(source,filter,gain,delay,duration){active++;source.connect(filter);filter.connect(gain);gain.connect(panner);source.start(start+delay);source.stop(start+delay+duration);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();if(--active===0)panner.disconnect();};}
 function tone(freq,end,delay,duration,level,type='sine'){const o=context.createOscillator(),g=context.createGain(),f=context.createBiquadFilter();f.type='lowpass';f.frequency.value=4500;o.type=type;o.frequency.setValueAtTime(freq,start+delay);o.frequency.exponentialRampToValueAtTime(Math.max(1,end),start+delay+duration);g.gain.setValueAtTime(.0001,start+delay);g.gain.exponentialRampToValueAtTime(Math.max(.0002,level*volume),start+delay+.002);g.gain.exponentialRampToValueAtTime(.0001,start+delay+duration);connect(o,f,g,delay,duration);}
 function burst(freq,delay,duration,level,type='lowpass',q=.7){const n=context.createBufferSource(),f=context.createBiquadFilter(),g=context.createGain();n.buffer=noise;n.loop=true;n.playbackRate.value=.97+Math.random()*.06;f.type=type;f.frequency.value=freq;f.Q.value=q;g.gain.setValueAtTime(.0001,start+delay);g.gain.exponentialRampToValueAtTime(Math.max(.0002,level*volume),start+delay+.001);g.gain.exponentialRampToValueAtTime(.0001,start+delay+duration);connect(n,f,g,delay,duration);}
 return {tone,burst};
}
export function weaponSound(context,noise,destination,index,volume=1,pan=0,environment='rift'){
 const {tone,burst}=voices(context,noise,destination,volume,pan);
 // Caliber-specific attack/body envelopes, not pitched laser oscillators.
 const profiles=[{crack:5400,body:132,tail:.18,power:.39},{crack:3900,body:72,tail:.48,power:.74},{crack:7600,body:103,tail:.4,power:.59},{crack:6100,body:215,tail:.085,power:.25},{crack:4600,body:95,tail:.3,power:.62}];const p=profiles[index];
 burst(p.crack,0,index===3?.024:.045,p.power,'highpass');burst(1600,0,p.tail,p.power*.8,'bandpass');burst(370,.006,p.tail*.9,p.power*.65);tone(p.body,p.body*.55,0,index===3?.045:.13,p.power*.5);
 // Delayed reflections distinguish the metal foundry and the wider outdoor arenas.
 const reflections=environment==='foundry'?[.055,.12]:environment==='citadel'?[.085,.19]:[.11];for(const [i,d]of reflections.entries())burst(1150,d,p.tail*.8,p.power*.14/(i+1),'bandpass');
 if(index===1){burst(680,.008,.28,.4);tone(88,42,.005,.19,.24);burst(5200,0,.023,.32,'highpass');burst(1750,.21,.085,.26,'bandpass',1.2);burst(3300,.245,.045,.2,'highpass');tone(240,110,.23,.045,.09,'triangle');burst(2100,.42,.065,.31,'bandpass',1.4);burst(4800,.455,.022,.23,'highpass');tone(390,180,.43,.038,.1,'triangle');}
 else if(index===2){burst(950,.025,.32,.24);burst(3000,.2,.045,.13,'bandpass');burst(1850,.36,.1,.15,'bandpass');burst(4300,.68,.045,.13,'highpass');}
 else if(index===3){burst(2400,.024,.022,.12,'bandpass');}
 else if(index===4){burst(600,.015,.18,.28);burst(3700,.05,.025,.23,'bandpass');burst(2200,.13,.035,.18,'highpass');}
 else{burst(2500,.045,.025,.16,'bandpass');burst(4500,.082,.02,.08,'highpass');}
}
export function gameSound(context,noise,destination,kind,volume=1,pan=0,{gun=0,stage=0,map='rift'}={}){
 const {tone,burst}=voices(context,noise,destination,volume,pan);
 if(kind==='shieldbreak'){burst(6400,0,.16,.22,'highpass');for(const [i,f]of [1400,2100,2900].entries())tone(f,f*.45,i*.018,.18,.06,'triangle');}
 else if(kind==='step'){burst(map==='foundry'?2300:map==='citadel'?950:1400,0,.07,.07,'bandpass');tone(map==='foundry'?160:95,65,0,.055,.04);burst(4000,.018,.035,.024,'highpass');}
 else if(kind==='reload'){const weight=gun===1||gun===4?.8:.5;if(stage===0){burst(2400,0,.045,.16,'bandpass');tone(460,390,0,.025,.035,'triangle');}else if(stage===1){burst(850,0,.09,.16*weight);burst(3300,.06,.03,.15,'bandpass');}else{burst(1800,0,.065,.21);burst(5200,.045,.035,.13,'highpass');tone(210,160,.01,.04,.05);}}
 else if(kind==='hit'||kind==='head'){burst(4100,0,.025,.09,'bandpass');tone(kind==='head'?1700:1050,kind==='head'?1400:850,0,.045,.06,'triangle');if(kind==='head')tone(2100,1900,.035,.065,.045);}
 else if(kind==='hurt'){burst(480,0,.16,.21);tone(75,48,0,.13,.12);}
 else if(kind==='jump'){burst(900,0,.1,.08,'bandpass');tone(120,85,0,.08,.03);}
 else if(kind==='kill'){tone(660,660,0,.1,.055,'triangle');tone(990,990,.055,.15,.045,'triangle');burst(3800,0,.03,.06,'highpass');}
 else if(kind==='start'){for(const [i,f]of [330,440,660].entries())tone(f,f,i*.065,.16,.055,'triangle');}
 else if(kind==='impact'){burst(map==='foundry'?3200:1300,0,.075,.09,'bandpass');}
 else if(kind==='ui'){burst(3600,0,.018,.025,'bandpass');tone(720,640,0,.028,.015,'triangle');}
 else if(kind==='empty'){burst(2800,0,.03,.1,'bandpass');tone(340,280,0,.025,.025,'triangle');}
}

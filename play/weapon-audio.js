// Original synthesized layers: no sampled audio from another game.
export function weaponSound(context,noise,destination,index,volume=1,pan=0){
 const start=context.currentTime,panner=context.createStereoPanner();panner.pan.value=Math.max(-1,Math.min(1,pan));panner.connect(destination);let latest=0;
 function tone(freq,end,delay,duration,level,type='sine'){const o=context.createOscillator(),g=context.createGain();o.type=type;o.frequency.setValueAtTime(freq,start+delay);o.frequency.exponentialRampToValueAtTime(end,start+delay+duration);g.gain.setValueAtTime(level*volume,start+delay);g.gain.exponentialRampToValueAtTime(.001,start+delay+duration);o.connect(g);g.connect(panner);o.start(start+delay);o.stop(start+delay+duration);o.onended=()=>{o.disconnect();g.disconnect();};latest=Math.max(latest,delay+duration);}
 function burst(freq,delay,duration,level,type='lowpass'){const n=context.createBufferSource(),f=context.createBiquadFilter(),g=context.createGain();n.buffer=noise;f.type=type;f.frequency.value=freq;f.Q.value=.7;g.gain.setValueAtTime(level*volume,start+delay);g.gain.exponentialRampToValueAtTime(.001,start+delay+duration);n.connect(f);f.connect(g);g.connect(panner);n.start(start+delay);n.stop(start+delay+duration);n.onended=()=>{n.disconnect();f.disconnect();g.disconnect();};latest=Math.max(latest,delay+duration);}
 if(index===1){tone(145,38,0,.28,.5);burst(5800,0,.065,.55,'highpass');burst(1700,.005,.34,.65);burst(3200,.28,.065,.25,'bandpass');tone(420,180,.29,.075,.08,'triangle');burst(2300,.42,.05,.2,'bandpass');}
 else if(index===2){tone(240,43,0,.3,.38);burst(7200,0,.045,.55,'highpass');burst(2200,.01,.29,.4);tone(750,180,.3,.06,.06,'triangle');}
 else if(index===3){tone(240,95,0,.055,.2,'triangle');burst(6300,0,.04,.31,'highpass');}
 else if(index===4){tone(195,45,0,.18,.4);burst(4200,0,.055,.45,'highpass');burst(1300,.02,.16,.24);}
 else{tone(170,58,0,.095,.3,'triangle');burst(4800,0,.052,.42,'highpass');burst(1700,.01,.12,.24);}
 setTimeout(()=>panner.disconnect(),(latest+.1)*1000);
}

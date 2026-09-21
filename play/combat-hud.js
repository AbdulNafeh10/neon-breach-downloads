// Only confirmed incoming hits enter this HUD; no enemy tracking or prediction.
export function incomingBearing(player,source){return Math.atan2(source.x-player.x,-(source.z-player.z))+player.yaw;}
export function ammoState(player,weapon){return {low:player.ammo[player.gun]<=Math.max(1,Math.floor(weapon.cap*.2)),progress:player.reload>0?Math.max(0,Math.min(1,1-player.reload/weapon.reload)):0};}
export function mountCombatHUD(doc){
 const root=doc.createElement('div');root.id='combat-assist';root.innerHTML='<div id="zone-callout"></div><div class="incoming-bearing" hidden aria-label="Direction of incoming damage"><i></i></div><div class="reload-meter" hidden><span></span><div><i></i></div></div><section class="death-recap" hidden><small>ELIMINATED BY</small><strong></strong><p></p><span></span></section>';doc.body.append(root);doc.querySelector('.tactical')?.append(root.querySelector('#zone-callout'));
 const bearing=root.querySelector('.incoming-bearing'),reload=root.querySelector('.reload-meter'),recap=root.querySelector('.death-recap');let last=null,at=0;
 return {
 hit({source,name,gun,amount,killed},now){last={source:{x:source.x,z:source.z},name,gun,amount,killed};at=now;},
 reset(){last=null;},
 update({player,weapon,mode,paused,now}){
  const active=mode==='match';root.hidden=!active||paused;if(!active){last=null;return;}
  const state=ammoState(player,weapon);doc.getElementById('ammo')?.classList.toggle('low-ammo',state.low&&player.reload<=0);
  reload.hidden=player.dead>0||(!state.low&&player.reload<=0);reload.classList.toggle('is-low',player.reload<=0);
  reload.querySelector('span').textContent=player.reload>0?'RELOADING · '+player.reload.toFixed(1)+'s':player.ammo[player.gun]===0?'EMPTY · RELOAD':'LOW AMMO · RELOAD';reload.querySelector('div').hidden=player.reload<=0;reload.querySelector('i').style.width=state.progress*100+'%';
  bearing.hidden=!last||now-at>1.1||player.dead>0;if(!bearing.hidden){bearing.style.transform='translate(-50%,-50%) rotate('+incomingBearing(player,last.source)+'rad)';bearing.style.opacity=Math.min(.65,(1.1-(now-at))*.8)*(globalThis.neonHitIntensity?.()??1);}
  recap.hidden=player.dead<=0||!last?.killed;if(!recap.hidden){recap.querySelector('strong').textContent=last.name;recap.querySelector('p').textContent=last.gun+' · '+Math.round(last.amount)+' final-shot damage';recap.querySelector('span').textContent='RESPAWNING IN '+Math.max(1,Math.ceil(player.dead))+'s';}else if(player.dead<=0&&last?.killed)last=null;
 }
 };
}

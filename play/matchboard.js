import {isTeamMode,points,TEAM_NAMES} from './rules.js';
export function renderMatchboard(body,{players,local,rules,teamScores,name,online,rtt}){
 const doc=body.ownerDocument,team=isTeamMode(rules),rows=[],sorted=players.slice().sort((a,b)=>points(b,rules)-points(a,rules)||b.score-a.score||a.side-b.side);
 const headers=body.closest('table').querySelector('thead tr');headers.replaceChildren(...['PLAYER','KILLS','DEATHS','SCORE / HILL SEC','PING'].map(label=>{const th=doc.createElement('th');th.textContent=label;return th;}));
 for(const group of team?[0,1]:[null]){if(team){const tr=doc.createElement('tr');tr.className='score-team-heading score-team-'+group;const th=doc.createElement('th');th.colSpan=5;th.scope='rowgroup';th.textContent=TEAM_NAMES[group]+'  ·  '+Math.floor(teamScores[group])+(local.team===group?'  ·  YOUR TEAM':'');tr.append(th);rows.push(tr);}
  for(const p of sorted.filter(p=>!team||p.team===group)){const tr=doc.createElement('tr');tr.className=(team?'score-team-'+group:'')+(p===local?' score-you':'');for(const value of [name(p.side)+(p===local?' · YOU':''),p.score,p.stats.deaths,Math.floor(points(p,rules)),p===local&&online?rtt+' ms':'—']){const td=doc.createElement('td');td.textContent=value;tr.append(td);}rows.push(tr);}
 }
 body.replaceChildren(...rows);
}

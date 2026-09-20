// Deliberately different handling envelopes; camera recoil remains bounded separately.
export const HANDLING=[
 {adsSpeed:13,recovery:12,kick:.085,tilt:.12,decay:13,roll:-.014},
 {adsSpeed:9,recovery:8,kick:.26,tilt:.32,decay:7,roll:.045},
 {adsSpeed:7,recovery:7,kick:.20,tilt:.19,decay:6.5,roll:-.025},
 {adsSpeed:18,recovery:17,kick:.05,tilt:.075,decay:22,roll:-.01},
 {adsSpeed:10,recovery:8,kick:.22,tilt:.34,decay:8,roll:.065}
];
const pulse=(age,start,length)=>age<start||age>start+length?0:Math.sin((age-start)/length*Math.PI);
export function weaponPose(index,{ads=0,shotAge=10,reload=0,reloading=false,equip=0}={}){
 const p=HANDLING[index],kick=Math.exp(-shotAge*p.decay),lift=1-Math.exp(-shotAge*120),shot=kick*lift;
 const dip=reloading?Math.sin(Math.PI*reload):0;
 return {kick:(shot*p.kick-pulse(shotAge,index===1?.28:.12,index===1?.35:.18)*p.kick*.12)*(1-ads*.55),tilt:shot*p.tilt*(1-ads*.86)-dip*.5-equip*.4,roll:shot*p.roll*(1-ads*.8)-dip*(index===4?.55:.38),dip:dip*.17+equip*.2,
 action:index===2?pulse(shotAge,.18,.55)*.1:index===4?pulse(shotAge,0,.16)*.11:shot*.035,
 bolt:index===2?pulse(shotAge,.12,.65)*-.65:0,pump:index===1?pulse(shotAge,.2,.38)*.12:0,
 magazine:reloading?Math.sin(Math.PI*Math.min(1,Math.max(0,(reload-.08)/.8)))*.27:0};
}

import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {BLOCKS} from './core.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

const palette={cyan:0x6dffd2,orange:0xff9961,violet:0xa98bff,steel:0x41545b,dark:0x121d29,light:0x71888b};
export function createArena(renderer){
 const scene=new T.Scene();scene.background=new T.Color(0x122331);scene.fog=new T.FogExp2(0x182b3b,.008);
 const environment=new T.PMREMGenerator(renderer);const room=new RoomEnvironment();scene.environment=environment.fromScene(room,.04).texture;room.dispose();environment.dispose();scene.environmentIntensity=.62;
 const hemi=new T.HemisphereLight(0xbbf0ff,0x233149,1.7);scene.add(hemi);
 const sun=new T.DirectionalLight(0xffcfad,3.5);sun.position.set(-24,38,-28);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-33,right:33,top:32,bottom:-32,near:1,far:100});sun.shadow.bias=-.0005;sun.shadow.normalBias=.04;scene.add(sun);
 const fill=new T.DirectionalLight(0x79bfff,1.5);fill.position.set(20,12,30);scene.add(fill);
 const materials={};const standard=(name,color,metalness=.45,roughness=.36)=>materials[name]=new T.MeshStandardMaterial({color,metalness,roughness});
 const dark=standard('dark',0x172631,.65,.31),steel=standard('steel',0x58747b,.7,.3),light=standard('light',0x9faeaa,.62,.27),base=standard('base',0x223a45,.58,.36),copper=standard('copper',0x74533d,.7,.34);
 const glow=(color,power=2)=>new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:power,metalness:.2,roughness:.3});
 const cyan=glow(palette.cyan,1.6),orange=glow(palette.orange,1.6),violet=glow(palette.violet,1.6),white=glow(0xc9fff1,2);
 let architectureParent=scene;const boxGeo=new T.BoxGeometry(1,1,1);const roundedCache=new Map();
 function box(x,y,z,w,h,d,mat,round=0,parent=architectureParent){let g=boxGeo;if(round){let key=[w,h,d,round].join();if(!roundedCache.has(key))roundedCache.set(key,new RoundedBoxGeometry(w,h,d,2,round));g=roundedCache.get(key)}const m=new T.Mesh(g,mat);if(!round)m.scale.set(w,h,d);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
 function cylinder(x,y,z,r,h,mat,sides=32,parent=scene){const m=new T.Mesh(new T.CylinderGeometry(r,r,h,sides),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
 const floorTexture=document.createElement('canvas');floorTexture.width=floorTexture.height=128;const g=floorTexture.getContext('2d');g.fillStyle='#a6b1af';g.fillRect(0,0,128,128);for(let i=0;i<3000;i++){g.fillStyle=Math.random()<.5?'#ffffff0b':'#0000000b';g.fillRect(Math.random()*128,Math.random()*128,Math.random()*15,1)}g.strokeStyle='#7b8d8b';g.lineWidth=2;g.strokeRect(3,3,122,122);g.fillStyle='#596b6a';[[9,9],[116,9],[9,116],[116,116]].forEach(p=>g.fillRect(p[0],p[1],3,3));const map=new T.CanvasTexture(floorTexture);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
 const floorMat=new T.MeshStandardMaterial({color:0x708c8d,map,metalness:.66,roughness:.26});
 box(0,-.45,0,51,.8,42,dark,.22);const tileGeo=new RoundedBoxGeometry(2.93,.16,2.93,1,.035);const tiles=new T.InstancedMesh(tileGeo,floorMat,16*13);let index=0;const matrix=new T.Matrix4();for(let x=0;x<16;x++)for(let z=0;z<13;z++){matrix.makeTranslation((x-7.5)*3,-.08,(z-6)*3);tiles.setMatrixAt(index++,matrix)}tiles.receiveShadow=true;scene.add(tiles);
 // Recessed runway lighting, team stripes, and perimeter architecture.
 for(const x of [-12,12])box(x,.013,0,.045,.025,35,cyan);
 for(const z of [-13.6,13.6]){const color=z>0?cyan:orange;box(0,.025,z,11,.025,.16,color);for(let x=-5;x<=5;x+=2)box(x,.027,z+(z>0?.5:-.5),.12,.025,.42,color);}
 for(const end of [-1,1]){
  const color=end>0?cyan:orange;
  box(0,.6,end*19.7,50,1.2,.5,base,.1);box(0,1.22,end*19.7,50,.07,.55,color);
  for(const x of [-21,-10.5,0,10.5,21]){box(x,3.8,end*20,1.1,7.6,1.1,dark,.12);box(x,5.8,end*19.38,.1,3.7,.08,color);box(x,7.5,end*20,2.2,.32,2.1,steel,.08)}
  box(0,7.35,end*20,44,.55,1,dark,.1);box(0,7.05,end*19.4,44,.08,.05,color);
  for(const x of [-5.5,5.5])box(x,2.6,end*19.65,.25,4,.4,steel,.05);
 }
 const glass=new T.MeshPhysicalMaterial({color:0x669fb3,transparent:true,opacity:.18,metalness:.45,roughness:.12,side:T.DoubleSide,depthWrite:false});
 for(const side of [-1,1]){
  box(side*24.5,1.9,0,.55,3.8,40,base,.08);box(side*24.15,4,0,.12,.12,40,cyan);
  for(const z of [-18,-12,-6,0,6,12,18]){box(side*24.2,5.25,z,.45,2.7,.3,steel,.05);box(side*24.2,5.1,z+2.8,.07,2.15,5.2,glass)}
  box(side*24.2,6.7,0,.3,.3,38,steel);
 }
 const architecture=new T.Group();scene.add(architecture);function rebuildArchitecture(){for(const child of [...architecture.children]){child.geometry.dispose();architecture.remove(child);}architectureParent=architecture;
 for(const b of BLOCKS){
  if(b.kind==='reactor')continue;
  const mat=b.kind==='crate'?copper:b.kind==='step'?steel:b.kind==='platform'?base:light;
  box(b.x,b.y+b.h/2,b.z,b.w,b.h,b.d,mat,b.kind==='step'?.035:.1);
  if(b.kind==='step'){box(b.x,b.h+.014,b.z+(b.z>0?.24:-.24),b.w-.3,.02,.045,cyan);continue}
  if(b.kind==='platform'){box(b.x,b.h+.02,b.z,b.w-.2,.03,b.d-.15,floorMat);for(const side of [-1,1])box(b.x+side*(b.w/2-.08),b.h+.04,b.z,.04,.025,b.d-.3,cyan);continue}
  const top=b.y+b.h;box(b.x,top-.12,b.z+b.d/2+.015,b.w-.25,.075,.025,b.z<0?orange:cyan);
  box(b.x,b.y+.13,b.z,b.w+.06,.24,b.d+.06,dark,.055);
  box(b.x,top+.02,b.z,b.w-.15,.065,b.d-.15,steel,.035);
  for(const s of [-1,1]){box(b.x+s*(b.w/2-.1),b.y+b.h*.5,b.z+b.d/2+.028,.075,b.h*.66,.04,dark);box(b.x+s*(b.w/2-.1),b.y+b.h*.5,b.z-b.d/2-.028,.075,b.h*.66,.04,dark)}
  if(b.kind==='bastion'){box(b.x,b.h/2,b.z+b.d/2+.045,.9,b.h*.6,.05,dark,.03);box(b.x,b.h/2,b.z+b.d/2+.08,.1,b.h*.45,.015,cyan);box(b.x,b.h/2,b.z-b.d/2-.045,.9,b.h*.6,.05,dark,.03);box(b.x,b.h/2,b.z-b.d/2-.08,.1,b.h*.45,.015,orange)}
 }
 architecture.updateMatrixWorld(true);const grouped=new Map();for(const mesh of architecture.children){const id=mesh.material.uuid;if(!grouped.has(id))grouped.set(id,{material:mesh.material,geometries:[]});const geo=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();geo.applyMatrix4(mesh.matrixWorld);grouped.get(id).geometries.push(geo);}architecture.clear();for(const {material,geometries}of grouped.values()){const mesh=new T.Mesh(mergeGeometries(geometries,false),material);mesh.castShadow=true;mesh.receiveShadow=true;architecture.add(mesh);geometries.forEach(g=>g.dispose());}architectureParent=scene;}rebuildArchitecture();
 const reactor=new T.Group();scene.add(reactor);
 cylinder(0,.3,0,3.15,.6,steel,8);cylinder(0,.66,0,2.8,.17,cyan,8);cylinder(0,.86,0,2.5,.25,dark,8);
 const pillarMat=new T.MeshPhysicalMaterial({color:0x66ecbd,metalness:.1,roughness:.08,transparent:true,opacity:.24,side:T.DoubleSide,depthWrite:false});cylinder(0,3.7,0,2.05,5.3,pillarMat,32);
 const core=new T.Mesh(new T.IcosahedronGeometry(1.12,2),new T.MeshStandardMaterial({color:0xadffe5,emissive:0x58ffbf,emissiveIntensity:1.6,flatShading:true,metalness:.5,roughness:.1}));core.position.y=3.3;reactor.add(core);
 const shell=new T.Mesh(new T.IcosahedronGeometry(1.55,1),new T.MeshBasicMaterial({color:0x88ffe0,wireframe:true,transparent:true,opacity:.2}));shell.position.y=3.3;reactor.add(shell);
 const rings=[];for(let i=0;i<3;i++){const ring=new T.Mesh(new T.TorusGeometry(1.85+i*.2,.026,8,100),i===1?violet:cyan);ring.position.y=3.3;ring.rotation.set(Math.PI/2+i*.45,i*.7,0);reactor.add(ring);rings.push(ring)}
 for(let i=0;i<4;i++){const angle=Math.PI/4+i*Math.PI/2,x=Math.cos(angle)*2.65,z=Math.sin(angle)*2.65;box(x,3.5,z,.55,5.9,.55,dark,.08);box(x*.94,3.5,z*.94,.12,4.8,.12,cyan);}
 cylinder(0,6.45,0,2.8,.4,steel,8);cylinder(0,6.16,0,2.65,.12,cyan,8);cylinder(0,6.8,0,1.8,.4,dark,8);
 const coreLight=new T.PointLight(palette.cyan,28,19,2);coreLight.position.set(0,4,0);scene.add(coreLight);
 // Remote terrain and atmospheric sky are part of the real-time scene.
 const sky=new T.Mesh(new T.SphereGeometry(220,48,24),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{top:{value:new T.Color(0x080f2e)},bottom:{value:new T.Color(0x416875)},sunColor:{value:new T.Color(0xe2a292)}},vertexShader:'varying vec3 vWorld;void main(){vWorld=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec3 vWorld;uniform vec3 top;uniform vec3 bottom;uniform vec3 sunColor;void main(){vec3 n=normalize(vWorld);float h=smoothstep(-0.05,0.65,n.y);vec3 c=mix(bottom,top,h);float glow=pow(max(0.,dot(n,normalize(vec3(-.7,.12,-.6)))),16.);c+=sunColor*glow*.3;gl_FragColor=vec4(c,1.);}'}));scene.add(sky);
 const aurora=new T.Mesh(new T.PlaneGeometry(260,95),new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,uniforms:{time:{value:0},tint:{value:new T.Color(0x3cfac1)},strength:{value:.32}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec2 vUv;uniform float time;uniform vec3 tint;uniform float strength;void main(){float wave=.43+sin(vUv.x*9.+time*.11)*.12+sin(vUv.x*19.-time*.07)*.045;float band=exp(-abs(vUv.y-wave)*16.);float rays=.6+.4*sin(vUv.x*185.+sin(vUv.x*28.+time*.12)*3.);float edge=smoothstep(0.,.18,vUv.x)*smoothstep(1.,.82,vUv.x);vec3 c=mix(tint,vec3(.45,.15,.8),smoothstep(wave,wave+.25,vUv.y));gl_FragColor=vec4(c,band*rays*edge*strength);}' }));aurora.position.set(0,61,-170);scene.add(aurora);
 const planet=new T.Mesh(new T.SphereGeometry(21,48,32),new T.MeshStandardMaterial({color:0x626993,roughness:1,metalness:.05}));planet.position.set(88,49,-130);scene.add(planet);
 const planetRing=new T.Mesh(new T.RingGeometry(27,38,100),new T.MeshBasicMaterial({color:0x8e9cb5,side:T.DoubleSide,transparent:true,opacity:.3}));planetRing.position.copy(planet.position);planetRing.rotation.set(1.12,.2,-.35);scene.add(planetRing);
 const mountains=new T.Group();scene.add(mountains);const mountainMat=new T.MeshStandardMaterial({color:0x26384b,roughness:1,metalness:.1,flatShading:true});for(let i=0;i<35;i++){const a=i/35*Math.PI*2,rad=80+Math.sin(i*7)*18;const m=new T.Mesh(new T.IcosahedronGeometry(1,0),mountainMat);m.position.set(Math.cos(a)*rad,-12,Math.sin(a)*rad);m.scale.set(12+Math.sin(i)*5,18+Math.cos(i*2.1)*13,11);m.rotation.set(i*.3,i,.1);mountains.add(m)}
 const starsGeo=new T.BufferGeometry(),starPos=[];for(let i=0;i<1000;i++){const a=Math.random()*Math.PI*2,y=Math.random()*.85+.1,r=Math.sqrt(1-y*y)*190;starPos.push(Math.cos(a)*r,y*190,Math.sin(a)*r)}starsGeo.setAttribute('position',new T.Float32BufferAttribute(starPos,3));scene.add(new T.Points(starsGeo,new T.PointsMaterial({color:0xb8dce7,size:.23,transparent:true,opacity:.75,depthWrite:false})));
 const motesGeo=new T.BufferGeometry(),motesPos=new Float32Array(270);for(let i=0;i<motesPos.length;i+=3){motesPos[i]=(Math.random()-.5)*45;motesPos[i+1]=Math.random()*11;motesPos[i+2]=(Math.random()-.5)*38}motesGeo.setAttribute('position',new T.BufferAttribute(motesPos,3));const motes=new T.Points(motesGeo,new T.PointsMaterial({color:0xb6ffea,size:.035,transparent:true,opacity:.45,depthWrite:false}));scene.add(motes);
 // Batch the static architecture by material so detail does not cost a draw call per panel.
 scene.updateMatrixWorld(true);const batches=new Map();for(const mesh of [...scene.children]){if(!mesh.isMesh||mesh.isInstancedMesh||[sky,planet,planetRing].includes(mesh)||!mesh.material.isMeshStandardMaterial&&!mesh.material.isMeshPhysicalMaterial)continue;const id=mesh.material.uuid;if(!batches.has(id))batches.set(id,{material:mesh.material,geometries:[]});const geo=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();geo.applyMatrix4(mesh.matrixWorld);batches.get(id).geometries.push(geo);scene.remove(mesh);}for(const batch of batches.values()){const geometry=mergeGeometries(batch.geometries,false);if(geometry){const mesh=new T.Mesh(geometry,batch.material);mesh.castShadow=!batch.material.transparent;mesh.receiveShadow=true;scene.add(mesh)}batch.geometries.forEach(g=>g.dispose())}
 let mapProps=new T.Group();scene.add(mapProps);const mapData={rift:{color:0x5fffd1,fog:0x182b3b,props:[]},foundry:{color:0xff9d55,fog:0x42322c,props:[[-3,-11,7,2.1,1.8],[3,11,7,2.1,1.8],[-15,-5,2,3.5,6],[15,5,2,3.5,6]]},citadel:{color:0xa68dff,fog:0x1e2449,props:[[0,-12,12,1.4,1.6],[0,12,12,1.4,1.6],[-7,0,1.8,4,7],[7,0,1.8,4,7]]}};
 return {scene,sun,coreLight,box,materials,update(time,reduced=false){aurora.material.uniforms.time.value=reduced?0:time;core.rotation.set(time*.3,time*.4,time*.12);core.position.y=3.35+Math.sin(time)*.12;shell.rotation.set(-time*.1,time*.18,.1);rings.forEach((r,i)=>{r.rotation.y=time*(i%2?-.22:.25)+i;r.rotation.z=Math.sin(time*.25+i)*.4});coreLight.intensity=16+Math.sin(time*2)*2;motes.rotation.y=time*.005;},setMap(name){const data=mapData[name]||mapData.rift;rebuildArchitecture();scene.fog.color.setHex(data.fog);coreLight.color.setHex(data.color);floorMat.color.setHex(name==='foundry'?0x967967:name==='citadel'?0x626f96:0x708c8d);},setAtmosphere(name){const theme={aurora:{top:0x080f2e,bottom:0x416875,sun:0xffcfad,fill:0x79bfff,fog:0x182b3b,tint:0x3cfac1,strength:.4},solar:{top:0x292036,bottom:0x88686a,sun:0xffbd81,fill:0x9eaaff,fog:0x40333f,tint:0xffa568,strength:.18},eclipse:{top:0x050b23,bottom:0x243e69,sun:0xbacaff,fill:0x7a87ff,fog:0x142239,tint:0x9272ff,strength:.52}}[name]||{top:0x080f2e,bottom:0x416875,sun:0xffcfad,fill:0x79bfff,fog:0x182b3b,tint:0x3cfac1,strength:.4};sky.material.uniforms.top.value.setHex(theme.top);sky.material.uniforms.bottom.value.setHex(theme.bottom);sun.color.setHex(theme.sun);fill.color.setHex(theme.fill);scene.fog.color.setHex(theme.fog);aurora.material.uniforms.tint.value.setHex(theme.tint);aurora.material.uniforms.strength.value=theme.strength;},setQuality(q){sun.castShadow=q!=='low';sun.shadow.mapSize.set(q==='high'?2048:1024,q==='high'?2048:1024);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}}};
}

export function makeSoldier(color=0xff9369){
 const root=new T.Group(),rig=new T.Group();root.add(rig);
 const armor=new T.MeshStandardMaterial({color:0x3a5260,metalness:.7,roughness:.3}),dark=new T.MeshStandardMaterial({color:0x101b27,metalness:.4,roughness:.5}),light=new T.MeshStandardMaterial({color:0xa7bcb9,metalness:.65,roughness:.24}),glow=new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:2.5});
 const part=(w,h,d,mat,x,y,z,parent=rig)=>{const m=new T.Mesh(new RoundedBoxGeometry(w,h,d,2,.035),mat);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m};
 part(.56,.57,.31,armor,0,1.17,0);part(.49,.24,.06,light,0,1.3,-.18);part(.3,.045,.022,glow,0,1.34,-.219);part(.29,.25,.13,dark,0,.83,0);part(.34,.29,.32,light,0,1.65,0);part(.31,.095,.033,glow,0,1.69,-.178);part(.23,.07,.035,dark,0,1.55,-.17);
 const legs=[];for(const s of [-1,1]){const pivot=new T.Group();pivot.position.set(s*.17,.8,0);rig.add(pivot);part(.2,.39,.23,armor,0,-.19,0,pivot);part(.17,.34,.2,dark,0,-.54,0,pivot);part(.23,.13,.34,armor,0,-.74,-.06,pivot);part(.12,.08,.05,glow,0,-.47,-.12,pivot);legs.push(pivot);part(.22,.22,.26,light,s*.39,1.33,0);const arm=part(.17,.49,.18,armor,s*.4,1.03,-.07);arm.rotation.x=-.6;}
 const weapon=new T.Group();weapon.position.set(.29,1.05,-.31);rig.add(weapon);part(.15,.19,.65,dark,0,0,-.23,weapon);part(.11,.08,.3,light,0,.1,-.22,weapon);part(.05,.05,.1,glow,0,.02,-.58,weapon);
 const shield=new T.Mesh(new T.SphereGeometry(1.1,20,16),new T.MeshBasicMaterial({color:0x8bdcf4,transparent:true,opacity:.08,wireframe:true,depthWrite:false}));shield.position.y=.9;root.add(shield);
 return {root,rig,weapon,shield,setSkin(name){const colors={mint:0x3c7066,solar:0x876341,violet:0x665782,crimson:0x84464f,carbon:0x242d38};armor.color.setHex(colors[name]||colors.mint);},setColor(value){glow.color.setHex(value);glow.emissive.setHex(value);},update(p,time,speed){root.position.set(p.x,p.y,p.z);root.rotation.y=p.yaw;rig.scale.y=p.slide>0?.6:1;legs.forEach((leg,i)=>leg.rotation.x=Math.sin(time*10+i*Math.PI)*Math.min(.7,speed*.08));weapon.rotation.x=p.pitch;shield.visible=p.shield>0;root.visible=p.dead<=0;}};
}

export function makeViewWeapons(){
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(62,innerWidth/innerHeight,.01,10);scene.add(new T.HemisphereLight(0xe1ffef,0x325071,2.9));const key=new T.DirectionalLight(0xffdfc2,3);key.position.set(-3,5,2);scene.add(key);
 const rig=new T.Group();scene.add(rig);const guns=[];const steel=new T.MeshStandardMaterial({color:0x728d91,metalness:.8,roughness:.22}),dark=new T.MeshStandardMaterial({color:0x142434,metalness:.6,roughness:.3}),rubber=new T.MeshStandardMaterial({color:0x111b23,metalness:.1,roughness:.67}),copper=new T.MeshStandardMaterial({color:0x7a5645,metalness:.75,roughness:.28});
 const box=(p,x,y,z,w,h,d,m)=>{const o=new T.Mesh(new RoundedBoxGeometry(w,h,d,2,.008),m);o.position.set(x,y,z);p.add(o);return o};
 const cyl=(p,x,y,z,r,len,m)=>{const o=new T.Mesh(new T.CylinderGeometry(r,r,len,12),m);o.rotation.x=Math.PI/2;o.position.set(x,y,z);p.add(o);return o};
 for(let i=0;i<3;i++){const gun=new T.Group();gun.position.set(.29,-.28,-.48);rig.add(gun);const color=i===0?0x7affca:i===1?0xffad66:0xb9a2ff;const glow=new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:2});
 box(gun,0,0,-.16,.14,.16,.43,i===1?copper:dark);box(gun,0,.073,-.21,.14,.033,.48,steel);box(gun,.066,-.005,-.17,.025,.1,.2,steel);box(gun,-.066,-.005,-.17,.018,.1,.2,steel);box(gun,0,-.095,.02,.085,.17,.085,rubber).rotation.x=.23;box(gun,0,-.15,-.11,.088,.16,.14,dark).rotation.x=-.13;box(gun,0,0,.16,.115,.13,.16,rubber);box(gun,0,.12,-.07,.085,.052,.11,dark);box(gun,0,.14,-.071,.045,.012,.04,glow);
 const barrelLen=i===2?.6:i===1?.32:.34;const muzzleZ=-.38-barrelLen;cyl(gun,0,.015,-.38-barrelLen/2,i===1?.042:.027,barrelLen,steel);cyl(gun,0,.015,muzzleZ,.043,.1,dark);cyl(gun,0,.015,muzzleZ-.056,.029,.015,rubber);
 for(let j=0;j<6;j++){box(gun,0,.098,-.16-j*.038,.11,.012,.013,dark);box(gun,.08,.006,-.27+j*.035,.014,.009,.021,glow)}
 if(i===1){cyl(gun,0,-.065,-.46,.026,.31,dark);box(gun,0,-.06,-.33,.14,.1,.22,rubber);for(let j=0;j<4;j++)box(gun,0,-.105,-.4+j*.045,.147,.013,.02,copper)}
 if(i===2){cyl(gun,0,.16,-.21,.065,.29,dark);cyl(gun,0,.16,-.055,.078,.05,steel);cyl(gun,0,.16,-.027,.057,.008,glow);box(gun,0,.103,-.2,.065,.08,.08,steel);box(gun,.1,-.01,-.04,.08,.035,.06,steel)}
 // Gauntlets and arms move with the weapon, making recoil and reloads tactile.
 box(gun,.03,-.17,.11,.13,.13,.22,rubber).rotation.x=.3;box(gun,.07,-.25,.27,.17,.16,.27,dark).rotation.set(.3,-.2,-.15);box(gun,-.04,-.12,-.32,.14,.1,.17,rubber);box(gun,-.11,-.22,-.18,.15,.15,.31,steel).rotation.set(-.5,0,-.3);box(gun,-.1,-.23,-.02,.09,.018,.055,glow);
 const flash=new T.Group();flash.position.set(0,.015,muzzleZ-.11);gun.add(flash);const flare=new T.Mesh(new T.ConeGeometry(.095,.35,7),new T.MeshBasicMaterial({color:0xffe9aa,transparent:true,opacity:.85,blending:T.AdditiveBlending,depthWrite:false}));flare.rotation.x=-Math.PI/2;flash.add(flare);const core=new T.Mesh(new T.SphereGeometry(.05,8,8),new T.MeshBasicMaterial({color:0xffffff}));flash.add(core);flash.visible=false;const lamp=new T.PointLight(0xffbb78,0,3);flash.add(lamp);
 guns.push({group:gun,flash,lamp,muzzleZ});gun.visible=i===0;}
 return {scene,camera,rig,guns};
}

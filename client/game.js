(function(){
'use strict';
var _el={},_sv={};
var $=function(id){return _el[id]||(_el[id]=document.getElementById(id))};
/* 값이 바뀔 때만 DOM에 기록 */
function st(id,prop,val){var k=id+prop;if(_sv[k]!==val){_sv[k]=val;$(id).style[prop]=val}}
var CFG={sens:1,vol:1,cap:0,fps:false,dyn:true,mini:true,diff:1,bsz:1,auto:false,shk:1,fls:1,hl:0};
try{var c0=JSON.parse(localStorage.getItem('ss_cfg'))||{};for(var ck in CFG)if(typeof c0[ck]===typeof CFG[ck])CFG[ck]=c0[ck]}catch(e){}
function saveCfg(){try{localStorage.setItem('ss_cfg',JSON.stringify(CFG))}catch(e){}}
var DFD=[.7,1,1.35],DFH=[.85,1,1.2]; /* 난이도: 받는 피해 · 적 체력 */
/* 강화 */
function newPK(){return {dmg:1,rate:1,rel:1,mag:1,spd:1,dr:1,shw:0,grx:0,dash:1,boom:0,phase:0,refund:0,leech:0,last:0,cluster:0,exec:0}}
var PK=newPK();
/* 영구 진행: 스프링클(재화)과 해금 */
var META={cur:0,own:{}};
try{var m0=JSON.parse(localStorage.getItem('ss_meta'));if(m0&&typeof m0.cur==='number'){META.cur=m0.cur;META.own=m0.own||{}}}catch(e){}
function saveMeta(){try{localStorage.setItem('ss_meta',JSON.stringify(META))}catch(e){}}
function lsGet(k,d){try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
var ST={},KW='',hitBy='',HLC=[0,0x4a1010,0x4a4208,0x083f44];
if(!window.THREE){$('subt').textContent='3D 라이브러리 로드 실패 · 네트워크 확인 후 새로고침';$('go').disabled=true;return}
var T=THREE,cv=$('c');
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;

/* ================= 맵 ================= */
/* 맵 정의는 maps.js. 선택한 맵은 로컬 저장소에 저장되고, 변경 시 새로고침으로 적용 */
var MAPI=0;try{MAPI=+localStorage.getItem('ss_map')||0}catch(e){}
if(!MAPS[MAPI])MAPI=0;
var MDEF=MAPS[MAPI],MAP=MDEF.grid;
var MW=MAP[0].length,MH=MAP.length,CS=3,UP=3,WH=6,RD={'>':[1,0],'<':[-1,0],'^':[0,-1],'v':[0,1]},RS=new Uint8Array(MW*MH),x,z,i,k;
function mt(cx,cz){return cx<0||cz<0||cx>=MW||cz>=MH?'#':MAP[cz][cx]}
for(z=0;z<MH;z++)for(x=0;x<MW;x++){var d0=RD[MAP[z][x]];if(d0&&mt(x-d0[0],z-d0[1])===MAP[z][x])RS[z*MW+x]=1}
function rampH(cx,cz,px,pz){
  var d=RD[MAP[cz][cx]],fx=px/CS-cx,fz=pz/CS-cz,f=d[0]>0?fx:d[0]<0?1-fx:d[1]<0?1-fz:fz;
  return (RS[cz*MW+cx]?1.5:0)+1.5*Math.max(0,Math.min(1,f));
}
/* 엄폐물: 상자(칸 모서리) · 방벽(칸 경계) */
var COV=[],CB=[],BLK={};for(i=0;i<MW*MH;i++)CB[i]=[];
function addCov(x0,z0,x1,z1,b,h,kind){
  var c={x0:x0,z0:z0,x1:x1,z1:z1,b:b,t:b+h,h:h,kind:kind},cx,cz;COV.push(c);
  for(cz=Math.floor(z0/CS);cz<=Math.floor(z1/CS);cz++)for(cx=Math.floor(x0/CS);cx<=Math.floor(x1/CS);cx++)CB[cz*MW+cx].push(c);
}
function crate(cx,cz,qx,qz,h,b){var mx=(cx+.5)*CS+qx*.95,mz=(cz+.5)*CS+qz*.95;addCov(mx-.5,mz-.5,mx+.5,mz+.5,b||0,h,0)}
function bar(cx,cz,ax){
  var a=cz*MW+cx,b=ax==='x'?a+1:a+MW;BLK[a+'_'+b]=BLK[b+'_'+a]=1;
  if(ax==='x')addCov((cx+1)*CS-.25,cz*CS+.2,(cx+1)*CS+.25,cz*CS+2.8,0,1.2,1);
  else addCov(cx*CS+.2,(cz+1)*CS-.25,cx*CS+2.8,(cz+1)*CS+.25,0,1.2,1);
}
MDEF.crates.forEach(function(a){crate.apply(null,a)});
/* 낮은 상자 일부는 드럼통으로 */
COV.forEach(function(c,n){if(c.h===1.2&&c.b===0&&n%3===1){c.kind=2;c.x0+=.1;c.x1-=.1;c.z0+=.1;c.z1-=.1;c.h=1.15;c.t=1.15}});
MDEF.bars.forEach(function(a){bar(a[0],a[1],a[2])});
function floorAt(px,pz,y){
  var cx=Math.floor(px/CS),cz=Math.floor(pz/CS),t=mt(cx,cz),f;
  if(t==='#')return 99;
  if(t==='.')f=0;else if(t==='U')f=y>=UP-.6?UP:0;
  else{f=rampH(cx,cz,px,pz);if(f>y+.6)return 99}
  var l=CB[cz*MW+cx],q,c;
  for(q=0;q<l.length;q++){c=l[q];
    if(!c.dead&&px>c.x0&&px<c.x1&&pz>c.z0&&pz<c.z1&&y>c.b-.5){if(c.t>y+.6)return 99;if(c.t>f)f=c.t}}
  return f;
}
function solid(px,py,pz){
  if(py<0)return true;if(py>WH)return false;
  var cx=Math.floor(px/CS),cz=Math.floor(pz/CS),t=mt(cx,cz);
  if(t==='#')return true;
  if(t==='U'){if(py>UP-.4&&py<UP)return true}
  else if(t!=='.'&&py<rampH(cx,cz,px,pz))return true;
  var l=CB[cz*MW+cx],q,c;
  for(q=0;q<l.length;q++){c=l[q];if(!c.dead&&px>c.x0&&px<c.x1&&pz>c.z0&&pz<c.z1&&py>=c.b&&py<c.t)return true}
  return false;
}
function barrelAt(px,py,pz){
  var cx=Math.floor(px/CS),cz=Math.floor(pz/CS);if(cx<0||cz<0||cx>=MW||cz>=MH)return null;
  var l=CB[cz*MW+cx],q,c;
  for(q=0;q<l.length;q++){c=l[q];if(c.kind===2&&!c.dead&&px>c.x0-.1&&px<c.x1+.1&&pz>c.z0-.1&&pz<c.z1+.1&&py>=c.b-.1&&py<c.t+.1)return c}
  return null;
}
function ray(ox,oy,oz,dx,dy,dz,max){
  for(var t=.15;t<max;t+=.15)if(solid(ox+dx*t,oy+dy*t,oz+dz*t)){
    var a=t-.15,b=t,m,n;for(n=0;n<5;n++){m=(a+b)/2;if(solid(ox+dx*m,oy+dy*m,oz+dz*m))b=m;else a=m}
    return a;
  }
  return -1;
}
function los(ax,ay,az,bx,by,bz){
  var dx=bx-ax,dy=by-ay,dz=bz-az,n=Math.ceil(Math.sqrt(dx*dx+dy*dy+dz*dz)/.4),q;
  for(q=1;q<n;q++)if(solid(ax+dx*q/n,ay+dy*q/n,az+dz*q/n))return false;return true;
}
function ok(e,px,pz,r){return floorAt(px-r,pz-r,e.y)<50&&floorAt(px+r,pz-r,e.y)<50&&floorAt(px-r,pz+r,e.y)<50&&floorAt(px+r,pz+r,e.y)<50}
function move(e,dx,dz,r){
  if(!ok(e,e.x,e.z,r)){ /* 겹친 상태: 가장 가까운 빈 자리로 밀어내기 */
    for(var d=.15;d<1.6;d+=.15)for(var a=0;a<8;a++){var ux=Math.cos(a*.785)*d,uz=Math.sin(a*.785)*d;
      if(ok(e,e.x+ux,e.z+uz,r)){e.x+=ux;e.z+=uz;return}}
  }
  if(ok(e,e.x+dx,e.z,r))e.x+=dx;if(ok(e,e.x,e.z+dz,r))e.z+=dz;
}
/* 발 둘레 전체에서 가장 높은 바닥을 사용: 모서리가 상자·경사로에 걸친 채 가라앉지 않음 */
function grav(e,dt,r){
  var f=floorAt(e.x,e.z,e.y),q,v;if(f>50)f=-1;
  for(q=0;q<4;q++){v=floorAt(e.x+(q&1?r:-r),e.z+(q&2?r:-r),e.y);if(v<50&&v>f)f=v}
  if(f<0)f=e.y;
  if(e.y>f+.001){e.vy-=22*dt;e.y+=e.vy*dt;if(e.y<=f){e.y=f;e.vy=0}}
  else{e.y+=Math.min(f-e.y,9*dt);e.vy=0}
}
function clearLine(e,tx,tz,r){
  var dx=tx-e.x,dz=tz-e.z,n=Math.ceil(Math.hypot(dx,dz)/.3),q;
  for(q=1;q<=n;q++)if(!ok(e,e.x+dx*q/n,e.z+dz*q/n,r))return false;return true;
}
/* 경로 그래프: 노드 = 칸*2 + 층 */
var NN=MW*MH*2,adj=[],radj=[],dist=new Int16Array(NN);
for(i=0;i<NN;i++){adj[i]=[];radj[i]=[]}
function E(a,b){adj[a].push(b);radj[b].push(a)}
function gnd(t){return t==='.'||t==='U'}
var D4=[[1,0],[-1,0],[0,1],[0,-1]];
for(z=0;z<MH;z++)for(x=0;x<MW;x++){
  var t=MAP[z][x],c=z*MW+x;if(t==='#')continue;
  for(k=0;k<4;k++){
    var dx=D4[k][0],dz=D4[k][1],u=mt(x+dx,z+dz),n=(z+dz)*MW+x+dx,d;if(u==='#')continue;
    if(gnd(t)&&gnd(u)&&!BLK[c+'_'+n])E(c*2,n*2);
    if(t==='U'&&u==='U')E(c*2+1,n*2+1);
    if(t==='U'&&u==='.')E(c*2+1,n*2);
    if(RD[t]){d=RD[t];
      if(dx===d[0]&&dz===d[1]){if(u===t)E(c*2,n*2);else if(RS[c]&&u==='U')E(c*2,n*2+1)}
      if(dx===-d[0]&&dz===-d[1]){if(u===t)E(c*2,n*2);else if(!RS[c]&&gnd(u))E(c*2,n*2)}
    }else if(RD[u]){d=RD[u];
      if(gnd(t)&&!RS[n]&&dx===d[0]&&dz===d[1])E(c*2,n*2);
      if(t==='U'&&RS[n]&&dx===-d[0]&&dz===-d[1])E(c*2+1,n*2);
    }
  }
}
function nodeOf(e){var cx=Math.floor(e.x/CS),cz=Math.floor(e.z/CS);return (cz*MW+cx)*2+(mt(cx,cz)==='U'&&e.y>2.2?1:0)}
function flow(){
  dist.fill(999);var q=[nodeOf(P)],h=0,a,b,l;dist[q[0]]=0;
  while(h<q.length){a=q[h++];l=radj[a];for(b=0;b<l.length;b++)if(dist[l[b]]>dist[a]+1){dist[l[b]]=dist[a]+1;q.push(l[b])}}
}
var SPAWN=MDEF.spawn;

/* ================= 렌더러 ================= */
var renderer;
try{renderer=new T.WebGLRenderer({canvas:cv,antialias:(window.devicePixelRatio||1)<2,powerPreference:'high-performance'})}
catch(e){$('subt').textContent='WebGL 미지원 환경';$('go').disabled=true;return}
renderer.autoClear=false;
var scene=new T.Scene(),BG=0x8a6f72;scene.background=new T.Color(BG);scene.fog=new T.Fog(BG,22,104);
var cam=new T.PerspectiveCamera(70,1,.08,140);cam.rotation.order='YXZ';
var gScene=new T.Scene(),gCam=new T.PerspectiveCamera(58,1,.01,10),BF=70;
var rsc=1; /* 동적 해상도 배율 */
function applyRes(){var w=innerWidth,h=Math.max(1,innerHeight);renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5)*rsc);renderer.setSize(w,h,false);if(PP)PP.size(w,h)}
function resize(){
  var w=innerWidth,h=Math.max(1,innerHeight);
  applyRes();
  cam.aspect=gCam.aspect=w/h;BF=w<h?86:70;cam.fov=BF;gCam.fov=w<h?74:58;cam.updateProjectionMatrix();gCam.updateProjectionMatrix();
}
var PP=null;
function mkPost(){
  try{
    var o={minFilter:T.LinearFilter,magFilter:T.LinearFilter,format:T.RGBAFormat},
        rs=renderer.capabilities.isWebGL2&&T.WebGLMultisampleRenderTarget?new T.WebGLMultisampleRenderTarget(4,4,o):new T.WebGLRenderTarget(4,4,o),
        ra=new T.WebGLRenderTarget(4,4,{minFilter:T.LinearFilter,magFilter:T.LinearFilter,format:T.RGBAFormat,depthBuffer:false}),rb=ra.clone(),
        vs='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
    function SM(u,fs){return new T.ShaderMaterial({uniforms:u,vertexShader:vs,fragmentShader:'varying vec2 vUv;'+fs,depthTest:false,depthWrite:false})}
    var mB=SM({tD:{value:null},px:{value:new T.Vector2()}},
      'uniform sampler2D tD;uniform vec2 px;void main(){vec3 c=(texture2D(tD,vUv+px*vec2(-1.,-1.)).rgb+texture2D(tD,vUv+px*vec2(1.,-1.)).rgb+texture2D(tD,vUv+px*vec2(-1.,1.)).rgb+texture2D(tD,vUv+px).rgb)*.25;'+
      'float l=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c*smoothstep(.8,1.,l)*.9,1.);}'),
    mG=SM({tD:{value:null},dir:{value:new T.Vector2()}},
      'uniform sampler2D tD;uniform vec2 dir;void main(){vec3 c=texture2D(tD,vUv).rgb*.227;'+
      'c+=(texture2D(tD,vUv+dir*1.38).rgb+texture2D(tD,vUv-dir*1.38).rgb)*.316;c+=(texture2D(tD,vUv+dir*3.23).rgb+texture2D(tD,vUv-dir*3.23).rgb)*.07;gl_FragColor=vec4(c,1.);}'),
    mF=SM({tS:{value:null},tB:{value:null},uBloom:{value:.7},uAb:{value:0},uT:{value:0},uSat:{value:1.1},uVig:{value:.85},uTint:{value:new T.Vector3(1,1,1)},uRes:{value:new T.Vector2(1,1)}},
      'uniform sampler2D tS,tB;uniform float uBloom,uAb,uT,uSat,uVig;uniform vec3 uTint;uniform vec2 uRes;'+
      'float hh(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}'+
      'void main(){vec2 c=vUv-.5;float r2=dot(c,c);vec2 o=c*uAb*(.3+r2*3.);'+
      'vec3 col=vec3(texture2D(tS,vUv+o).r,texture2D(tS,vUv).g,texture2D(tS,vUv-o).b);col+=texture2D(tB,vUv).rgb*uBloom;'+
      'col=(col-.5)*1.07+.5;float l=dot(col,vec3(.299,.587,.114));col=mix(vec3(l),col,uSat)*uTint;'+
      'col*=1.-r2*uVig;col+=(hh(vUv*uRes+uT)-.5)*.022;gl_FragColor=vec4(clamp(col,0.,1.),1.);}'),
    sc=new T.Scene(),cm=new T.OrthographicCamera(-1,1,1,-1,0,1),q=new T.Mesh(new T.PlaneGeometry(2,2),mB);
    q.frustumCulled=false;sc.add(q);
    return {rs:rs,ra:ra,rb:rb,mB:mB,mG:mG,mF:mF,sc:sc,cm:cm,q:q,w:4,h:4,
      size:function(w,h){var pr=renderer.getPixelRatio(),W=Math.max(4,w*pr|0),H=Math.max(4,h*pr|0);this.w=W;this.h=H;rs.setSize(W,H);ra.setSize(W/3|0,H/3|0);rb.setSize(W/3|0,H/3|0);mF.uniforms.uRes.value.set(W,H)}};
  }catch(e){return null}
}
function renderPost(){
  var p=PP,bw=p.w/3|0,bh=p.h/3|0,u=p.mF.uniforms,k;
  renderer.setRenderTarget(p.rs);renderer.clear();renderer.render(scene,cam);renderer.clearDepth();renderer.render(gScene,gCam);
  p.q.material=p.mB;p.mB.uniforms.tD.value=p.rs.texture;p.mB.uniforms.px.value.set(1/p.w,1/p.h);renderer.setRenderTarget(p.ra);renderer.render(p.sc,p.cm);
  p.q.material=p.mG;
  for(k=0;k<2;k++){var r=k?2.4:1;
    p.mG.uniforms.tD.value=p.ra.texture;p.mG.uniforms.dir.value.set(r/bw,0);renderer.setRenderTarget(p.rb);renderer.render(p.sc,p.cm);
    p.mG.uniforms.tD.value=p.rb.texture;p.mG.uniforms.dir.value.set(0,r/bh);renderer.setRenderTarget(p.ra);renderer.render(p.sc,p.cm)}
  var play=state==='play',slo=play&&slowT>0;
  u.tS.value=p.rs.texture;u.tB.value=p.ra.texture;u.uT.value=tNow%10;
  u.uAb.value=RM?0:.0012+(play?hurt*.007+boomA*.014+shake*.004+(slo?.004:0):0);
  u.uSat.value=play&&P.hp<30?.7:slo?.8:1.1;if(slo)u.uTint.value.set(.9,.98,1.1);else u.uTint.value.set(1.03,1,.97);
  p.q.material=p.mF;renderer.setRenderTarget(null);renderer.render(p.sc,p.cm);
}
addEventListener('resize',resize);resize();

scene.add(new T.HemisphereLight(0xeadfee,0x43363c,.7));
var sun=new T.DirectionalLight(0xffd9b0,.82),SHD=!(window.matchMedia&&matchMedia('(pointer:coarse)').matches),dome,clouds,HQ=SHD,BUMP=[];
try{var hv=localStorage.getItem('botarena3d_hq');if(hv!==null)HQ=hv==='1'}catch(e){}
try{var sv=localStorage.getItem('botarena3d_shadow');if(sv!==null)SHD=sv==='1'}catch(e){}
sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-36;sun.shadow.camera.right=36;sun.shadow.camera.top=36;sun.shadow.camera.bottom=-36;
sun.shadow.camera.near=2;sun.shadow.camera.far=95;sun.shadow.bias=-.0012;sun.shadow.normalBias=.06;
renderer.shadowMap.enabled=true;renderer.shadowMap.autoUpdate=false; /* 그림자 갱신은 frame()에서 최대 60Hz */
renderer.shadowMap.type=T.PCFSoftShadowMap;sun.castShadow=SHD;
scene.add(sun);scene.add(sun.target);
var rim=new T.DirectionalLight(0x9db4ff,.32);rim.position.set(-12,14,-24);scene.add(rim); /* 반대편 보조광 */
var mLight=new T.PointLight(0xffd9a0,0,16);scene.add(mLight);
gScene.add(new T.HemisphereLight(0xeee6f0,0x4a3f44,1));
var gl2=new T.DirectionalLight(0xffe6c8,.75);gl2.position.set(1,2,1.5);gScene.add(gl2);
(function(){ /* 하늘 돔: 노을 그라데이션과 태양 */
  var c=document.createElement('canvas');c.width=512;c.height=256;var g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);
  gr.addColorStop(0,'#1f2238');gr.addColorStop(.3,'#45406a');gr.addColorStop(.45,'#a8727a');gr.addColorStop(.5,'#e6aa82');gr.addColorStop(.55,'#8a6f72');gr.addColorStop(1,'#8a6f72');
  g.fillStyle=gr;g.fillRect(0,0,512,256);
  var r=g.createRadialGradient(150,112,2,150,112,70);r.addColorStop(0,'rgba(255,244,220,1)');r.addColorStop(.12,'rgba(255,220,170,.95)');r.addColorStop(1,'rgba(255,180,120,0)');
  g.fillStyle=r;g.fillRect(60,30,190,170);
  dome=new T.Mesh(new T.SphereGeometry(125,24,14),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),side:T.BackSide,fog:false,depthWrite:false}));
  dome.renderOrder=-1;scene.add(dome);
  /* 구름층 */
  var c2=document.createElement('canvas');c2.width=1024;c2.height=256;var g2=c2.getContext('2d'),q,x,y,w,a,rg;
  for(q=0;q<70;q++){x=Math.random()*1024;y=40+Math.random()*82;w=40+Math.random()*110;a=.05+Math.random()*.16*(y/122);
    g2.save();g2.translate(x,y);g2.scale(1,.28);rg=g2.createRadialGradient(0,0,2,0,0,w);
    rg.addColorStop(0,'rgba(255,214,186,'+a+')');rg.addColorStop(.6,'rgba(236,160,150,'+a*.5+')');rg.addColorStop(1,'rgba(200,130,150,0)');
    g2.fillStyle=rg;g2.fillRect(-w,-w,w*2,w*2);if(x<w){g2.translate(1024,0);g2.fillRect(-w,-w,w*2,w*2)}g2.restore()}
  clouds=new T.Mesh(new T.SphereGeometry(118,24,14),new T.MeshBasicMaterial({map:new T.CanvasTexture(c2),side:T.BackSide,fog:false,transparent:true,depthWrite:false}));
  clouds.renderOrder=-1;scene.add(clouds);
})();

function tex(fn,rx,ry){
  var c=document.createElement('canvas'),g=c.getContext('2d');c.width=c.height=256;g.scale(2,2);fn(g);
  var t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rx||1,ry||rx||1);
  t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;
}
/* 월드 재질: 퐁 셰이딩 + 텍스처 기반 요철(고급 효과 시) */
function WM(t,spc,shn,bs){var m=new T.MeshPhongMaterial({map:t,specular:spc,shininess:shn,bumpMap:HQ?t:null,bumpScale:bs});BUMP.push([m,t]);return m}
function speck(g,n,a){for(var q=0;q<n;q++){g.fillStyle='rgba('+(Math.random()<.5?'0,0,0,':'255,255,255,')+a+')';g.fillRect(Math.random()*128,Math.random()*128,2,2)}}
function sh(o,c,r){o.castShadow=c;o.receiveShadow=r;return o}
var tFloor=tex(function(g){g.fillStyle='#6b635c';g.fillRect(0,0,128,128);
  for(var r=0;r<4;r++)for(var c=0;c<4;c++){var ox=c*32+(r%2?16:0),v=92+((r*7+c*13)%5)*6;g.fillStyle='rgb('+(v+14)+','+(v+6)+','+v+')';
    g.fillRect(ox+2,r*32+2,28,28);if(ox+32>128)g.fillRect(ox-128+2,r*32+2,28,28)}
  speck(g,300,.06)},MW*2,MH*2);
function plaster(g,base){g.fillStyle=base;g.fillRect(0,0,128,128);speck(g,260,.05);
  var gr=g.createLinearGradient(0,70,0,128);gr.addColorStop(0,'rgba(60,40,30,0)');gr.addColorStop(1,'rgba(60,40,30,.35)');g.fillStyle=gr;g.fillRect(0,70,128,58);
  g.fillStyle='#8f7560';g.fillRect(0,116,128,12);g.fillStyle='#d6bfa2';g.fillRect(0,0,128,5);g.fillStyle='#7d6a58';g.fillRect(0,5,128,2);
  g.strokeStyle='rgba(70,50,40,.5)';g.lineWidth=1;g.beginPath();g.moveTo(20,8);g.lineTo(28,30);g.lineTo(24,52);g.moveTo(100,116);g.lineTo(94,96);g.lineTo(101,80);g.stroke()}
var tWall=tex(function(g){plaster(g,'#b99c82')},1,2),
tWin=tex(function(g){plaster(g,'#c4a184');
  g.fillStyle='#d8c4a8';g.fillRect(30,24,68,74);g.fillStyle='#2e2a30';g.fillRect(36,30,56,62);
  g.fillStyle='#4f7d78';g.fillRect(36,30,22,62);g.fillRect(70,30,22,62);g.fillStyle='#3c625e';for(var q=0;q<8;q++){g.fillRect(38,34+q*7,18,2);g.fillRect(72,34+q*7,18,2)}
  g.fillStyle='#e6d3b8';g.fillRect(26,96,76,6);g.fillStyle='#7d6a58';g.fillRect(26,102,76,2)},1,2),
tBrick=tex(function(g){g.fillStyle='#c9b29a';g.fillRect(0,0,128,128);
  for(var r=0;r<8;r++)for(var c=-1;c<4;c++){var v=(r*5+c*11)%4;g.fillStyle=['#a66b55','#b0745c','#9c624e','#aa7059'][v<0?0:v];g.fillRect(c*32+(r%2?16:0)+1,r*16+1,30,14)}
  speck(g,220,.06);g.fillStyle='#8f7560';g.fillRect(0,118,128,10)},1,2),
tSlab=tex(function(g){g.fillStyle='#9a8f88';g.fillRect(0,0,128,128);speck(g,160,.05);
  g.strokeStyle='#6a5f58';g.lineWidth=6;g.strokeRect(3,3,122,122);g.strokeStyle='#bdb2a8';g.lineWidth=1;g.strokeRect(10,10,108,108);
  g.fillStyle='#7d726b';for(var q=0;q<3;q++)g.fillRect(12,38+q*26,104,2)}),
tRamp=tex(function(g){g.fillStyle='#93877f';g.fillRect(0,0,128,128);g.fillStyle='#6e635c';for(var q=0;q<8;q++)g.fillRect(q*16,0,4,128);g.fillStyle='#b5a99f';for(q=0;q<8;q++)g.fillRect(q*16+4,0,2,128)});

var floor=sh(new T.Mesh(new T.PlaneGeometry(MW*CS,MH*CS),WM(tFloor,0x34302c,26,.05)),false,true);
floor.rotation.x=-Math.PI/2;floor.position.set(MW*CS/2,0,MH*CS/2);scene.add(floor);
(function(){
  var cnt=[0,0,0],ns=0,m4=new T.Matrix4(),idx=[0,0,0],a=0,b=0,cx,cz,h=CS/2,wg=new T.BoxGeometry(CS,WH,CS);
  function vr(cx,cz){var v=(cx*7+cz*13)%6;return v===0?1:v===3?2:0}
  for(cz=0;cz<MH;cz++)for(cx=0;cx<MW;cx++){if(MAP[cz][cx]==='#')cnt[vr(cx,cz)]++;if(MAP[cz][cx]==='U')ns++}
  var nw=cnt[0]+cnt[1]+cnt[2],
      W=[tWall,tWin,tBrick].map(function(t,n){return sh(new T.InstancedMesh(wg,WM(t,0x161616,8,.04),cnt[n]),true,true)}),
      cap=sh(new T.InstancedMesh(new T.BoxGeometry(CS+.3,.3,CS+.3),new T.MeshLambertMaterial({color:0x9a5a48}),nw),true,true),
      skirt=sh(new T.InstancedMesh(new T.BoxGeometry(CS+.12,.5,CS+.12),new T.MeshLambertMaterial({color:0x7a6a5e}),nw),false,true),
      slabs=sh(new T.InstancedMesh(new T.BoxGeometry(CS,.4,CS),WM(tSlab,0x202020,14,.03),ns),true,true),
      trim=new T.InstancedMesh(new T.BoxGeometry(CS+.08,.1,CS+.08),new T.MeshLambertMaterial({color:0x5e5048}),ns),
      rm=WM(tRamp,0x202020,14,.03);rm.side=T.DoubleSide;
  for(cz=0;cz<MH;cz++)for(cx=0;cx<MW;cx++){
    var t=MAP[cz][cx],wx=cx*CS+h,wz=cz*CS+h;
    if(t==='#'){var v=vr(cx,cz);W[v].setMatrixAt(idx[v]++,m4.makeTranslation(wx,WH/2,wz));cap.setMatrixAt(a,m4.makeTranslation(wx,WH+.15,wz));skirt.setMatrixAt(a++,m4.makeTranslation(wx,.25,wz))}
    else if(t==='U'){slabs.setMatrixAt(b,m4.makeTranslation(wx,UP-.2,wz));trim.setMatrixAt(b++,m4.makeTranslation(wx,UP-.38,wz))}
    else if(RD[t]){
      var h0=RS[cz*MW+cx]?1.5:0,h1=h0+1.5,
      vv=[-h,h0,-h, -h,h0,h, h,h1,h,  -h,h0,-h, h,h1,h, h,h1,-h,
         -h,0,h, h,0,h, h,h1,h,  -h,0,h, h,h1,h, -h,h0,h,
         -h,0,-h, h,h1,-h, h,0,-h,  -h,0,-h, -h,h0,-h, h,h1,-h,
         h,0,-h, h,h1,-h, h,h1,h,  h,0,-h, h,h1,h, h,0,h],
      uv=[],q;for(q=0;q<vv.length;q+=3)uv.push((vv[q]+h)/CS,(vv[q+2]+h)/CS+vv[q+1]/CS);
      var ge=new T.BufferGeometry();ge.setAttribute('position',new T.Float32BufferAttribute(vv,3));
      ge.setAttribute('uv',new T.Float32BufferAttribute(uv,2));ge.computeVertexNormals();
      var me=sh(new T.Mesh(ge,rm),true,true);me.position.set(wx,0,wz);me.rotation.y=t==='>'?0:t==='<'?Math.PI:t==='^'?Math.PI/2:-Math.PI/2;scene.add(me);
    }
  }
  W.forEach(function(w){scene.add(w)});scene.add(cap);scene.add(skirt);scene.add(slabs);scene.add(trim);
  /* 사이트 표식 */
  function mark(ch,px,pz){
    var c=document.createElement('canvas');c.width=c.height=128;var g=c.getContext('2d');
    g.strokeStyle='#f1e2c8';g.lineWidth=7;g.beginPath();g.arc(64,64,54,0,6.3);g.stroke();g.fillStyle='#f1e2c8';g.font='bold 78px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(ch,64,68);
    var m=new T.Mesh(new T.PlaneGeometry(5,5),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,opacity:.5,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
    m.rotation.x=-Math.PI/2;m.position.set(px,.03,pz);scene.add(m);
  }
  MDEF.marks.forEach(function(a){mark(a[0],a[1]*CS,a[2]*CS)});
})();

/* ================= 모델 ================= */
var GEO={},trG=new T.BoxGeometry(.03,.03,1);
function box(w,h,d,m,px,py,pz,par){
  var key=w+'_'+h+'_'+d,o=new T.Mesh(GEO[key]||(GEO[key]=new T.BoxGeometry(w,h,d)),m);
  o.position.set(px,py,pz);par.add(o);return o;
}
var mVisor=new T.MeshBasicMaterial({color:0xf3dfc4}),mFlash=new T.MeshBasicMaterial({color:0xffe2b0}),
    mShadow=new T.MeshBasicMaterial({color:0,transparent:true,opacity:.32,depthWrite:false}),gShadow=new T.CircleGeometry(.55,14);
var mRed=new T.MeshBasicMaterial({color:0xff8a78}),mLaser=new T.MeshBasicMaterial({color:0xff6a5a,transparent:true,opacity:.75,depthWrite:false}),
    mCore=new T.MeshBasicMaterial({color:0xc9a9ee}),
    BT={grunt:{n:'보병',col:0xb8707c,sc:1,w:1,hp:100,spd:1,rng:26,r:.36},
        rusher:{n:'돌격병',col:0xd9a05a,sc:.86,w:.9,hp:60,spd:1.8,rng:0,r:.32},
        heavy:{n:'중장갑병',col:0x6f7f9a,sc:1.3,w:1.15,hp:340,spd:.55,rng:30,r:.4},
        sniper:{n:'저격병',col:0x7fa08a,sc:1.06,w:.84,hp:70,spd:.8,rng:60,r:.34},
        bomber:{n:'자폭병',col:0xcdbf58,sc:.9,w:1.05,hp:45,spd:1.55,rng:0,r:.34},
        shield:{n:'방패병',col:0x5f8f9a,sc:1.05,w:1,hp:150,spd:.7,rng:24,r:.38},
        gren:{n:'유탄병',col:0x8a8a52,sc:1,w:1,hp:110,spd:.85,rng:30,r:.36},
        flyer:{n:'말벌 드론',col:0xb05a5a,sc:.4,w:1,hp:36,spd:1.35,rng:44,r:.3,fly:1},
        medic:{n:'치유병',col:0xe6ebe6,sc:.98,w:.95,hp:80,spd:.9,rng:20,r:.34,geo:'grunt'},
        stalker:{n:'은신병',col:0x6a5a8a,sc:1,w:.9,hp:70,spd:1.55,rng:0,r:.32,geo:'rusher'},
        split:{n:'분열체',col:0x6fae5a,sc:1.3,w:1.3,hp:170,spd:.8,rng:0,r:.4,geo:'rusher'},
        mite:{n:'유충',col:0x9fd07a,sc:.55,w:1,hp:22,spd:1.9,rng:0,r:.25,geo:'rusher'},
        pylon:{n:'동력 첨탑',col:0xc9a9ee,sc:1.5,w:1,hp:170,spd:0,rng:0,r:.4},
        boss:{n:'거신',col:0x9a3e48,sc:2,w:1.1,hp:2600,spd:.42,rng:46,r:.42,boss:1},
        mother:{n:'모선',col:0x8a4a6a,sc:1.6,w:1,hp:2300,spd:.5,rng:64,r:.3,fly:1,boss:1},
        crusher:{n:'분쇄자',col:0x4a5a72,sc:2.3,w:1.1,hp:3000,spd:.9,rng:0,r:.42,geo:'rusher',boss:1},
        over:{n:'종말 군주',col:0x3a2a52,sc:2.8,w:1.1,hp:6500,spd:.4,rng:64,r:.42,geo:'boss',boss:1}},
    BGEO={},_m4=new T.Matrix4(),_eu=new T.Euler(),_qt=new T.Quaternion(),_v3=new T.Vector3(),_s3=new T.Vector3(1,1,1),_cl=new T.Color();
/* 부위별 상자·원통을 하나의 지오메트리로 병합(정점 색) → 적 1기당 드로콜 최소화 */
function Acc(){this.p=[];this.n=[];this.c=[]}
function pushG(acc,geo,px,py,pz,col,rx,ry,rz){
  _eu.set(rx||0,ry||0,rz||0);_qt.setFromEuler(_eu);_m4.compose(_v3.set(px,py,pz),_qt,_s3);geo.applyMatrix4(_m4);
  var g=geo.index?geo.toNonIndexed():geo,A=g.attributes.position.array,N=g.attributes.normal.array,q;_cl.setHex(col);
  for(q=0;q<A.length;q+=3){acc.p.push(A[q],A[q+1],A[q+2]);acc.n.push(N[q],N[q+1],N[q+2]);acc.c.push(_cl.r,_cl.g,_cl.b)}
  geo.dispose();if(g!==geo)g.dispose();
}
function finG(acc){if(!acc.p.length)return null;var g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(acc.p,3));
  g.setAttribute('normal',new T.Float32BufferAttribute(acc.n,3));g.setAttribute('color',new T.Float32BufferAttribute(acc.c,3));return g}
function botGeo(tp){
  if(BGEO[tp])return BGEO[tp];
  var kd=BT[tp].geo||tp;
  var Pc=BT[tp].col,D=kd==='heavy'?0x3a3d47:kd==='boss'?0x2e282c:0x4a4552,J=0x29272d,S=0xd3bba3,K=0x19181b,R=0xd9776c,
      big=kd==='heavy'||kd==='boss',th=new Acc(),sn=new Acc(),to=new Acc(),he=new Acc(),ar=new Acc(),gu=new Acc(),q,s;
  function B(a,w,h,d,px,py,pz,col,rx,ry,rz){pushG(a,new T.BoxGeometry(w,h,d),px,py,pz,col,rx,ry,rz)}
  function C(a,r1,r2,l,px,py,pz,col,ax,seg){pushG(a,new T.CylinderGeometry(r1,r2,l,seg||10),px,py,pz,col,ax==='z'?Math.PI/2:0,0,ax==='x'?Math.PI/2:0)}
  /* 허벅지 · 정강이 */
  B(th,.19,.44,.22,0,-.23,0,D);B(th,.21,.26,.06,0,-.2,.12,Pc);B(th,.215,.05,.235,0,-.07,0,J);B(th,.215,.05,.235,0,-.37,0,J);C(th,.078,.078,.22,0,0,0,J,'x');
  C(sn,.072,.072,.2,0,0,0,J,'x');B(sn,.2,.15,.1,0,-.03,.1,Pc);B(sn,.16,.38,.19,0,-.23,0,D);B(sn,.18,.24,.06,0,-.25,.1,Pc);
  B(sn,.13,.06,.15,0,-.4,0,J);B(sn,.19,.1,.34,0,-.4,.06,J);B(sn,.2,.07,.1,0,-.41,.2,D);B(sn,.2,.03,.36,0,-.445,.06,K);
  if(big){B(th,.26,.3,.1,0,-.2,.13,Pc);B(th,.27,.34,.25,0,-.2,0,D);B(sn,.25,.3,.27,0,-.22,0,D);B(sn,.27,.1,.3,0,-.1,0,Pc);B(sn,.26,.12,.4,0,-.4,.06,D)}
  /* 몸통 */
  B(to,.5,.2,.3,0,-.02,0,D);B(to,.54,.07,.33,0,.1,0,J);B(to,.1,.07,.02,0,.1,.175,S);B(to,.12,.12,.08,.2,.02,.19,J);B(to,.12,.12,.08,-.2,.02,.19,J);
  B(to,.46,.18,.3,0,.2,0,J);B(to,.62,.4,.36,0,.47,0,Pc);B(to,.44,.28,.07,0,.5,.2,D);B(to,.3,.035,.02,0,.6,.24,S);
  B(to,.4,.08,.34,0,.7,0,D);C(to,.07,.08,.1,0,.77,0,J,'y');
  for(s=-1;s<2;s+=2){B(to,.24,.16,.3,s*.42,.62,0,Pc);B(to,.26,.04,.32,s*.42,.53,0,D);B(to,.05,.36,.39,s*.19,.5,0,J)}
  if(kd==='rusher'){for(q=0;q<4;q++)B(to,.05,.2-q*.03,.16,0,.6-q*.16,-.25,S,.5);B(to,.3,.3,.1,0,.45,-.2,D)}
  else if(kd==='bomber'){C(to,.25,.25,.52,0,.45,-.38,R,'y',12);C(to,.26,.26,.05,0,.6,-.38,J,'y',12);C(to,.26,.26,.05,0,.3,-.38,J,'y',12);C(to,.06,.06,.1,0,.76,-.38,J,'y',8);
    for(q=0;q<5;q++)C(to,.04,.04,.15,-.2+q*.1,.3,.2,R,'y',6);B(to,.56,.03,.04,0,.3,.2,J)}
  else{B(to,.42,.46,.18,0,.42,-.27,D);C(to,.07,.07,.44,0,.7,-.27,J,'x');B(to,.14,.16,.06,.12,.34,-.38,J);B(to,.14,.16,.06,-.12,.34,-.38,J);B(to,.3,.03,.19,0,.2,-.27,S)}
  if(big){for(s=-1;s<2;s+=2){B(to,.38,.3,.44,s*.5,.66,0,Pc);B(to,.4,.06,.46,s*.5,.5,0,D);B(to,.3,.04,.36,s*.5,.83,0,S)}
    B(to,.72,.14,.44,0,.72,0,D);B(to,.5,.18,.1,0,.22,.2,Pc);C(to,.2,.2,.3,0,.32,-.46,J,'x',12);C(to,.21,.21,.04,0,.32,-.46,S,'x',12)}
  if(kd==='boss'){for(s=-1;s<2;s+=2){B(to,.42,.36,.52,s*.68,.98,-.02,D);B(to,.44,.05,.54,s*.68,1.17,-.02,Pc);
      for(q=0;q<4;q++){C(to,.07,.07,.54,s*.68+(q&1?.09:-.09),.98+(q&2?.08:-.08),0,J,'z',8);C(to,.05,.05,.02,s*.68+(q&1?.09:-.09),.98+(q&2?.08:-.08),.275,R,'z',8)}
      C(to,.06,.09,.5,s*.16,.9,-.44,J,'y',8)}
    B(to,.66,.1,.4,0,.3,0,Pc)}
  if(kd==='sniper'){B(to,.66,.95,.05,0,.14,-.38,D,.14);B(to,.5,.1,.1,0,.68,-.2,D)}
  if(kd==='shield'){B(to,.8,1.34,.05,-.1,.3,.56,D);B(to,.82,.07,.07,-.1,.96,.56,Pc);B(to,.82,.07,.07,-.1,-.36,.56,Pc);B(to,.07,1.3,.07,.3,.3,.56,Pc);B(to,.07,1.3,.07,-.5,.3,.56,Pc);
    B(to,.34,.1,.02,-.1,.74,.59,K);B(to,.3,.3,.02,-.1,.2,.59,Pc);B(to,.1,.1,.2,-.3,.4,.46,J)}
  if(kd==='gren'){B(to,.09,.74,.4,0,.44,0,S,0,0,.62);for(q=0;q<4;q++)C(to,.045,.045,.12,-.17+q*.11,.33+q*.08,.21,J,'y',8)}
  /* 팔 */
  B(ar,.14,.34,.15,0,-.19,0,D);C(ar,.072,.072,.16,0,-.38,0,J,'x');B(ar,.13,.3,.14,0,-.56,0,Pc);B(ar,.15,.14,.16,0,-.54,0,D);B(ar,.13,.12,.14,0,-.78,0,J);
  if(kd==='rusher'){B(ar,.035,.62,.11,0,-1.08,0,S);B(ar,.02,.56,.13,0,-1.06,0,0xf3e6d2);B(ar,.05,.2,.14,0,-.86,0,J)}
  if(big){B(ar,.2,.2,.21,0,-.56,0,D);B(ar,.18,.3,.19,0,-.2,0,Pc)}
  /* 머리 */
  if(big){B(he,.42,.36,.42,0,.02,0,D);B(he,.44,.1,.3,0,.2,-.02,Pc);B(he,.2,.14,.06,0,-.1,.22,J);B(he,.06,.2,.2,.23,0,0,J);B(he,.06,.2,.2,-.23,0,0,J);B(he,.34,.04,.1,0,.12,.2,Pc);
    if(kd==='boss'){B(he,.07,.38,.07,.2,.36,-.04,S,0,0,-.35);B(he,.07,.38,.07,-.2,.36,-.04,S,0,0,.35);B(he,.3,.08,.3,0,.27,0,Pc);B(he,.1,.2,.1,0,.3,-.16,S)}}
  else if(kd==='sniper'){B(he,.36,.36,.38,0,.02,-.02,D);B(he,.3,.26,.3,0,0,.03,J);B(he,.4,.06,.44,0,.2,-.04,D);B(he,.36,.3,.06,0,-.1,-.2,D);C(he,.05,.05,.1,-.08,.02,.2,J,'z',8)}
  else if(kd==='rusher'){B(he,.3,.26,.34,0,0,0,D);B(he,.05,.24,.42,0,.2,-.04,Pc);B(he,.2,.08,.1,0,-.12,.14,J);B(he,.34,.05,.1,0,.1,.14,Pc);
    B(he,.04,.12,.12,.1,-.17,.16,S);B(he,.04,.12,.12,-.1,-.17,.16,S)}
  else{B(he,.32,.3,.32,0,0,0,D);B(he,.36,.08,.2,0,.15,-.04,Pc);B(he,.3,.04,.06,0,.09,.16,Pc);B(he,.05,.12,.12,.18,0,0,J);B(he,.05,.12,.12,-.18,0,0,J);
    B(he,.22,.08,.1,0,-.12,.13,J);B(he,.02,.24,.02,.12,.26,-.1,J);B(he,.1,.05,.06,-.1,.17,.1,S)}
  if(kd==='bomber'){C(he,.06,.06,.05,.08,.03,.17,K,'z',8);C(he,.06,.06,.05,-.08,.03,.17,K,'z',8);B(he,.34,.05,.34,0,.06,0,J)}
  if(kd==='shield'){B(he,.38,.12,.36,0,.13,0,Pc);B(he,.3,.14,.04,0,-.1,.17,D)}
  if(kd==='gren'){B(he,.46,.03,.46,0,.12,0,D);B(he,.3,.1,.3,0,.2,0,Pc)}
  /* 총 */
  if(big){B(gu,.17,.2,.46,0,0,0,J);B(gu,.1,.1,.12,0,-.14,-.05,D);for(q=0;q<3;q++)C(gu,.028,.028,.6,Math.cos(q*2.09)*.05,Math.sin(q*2.09)*.05,.5,D,'z',8);
    C(gu,.09,.09,.04,0,0,.78,Pc,'z',12);C(gu,.09,.09,.03,0,0,.42,D,'z',12);B(gu,.06,.06,.2,0,.13,-.05,D);B(gu,.19,.03,.3,0,.05,0,Pc)}
  else if(kd==='sniper'){B(gu,.07,.11,.5,0,0,0,J);C(gu,.018,.018,.9,0,.02,.64,D,'z',8);C(gu,.03,.03,.1,0,.02,1.06,J,'z',8);C(gu,.035,.035,.26,0,.1,.02,J,'z',10);
    B(gu,.05,.14,.07,0,-.12,-.04,D);B(gu,.07,.1,.2,0,-.01,-.34,D);B(gu,.012,.14,.012,.04,-.08,.5,J,0,0,.3);B(gu,.012,.14,.012,-.04,-.08,.5,J,0,0,-.3)}
  else if(kd==='shield'){B(gu,.06,.1,.26,0,0,.1,J);B(gu,.05,.12,.06,0,-.1,.02,D);B(gu,.03,.03,.1,0,.03,.26,D)}
  else if(kd==='gren'){C(gu,.06,.06,.5,0,.02,.16,D,'z',10);C(gu,.072,.072,.06,0,.02,.42,J,'z',10);B(gu,.07,.12,.3,0,-.02,-.2,J);B(gu,.05,.14,.06,0,-.12,0,D);C(gu,.095,.095,.12,0,-.05,.06,Pc,'z',8)}
  else if(kd!=='rusher'&&kd!=='bomber'){B(gu,.09,.14,.5,0,0,0,J);C(gu,.022,.022,.34,0,.02,.4,D,'z',8);B(gu,.06,.16,.08,0,-.13,-.02,D);B(gu,.07,.1,.18,0,-.01,-.32,D);
    B(gu,.03,.04,.1,0,.09,-.08,S);B(gu,.05,.1,.05,0,-.1,.2,J);B(gu,.094,.03,.2,0,.03,.1,D)}
  return BGEO[tp]={th:finG(th),sn:finG(sn),to:finG(to),he:finG(he),ar:finG(ar),gu:finG(gu)};
}
var mHeal=new T.MeshBasicMaterial({color:0x8fe0a0,transparent:true,opacity:.7,depthWrite:false}),mHealS=new T.MeshBasicMaterial({color:0x8fe0a0}),
    mBeam=new T.MeshBasicMaterial({color:0xc9a9ee,transparent:true,opacity:.6,depthWrite:false});
function mkFlyer(tp){ /* 비행형 적 · 모선 */
  var big=tp==='mother',mat=new T.MeshPhongMaterial({color:BT[tp].col,shininess:45,specular:0x333333}),md=new T.MeshPhongMaterial({color:0x2b2930}),
      mrot=new T.MeshBasicMaterial({color:0xe6c0c0,transparent:true,opacity:.4,depthWrite:false}),g=new T.Group(),u=new T.Group(),rot=[],q,o;
  g.rotation.order='YXZ';g.add(u);u.position.y=big?1.4:.4;if(big)u.scale.setScalar(3.8);
  o=new T.Mesh(new T.SphereGeometry(.26,14,10),mat);o.scale.set(1,.7,1.3);o.castShadow=true;u.add(o);
  box(.14,.1,.34,md,0,-.12,.18,u);o=new T.Mesh(new T.CylinderGeometry(.025,.025,.3,8),md);o.rotation.x=Math.PI/2;o.position.set(0,-.13,.44);u.add(o);
  box(.2,.07,.03,mRed,0,.03,.33,u);o=new T.Mesh(new T.ConeGeometry(.07,.36,8),md);o.rotation.x=-Math.PI/2;o.position.set(0,0,-.5);u.add(o);
  for(q=0;q<4;q++){var sx=q&1?.4:-.4,sz=q&2?.36:-.36;o=box(.5,.03,.05,md,sx/2,.06,sz/2,u);o.rotation.y=Math.atan2(-sz,sx);
    o=new T.Mesh(new T.CylinderGeometry(.2,.2,.012,14),mrot);o.position.set(sx,.12,sz);u.add(o);o=box(.38,.012,.03,md,sx,.125,sz,u);rot.push(o)}
  if(big){o=new T.Mesh(new T.TorusGeometry(.5,.03,8,28),mCore);o.rotation.x=Math.PI/2;o.position.y=-.02;u.add(o);
    o=new T.Mesh(new T.CylinderGeometry(.16,.22,.1,14),md);o.position.y=.2;u.add(o);box(.1,.03,.03,mCore,0,.26,.1,u);
    for(q=-1;q<2;q+=2){box(.08,.08,.3,md,q*.2,-.14,.1,u);o=new T.Mesh(new T.CylinderGeometry(.03,.03,.2,8),md);o.rotation.x=Math.PI/2;o.position.set(q*.2,-.14,.34);u.add(o)}}
  var fl=box(.16,.16,.16,mFlash,0,-.13,.62,u);fl.rotation.set(.8,.8,0);fl.visible=false;
  scene.add(g);return {g:g,u:u,fl:fl,sh:{visible:false},mat:mat,rot:rot,lz:null};
}
function mkPylon(){
  var mat=new T.MeshPhongMaterial({color:0xc9a9ee,shininess:90,specular:0x888888,emissive:0x2a1a44}),md=new T.MeshPhongMaterial({color:0x2e282c}),g=new T.Group(),cr,o;
  o=new T.Mesh(new T.CylinderGeometry(.5,.7,.5,8),md);o.position.y=.25;o.castShadow=true;g.add(o);
  o=new T.Mesh(new T.CylinderGeometry(.12,.12,1.2,8),md);o.position.y=1;g.add(o);
  cr=new T.Mesh(new T.OctahedronGeometry(.55),mat);cr.scale.y=1.7;cr.position.y=1.9;cr.castShadow=true;g.add(cr);
  o=new T.Mesh(new T.TorusGeometry(.75,.04,6,20),mCore);o.rotation.x=Math.PI/2;cr.add(o);glow(0xc9a9ee,3,cr,0);
  var lz=new T.Mesh(trG,mBeam);lz.visible=false;lz.frustumCulled=false;scene.add(lz);
  scene.add(g);return {g:g,cr:cr,fl:{visible:false},sh:{visible:false},mat:mat,lz:lz};
}
/* 먼 거리용: 같은 형태를 하나의 지오메트리로 합친 정지 모델(드로콜 1회) */
var BFAR={};
function farGeo(tp,root,mat){
  if(BFAR[tp])return BFAR[tp];
  var acc=new Acc();root.updateMatrixWorld(true);
  root.traverse(function(o){
    if(!o.isMesh||o.material!==mat)return;
    var g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);
    var A=g.attributes.position.array,N=g.attributes.normal.array,C=g.attributes.color.array,q;
    for(q=0;q<A.length;q++){acc.p.push(A[q]);acc.n.push(N[q]);acc.c.push(C[q])}
    g.dispose()});
  return BFAR[tp]=finG(acc);
}
function mkBot(tp){
  var c=BT[tp];if(c.fly)return mkFlyer(tp);if(tp==='pylon')return mkPylon();
  var kd=c.geo||tp,G=botGeo(tp),g=new T.Group(),u=new T.Group(),up=new T.Group(),big=kd==='heavy'||kd==='boss',o,halo=null;
  g.rotation.order='YXZ';g.add(u);u.scale.set(c.sc*c.w,c.sc,c.sc*c.w);
  var mat=new T.MeshPhongMaterial({vertexColors:true,shininess:38,specular:0x2c2c2c}),eye=kd==='grunt'||kd==='heavy'||kd==='shield'||kd==='gren'?mVisor:mRed,
      cs=tp!=='stalker';
  if(tp==='stalker'){mat.transparent=true;mat.opacity=.07}
  var cm=[];
  function M(geo,par,cast){var m=new T.Mesh(geo,mat);m.castShadow=!!cast&&cs;if(m.castShadow)cm.push(m);par.add(m);return m}
  function leg(sx){var t=new T.Group(),k=new T.Group();t.position.set(sx,.92,0);k.position.set(0,-.46,0);u.add(t);t.add(k);M(G.th,t,1);M(G.sn,k,1);return [t,k]}
  var L=leg(-.17),R=leg(.17);
  up.position.y=1;u.add(up);M(G.to,up,1);
  function arm(sx,rx,rz){var a=new T.Group();a.position.set(sx,.52,0);a.rotation.set(rx,0,rz);up.add(a);M(G.ar,a,1);return a}
  var aL,aR,gun=new T.Group(),fl;up.add(gun);
  if(kd==='rusher'){aR=arm(.42,-1.35,-.2);aL=arm(-.42,-1.35,.2);fl=box(.9,.05,.34,mFlash,0,.2,.85,up);fl.rotation.z=.5}
  else if(kd==='bomber'){aR=arm(.42,-.5,-.25);aL=arm(-.42,-.5,.25);fl=box(.12,.12,.12,mRed,0,.86,-.38,up)}
  else{aR=arm(.42,-1.15,-.12);aL=arm(-.42,-1.15,.75);
    var gp=big?[.34,.12,.46,.92,.26]:kd==='sniper'?[.3,.26,.5,1.16,.18]:[.3,.22,.5,.62,.2];
    gun.position.set(gp[0],gp[1],gp[2]);M(G.gu,gun);fl=box(gp[4],gp[4],gp[4],mFlash,0,.02,gp[3],gun);fl.rotation.set(.8,.8,0)}
  fl.visible=false;
  var head=new T.Group();head.position.set(0,.84,0);up.add(head);M(G.he,head,1);
  if(big)box(.3,.05,.04,eye,0,.04,.215,head);else if(kd==='sniper')box(.07,.07,.02,eye,-.08,.02,.255,head);
  else if(kd==='rusher')box(.3,.06,.05,eye,0,.03,.175,head);else box(.26,.09,.04,eye,0,.02,.165,head);
  box(.1,.06,.02,eye,-.1,.47,.245,up);
  if(kd==='boss'){box(.22,.22,.04,mCore,0,.47,.24,up);box(.5,.04,.04,mCore,0,.3,.21,up)}
  if(tp==='medic'){box(.2,.07,.03,mHealS,0,.5,.245,up);box(.07,.2,.03,mHealS,0,.5,.245,up);box(.26,.09,.03,mHealS,0,.45,-.37,up);box(.09,.26,.03,mHealS,0,.45,-.37,up)}
  if(tp==='over'){halo=new T.Mesh(new T.TorusGeometry(.5,.035,8,28),mCore);halo.rotation.x=Math.PI/2;halo.position.y=.55;head.add(halo);
    for(o=-1;o<2;o+=2){var ob=new T.Mesh(new T.SphereGeometry(.14,12,10),mCore);ob.position.set(o*1,1.3,-.1);up.add(ob);glow(0xc9a9ee,1.2,ob,0)}
    box(.34,.34,.05,mCore,0,.47,.25,up)}
  if(tp==='crusher'){box(.5,.08,.04,mCore,0,.47,.2,up);box(.08,.3,.04,mCore,0,.47,.2,up)}
  var bs=new T.Mesh(gShadow,mShadow);bs.rotation.x=-Math.PI/2;bs.position.y=.03;u.add(bs);
  var lz=null;if(tp==='sniper'||tp==='crusher'||tp==='medic'){lz=new T.Mesh(trG,tp==='medic'?mHeal:mLaser);lz.visible=false;lz.frustumCulled=false;scene.add(lz)}
  var fm=new T.Mesh(farGeo(tp,g,mat),mat);fm.visible=false;g.add(fm);
  scene.add(g);
  return {g:g,u:u,far:fm,up:up,head:head,thL:L[0],knL:L[1],thR:R[0],knR:R[1],aL:aL,aR:aR,fl:fl,sh:bs,mat:mat,lz:lz,halo:halo,cm:cm,nr:true};
}
function killMesh(b){scene.remove(b.m.g);if(b.m.lz)scene.remove(b.m.lz);b.m.mat.dispose();if(bossB===b)bossB=null}

/* 엄폐물 메시: 나무 상자 · 드럼통 · 모래주머니 */
(function(){
  var tCrate=tex(function(g){g.fillStyle='#8a7765';g.fillRect(0,0,128,128);speck(g,200,.06);
    g.fillStyle='rgba(60,45,35,.35)';for(var q=1;q<5;q++)g.fillRect(0,q*25,128,2);
    g.strokeStyle='#5c4e43';g.lineWidth=12;g.strokeRect(6,6,116,116);g.lineWidth=9;g.beginPath();g.moveTo(10,10);g.lineTo(118,118);g.stroke();
    g.strokeStyle='#a39180';g.lineWidth=1;g.strokeRect(13,13,102,102);
    g.fillStyle='#3f3630';[[8,8],[114,8],[8,114],[114,114],[61,8],[61,114],[8,61],[114,61]].forEach(function(p){g.fillRect(p[0],p[1],6,6)})}),
  mCrate=WM(tCrate,0x141414,6,.035),mLid=new T.MeshLambertMaterial({color:0x5c4e43}),
  mBr=[new T.MeshLambertMaterial({color:0x4f7d78}),new T.MeshLambertMaterial({color:0xa0563f})],mRing=new T.MeshLambertMaterial({color:0x2e2c30}),
  gBr=new T.CylinderGeometry(.4,.4,1.15,16),gRing=new T.CylinderGeometry(.42,.42,.05,16),gTop=new T.CylinderGeometry(.34,.34,.02,16),gHz=new T.CylinderGeometry(.405,.405,.2,16,1,true),mHz=new T.MeshLambertMaterial({color:0xe6c46a}),
  nb=0,bi=0,m4=new T.Matrix4(),qt=new T.Quaternion(),ps=new T.Vector3(),sc=new T.Vector3(.64,.34,.5),up=new T.Vector3(0,1,0);
  COV.forEach(function(c){if(c.kind===1)nb+=18});
  var bags=sh(new T.InstancedMesh(new T.SphereGeometry(.5,10,7),new T.MeshLambertMaterial({color:0xb09c7c}),nb),true,true);
  COV.forEach(function(c,n){var w=c.x1-c.x0,d=c.z1-c.z0,mx=(c.x0+c.x1)/2,mz=(c.z0+c.z1)/2,y,o,r,k;
    if(c.kind===1){var lx=w>d;qt.setFromAxisAngle(up,lx?0:Math.PI/2);
      for(r=0;r<4;r++){var cn=r%2?4:5;for(k=0;k<cn;k++){var t=(k-(cn-1)/2)*.54;ps.set(mx+(lx?t:0),c.b+.16+r*.29,mz+(lx?0:t));bags.setMatrixAt(bi++,m4.compose(ps,qt,sc))}}
      for(;bi%18;)bags.setMatrixAt(bi++,m4.makeScale(0,0,0));}
    else if(c.kind===2){var bg=new T.Group();bg.position.set(mx,c.b,mz);o=sh(new T.Mesh(gBr,mBr[1]),true,true);o.position.y=.575;bg.add(o);
      for(k=0;k<3;k++){r=new T.Mesh(gRing,mRing);r.position.y=.12+k*.46;bg.add(r)}
      r=new T.Mesh(gTop,mRing);r.position.y=1.16;bg.add(r);r=new T.Mesh(gHz,mHz);r.position.y=.6;bg.add(r);
      scene.add(bg);c.g=bg;c.hp=50}
    else{for(y=0;y<c.h-.1;y+=1.2)sh(box(w,1.2,d,mCrate,mx,c.b+y+.6,mz,scene),true,true);box(w+.05,.05,d+.05,mLid,mx,c.b+c.h+.025,mz,scene)}
  });
  scene.add(bags);
})();

/* 무기: 소총 · 산탄총 · 저격총 */
var WP=[
 {n:'소총',mag:24,res:72,max:240,add:48,rate:.105,dmg:34,pel:1,base:.003,sp:.014,af:.65,ads:46,rel:1.1,kick:.014,bl:.22,vol:.2,fq:2200,low:6},
 {n:'산탄총',mag:6,res:18,max:60,add:8,rate:.8,dmg:15,pel:8,base:.055,sp:0,af:.3,ads:58,rel:1.45,kick:.05,bl:.6,vol:.3,fq:900,low:2},
 {n:'저격총',mag:5,res:15,max:40,add:5,rate:1.15,dmg:130,pel:1,base:.045,sp:0,af:1,ads:18,rel:1.7,kick:.06,bl:.8,vol:.32,fq:3400,low:2},
 {n:'로켓런처',mag:1,res:0,max:9,add:0,rate:.7,dmg:0,pel:0,base:0,sp:0,af:0,ads:55,rel:1.35,kick:.08,bl:1,vol:.3,fq:500,low:1,rocket:1},
 {n:'화염방사기',mag:100,res:100,max:300,add:60,rate:.05,dmg:7,pel:0,base:0,sp:0,af:0,ads:60,rel:1.8,kick:.0015,bl:.04,vol:.1,fq:800,low:15,flame:1,own:'flame'},
 {n:'레일건',mag:3,res:6,max:18,add:3,rate:1.3,dmg:240,pel:1,base:.002,sp:0,af:.5,ads:30,rel:2,kick:.07,bl:.9,vol:.3,fq:4000,low:1,rail:1,own:'rail'}],
 /* 반동 충격량: 후퇴 · 총구 들림 · 좌우 · 기울임 */
 RC=[[.9,.8,.5,.8],[1.7,2.6,1,1.6],[1.9,3,.8,1.2],[1.5,2.2,1,2],[.1,.08,.2,.3],[1.7,2.8,.6,1]],
 guns=[],flash,CUR=0,DMAG=[],dmI=0;
(function(){
  function PH(c,sn){return new T.MeshPhongMaterial({color:c,shininess:sn||60,specular:0x444448})}
  var mcT=tex(function(g){var r=g.createRadialGradient(46,40,3,64,64,74);r.addColorStop(0,'#ffffff');r.addColorStop(.22,'#c4c4ce');r.addColorStop(.55,'#62626c');r.addColorStop(.85,'#26262b');r.addColorStop(1,'#3a3a44');
    g.fillStyle=r;g.fillRect(0,0,128,128)});
  function MC(c){return new T.MeshMatcapMaterial({color:c,matcap:mcT})}
  var m1=MC(0x8e8a9c),m2=MC(0xb4aec6),m3=MC(0x5c5a64),ma=new T.MeshBasicMaterial({color:0xA68FBD}),
      mh=PH(0x2b292f,12),mw=PH(0x8a6a4c,25),ms=PH(0x4a4650,10),ml=new T.MeshBasicMaterial({color:0x9fc0e6}),mk=PH(0x3d3a42,20),g,q,o,mag,pump,lh,bolt;
  function cyl(r1,r2,len,m,y,z,par){var c=new T.Mesh(new T.CylinderGeometry(r1,r2,len,10),m);c.rotation.x=Math.PI/2;c.position.set(0,y,z);par.add(c);return c}
  /* 오른손: 손등 · 손가락 3 · 방아쇠 손가락 · 엄지 · 손목 보호대 · 팔 */
  function rear(g,gz){box(.085,.1,.09,mh,0,-.105,gz,g);o=box(.09,.09,.3,ms,.03,-.2,gz+.135,g);o.rotation.x=.55;
    for(var f=0;f<3;f++){box(.075,.022,.03,mh,0,-.075-f*.027,gz-.05,g);box(.079,.008,.012,mk,0,-.075-f*.027,gz-.062,g)}
    box(.022,.03,.07,mh,-.045,-.05,gz-.01,g);box(.02,.02,.05,mh,.03,-.062,gz-.075,g);box(.026,.026,.03,mk,-.047,-.05,gz+.03,g);
    box(.06,.03,.05,mk,0,-.06,gz+.02,g);
    o=box(.096,.03,.096,m3,.03,-.15,gz+.06,g);o.rotation.x=.55;o=box(.1,.012,.1,mk,.03,-.165,gz+.075,g);o.rotation.x=.55}
  /* 왼손: 재장전 때 따로 움직이도록 그룹으로 반환 */
  function front(g,fz){var h=new T.Group();g.add(h);box(.085,.075,.11,mh,0,-.065,fz,h);o=box(.086,.086,.34,ms,-.07,-.13,fz+.14,h);o.rotation.set(-.35,.45,0);
    for(var f=0;f<4;f++){box(.022,.055,.024,mh,-.05,-.03,fz-.04+f*.027,h);box(.012,.02,.026,mk,-.058,-.012,fz-.04+f*.027,h)}
    box(.022,.045,.03,mh,.05,-.035,fz,h);box(.024,.02,.03,mk,.052,-.02,fz+.03,h);box(.06,.02,.09,mk,0,-.105,fz,h);
    o=box(.094,.03,.094,m3,-.045,-.105,fz+.07,h);o.rotation.set(-.35,.45,0);return h}
  function mkBolt(g,x,y,z){var b=new T.Group();b.position.set(x,y,z);g.add(b);box(.012,.012,.07,m2,0,0,0,b);box(.024,.024,.024,m3,.022,0,.04,b);return b}
  /* 소총 */
  g=new T.Group();
  box(.07,.1,.34,m1,0,0,0,g);box(.074,.03,.2,m3,0,-.045,.02,g);
  box(.062,.075,.27,m2,0,-.004,-.3,g);
  for(q=0;q<4;q++)box(.066,.012,.03,m3,0,.012,-.2-q*.06,g);
  cyl(.014,.014,.24,m3,.005,-.54,g);cyl(.023,.02,.07,m1,.005,-.68,g);
  box(.03,.014,.44,m3,0,.057,-.12,g);
  box(.045,.045,.11,m1,0,.088,-.03,g);box(.03,.03,.004,ma,0,.088,.027,g);box(.012,.03,.03,m3,0,.06,-.03,g);
  box(.012,.04,.012,m3,0,.075,-.42,g);box(.04,.012,.012,m3,0,.06,-.42,g);
  mag=box(.044,.17,.075,m2,0,-.125,-.06,g);mag.rotation.x=.16;
  box(.02,.03,.04,m3,0,-.065,.06,g);
  o=box(.05,.13,.06,m3,0,-.1,.13,g);o.rotation.x=-.32;
  box(.058,.085,.2,m1,0,-.008,.27,g);box(.066,.11,.03,m3,0,-.012,.38,g);
  box(.074,.012,.12,ma,0,.024,-.02,g);
  lh=front(g,-.3);rear(g,.135);
  box(.004,.03,.07,m3,.036,.015,-.02,g);bolt=box(.02,.015,.03,m2,.045,.03,.06,g);box(.074,.012,.012,m2,0,-.01,.08,g);
  for(q=0;q<3;q++)box(.048,.008,.078,m3,0,-.09-q*.035,-.055-q*.006,mag.parent);
  for(q=0;q<7;q++)box(.032,.007,.018,m2,0,.067,-.3+q*.045,g);
  o=cyl(.016,.016,.09,m3,-.005,-.36,g);o.position.x=-.045;box(.02,.02,.004,ml,-.045,-.005,-.406,g);
  box(.05,.006,.02,m3,0,.005,-.68,g);box(.006,.05,.02,m3,0,.005,-.68,g);box(.045,.02,.12,m2,0,.045,.27,g);
  box(.01,.014,.5,m3,.036,-.03,-.2,g);
  guns.push({g:g,mag:mag,my:-.125,lh:lh,bolt:bolt,bz:.06,fz:-.74,fy:.005,hip:[.23,-.22,-.46],ads:[0,-.118,-.34]});
  /* 산탄총 */
  g=new T.Group();
  box(.075,.1,.3,m1,0,0,.02,g);box(.079,.03,.1,m3,0,.02,.02,g);
  cyl(.024,.024,.58,m3,.022,-.41,g);cyl(.02,.02,.46,m1,-.03,-.35,g);cyl(.026,.026,.03,m1,-.03,-.585,g);
  box(.03,.012,.3,m3,0,.056,.02,g);box(.012,.02,.012,ma,0,.055,-.68,g);
  pump=new T.Group();pump.position.set(0,-.032,-.32);g.add(pump);
  box(.07,.065,.18,mw,0,0,0,pump);for(q=0;q<4;q++)box(.074,.05,.012,m3,0,0,-.06+q*.04,pump);
  box(.085,.075,.11,mh,0,-.04,0,pump);o=box(.08,.08,.34,mh,-.07,-.105,.14,pump);o.rotation.set(-.35,.45,0);
  o=box(.06,.1,.3,mw,0,-.035,.31,g);o.rotation.x=-.12;box(.064,.11,.025,m3,0,-.055,.465,g);
  o=box(.05,.1,.07,mw,0,-.085,.16,g);o.rotation.x=-.4;
  box(.02,.03,.04,m3,0,-.065,.08,g);box(.079,.012,.1,ma,0,-.02,.02,g);
  rear(g,.165);
  box(.058,.012,.34,m1,0,.05,-.44,g);for(q=0;q<5;q++)box(.06,.014,.02,m3,0,.05,-.58+q*.07,g);
  box(.012,.05,.16,m3,.044,0,.02,g);for(q=0;q<4;q++){o=box(.016,.05,.022,PH(0xd9776c,30),.054,0,-.035+q*.035,g);box(.017,.012,.023,mw,.054,-.02,-.035+q*.035,g)}
  box(.03,.03,.02,m3,0,-.03,-.6,g);box(.06,.012,.26,m3,0,-.085,.31,g);
  var shl=box(.022,.022,.06,PH(0xd9776c,30),0,-.2,.02,g);shl.visible=false;
  guns.push({g:g,pump:pump,shell:shl,fz:-.72,fy:.022,hip:[.23,-.21,-.44],ads:[0,-.085,-.36]});
  /* 저격총 */
  g=new T.Group();
  box(.07,.09,.4,m1,0,0,0,g);box(.06,.06,.32,m2,0,-.012,-.34,g);
  cyl(.016,.012,.64,m3,.012,-.52,g);cyl(.027,.027,.09,m1,.012,-.86,g);
  for(q=0;q<3;q++)box(.06,.01,.012,m3,0,.012,-.83-q*.025,g);
  cyl(.034,.034,.3,m3,.098,-.05,g);cyl(.046,.036,.08,m3,.098,-.235,g);cyl(.04,.034,.05,m3,.098,.115,g);
  box(.022,.04,.03,m1,0,.058,-.13,g);box(.022,.04,.03,m1,0,.058,.03,g);
  box(.034,.034,.004,ma,0,.098,.142,g);box(.03,.03,.03,m2,0,.14,-.05,g);box(.03,.03,.03,m2,.045,.098,-.05,g);
  bolt=mkBolt(g,.048,.012,.1);
  mag=box(.042,.1,.09,m2,0,-.085,-.05,g);
  box(.02,.03,.04,m3,0,-.06,.07,g);
  o=box(.05,.12,.06,m3,0,-.1,.14,g);o.rotation.x=-.32;
  box(.058,.1,.26,m1,0,-.02,.33,g);box(.066,.12,.03,m3,0,-.025,.47,g);box(.05,.03,.14,m2,0,.045,.33,g);
  o=box(.012,.1,.012,m3,.035,-.075,-.44,g);o.rotation.z=.35;o=box(.012,.1,.012,m3,-.035,-.075,-.44,g);o.rotation.z=-.35;
  box(.074,.012,.12,ma,0,.02,-.02,g);
  lh=front(g,-.32);rear(g,.145);
  box(.05,.05,.004,ml,0,.098,-.277,g);box(.06,.012,.02,m3,0,.012,-.86,g);box(.012,.06,.02,m3,0,.012,-.86,g);
  for(q=0;q<3;q++)box(.074,.008,.03,m3,0,.03,-.14+q*.07,g);box(.03,.02,.2,m3,0,-.05,-.34,g);
  box(.01,.014,.4,m2,.036,-.02,-.3,g);box(.045,.006,.3,m3,0,.133,-.05,g);
  guns.push({g:g,mag:mag,my:-.085,lh:lh,sbolt:bolt,fz:-.93,fy:.012,hip:[.23,-.22,-.44],ads:[0,-.11,-.3]});
  /* 로켓런처 */
  var mr=new T.MeshLambertMaterial({color:0xd9776c}),war;
  g=new T.Group();
  cyl(.05,.05,.95,m2,0,-.1,g);cyl(.05,.064,.08,m3,0,-.6,g);cyl(.072,.05,.12,m3,0,.42,g);
  box(.106,.106,.025,m1,0,0,-.32,g);box(.106,.106,.025,m3,0,0,.2,g);
  box(.03,.03,.3,m1,0,.062,-.12,g);box(.012,.06,.012,m3,0,.1,-.25,g);box(.03,.03,.01,ma,0,.1,-.1,g);
  war=new T.Mesh(new T.ConeGeometry(.045,.17,10),mr);war.rotation.x=-Math.PI/2;war.position.set(0,0,-.7);g.add(war);
  o=box(.05,.13,.06,m3,0,-.11,-.02,g);o.rotation.x=-.25;box(.04,.04,.16,m1,0,-.066,.08,g);
  lh=front(g,-.3);rear(g,-.015);
  box(.11,.02,.3,m1,0,-.055,-.3,g);cyl(.045,.045,.02,m3,0,.485,g);for(q=0;q<4;q++)box(.108,.108,.012,m3,0,0,-.2+q*.14,g);
  box(.05,.07,.004,m3,0,.13,-.25,g);box(.05,.004,.03,m3,0,.165,-.25,g);box(.03,.05,.08,m3,-.07,.02,.1,g);
  o=box(.04,.1,.05,m3,0,-.1,.25,g);o.rotation.x=.3;
  guns.push({g:g,war:war,lh:lh,fz:-.72,fy:0,hip:[.25,-.19,-.4],ads:[.1,-.12,-.3]});
  /* 화염방사기 */
  var mt2=PH(0xb85a4a,40),mo=new T.MeshBasicMaterial({color:0xffb060});
  g=new T.Group();
  box(.075,.09,.36,m1,0,0,0,g);box(.079,.03,.2,m3,0,-.04,.02,g);cyl(.022,.022,.5,m3,.01,-.42,g);cyl(.034,.024,.1,m1,.01,-.7,g);cyl(.04,.034,.03,m3,.01,-.76,g);
  for(q=0;q<4;q++)cyl(.027,.027,.015,m2,.01,-.3-q*.09,g);
  o=cyl(.008,.008,.42,m3,-.03,-.44,g);box(.02,.02,.02,mo,0,-.03,-.66,g);
  mag=new T.Mesh(new T.CylinderGeometry(.05,.05,.26,12),mt2);mag.rotation.x=Math.PI/2;mag.position.set(0,-.105,-.02);g.add(mag);
  o=cyl(.052,.052,.02,m3,-.105,.1,g);o=cyl(.052,.052,.02,m3,-.105,-.14,g);box(.03,.03,.03,ma,0,-.105,.13,g);
  box(.03,.014,.3,m3,0,.052,-.02,g);box(.012,.03,.012,m3,0,.07,-.3,g);box(.058,.085,.18,m1,0,-.01,.27,g);box(.066,.11,.03,m3,0,-.014,.37,g);
  o=box(.05,.13,.06,m3,0,-.1,.14,g);o.rotation.x=-.32;box(.076,.012,.12,ma,0,.02,-.02,g);
  lh=front(g,-.3);rear(g,.145);
  guns.push({g:g,mag:mag,my:-.105,lh:lh,fz:-.8,fy:.01,hip:[.23,-.21,-.44],ads:[.06,-.14,-.36]});
  /* 레일건 */
  g=new T.Group();
  box(.08,.1,.36,m1,0,0,.02,g);box(.084,.03,.2,m3,0,-.04,.04,g);
  box(.016,.03,.72,m2,.026,.022,-.5,g);box(.016,.03,.72,m2,-.026,.022,-.5,g);box(.022,.012,.68,ml,0,.022,-.5,g);
  for(q=0;q<5;q++)box(.086,.05,.02,m3,0,.022,-.22-q*.14,g);
  box(.07,.06,.3,m1,0,-.03,-.3,g);cyl(.03,.03,.16,m3,-.035,-.52,g);
  bolt=box(.05,.05,.1,ml,0,.075,.08,g);box(.06,.012,.3,m3,0,.056,.02,g);box(.012,.04,.012,m3,0,.085,-.14,g);box(.03,.012,.012,ma,0,.1,-.14,g);
  mag=box(.05,.12,.1,m2,0,-.1,-.02,g);box(.054,.02,.104,ma,0,-.08,-.02,g);
  o=box(.05,.13,.06,m3,0,-.11,.16,g);o.rotation.x=-.32;box(.06,.1,.24,m1,0,-.015,.34,g);box(.068,.12,.03,m3,0,-.02,.47,g);
  box(.02,.03,.04,m3,0,-.065,.09,g);box(.084,.012,.14,ma,0,-.022,.02,g);
  lh=front(g,-.3);rear(g,.165);
  guns.push({g:g,mag:mag,my:-.1,lh:lh,core:bolt,fz:-.9,fy:.022,hip:[.23,-.22,-.44],ads:[0,-.13,-.32]});
  /* 떨어지는 탄창 */
  for(q=0;q<3;q++){o=box(.044,.17,.075,m2,0,0,0,gScene);o.visible=false;DMAG.push({m:o,l:0,vx:0,vy:0,vr:0})}
  var ft=tex(function(g){var r=g.createRadialGradient(64,64,2,64,64,62);r.addColorStop(0,'#fff');r.addColorStop(.25,'#ffe7b8');r.addColorStop(.6,'rgba(255,170,80,.35)');r.addColorStop(1,'rgba(255,140,60,0)');
    g.fillStyle=r;g.fillRect(0,0,128,128);g.strokeStyle='rgba(255,240,210,.9)';g.lineWidth=5;
    for(var q=0;q<4;q++){g.beginPath();g.moveTo(64,64);g.lineTo(64+Math.cos(q*1.57+.4)*60,64+Math.sin(q*1.57+.4)*60);g.stroke()}});
  var fm=new T.MeshBasicMaterial({map:ft,transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});
  flash=new T.Group();
  flash.add(new T.Mesh(new T.PlaneGeometry(.26,.26),fm));
  o=new T.Mesh(new T.PlaneGeometry(.34,.12),fm);o.rotation.y=Math.PI/2;flash.add(o);
  o=new T.Mesh(new T.PlaneGeometry(.34,.12),fm);o.rotation.set(0,Math.PI/2,Math.PI/2);flash.add(o);
  flash.visible=false;
  for(q=0;q<guns.length;q++)gScene.add(guns[q].g);
})();
function showGun(n){CUR=n;for(var q=0;q<guns.length;q++)guns[q].g.visible=q===n;guns[n].g.add(flash);flash.position.set(0,guns[n].fy,guns[n].fz);hudC=''}
var CASE=[],caseI=0,caseP=0,shotN=0,flameN=0,kickY=0,melA=0,afT=0,afOn=false,
    gz=0,gzV=0,gp=0,gpV=0,gyw=0,gyV=0,gr=0,grV=0,gy=0,gyyV=0,swX=0,swY=0,lyaw=0,lpit=0,relA=0;
function eject(G){var cs=CASE[caseI];caseI=(caseI+1)%CASE.length;cs.m.position.set(G.g.position.x+.05,G.g.position.y+.04,G.g.position.z+.02);cs.m.visible=true;cs.m.scale.setScalar(CUR===1?1.8:CUR===2?1.5:1);
  cs.vx=.9+Math.random()*.5;cs.vy=.9+Math.random()*.4;cs.vz=.2+Math.random()*.3;cs.l=.45}
(function(){var m=new T.MeshLambertMaterial({color:0xd9b25a});for(var q=0;q<5;q++){var o=box(.012,.012,.034,m,0,0,0,gScene);o.visible=false;CASE.push({m:o,l:0,vx:0,vy:0,vz:0})}})();
/* 효과: 입자 · 예광탄 · 탄흔 */
var softT=tex(function(g){var r=g.createRadialGradient(64,64,2,64,64,62);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.35,'rgba(255,255,255,.5)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,128,128)});
function mkPS(n,mat,grav,drag){
  var o={n:n,p:new Float32Array(n*3),c:new Float32Array(n*3),v:new Float32Array(n*3),l:new Float32Array(n),i:0,g:grav,d:drag},q,ge=new T.BufferGeometry();
  for(q=0;q<n;q++)o.p[q*3+1]=-999;ge.setAttribute('position',new T.BufferAttribute(o.p,3));ge.setAttribute('color',new T.BufferAttribute(o.c,3));
  o.geo=ge;o.pts=new T.Points(ge,mat);o.pts.frustumCulled=false;scene.add(o.pts);return o;
}
var PSK=mkPS(460,new T.PointsMaterial({size:.27,map:softT,vertexColors:true,transparent:true,blending:T.AdditiveBlending,depthWrite:false}),12,0),
    PSM=mkPS(240,new T.PointsMaterial({size:.55,map:softT,vertexColors:true,transparent:true,opacity:.3,depthWrite:false}),-.8,1.5);
/* 회색 계열은 연기, 그 외는 가산 혼합 불꽃 */
function puff(px,py,pz,n,sp,r,g,b,life,bx,by,bz){
  var s=Math.abs(r-g)<.07&&Math.abs(g-b)<.07&&r<.82?PSM:PSK,q,j;
  for(q=0;q<n;q++){j=s.i*3;s.i=(s.i+1)%s.n;
    s.p[j]=px;s.p[j+1]=py;s.p[j+2]=pz;s.c[j]=r;s.c[j+1]=g;s.c[j+2]=b;
    s.v[j]=(Math.random()-.5)*sp+(bx||0);s.v[j+1]=Math.random()*sp*.8+(by||0);s.v[j+2]=(Math.random()-.5)*sp+(bz||0);
    s.l[j/3]=life*(.6+Math.random()*.6)*(s===PSM?1.7:1)}
}
function psUpd(dt){
  for(var n=0;n<2;n++){var s=n?PSM:PSK,q,j,k=Math.max(0,1-s.d*dt),fd=Math.max(0,1-dt*5);
    for(q=0;q<s.n;q++)if(s.l[q]>0){j=q*3;s.l[q]-=dt;
      if(s.l[q]<=0){s.p[j+1]=-999;continue}
      s.v[j]*=k;s.v[j+2]*=k;s.v[j+1]=s.v[j+1]*k-s.g*dt;s.p[j]+=s.v[j]*dt;s.p[j+1]+=s.v[j+1]*dt;s.p[j+2]+=s.v[j+2]*dt;
      if(!n){if(s.p[j+1]<.03){s.p[j+1]=.03;s.v[j+1]*=-.35;s.v[j]*=.6;s.v[j+2]*=.6}
        if(s.l[q]<.2){s.c[j]*=fd;s.c[j+1]*=fd;s.c[j+2]*=fd}}}
    s.geo.attributes.position.needsUpdate=true;s.geo.attributes.color.needsUpdate=true}
}
var TR=[];
for(i=0;i<24;i++){var tm=new T.Mesh(trG,new T.MeshBasicMaterial({color:0xffe2b0,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));tm.visible=false;tm.frustumCulled=false;scene.add(tm);TR.push({m:tm,l:0})}
var trI=0,v1=new T.Vector3(),v2=new T.Vector3();
function tracer(ax,ay,az,bx,by,bz,col){
  var t=TR[trI];trI=(trI+1)%TR.length;v1.set(ax,ay,az);v2.set(bx,by,bz);
  t.m.position.copy(v1).add(v2).multiplyScalar(.5);t.m.scale.z=Math.max(.1,v1.distanceTo(v2));t.m.lookAt(v2);
  t.m.material.color.setHex(col);t.m.material.opacity=.9;t.m.visible=true;t.l=.07;
}
var DC=[],dcG=new T.CircleGeometry(.075,8),dcM=new T.MeshBasicMaterial({color:0x131216,transparent:true,opacity:.85,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),dcI=0;
for(i=0;i<44;i++){var dm=new T.Mesh(dcG,dcM);dm.visible=false;scene.add(dm);DC.push(dm)}

/* 로켓 · 폭발 · 드론 */
var RK=[],rockets=[],EX=[],SC=[],scI=0,xLight=new T.PointLight(0xffb060,0,48),shake=0,boomA=0,drones=[],DMAX=12,bossB=null;
scene.add(xLight);
(function(){
  var mb=new T.MeshPhongMaterial({color:0xd9776c}),md=new T.MeshPhongMaterial({color:0x2b2930}),
      mf=new T.MeshBasicMaterial({color:0xffc070,transparent:true,opacity:.9,blending:T.AdditiveBlending,depthWrite:false}),q,g,o,k;
  for(q=0;q<8;q++){g=new T.Group();o=new T.Mesh(new T.CylinderGeometry(.06,.06,.46,10),md);o.rotation.x=Math.PI/2;g.add(o);
    o=new T.Mesh(new T.ConeGeometry(.06,.2,10),mb);o.rotation.x=Math.PI/2;o.position.z=.33;g.add(o);
    o=new T.Mesh(new T.CylinderGeometry(.062,.062,.05,10),mb);o.rotation.x=Math.PI/2;o.position.z=.1;g.add(o);
    box(.26,.02,.12,mb,0,0,-.2,g);box(.02,.26,.12,mb,0,0,-.2,g);
    o=new T.Mesh(new T.SphereGeometry(.16,10,8),mf);o.position.z=-.36;o.scale.z=2.4;g.add(o);g.userData.fl=o;
    g.visible=false;scene.add(g);RK.push(g)}
  /* 폭발: 섬광 핵 · 화염구 · 충격파 고리 · 연기 */
  var gs=new T.SphereGeometry(1,18,12),gk=new T.IcosahedronGeometry(1,1),gr=new T.RingGeometry(.82,1,40);
  for(q=0;q<4;q++){g=new T.Group();
    var e={g:g,l:0,k:1,sm:[],
      core:new T.Mesh(gs,new T.MeshBasicMaterial({color:0xfff6dc,transparent:true,blending:T.AdditiveBlending,depthWrite:false})),
      fire:new T.Mesh(gs,new T.MeshBasicMaterial({color:0xff8a3a,transparent:true,blending:T.AdditiveBlending,depthWrite:false})),
      fir2:new T.Mesh(gk,new T.MeshBasicMaterial({color:0xffb85a,transparent:true,blending:T.AdditiveBlending,depthWrite:false})),
      ring:new T.Mesh(gr,new T.MeshBasicMaterial({color:0xffe0b0,transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide})),
      smat:new T.MeshLambertMaterial({color:0x3c3638,transparent:true,depthWrite:false})};
    e.ring.rotation.x=-Math.PI/2;g.add(e.core);g.add(e.fire);g.add(e.fir2);g.add(e.ring);
    for(k=0;k<7;k++){o=new T.Mesh(gk,e.smat);o.userData.d=[Math.cos(k*.9)*(.6+k%3*.5),.3+k%2*.5,Math.sin(k*.9)*(.6+k%3*.5)];g.add(o);e.sm.push(o)}
    g.visible=false;scene.add(g);EX.push(e)}
  var gc=new T.CircleGeometry(2.6,24);
  for(q=0;q<5;q++){o=new T.Mesh(gc,new T.MeshBasicMaterial({color:0x151214,transparent:true,opacity:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));
    o.rotation.x=-Math.PI/2;o.visible=false;scene.add(o);SC.push({m:o,l:0})}
})();
function mkDrone(){
  var m1=new T.MeshPhongMaterial({color:0x9fb4d6,shininess:50}),m2=new T.MeshPhongMaterial({color:0x34363e,shininess:50}),
      mrot=new T.MeshBasicMaterial({color:0xd6dcea,transparent:true,opacity:.4,depthWrite:false}),g=new T.Group(),rot=[],q,o;
  box(.34,.1,.42,m1,0,0,0,g);box(.22,.06,.26,m2,0,.08,0,g);box(.3,.03,.3,m1,0,.115,0,g);box(.12,.05,.02,mCore,0,0,.215,g);box(.04,.02,.02,mRed,0,.08,-.14,g);
  o=new T.Mesh(new T.SphereGeometry(.07,10,8),m2);o.position.set(0,-.08,.12);g.add(o);
  o=new T.Mesh(new T.CylinderGeometry(.018,.018,.26,8),m2);o.rotation.x=Math.PI/2;o.position.set(0,-.09,.22);g.add(o);
  box(.02,.1,.02,m2,.12,-.1,-.1,g);box(.02,.1,.02,m2,-.12,-.1,-.1,g);box(.02,.02,.3,m2,.12,-.15,-.05,g);box(.02,.02,.3,m2,-.12,-.15,-.05,g);
  for(q=0;q<4;q++){var sx=q&1?.32:-.32,sz=q&2?.32:-.32;o=box(.4,.03,.05,m2,sx/2,.02,sz/2,g);o.rotation.y=Math.atan2(-sz,sx);
    o=new T.Mesh(new T.CylinderGeometry(.035,.04,.09,8),m2);o.position.set(sx,.06,sz);g.add(o);
    o=new T.Mesh(new T.CylinderGeometry(.18,.18,.012,16),mrot);o.position.set(sx,.115,sz);g.add(o);
    o=new T.Mesh(new T.TorusGeometry(.185,.012,6,18),m1);o.rotation.x=Math.PI/2;o.position.set(sx,.11,sz);g.add(o);
    o=box(.34,.012,.03,m2,sx,.118,sz,g);rot.push(o)}
  scene.add(g);return {g:g,rot:rot};
}
function mkTurret(){
  var m1=new T.MeshPhongMaterial({color:0x8f97a6,shininess:60}),m2=new T.MeshPhongMaterial({color:0x2e3036,shininess:60}),g=new T.Group(),h=new T.Group(),q,o;
  for(q=0;q<3;q++){o=box(.07,.62,.07,m2,Math.cos(q*2.09)*.26,.27,Math.sin(q*2.09)*.26,g);o.rotation.set(Math.sin(q*2.09)*.5,0,-Math.cos(q*2.09)*.5)}
  o=new T.Mesh(new T.CylinderGeometry(.16,.2,.16,12),m2);o.position.y=.6;o.castShadow=true;g.add(o);
  h.position.y=.82;g.add(h);o=box(.36,.24,.44,m1,0,0,0,h);o.castShadow=true;box(.38,.06,.3,m2,0,.14,-.04,h);box(.14,.05,.02,mCore,0,.04,.225,h);
  for(q=-1;q<2;q+=2){o=new T.Mesh(new T.CylinderGeometry(.03,.03,.5,8),m2);o.rotation.x=Math.PI/2;o.position.set(q*.09,-.03,.42);h.add(o)}
  box(.1,.2,.2,m2,.24,-.02,-.05,h);box(.04,.04,.04,mRed,0,.2,-.12,h);
  scene.add(g);return {g:g,rot:[],head:h};
}
function addDrone(){
  var n=0,q,fixed=false;for(q=0;q<drones.length;q++)if(!drones[q].tur)n++;
  if(n>=DMAX){for(q=0;q<drones.length;q++)if(drones[q].hp<drones[q].mhp){drones[q].hp=drones[q].mhp;fixed=true}return fixed}
  drones.push({m:mkDrone(),x:P.x,y:P.y+2.4,z:P.z,cd:.4+Math.random()*.4,yaw:0,hp:60*PK.dr,mhp:60*PK.dr,hit:0});return true;
}
function addTurret(x,y,z){
  var n=0,q,first=-1;for(q=0;q<drones.length;q++)if(drones[q].tur){n++;if(first<0)first=q}
  if(n>=4){scene.remove(drones[first].m.g);drones.splice(first,1)}
  drones.push({tur:1,m:mkTurret(),x:x,y:y,z:z,cd:.4,yaw:0,hp:170,mhp:170,hit:0});ringFx(x,y,z,0xc9a9ee,3,.5);
}
function hurtDrone(dr,dmg){
  dr.hp-=dmg;dr.hit=.12;puff(dr.x,dr.y+(dr.tur?.8:0),dr.z,4,3,1,.8,.5,.3);
  if(dr.hp<=0){var n=drones.indexOf(dr);if(n>=0)drones.splice(n,1);scene.remove(dr.m.g);explodeFx(dr.x,dr.y+(dr.tur?.8:0),dr.z,.4);chunks(dr.x,dr.y+.5,dr.z,8,0x9fb4d6,6);note(dr.tur?'포탑 파괴':'드론 파괴')}
}
/* 고급 효과: 파편 · 확산 고리 · 소환 기둥 · 피해 숫자 · 부유 먼지 · 발광 */
var DBN=110,debris,dbP=new Float32Array(DBN*3),dbV=new Float32Array(DBN*3),dbL=new Float32Array(DBN),dbS=new Float32Array(DBN),dbI=0,
    _dm=new T.Matrix4(),_dq=new T.Quaternion(),_de=new T.Euler(),_dp=new T.Vector3(),_ds=new T.Vector3(),_dc=new T.Color(),
    RF=[],PL=[],DN=[],dnI=0,motes,moP,glowT,PADS=MDEF.pads,PORT=MDEF.ports,portM=[],padM=[],tpT=0,tpLock=false,
    dirT=0,dirA=0,vpA=0,invN=0,waveT=0;
(function(){
  var q,o,k,g;
  debris=new T.InstancedMesh(new T.BoxGeometry(.17,.12,.21),new T.MeshLambertMaterial({color:0xffffff}),DBN);debris.frustumCulled=false;debris.castShadow=true;
  for(q=0;q<DBN;q++){debris.setMatrixAt(q,_dm.makeScale(0,0,0));debris.setColorAt(q,_dc.setHex(0xffffff))}scene.add(debris);
  var gr=new T.RingGeometry(.86,1,48);
  for(q=0;q<10;q++){o=new T.Mesh(gr,new T.MeshBasicMaterial({color:0xffffff,transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));o.rotation.x=-Math.PI/2;o.visible=false;scene.add(o);RF.push({m:o,l:0,d:1,s:1})}
  var gp=new T.CylinderGeometry(.55,.55,9,14,1,true);
  for(q=0;q<12;q++){o=new T.Mesh(gp,new T.MeshBasicMaterial({color:0xff8a78,transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));o.visible=false;scene.add(o);PL.push({m:o,l:0})}
  for(q=0;q<14;q++){var c=document.createElement('canvas');c.width=128;c.height=64;var tx=new T.CanvasTexture(c);
    o=new T.Sprite(new T.SpriteMaterial({map:tx,transparent:true,depthTest:false,depthWrite:false}));o.visible=false;o.renderOrder=5;scene.add(o);DN.push({m:o,c:c,t:tx,l:0,vy:0})}
  glowT=tex(function(g2){var r=g2.createRadialGradient(64,64,2,64,64,62);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.3,'rgba(255,255,255,.45)');r.addColorStop(1,'rgba(255,255,255,0)');g2.fillStyle=r;g2.fillRect(0,0,128,128)});
  moP=new Float32Array(140*3);for(q=0;q<140*3;q++)moP[q]=(Math.random()-.5)*36;
  var mg=new T.BufferGeometry();mg.setAttribute('position',new T.BufferAttribute(moP,3));
  motes=new T.Points(mg,new T.PointsMaterial({color:0xffe2b8,size:.06,transparent:true,opacity:.55,depthWrite:false}));motes.frustumCulled=false;scene.add(motes);
  /* 벽등: 기구 · 전구 · 발광점 · 바닥 빛 웅덩이 (인스턴싱) */
  var LP=[],cx,cz,m4=new T.Matrix4(),qr=new T.Quaternion().setFromEuler(new T.Euler(-Math.PI/2,0,0)),v0=new T.Vector3(),s1=new T.Vector3(1,1,1);
  for(cz=0;cz<MH;cz++)for(cx=0;cx<MW;cx++)if(MAP[cz][cx]==='#')for(k=0;k<4;k++){var dx=D4[k][0],dz=D4[k][1];
    if(mt(cx+dx,cz+dz)==='.'&&(cx*17+cz*31+k*7)%8===0)LP.push([(cx+.5)*CS+dx*1.5,(cz+.5)*CS+dz*1.5,dx,dz])}
  if(LP.length){
    var fix=new T.InstancedMesh(new T.BoxGeometry(.2,.34,.2),new T.MeshLambertMaterial({color:0x2e2a2c}),LP.length),
        bulb=new T.InstancedMesh(new T.SphereGeometry(.11,10,8),new T.MeshBasicMaterial({color:0xfff0c8}),LP.length),
        pool=new T.InstancedMesh(new T.PlaneGeometry(6,6),new T.MeshBasicMaterial({map:softT,color:0xffc488,transparent:true,opacity:.3,blending:T.AdditiveBlending,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),LP.length),
        gp2=new Float32Array(LP.length*3),gg=new T.BufferGeometry();
    LP.forEach(function(l,n){fix.setMatrixAt(n,m4.makeTranslation(l[0]+l[2]*.1,3.45,l[1]+l[3]*.1));bulb.setMatrixAt(n,m4.makeTranslation(l[0]+l[2]*.16,3.25,l[1]+l[3]*.16));
      pool.setMatrixAt(n,m4.compose(v0.set(l[0]+l[2]*1.2,.035,l[1]+l[3]*1.2),qr,s1));gp2[n*3]=l[0]+l[2]*.22;gp2[n*3+1]=3.25;gp2[n*3+2]=l[1]+l[3]*.22});
    gg.setAttribute('position',new T.BufferAttribute(gp2,3));
    o=new T.Points(gg,new T.PointsMaterial({map:softT,color:0xffcf96,size:2.6,transparent:true,opacity:.75,blending:T.AdditiveBlending,depthWrite:false}));o.frustumCulled=false;
    pool.frustumCulled=false;scene.add(fix);scene.add(bulb);scene.add(pool);scene.add(o);
  }
  /* 점프 패드 · 순간이동문 */
  var mp=new T.MeshLambertMaterial({color:0x3a3640}),my=new T.MeshBasicMaterial({color:0xf2d37a});
  PADS.forEach(function(p){g=new T.Group();g.position.set((p[0]+.5)*CS,0,(p[1]+.5)*CS);
    o=new T.Mesh(new T.CylinderGeometry(.8,.9,.12,20),mp);o.position.y=.06;o.receiveShadow=true;g.add(o);
    for(k=0;k<3;k++){o=new T.Mesh(new T.ConeGeometry(.36-k*.07,.16,4),my);o.position.y=.24+k*.2;g.add(o)}
    o=new T.Mesh(new T.TorusGeometry(.78,.04,6,24),my);o.rotation.x=Math.PI/2;o.position.y=.13;g.add(o);
    glow(0xf2d37a,2.4,g,.5);scene.add(g);padM.push(g)});
  PORT.forEach(function(pr,n){var col=n?0x7fe0d0:0xc9a9ee,mm=new T.MeshBasicMaterial({color:col}),md=new T.MeshBasicMaterial({color:col,transparent:true,opacity:.3,side:T.DoubleSide,depthWrite:false});
    pr.forEach(function(p){g=new T.Group();g.position.set((p[0]+.5)*CS,1.25,(p[1]+.5)*CS);
      o=new T.Mesh(new T.TorusGeometry(1,.07,8,28),mm);g.add(o);o=new T.Mesh(new T.CircleGeometry(.95,24),md);g.add(o);
      o=new T.Mesh(new T.TorusGeometry(.6,.03,6,n?4:3),mm);g.add(o);g.userData.i=o;
      glow(col,3.6,g,0);o=box(.6,.1,.6,mp,0,-1.2,0,g);scene.add(g);portM.push(g)})});
})();
function glow(col,size,par,y){var sp3=new T.Sprite(new T.SpriteMaterial({map:glowT,color:col,transparent:true,opacity:.5,blending:T.AdditiveBlending,depthWrite:false}));sp3.scale.set(size,size,1);if(y)sp3.position.y=y;par.add(sp3);return sp3}
function chunks(x,y,z,n,col,spd){
  for(var q=0;q<n;q++){var j=dbI*3;dbP[j]=x+(Math.random()-.5)*.5;dbP[j+1]=y+(Math.random()-.5)*.8;dbP[j+2]=z+(Math.random()-.5)*.5;
    dbV[j]=(Math.random()-.5)*spd;dbV[j+1]=Math.random()*spd*.9+1.5;dbV[j+2]=(Math.random()-.5)*spd;dbL[dbI]=1.6+Math.random()*1.2;dbS[dbI]=.6+Math.random()*1.3;
    debris.setColorAt(dbI,_dc.setHex(Math.random()<.35?0x2b2930:col));dbI=(dbI+1)%DBN}
  debris.instanceColor.needsUpdate=true;
}
function ringFx(x,y,z,col,size,dur){var r=RF[0],q;for(q=1;q<RF.length;q++)if(RF[q].l<r.l)r=RF[q];r.m.position.set(x,y+.07,z);r.m.material.color.setHex(col);r.m.visible=true;r.l=r.d=dur||.6;r.s=size}
function pillar(x,y,z,col){var p=PL[0],q;for(q=1;q<PL.length;q++)if(PL[q].l<p.l)p=PL[q];p.m.position.set(x,y+4.5,z);p.m.material.color.setHex(col);p.m.visible=true;p.l=.55}
function dmgNum(x,y,z,amt,head){
  var d=DN[dnI];dnI=(dnI+1)%DN.length;var g=d.c.getContext('2d');g.clearRect(0,0,128,64);
  g.font='bold '+(head?46:36)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=6;g.strokeStyle='#161616';g.fillStyle=head?'#f3dfc4':'#EEECE9';
  var t=Math.round(amt)+(head?'!':'');g.strokeText(t,64,34);g.fillText(t,64,34);d.t.needsUpdate=true;
  var ds=Math.hypot(x-P.x,z-P.z),sz=.5+ds*.045;d.m.scale.set(sz*2,sz,1);d.m.position.set(x+(Math.random()-.5)*.4,y,z+(Math.random()-.5)*.4);d.m.material.opacity=1;d.m.visible=true;d.l=.75;d.vy=1.4+ds*.04;
}
function beam(m,ax,ay,az,bx,by,bz,th){v1.set(ax,ay,az);v2.set(bx,by,bz);m.position.copy(v1).add(v2).multiplyScalar(.5);m.scale.set(th,th,Math.max(.1,v1.distanceTo(v2)));m.lookAt(v2);m.visible=true}
/* 피해 적용 공통: 무적 · 흡혈 · 피해 숫자 · 처치. src 1 = 폭발(파편화) */
function dmgBot(b,amt,x,y,z,head,src,noNum){
  if(b.die>0||b.im>0)return false;
  if(b.inv){puff(x,y,z,4,3,.8,.7,1,.25);sShieldHit(x,z);if(tNow-invN>1.6){invN=tNow;note('무적 · 동력 첨탑 파괴')}return false}
  if(PK.exec&&b.hp<b.mhp*.3)amt*=1.4;
  b.hp-=amt;if(noNum!==2)b.hit=.1;if(!noNum)dmgNum(x,y+.3,z,amt,head);
  var lr=(P.vp>0?.12:0)+PK.leech;
  if(lr){vpA+=amt*lr;if(vpA>=1){var h=vpA|0;vpA-=h;P.hp=Math.min(P.mhp,P.hp+h)}}
  if(b.hp<=0){killBot(b,x,y,z,src===1);return true}return false;
}
function fx2(dt){
  var q,j,act=false;
  for(q=0;q<DBN;q++)if(dbL[q]>0){j=q*3;dbL[q]-=dt;dbV[j+1]-=16*dt;dbP[j]+=dbV[j]*dt;dbP[j+1]+=dbV[j+1]*dt;dbP[j+2]+=dbV[j+2]*dt;
    var fl2=floorAt(dbP[j],dbP[j+2],dbP[j+1]+.3);if(fl2<50&&dbP[j+1]<fl2+.07){dbP[j+1]=fl2+.07;dbV[j+1]*=-.35;dbV[j]*=.6;dbV[j+2]*=.6}
    var dz2=dbL[q]<.4?dbS[q]*Math.max(0,dbL[q])/.4:dbS[q];_de.set(dbL[q]*5+q,dbL[q]*3,q);_dq.setFromEuler(_de);
    debris.setMatrixAt(q,dbL[q]<=0?_dm.makeScale(0,0,0):_dm.compose(_dp.set(dbP[j],dbP[j+1],dbP[j+2]),_dq,_ds.set(dz2,dz2,dz2)));act=true}
  if(act)debris.instanceMatrix.needsUpdate=true;
  for(q=0;q<RF.length;q++){var r=RF[q];if(r.l>0){r.l-=dt;var p=1-Math.max(0,r.l)/r.d,e=1-(1-p)*(1-p);r.m.scale.setScalar(.3+e*r.s);r.m.material.opacity=(1-p)*.9;if(r.l<=0)r.m.visible=false}}
  for(q=0;q<PL.length;q++){var pl=PL[q];if(pl.l>0){pl.l-=dt;var pp=1-Math.max(0,pl.l)/.55;pl.m.scale.set(1.2-pp,1,1.2-pp);pl.m.material.opacity=(1-pp)*.75;if(pl.l<=0)pl.m.visible=false}}
  for(q=0;q<DN.length;q++){var dn=DN[q];if(dn.l>0){dn.l-=dt;dn.m.position.y+=dn.vy*dt;dn.m.material.opacity=Math.min(1,dn.l/.3);if(dn.l<=0)dn.m.visible=false}}
  for(q=0;q<moP.length;q+=3){moP[q]+=dt*.22;moP[q+1]+=dt*.14;if(moP[q]>18)moP[q]-=36;if(moP[q+1]>10)moP[q+1]-=14}
  motes.geometry.attributes.position.needsUpdate=true;motes.position.set(cam.position.x,cam.position.y,cam.position.z);
  for(q=0;q<padM.length;q++){var pm=padM[q];for(j=1;j<4;j++)pm.children[j].position.y=.24+(j-1)*.2+((tNow*1.4+j*.2)%1)*.25}
  for(q=0;q<portM.length;q++){portM[q].rotation.y=tNow*.9+q;portM[q].userData.i.rotation.z=-tNow*2}
  if(dirT>0)dirT-=dt*1.1;
}
/* 점프 패드 · 순간이동문 · 지속 효과 시간 */
function upd2(dt){
  var q,k,px,pz;
  if(P.vp>0)P.vp-=dt;tpT-=dt;waveT+=dt;
  if(P.vy===0&&P.y<.3)for(q=0;q<PADS.length;q++){px=(PADS[q][0]+.5)*CS;pz=(PADS[q][1]+.5)*CS;
    if(Math.hypot(P.x-px,P.z-pz)<.9){P.y+=.07;P.vy=13;sPad();ringFx(px,0,pz,0xf2d37a,3.2,.45);break}}
  var nearP=false;
  for(q=0;q<PORT.length;q++)for(k=0;k<2;k++){px=(PORT[q][k][0]+.5)*CS;pz=(PORT[q][k][1]+.5)*CS;var dd=Math.hypot(P.x-px,P.z-pz);
    if(dd<1.4&&P.y<1)nearP=true;
    if(dd<.95&&P.y<1&&!tpLock&&tpT<=0){var o=PORT[q][1-k],col=q?0x7fe0d0:0xc9a9ee;ringFx(px,0,pz,col,4,.5);pillar(px,0,pz,col);
      P.x=(o[0]+.5)*CS;P.z=(o[1]+.5)*CS;P.y=0;P.vy=0;tpT=1.5;tpLock=true;ringFx(P.x,0,P.z,col,4,.5);pillar(P.x,0,P.z,col);sTele();if(!RM)boomA=Math.max(boomA,.35);return}}
  if(!nearP)tpLock=false;
}
function freezeNova(){
  var q,b,n=0;ringFx(P.x,P.y,P.z,0xbfe8ff,34,.8);ringFx(P.x,P.y,P.z,0xffffff,18,.5);sFreeze();
  for(q=0;q<bots.length;q++){b=bots[q];if(b.die<=0&&b.tp!=='pylon'&&Math.hypot(b.x-P.x,b.z-P.z)<17){b.frz=b.boss?1.5:4.5;n++;puff(b.x,b.y+b.sc,b.z,6,2,.75,.9,1,.6)}}
  for(q=0;q<grenades.length;q++)grenades[q].fuse+=2;
}
function nuke(){
  var q,b,l=bots.slice();if(!RM){boomA=1;shake=1.5}ringFx(P.x,P.y,P.z,0xfff2c0,90,1.4);ringFx(P.x,P.y,P.z,0xffb060,60,1);sBoom(P.x,P.z,1.3);sBoom(P.x,P.z,1);
  for(q=0;q<l.length;q++){b=l[q];if(b.die>0)continue;if(b.boss)dmgBot(b,700,b.x,b.y+b.sc,b.z,false,1);else if(b.tp!=='pylon'){b.im=0;dmgBot(b,1e5,b.x,b.y+b.sc,b.z,false,1,true)}}
}
var GR=[],grenades=[],booms=[],WR=[],slowT=0,ets=1,comboN=0,comboT=0,bulletT=0,hbT=0,stepD=0;
(function(){
  var mg=new T.MeshPhongMaterial({color:0x5a5a36}),mr=new T.MeshBasicMaterial({color:0xff8a78}),q,g,o,gw=new T.RingGeometry(3.9,4.4,40);
  for(q=0;q<8;q++){g=new T.Group();o=new T.Mesh(new T.SphereGeometry(.13,10,8),mg);o.scale.y=1.25;g.add(o);box(.27,.05,.27,mr,0,0,0,g);box(.06,.08,.06,mg,0,.18,0,g);g.visible=false;scene.add(g);GR.push(g)}
  for(q=0;q<10;q++){o=new T.Mesh(gw,new T.MeshBasicMaterial({color:0xff8a78,transparent:true,opacity:.7,side:T.DoubleSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));
    o.rotation.x=-Math.PI/2;o.visible=false;scene.add(o);WR.push(o)}
})();
function ring(x,y,z,k){for(var q=0;q<WR.length;q++)if(!WR[q].visible){var r=WR[q];r.position.set(x,y+.05,z);r.scale.setScalar(k||1);r.visible=true;return r}return null}
function lob(b){
  var m=null,q;for(q=0;q<GR.length;q++)if(!GR[q].visible){m=GR[q];break}
  if(!m)return;
  var ca=Math.cos(b.rot),sa=Math.sin(b.rot),gx=b.x+sa*.7+ca*.3,gz=b.z+ca*.7-sa*.3,gy=b.y+1.5,T2=1.25,
      tx=P.x+(Math.random()-.5)*2.4,tz=P.z+(Math.random()-.5)*2.4;
  m.visible=true;b.fl=.1;sLob(b);
  grenades.push({m:m,x:gx,y:gy,z:gz,vx:(tx-gx)/T2,vz:(tz-gz)/T2,vy:(P.y-gy)/T2+.5*14*T2,fuse:-1,r:null});
}
function airstrike(){
  var l=bots.filter(function(b){return b.die<=0}).sort(function(a,b){return Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z)}).slice(0,7),q,b,f;
  for(q=0;q<l.length;q++){b=l[q];f=floorAt(b.x,b.z,b.y+.5);if(f>50)f=b.y;
    booms.push({x:b.x,y:f+.6,z:b.z,t:1+q*.16,mode:3,r:ring(b.x,f,b.z,1.2),fall:1});sAir(b.x,b.z,q*.16)}
  if(!l.length)note('공습 대상 없음');
}
function blowBarrel(c){
  if(c.dead)return;c.dead=1;c.g.visible=false;explode((c.x0+c.x1)/2,c.b+.6,(c.z0+c.z1)/2,2);
}
function killBot(b,ex,ey,ez,gib){
  if(b.die>0)return;var tp=b.tp,q;
  b.die=tp==='bomber'||tp==='pylon'||tp==='mite'||gib&&!b.boss?.05:1.3;if(tp!=='pylon'){kills++;ST.kw[KW||'기타']=(ST.kw[KW||'기타']||0)+1;if(b.boss)ST.boss++}
  if(PK.boom&&!b.boss&&tp!=='pylon'&&tp!=='bomber'&&Math.random()<.35)booms.push({x:b.x,y:b.y+1,z:b.z,t:.1,mode:5});b.m.sh.visible=false;sKill(b);puff(ex,ey,ez,14,4.5,.95,.8,.6,.5);
  chunks(b.x,b.y+b.sc,b.z,b.boss?44:gib?14:tp==='pylon'?12:6,BT[tp].col,gib||b.boss?10:5);
  if(tp!=='pylon'&&tp!=='mite'){comboN=comboT>0?comboN+1:1;comboT=4;
    if(comboN>=2){note(['','','더블 킬','트리플 킬','쿼드 킬','학살'][Math.min(comboN,5)]+(comboN>5?' ×'+comboN:''));sCombo(comboN);if(comboN>=3)P.hp=Math.min(P.mhp,P.hp+4)}}
  if(tp==='bomber'){booms.push({x:b.x,y:b.y+1,z:b.z,t:.04,mode:2});if(Math.random()<.3)drop(b)}
  else if(tp==='split'){for(q=0;q<3;q++){var mt=addBot('mite',[Math.floor(b.x/CS),Math.floor(b.z/CS),0]);mt.x=b.x+Math.cos(q*2.09)*.5;mt.z=b.z+Math.sin(q*2.09)*.5;mt.y=b.y;mt.im=.5}
    ringFx(b.x,b.y,b.z,0x9fd07a,4,.4)}
  else if(tp==='pylon')ringFx(b.x,b.y,b.z,0xc9a9ee,7,.5);
  else if(b.boss){ /* 보스 보상 · 연쇄 폭발 */
    var rw=tp==='over'?['rk','dr','dr','hp','sd','nk','tu','ov']:['rk','dr','hp','sd','tu'];
    rw.forEach(function(t,n){items.push({g:mkItem(t),type:t,x:b.x+Math.cos(n*6.283/rw.length)*1.8,y:floorSafe(b),z:b.z+Math.sin(n*6.283/rw.length)*1.8,life:45})});
    for(q=0;q<7;q++)booms.push({x:b.x+(Math.random()-.5)*3*b.sc/2,y:b.y+1+Math.random()*2.5*b.sc/2,z:b.z+(Math.random()-.5)*3*b.sc/2,t:.1+q*.2,mode:4});
    P.hp=P.mhp;say(tp==='over'?'슈퍼 보스 격파':'보스 격파');bulletT=1.5;ringFx(b.x,b.y,b.z,0xffe0b0,30,1);
    if(tp==='over')for(q=0;q<bots.length;q++)if(bots[q].tp==='pylon'&&bots[q].die<=0)killBot(bots[q],bots[q].x,bots[q].y+2,bots[q].z);
  }else if(tp!=='mite'||Math.random()<.15)drop(b);
}
function hurtP(dmg,sx,sz){
  if(P.ds>0&&PK.phase)return false; /* 위상 대시 */
  dmg=Math.round(dmg*DFD[CFG.diff]);if(dmg<=0)return false;
  if(sx!==undefined){dirA=Math.atan2((sx-P.x)*Math.cos(P.yaw)-(sz-P.z)*Math.sin(P.yaw),-(sx-P.x)*Math.sin(P.yaw)-(sz-P.z)*Math.cos(P.yaw));dirT=1}
  if(P.sh>0){var ab=Math.min(P.sh,dmg);P.sh-=ab;dmg-=ab;sHurt(1);if(dmg<=0){hurt=Math.max(hurt,.3);return false}}
  P.hp-=dmg;hurt=1;sHurt(0);if(P.hp<=0){P.hp=0;ST.cause=hitBy||'알 수 없음';over();return true}return false;
}
function explodeFx(x,y,z,k){
  var q,e=EX[0];for(q=1;q<EX.length;q++)if(EX[q].l<e.l)e=EX[q];
  e.g.position.set(x,y,z);e.g.visible=true;e.l=1.25;e.k=k;
  xLight.position.set(x,y+.6,z);xLight.intensity=4.5*k;
  var dp=Math.hypot(P.x-x,P.z-z);
  if(!RM){shake=Math.max(shake,Math.max(.25,1.5-dp/22)*k);boomA=Math.max(boomA,Math.max(0,.55-dp/30)*k)}
  puff(x,y,z,60,13*k,1,.78,.42,.9);puff(x,y,z,28,6*k,1,.5,.2,1.3);puff(x,y,z,20,4,.35,.33,.34,1.5);
  sBoom(x,z,k);
  var f=floorAt(x,z,y+.5);
  if(f<50&&y-f<2.2){var s=SC[scI];scI=(scI+1)%SC.length;s.m.position.set(x,f+.04,z);s.m.scale.set(k,k,k);s.m.visible=true;s.l=14}
}
/* 폭발 주체: 0 플레이어(적 + 자신) · 1 적(플레이어만) · 2 중립(모두) · 3 공습(적만) */
function explode(x,y,z,en){
  var q,b,d,c,l;explodeFx(x,y,z,en===1?.75:en===3?1.1:en===4?.8:en===5?.5:1);ringFx(x,y-.4,z,0xffd9a0,9,.45);
  if(en===4)return;
  for(q=0;q<COV.length;q++){c=COV[q];if(c.kind===2&&!c.dead&&!c.fz&&Math.hypot((c.x0+c.x1)/2-x,(c.z0+c.z1)/2-z)<5.2&&Math.abs(c.b-y)<3){c.fz=1;booms.push({t:.14+Math.random()*.2,bar:c})}}
  if(en!==1){l=bots.slice();for(q=0;q<l.length;q++){b=l[q];if(b.die>0)continue;d=Math.hypot(b.x-x,b.y+b.sc-y,b.z-z)-(b.boss?1:0);
    var R=en===2?5:en===5?3.6:6.5,D=en===2?150:en===3?320:en===5?90*PK.dmg:260*PK.dmg;if(en!==0&&en!==5)KW=en===3?'공습':'폭발';
    if(d<R)dmgBot(b,D*(1-Math.max(0,d)/R)*(P.pw>0&&en===0?2:1),b.x,b.y+b.sc*1.4,b.z,false,1)}}
  if(en===1||en===2){l=drones.slice();for(q=0;q<l.length;q++){d=Math.hypot(l[q].x-x,l[q].y-y,l[q].z-z);if(d<4.6)hurtDrone(l[q],60*(1-d/4.6))}}
  if(en!==3&&en!==5&&state==='play'){hitBy=en===0?'자신의 폭발물':'폭발';d=Math.hypot(P.x-x,P.y+1-y,P.z-z);var pr=en===0?4:4.6;if(d<pr)hurtP((en===0?40:36)*(1-d/pr),x,z)}
}
function launch(x,y,z,dx,dy,dz,en){
  var m=null,q;for(q=0;q<RK.length;q++)if(!RK[q].visible){m=RK[q];break}
  if(!m)return;m.visible=true;m.position.set(x,y,z);
  rockets.push({m:m,x:x,y:y,z:z,dx:dx,dy:dy,dz:dz,l:en?6:3,e:en});
}
function fireRocket(dx,dy,dz,rx,rz){launch(P.x+dx*.9+rx*.18,P.y+1.5+dy*.9,P.z+dz*.9+rz*.18,dx,dy,dz,0)}
function botShot(b,ch,dmg,d){ /* 반환값 true = 플레이어 사망 */
  var sc=b.sc,ca=Math.cos(b.rot),sa=Math.sin(b.rot),k=b.fly?(b.tp==='mother'?1.5:.4):sc,gx=b.x+(ca*.3+sa*.9)*k,gz=b.z+(-sa*.3+ca*.9)*k,
      gy=b.y+(b.fly?(b.tp==='mother'?.9:.3):1.25*sc),ty=P.y+.95;
  b.fl=.07;sBot(b);
  /* 일부 사격은 드론 · 포탑을 노림 */
  if(drones.length&&Math.random()<.28){var dr=drones[Math.random()*drones.length|0],dy0=dr.y+(dr.tur?.8:0);
    if(Math.hypot(dr.x-gx,dr.z-gz)<40&&los(gx,gy,gz,dr.x,dy0,dr.z)){tracer(gx,gy,gz,dr.x,dy0,dr.z,0xff9f8a);if(Math.random()<Math.min(.8,ch+.25))hurtDrone(dr,dmg*1.3);return false}}
  if(!los(gx,gy,gz,P.x,ty,P.z)){ /* 엄폐물에 막힌 사격 */
    var bl=Math.hypot(P.x-gx,ty-gy,P.z-gz)||1,bx=(P.x-gx)/bl,by=(ty-gy)/bl,bz=(P.z-gz)/bl,bt=ray(gx,gy,gz,bx,by,bz,bl);
    if(bt<0)bt=bl;tracer(gx,gy,gz,gx+bx*bt,gy+by*bt,gz+bz*bt,0xff9f8a);puff(gx+bx*bt,gy+by*bt,gz+bz*bt,5,2.4,1,.85,.6,.3);sRico(gx+bx*bt,gz+bz*bt);
    return false;
  }
  var hitP=Math.random()<ch,off=hitP?.15:1.1;
  tracer(gx,gy,gz,P.x+(Math.random()-.5)*off*2,P.y+1.2+(Math.random()-.5)*off,P.z+(Math.random()-.5)*off*2,0xff9f8a);
  if(!hitP)sWhiz(sp(b.x,b.z).pan*-.6);
  if(hitP)hitBy=BT[b.tp].n;
  return hitP?hurtP(dmg,b.x,b.z):false;
}
/* 슈퍼 보스 단계: 66% 방어막과 첨탑 · 33% 폭주와 유성 · 주기적 증원 */
function overTick(b,dt){
  var ph=b.hp/b.mhp,q,n=0,c;
  if(!b.p2&&ph<.66){b.p2=1;b.inv=1;say('방어막 전개 · 동력 첨탑 3기 파괴');sRoar();
    var cs=SPAWN.filter(function(a){return a[2]===0}).sort(function(a,e){return Math.hypot((a[0]+.5)*CS-b.x,(a[1]+.5)*CS-b.z)-Math.hypot((e[0]+.5)*CS-b.x,(e[1]+.5)*CS-b.z)});
    for(q=1;q<4;q++)addBot('pylon',cs[q],1)}
  if(b.inv){for(q=0;q<bots.length;q++)if(bots[q].tp==='pylon'&&bots[q].die<=0)n++;if(!n){b.inv=0;say('방어막 해제');ringFx(b.x,b.y+1,b.z,0xc9a9ee,12,.7)}}
  if(!b.p3&&ph<.33){b.p3=1;b.sp*=1.6;say('군주 폭주');sRoar()}
  b.sm-=dt;if(b.sm<=0){b.sm=b.p3?9:13;if(bots.length<18)for(q=0;q<3;q++){c=SPAWN[Math.random()*SPAWN.length|0];addBot(pickType(wave,1),c)}}
  if(b.p3){b.mt-=dt;if(b.mt<=0){b.mt=2.6;for(q=0;q<3;q++){var mx=P.x+(Math.random()-.5)*7,mz=P.z+(Math.random()-.5)*7,f=floorAt(mx,mz,P.y+.5);
    if(f<50){booms.push({x:mx,y:f+.5,z:mz,t:1.25+q*.3,mode:1,r:ring(mx,f,mz,1.05),fall:1});sAir(mx,mz,q*.3)}}}}
}

/* 아이템 */
var ITEM={hp:'+35 체력',am:'탄약 보급',pw:'강화탄 10초',rk:'로켓 +3 · 4번 무기',dr:'지원 드론 +1',sl:'시간 감속 6초',sd:'방어막 +60',as:'공습 요청',ov:'과열 8초 · 무한 탄약',tu:'자동 포탑 설치',vp:'흡혈 12초',fz:'빙결 파동',nk:'전멸 폭탄'};
function mkItem(type){
  var g=new T.Group(),m,q,o;
  if(type==='hp'){m=new T.MeshLambertMaterial({color:0xa9cfa3,emissive:0x2c4a2a});box(.5,.16,.16,m,0,0,0,g);box(.16,.5,.16,m,0,0,0,g)}
  else if(type==='am'){m=new T.MeshLambertMaterial({color:0xd3bba3,emissive:0x4a3a26});box(.46,.26,.28,m,0,0,0,g);
    var mc=new T.MeshLambertMaterial({color:0x6b5a44});box(.48,.05,.3,mc,0,.05,0,g);
    for(q=0;q<3;q++){o=new T.Mesh(new T.CylinderGeometry(.035,.035,.16,8),mc);o.position.set(-.13+q*.13,.2,0);g.add(o)}}
  else if(type==='pw'){m=new T.MeshLambertMaterial({color:0xc0a9d6,emissive:0x4a3a66});g.add(new T.Mesh(new T.OctahedronGeometry(.28),m));
    o=new T.Mesh(new T.TorusGeometry(.38,.025,6,20),m);o.rotation.x=Math.PI/2;g.add(o)}
  else if(type==='rk'){m=new T.MeshLambertMaterial({color:0xe08f84,emissive:0x5a2a26});
    o=new T.Mesh(new T.CylinderGeometry(.09,.09,.42,10),m);g.add(o);o=new T.Mesh(new T.ConeGeometry(.09,.22,10),m);o.position.y=.32;g.add(o);
    box(.36,.14,.03,m,0,-.2,0,g);box(.03,.14,.36,m,0,-.2,0,g)}
  else if(type==='sl'){m=new T.MeshLambertMaterial({color:0x8fd0e6,emissive:0x1f4a5a}); /* 모래시계 */
    o=new T.Mesh(new T.ConeGeometry(.2,.3,12),m);o.position.y=.15;o.rotation.x=Math.PI;g.add(o);o=new T.Mesh(new T.ConeGeometry(.2,.3,12),m);o.position.y=-.15;g.add(o);
    box(.5,.04,.5,m,0,.32,0,g);box(.5,.04,.5,m,0,-.32,0,g)}
  else if(type==='sd'){m=new T.MeshLambertMaterial({color:0x7fa0e0,emissive:0x22335a}); /* 방패 */
    o=new T.Mesh(new T.CylinderGeometry(.3,.3,.07,6),m);o.rotation.x=Math.PI/2;g.add(o);box(.1,.36,.1,m,0,0,0,g);box(.36,.1,.1,m,0,0,0,g);
    o=new T.Mesh(new T.TorusGeometry(.32,.03,6,6),m);g.add(o)}
  else if(type==='as'){m=new T.MeshLambertMaterial({color:0xe6b04a,emissive:0x5a3c12}); /* 낙하 폭탄 */
    o=new T.Mesh(new T.SphereGeometry(.17,12,10),m);o.scale.y=1.5;g.add(o);o=new T.Mesh(new T.ConeGeometry(.1,.2,10),m);o.rotation.x=Math.PI;o.position.y=-.32;g.add(o);
    box(.4,.16,.03,m,0,.3,0,g);box(.03,.16,.4,m,0,.3,0,g)}
  else if(type==='ov'){m=new T.MeshLambertMaterial({color:0xe07fb0,emissive:0x5a2244}); /* 탄환 3발 */
    for(q=0;q<3;q++){var bx=Math.cos(q*2.09)*.14,bz=Math.sin(q*2.09)*.14;o=new T.Mesh(new T.CylinderGeometry(.06,.06,.3,10),m);o.position.set(bx,-.05,bz);g.add(o);
      o=new T.Mesh(new T.ConeGeometry(.06,.16,10),m);o.position.set(bx,.18,bz);g.add(o)}
    o=new T.Mesh(new T.TorusGeometry(.2,.025,6,16),m);o.rotation.x=Math.PI/2;o.position.y=-.08;g.add(o)}
  else if(type==='tu'){m=new T.MeshLambertMaterial({color:0xaab2c2,emissive:0x2a2e3a}); /* 포탑 */
    o=new T.Mesh(new T.CylinderGeometry(.14,.22,.2,10),m);o.position.y=-.2;g.add(o);box(.3,.2,.34,m,0,.02,0,g);
    for(q=-1;q<2;q+=2){o=new T.Mesh(new T.CylinderGeometry(.03,.03,.34,8),m);o.rotation.x=Math.PI/2;o.position.set(q*.08,.02,.3);g.add(o)}}
  else if(type==='vp'){m=new T.MeshLambertMaterial({color:0xd0506a,emissive:0x5a1626}); /* 물방울 */
    o=new T.Mesh(new T.SphereGeometry(.2,12,10),m);o.position.y=-.08;g.add(o);o=new T.Mesh(new T.ConeGeometry(.17,.34,12),m);o.position.y=.2;g.add(o)}
  else if(type==='fz'){m=new T.MeshLambertMaterial({color:0xbfe8ff,emissive:0x2a4a66}); /* 눈 결정 */
    for(q=0;q<3;q++){o=box(.62,.06,.06,m,0,0,0,g);o.rotation.z=q*1.047}o=new T.Mesh(new T.OctahedronGeometry(.13),m);g.add(o)}
  else if(type==='nk'){m=new T.MeshLambertMaterial({color:0xf2e96a,emissive:0x5a520e}); /* 전멸 폭탄 */
    g.add(new T.Mesh(new T.SphereGeometry(.2,14,10),m));for(q=0;q<3;q++){o=new T.Mesh(new T.TorusGeometry(.32,.022,6,22),m);o.rotation.set(q*1.047,q*.7,0);g.add(o)}}
  else{m=new T.MeshLambertMaterial({color:0x9fb4d6,emissive:0x2a3a5a});box(.3,.09,.3,m,0,0,0,g);box(.7,.03,.05,m,0,.03,0,g).rotation.y=.785;box(.7,.03,.05,m,0,.03,0,g).rotation.y=-.785;
    for(q=0;q<4;q++){o=new T.Mesh(new T.CylinderGeometry(.13,.13,.02,12),m);o.position.set(q&1?.25:-.25,.08,q&2?.25:-.25);g.add(o)}}
  var ring=new T.Mesh(new T.RingGeometry(.42,.5,20),new T.MeshBasicMaterial({color:m.color.getHex(),transparent:true,opacity:.55,side:T.DoubleSide,depthWrite:false}));
  ring.rotation.x=-Math.PI/2;ring.position.y=-.52;g.add(ring);g.userData.ring=ring;glow(m.color.getHex(),1.7,g,0);
  scene.add(g);return g;
}

/* ================= 상태 ================= */
var seen={grunt:1},state='menu',adsA=0,adsT=false,rmb=false,swT=0,nextW=0,P,bots=[],items=[],wave,kills,pend,flowT,hurt,hitM,recoil,bobT,bloom,kick,flashT,tNow=0,best=0;
var BKEY='ss_best_'+MDEF.id;
try{best=+localStorage.getItem(BKEY)||(MDEF.id==='inferno'?+localStorage.getItem('botarena3d_best'):0)||0}catch(e){}
function reset(){
  var q;for(q=0;q<bots.length;q++)killMesh(bots[q]);for(q=0;q<items.length;q++)scene.remove(items[q].g);
  for(q=0;q<DC.length;q++)DC[q].visible=false;
  P={x:(MDEF.start[0]+.5)*CS,z:(MDEF.start[1]+.5)*CS,y:0,vy:0,yaw:0,pitch:0,hp:100,mhp:100,gr:3,gc:0,dc:0,ds:0,dq:0,dvx:0,dvz:0,ac:0,mc:0,rsh:0,relE:false,dm:0,air:0,did:0,am:[24,6,5,0,META.own.flame?100:0,META.own.rail?3:0],rs:[72,18,15,0,META.own.flame?100:0,META.own.rail?6:0],cd:0,rel:0,pw:0,sh:0,ov:0,vp:0};
  for(q=0;q<DBN;q++){dbL[q]=0;debris.setMatrixAt(q,_dm.makeScale(0,0,0))}debris.instanceMatrix.needsUpdate=true;
  for(q=0;q<RF.length;q++){RF[q].l=0;RF[q].m.visible=false}for(q=0;q<PL.length;q++){PL[q].l=0;PL[q].m.visible=false}for(q=0;q<DN.length;q++){DN[q].l=0;DN[q].m.visible=false}
  tpT=0;tpLock=false;dirT=0;vpA=0;waveT=0;pkW=0;PK=newPK();ST={shots:0,hits:0,heads:0,kw:{},t:0,boss:0,bonus:0,perks:[],cause:'',banked:false};KW='';hitBy='';WM=null;wmT=0;wmDone=0;scene.fog.near=22;scene.fog.far=104;st('wtm','display','none');
  for(q=0;q<GR.length;q++)GR[q].visible=false;for(q=0;q<WR.length;q++)WR[q].visible=false;grenades=[];booms=[];slowT=0;ets=1;comboN=0;comboT=0;bulletT=0;hbT=0;stepD=0;
  for(q=0;q<COV.length;q++)if(COV[q].kind===2){COV[q].dead=0;COV[q].fz=0;COV[q].hp=50;COV[q].g.visible=true}
  adsA=0;adsT=false;rmb=false;swT=0;nextW=0;showGun(0);setAim();
  for(q=0;q<RK.length;q++)RK[q].visible=false;rockets=[];for(q=0;q<drones.length;q++)scene.remove(drones[q].m.g);drones=[];shake=0;boomA=0;bossB=null;seen={grunt:1};
  for(q=0;q<EX.length;q++){EX[q].l=0;EX[q].g.visible=false}for(q=0;q<SC.length;q++){SC[q].l=0;SC[q].m.visible=false}
  bots=[];items=[];wave=0;kills=0;pend=.01;flowT=0;hurt=0;hitM=0;recoil=0;bobT=0;bloom=0;kick=0;flashT=0;hudC='';
}
var INTRO={2:'rusher',3:'bomber',4:'sniper',5:'shield',6:'flyer',7:'stalker',8:'heavy',9:'gren',11:'medic',12:'split'},
    POOL=[['grunt',1,30],['rusher',2,16],['bomber',3,12],['sniper',4,10],['shield',5,11],['flyer',6,13],['stalker',7,10],['heavy',8,6],['gren',9,9],['medic',11,6],['split',12,8]],
    BOSSES=['boss','mother','crusher'];
function pickType(w,i){
  if(i===0&&INTRO[w])return INTRO[w];
  if(w>=10&&w%5===0&&i<2)return 'heavy';
  var t=0,q,r;for(q=0;q<POOL.length;q++)if(w>=POOL[q][1])t+=POOL[q][2];
  r=Math.random()*t;for(q=0;q<POOL.length;q++)if(w>=POOL[q][1]){r-=POOL[q][2];if(r<0)return POOL[q][0]}
  return 'grunt';
}
function bossFor(w){return w%25===0?'over':w%10===0?BOSSES[(w/10-1)%3]:null}
function addBot(tp,c,hpMul,el){
  var cf=BT[tp],hm=(hpMul||1+.06*(wave-1))*(el?2.2:1)*DFH[CFG.diff],
  b={tp:tp,sc:cf.sc*(el?1.2:1),r:cf.r,rng:cf.rng,fly:cf.fly,boss:cf.boss,el:el,x:(c[0]+.5)*CS+(Math.random()-.5)*.6,z:(c[1]+.5)*CS+(Math.random()-.5)*.6,
    y:c[2]+(cf.fly?(tp==='mother'?7.5:4.5):0),vy:0,hp:cf.hp*hm,mhp:cf.hp*hm,hr:cf.fly?(tp==='mother'?2.3:1.15):0,ls:9,cd:.6+Math.random(),
    sd:Math.random()<.5?1:-1,st:1,hit:0,fl:0,die:0,los:false,sp:Math.min(5.8,3.7+wave*.2)*cf.spd,ph:Math.random()*6,rot:0,bn:5,ch:0,sk:0,wig:0,wx:0,wz:0,pm:0,
    rc:2,sl:0,sm:8,mt:1,frz:0,inv:0,im:0,dash:0,dh:0,dx:0,dz:0,hc:0,tg:null,gc:4,m:mkBot(tp)};
  if(el)b.m.g.scale.setScalar(1.2);
  if(tp!=='mite')pillar(b.x,c[2],b.z,cf.boss?0xc9a9ee:tp==='pylon'?0xc9a9ee:0xff8a78);
  bots.push(b);return b;
}
function spawnWave(){
  /* 웨이브 변형: 4웨이브부터 30% 확률(보스 웨이브 제외) */
  scene.fog.near=22;scene.fog.far=104;st('wtm','display','none');WM=null;wmDone=0;
  if(!bossFor(wave+1)&&wave+1>=4&&Math.random()<.3)WM=['fog','elite','barrel','timed'][Math.random()*4|0];
  wave++;waveT=0;var bt=bossFor(wave),alive=0,q,c,t,tp,nw='',dd;for(q=0;q<bots.length;q++)if(bots[q].die<=0)alive++;
  var n=Math.max(0,Math.min(bt?Math.min(8,3+(wave/5|0)):Math.min(14,3+wave),24-alive));
  if(bt){ /* 보스 */
    t=0;do{c=SPAWN[Math.random()*SPAWN.length|0];t++}while(t<60&&(c[2]>0||Math.hypot((c[0]+.5)*CS-P.x,(c[1]+.5)*CS-P.z)<26));
    bossB=addBot(bt,c,bt==='over'?Math.max(1,wave/25):1+(wave-10)/25);sRoar();ringFx(bossB.x,0,bossB.z,0xc9a9ee,14,.9);
  }
  if(WM==='elite')n=Math.ceil(n*.6);
  if(WM==='fog'){scene.fog.near=3;scene.fog.far=30}
  if(WM==='timed')wmT=35;
  if(WM==='barrel'){for(q=0;q<COV.length;q++)if(COV[q].kind===2&&COV[q].dead){COV[q].dead=0;COV[q].fz=0;COV[q].hp=50;COV[q].g.visible=true}
    for(q=0;q<3;q++){t=0;do{c=SPAWN[Math.random()*SPAWN.length|0];t++}while(t<40&&Math.hypot((c[0]+.5)*CS-P.x,(c[1]+.5)*CS-P.z)<14);addBot('bomber',c)}}
  for(q=0;q<n;q++){
    tp=pickType(wave,bt?q+1:q);if(!seen[tp]){seen[tp]=1;nw=BT[tp].n}
    t=0;do{c=SPAWN[Math.random()*SPAWN.length|0];t++;dd=Math.hypot((c[0]+.5)*CS-P.x,(c[1]+.5)*CS-P.z)}while(t<50&&(dd<14||dd>(t<30?46:999)||(tp==='heavy'&&c[2]>0)));
    addBot(tp,c,0,tp!=='mite'&&(WM==='elite'?Math.random()<.5:wave>=6&&Math.random()<.1));
  }
  if(wave%5===0)for(q=0;q<COV.length;q++)if(COV[q].kind===2&&COV[q].dead){COV[q].dead=0;COV[q].fz=0;COV[q].hp=50;COV[q].g.visible=true}
  say('웨이브 '+wave+(bt?(bt==='over'?' · 슈퍼 보스 ':' · 보스 ')+BT[bt].n+' 출현':WM?' · 변형: '+{fog:'짙은 안개',elite:'정예 부대',barrel:'폭발물 지대',timed:'35초 내 섬멸'}[WM]:nw?' · '+nw+' 출현':''));if(!bt)sWave();
}
var msgT=0,noteT=0;
function say(t){$('msg').textContent=t;msgT=1.6}
function note(t){$('note').textContent=t;noteT=1.3}

/* ================= 소리 ================= */
/* 합성음: 압축기 → 마스터, 잔향 버스, 좌우 패닝과 거리 감쇠 */
var AC=null,snd=true,NB=null,MG=null,RV=null,DG=null;
function initAudio(){
  if(AC)return;
  try{
    AC=new (window.AudioContext||window.webkitAudioContext)();
    var q,d,len=AC.sampleRate,cmp=AC.createDynamicsCompressor();
    NB=AC.createBuffer(1,len,AC.sampleRate);d=NB.getChannelData(0);for(q=0;q<len;q++)d[q]=Math.random()*2-1;
    MG=AC.createGain();MG.gain.value=snd?.9*CFG.vol:0;MG.connect(cmp);cmp.connect(AC.destination);
    var il=AC.sampleRate*1.7|0,ib=AC.createBuffer(2,il,AC.sampleRate),c2,cvn=AC.createConvolver();
    for(c2=0;c2<2;c2++){d=ib.getChannelData(c2);for(q=0;q<il;q++)d[q]=(Math.random()*2-1)*Math.pow(1-q/il,2.8)}
    cvn.buffer=ib;RV=AC.createGain();RV.gain.value=.5;RV.connect(cvn);cvn.connect(MG);
    /* 바람 소리 · 드론 구동음 */
    var w=AC.createBufferSource(),wf=AC.createBiquadFilter(),wg=AC.createGain();w.buffer=NB;w.loop=true;wf.type='lowpass';wf.frequency.value=320;wg.gain.value=.05;
    w.connect(wf);wf.connect(wg);wg.connect(MG);w.start();
    var o=AC.createOscillator(),o2=AC.createOscillator(),of=AC.createBiquadFilter();o.type='sawtooth';o.frequency.value=92;o2.type='sawtooth';o2.frequency.value=139;
    of.type='lowpass';of.frequency.value=420;DG=AC.createGain();DG.gain.value=0;o.connect(of);o2.connect(of);of.connect(DG);DG.connect(MG);o.start();o2.start();
  }catch(e){AC=null}
}
function route(g,o){
  var last=g;
  if(o.pan&&AC.createStereoPanner){var p=AC.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,o.pan));g.connect(p);last=p}
  last.connect(MG);if(o.rev){var r=AC.createGain();r.gain.value=o.rev;last.connect(r);r.connect(RV)}
}
function env(g,t,vol,dur,a){g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(Math.max(.0002,vol),t+(a||.004));g.gain.exponentialRampToValueAtTime(.0001,t+dur)}
function tone(type,f0,f1,dur,vol,o){
  if(!snd||!AC||vol<.004)return;o=o||{};
  try{var t=AC.currentTime+(o.d||0),os=AC.createOscillator(),g=AC.createGain();os.type=type;
    os.frequency.setValueAtTime(Math.max(20,f0),t);os.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
    env(g,t,vol,dur,o.a);os.connect(g);route(g,o);os.start(t);os.stop(t+dur+.03)}catch(e){}
}
function nz(dur,vol,ft,f0,f1,o){
  if(!snd||!AC||!NB||vol<.004)return;o=o||{};
  try{var t=AC.currentTime+(o.d||0),sr=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();sr.buffer=NB;sr.loop=true;
    f.type=ft;f.Q.value=o.q||.8;f.frequency.setValueAtTime(Math.max(30,f0),t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);
    env(g,t,vol,dur,o.a);sr.connect(f);f.connect(g);route(g,o);sr.start(t,Math.random()*.8);sr.stop(t+dur+.03)}catch(e){}
}
function beep(f0,f1,t,v,type){tone(type||'square',f0,f1,t,v)}
function bang(v,fq,dur){nz(dur||.16,v,'lowpass',fq,fq*.5);tone('sine',160,45,.1,v*.7)}
/* 위치 → 패닝 · 감쇠 */
function sp(x,z,rev){var dx=x-P.x,dz=z-P.z,d=Math.hypot(dx,dz);return {pan:d<.6?0:(dx*Math.cos(P.yaw)-dz*Math.sin(P.yaw))/d*.85,att:1/(1+d/12),rev:rev||0,d:0}}
function sShot(w){
  if(w===5){nz(.5,.5,'bandpass',5000,300,{q:1.5,rev:.9});tone('sawtooth',1800,90,.35,.3,{rev:.7});tone('sine',90,30,.4,.6);tone('square',3200,3200,.05,.1);return}
  if(w===0){nz(.08,.3,'highpass',1100,500,{rev:.25});nz(.17,.24,'lowpass',2800,420,{rev:.35});tone('triangle',200,52,.09,.34);tone('square',2600,900,.018,.05)}
  else if(w===1){nz(.32,.55,'lowpass',1500,150,{rev:.6});tone('sine',125,36,.26,.6);nz(.07,.32,'highpass',1700,800);
    nz(.05,.16,'bandpass',1900,1500,{d:.3,q:3});nz(.06,.18,'bandpass',1150,900,{d:.45,q:3});tone('square',240,180,.03,.05,{d:.45})}
  else if(w===2){nz(.12,.55,'highpass',1300,280,{rev:.8});nz(.55,.4,'lowpass',3400,170,{rev:.9});tone('sine',155,30,.32,.6);
    nz(.04,.13,'bandpass',2500,2100,{d:.5,q:4});nz(.05,.15,'bandpass',1500,1250,{d:.7,q:4})}
  else{nz(.55,.42,'bandpass',260,2600,{q:1.1,rev:.5});tone('sawtooth',80,250,.4,.2);nz(.14,.34,'lowpass',900,180);tone('sine',70,40,.2,.4)}
}
function sBoom(x,z,k){
  var o=sp(x,z,.9),a=Math.min(1,o.att*2.2)*k,q;
  nz(1.15,.75*a,'lowpass',1000,55,o);tone('sine',115,23,.95,.85*a,{pan:o.pan});tone('triangle',62,27,1.15,.42*a,{pan:o.pan,rev:.5});nz(.1,.5*a,'highpass',900,300,o);
  for(q=0;q<6;q++)nz(.05,.16*a,'highpass',2400+Math.random()*2500,1500,{pan:o.pan+(Math.random()-.5)*.6,d:.12+q*.07+Math.random()*.06});
}
function sBot(b){
  var o=sp(b.x,b.z,.35),a=o.att*1.6,tp=b.tp;
  if(tp==='heavy'||b.boss&&!b.fly){nz(.1,.3*a,'lowpass',900,300,o);tone('triangle',120,48,.08,.3*a,{pan:o.pan})}
  else if(tp==='sniper'){nz(.4,.4*a,'lowpass',3200,200,sp(b.x,b.z,.9));nz(.08,.3*a,'highpass',1400,500,o);tone('sine',150,34,.25,.4*a,{pan:o.pan})}
  else if(b.fly){tone('square',tp==='mother'?700:1500,tp==='mother'?220:480,.09,.1*a,{pan:o.pan});nz(.05,.08*a,'highpass',3000,2000,o)}
  else if(tp==='shield'){nz(.07,.24*a,'lowpass',2200,700,o);tone('triangle',260,90,.06,.2*a,{pan:o.pan})}
  else{nz(.11,.26*a,'lowpass',1700,450,o);tone('triangle',180,58,.08,.22*a,{pan:o.pan})}
}
function sWhiz(pan){nz(.13,.11,'bandpass',3400,800,{q:7,pan:pan})}
function sRico(x,z){var o=sp(x,z);tone('sine',2300+Math.random()*1500,800,.18,.07*o.att*2,{pan:o.pan});nz(.04,.14*o.att*2,'highpass',3200,2000,o)}
function sReload(w){
  var r=relT(w);
  if(w===1){for(var q=0;q<3;q++){nz(.04,.15,'bandpass',1300,1000,{d:.2+q*r*.22,q:3});tone('square',210,160,.03,.05,{d:.2+q*r*.22})}
    nz(.05,.17,'bandpass',1900,1500,{d:r-.3,q:3});nz(.06,.19,'bandpass',1150,900,{d:r-.15,q:3})}
  else if(w===3){nz(.1,.16,'bandpass',600,300,{d:.25,q:2});tone('sine',150,90,.12,.2,{d:r*.55});nz(.08,.2,'bandpass',900,500,{d:r*.55,q:2});nz(.05,.16,'bandpass',1800,1400,{d:r-.2,q:4})}
  else{nz(.04,.17,'bandpass',1500,1100,{d:.12,q:3});tone('square',330,220,.03,.05,{d:.12});
    nz(.05,.2,'bandpass',950,700,{d:r*.55,q:2.5});tone('square',185,140,.04,.07,{d:r*.55});
    nz(.035,.17,'bandpass',2300,1900,{d:r-.26,q:4});nz(.045,.19,'bandpass',1400,1100,{d:r-.14,q:4})}
}
function sSwitch(){nz(.09,.1,'bandpass',600,1500,{q:1});tone('square',270,200,.03,.045,{d:.09});nz(.04,.1,'bandpass',1700,1300,{d:.2,q:3})}
function sHit(head){tone('sine',head?1950:1350,head?1500:1000,.06,.1);if(head){tone('triangle',2700,2700,.14,.07,{d:.03});tone('sine',3600,3600,.1,.035,{d:.05})}}
function sKill(b){var o=sp(b.x,b.z);tone('sawtooth',170,40,.3,.1*Math.min(1,o.att*2),{pan:o.pan});tone('sine',640,960,.1,.08);tone('sine',960,1280,.13,.07,{d:.07})}
function sHurt(sh){if(sh){tone('sine',1500,500,.14,.14);nz(.08,.12,'highpass',2500,1500)}else{tone('sine',150,55,.22,.42);nz(.1,.22,'lowpass',600,200)}}
function sStep(up){nz(.07,.06,'lowpass',up?620:340,120);tone('sine',up?120:82,50,.06,.07)}
function sPick(t){
  var m={hp:[523,659,784],am:[330,330,440],pw:[440,554,740],rk:[196,262,330],dr:[660,880,1320],sl:[880,660,440],sd:[392,523,784],as:[262,392,523],ov:[587,740,988]}[t]||[523,659,784],q;
  for(q=0;q<3;q++)tone(t==='am'||t==='rk'?'square':'triangle',m[q],m[q],.16,t==='am'||t==='rk'?.05:.09,{d:q*.07,rev:.3});
}
function sCharge(b,dur){var o=sp(b.x,b.z);tone('sawtooth',300,1700,dur,.06*Math.min(1,o.att*2.4),{pan:o.pan,a:dur*.6})}
function sBeep(b){var o=sp(b.x,b.z);tone('square',1850,1850,.05,.1*Math.min(1,o.att*2.5),{pan:o.pan})}
function sSlash(b){var o=sp(b.x,b.z);o.q=2;nz(.13,.24,'bandpass',2600,600,o);tone('sawtooth',700,200,.08,.06,{pan:o.pan})}
function sRoar(){tone('sawtooth',72,38,1.5,.5,{rev:.9,a:.25});tone('sawtooth',108,56,1.5,.3,{rev:.9,a:.25});nz(1.3,.3,'lowpass',420,90,{rev:.9,a:.2})}
function sWave(){tone('triangle',220,220,.2,.12,{rev:.4});tone('triangle',330,330,.34,.12,{d:.2,rev:.4})}
function sClear(){[392,523,659,784].forEach(function(f,q){tone('triangle',f,f,.22,.09,{d:q*.09,rev:.4})})}
function sHeart(){tone('sine',72,40,.12,.5);tone('sine',62,38,.12,.36,{d:.22})}
function sCombo(n){var f=440*Math.pow(1.19,Math.min(n,6));tone('square',f,f,.09,.06,{rev:.3});tone('square',f*1.5,f*1.5,.14,.06,{d:.08,rev:.3})}
function sSlow(on){if(on){tone('sine',900,110,.9,.2,{rev:.6});nz(.9,.12,'lowpass',2500,150,{rev:.6})}else tone('sine',130,800,.5,.14,{rev:.4})}
function sShieldHit(x,z){var o=sp(x,z);tone('sine',1700,2400,.09,.1*Math.min(1,o.att*2.5),{pan:o.pan});nz(.05,.16*Math.min(1,o.att*2.5),'highpass',3500,2500,o)}
function sAir(x,z,d){var o=sp(x,z);tone('sine',2600,420,1,.09*Math.min(1,o.att*2.5),{pan:o.pan,d:d,a:.3})}
function sLob(b){var o=sp(b.x,b.z);tone('sine',320,110,.14,.24*Math.min(1,o.att*2),{pan:o.pan});nz(.08,.2*Math.min(1,o.att*2),'lowpass',900,300,o)}
function sPad(){tone('sine',220,900,.26,.2);tone('triangle',330,1350,.26,.1);nz(.2,.1,'bandpass',500,2500,{q:1.5})}
function sTele(){nz(.45,.2,'bandpass',300,3200,{q:2,rev:.6});tone('sine',1300,180,.4,.14,{rev:.6});tone('sine',180,1300,.35,.08,{d:.1,rev:.6})}
function sFreeze(){tone('sine',2300,3400,.5,.1,{rev:.8});tone('triangle',3100,4200,.6,.06,{d:.05,rev:.8});nz(.6,.16,'highpass',6000,3000,{rev:.8})}
function sDash(b){var o=sp(b.x,b.z,.5);o.q=1;nz(.8,.5*Math.min(1,o.att*2.5),'bandpass',200,1800,o);tone('sawtooth',60,180,.7,.3*Math.min(1,o.att*2.5),{pan:o.pan})}
function sDrone(x,z){var o=sp(x,z);tone('square',1250,700,.06,.045,{pan:o.pan});nz(.04,.05,'highpass',3000,2200,o)}
document.addEventListener('visibilitychange',function(){if(!AC)return;try{if(document.hidden)AC.suspend();else AC.resume()}catch(e){}});

/* ================= 입력 ================= */
var K={},firing=false,joyId=null,jx0=0,jy0=0,jx=0,jy=0,lookId=null,lx=0,ly=0,fireId=null,touchAim=false;
var DEF={fwd:'KeyW',back:'KeyS',left:'KeyA',right:'KeyD',fire:'Space',rel:'KeyR',aim:'KeyF',next:'KeyQ',w1:'Digit1',w2:'Digit2',w3:'Digit3',w4:'Digit4',w5:'Digit5',w6:'Digit6',alt:'KeyX',melee:'KeyV',jump:'KeyE',dash:'ShiftLeft',gren:'KeyG',pause:'KeyP',lL:'ArrowLeft',lR:'ArrowRight',lU:'ArrowUp',lD:'ArrowDown'},
    ANAME={fwd:'전진',back:'후진',left:'좌 이동',right:'우 이동',fire:'사격',rel:'재장전',aim:'정조준',next:'다음 무기',w1:'소총',w2:'산탄총',w3:'저격총',w4:'로켓런처',w5:'화염방사기',w6:'레일건',alt:'보조 사격',melee:'근접 공격',jump:'점프',dash:'대시',gren:'수류탄',pause:'일시정지',lL:'조준 좌',lR:'조준 우',lU:'조준 상',lD:'조준 하'},
    BIND={},ACT={},cap=null;
function mapB(){ACT={};for(var a in BIND)if(BIND[a])ACT[BIND[a]]=a}
function loadB(){var o={},a;try{o=JSON.parse(localStorage.getItem('botarena3d_keys'))||{}}catch(e){}
  for(a in DEF)BIND[a]=typeof o[a]==='string'?o[a]:DEF[a];mapB()}
function saveB(){mapB();try{localStorage.setItem('botarena3d_keys',JSON.stringify(BIND))}catch(e){}}
function keyName(c){
  if(!c)return '미지정';
  var m={ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',ArrowDown:'↓',Space:'Space',ShiftLeft:'왼쪽 Shift',ShiftRight:'오른쪽 Shift',ControlLeft:'왼쪽 Ctrl',ControlRight:'오른쪽 Ctrl',AltLeft:'왼쪽 Alt',AltRight:'오른쪽 Alt'};
  return m[c]||c.replace(/^Key|^Digit/,'').replace(/^Numpad/,'숫자패드 ');
}
function drawKeys(){
  var box=$('klist'),a;box.textContent='';
  for(a in DEF)(function(a){
    var l=document.createElement('label'),sp=document.createElement('span'),b=document.createElement('button');
    sp.textContent=ANAME[a];b.type='button';b.className='kb';b.textContent=cap===a?'키 입력 대기':keyName(BIND[a]);
    if(cap===a)b.classList.add('on');
    b.setAttribute('aria-label',ANAME[a]+' 키: '+b.textContent);
    b.addEventListener('click',function(){cap=cap===a?null:a;drawKeys();var n=box.querySelector('.on');if(n)n.focus()});
    l.appendChild(sp);l.appendChild(b);box.appendChild(l);
  })(a);
}
addEventListener('keydown',function(e){
  if(!cap)return;
  e.preventDefault();e.stopPropagation();
  var a=cap,o;cap=null;
  if(e.code!=='Escape'&&e.code){for(o in BIND)if(BIND[o]===e.code)BIND[o]='';BIND[a]=e.code;saveB()}
  drawKeys();var bs=$('klist').querySelectorAll('.kb'),i=Object.keys(DEF).indexOf(a);if(bs[i])bs[i].focus();
},true);
loadB();
function setAim(){var a=$('aim');a.setAttribute('aria-pressed',adsT);a.classList.toggle('on',adsT)}
function cycle(d){var N=WP.length;for(var k=1;k<N;k++){var n=(CUR+d*k+N*2)%N;if(n<3||P.am[n]+P.rs[n]>0){switchTo(n);return}}}
function switchTo(n){if(state!=='play'||n===CUR||swT>0)return;if(n>=WP.length)return;if(n>=3&&P.am[n]+P.rs[n]<=0){note(n===3?'로켓 없음':META.own[WP[n].own]?'탄약 없음':'해금 필요');return}P.rsh=0;nextW=n;swT=.26;P.rel=0;adsT=false;setAim();sSwitch()}
function look(dx,dy,s){s*=cam.fov/BF*CFG.sens;P.yaw-=dx*s;P.pitch=Math.max(-1.3,Math.min(1.3,P.pitch-dy*s))}
addEventListener('keydown',function(e){
  if(cap)return;
  if(state==='pick'){var n=e.code==='Digit1'||e.code==='Numpad1'?0:e.code==='Digit2'||e.code==='Numpad2'?1:e.code==='Digit3'||e.code==='Numpad3'?2:-1;if(n>=0){e.preventDefault();choose(n)}return}
  if(e.code==='Escape'&&state==='play'){pause();return}
  var a=ACT[e.code];if(state!=='play'||!a)return;
  K[a]=1;e.preventDefault();if(e.repeat)return;
  if(a==='alt')altFire();else if(a==='melee')melee();else if(a==='jump')jump();else if(a==='dash')dash();else if(a==='gren')throwG();else if(a==='pause')pause();
  else if(a==='rel')reload();else if(a==='aim'){adsT=!adsT;setAim()}else if(a==='next')cycle(1);
  else if(/^w\d$/.test(a))switchTo(+a.charAt(1)-1);
});
addEventListener('keyup',function(e){var a=ACT[e.code];if(a)K[a]=0});
addEventListener('blur',function(){K={};firing=false;rmb=false});
/* 포인터 잠금 해제(Esc) · 탭 전환 시 자동 일시정지 */
document.addEventListener('pointerlockchange',function(){if(!locked()&&state==='play'&&!touchAim)pause()});
document.addEventListener('visibilitychange',function(){if(document.hidden)pause()});
/* 눌린 버튼 상태를 매 이벤트에서 직접 읽음: 우클릭을 누른 채 좌클릭해도 인식 */
function mouseBtn(e){firing=!!(e.buttons&1);rmb=!!(e.buttons&2)}
function locked(){return document.pointerLockElement===cv}
cv.addEventListener('pointerdown',function(e){
  if(state!=='play')return;
  e.preventDefault();
  try{cv.setPointerCapture(e.pointerId)}catch(_){}
  if(e.pointerType==='mouse'){
    if(!locked()){try{var p=cv.requestPointerLock();if(p&&p.catch)p.catch(function(){})}catch(_){}}
    mouseBtn(e);if(e.button===1)altFire();lookId=e.pointerId;lx=e.clientX;ly=e.clientY;touchAim=false;
  }else{
    document.body.classList.add('touch');touchAim=true;lastTouch=Date.now();
    if(e.clientX<innerWidth/2&&joyId===null){
      joyId=e.pointerId;jx0=e.clientX;jy0=e.clientY;jx=jy=0;
      var J=$('joy');J.style.display='block';J.style.left=jx0+'px';J.style.top=jy0+'px';$('knob').style.transform='';
    }else if(lookId===null){lookId=e.pointerId;lx=e.clientX;ly=e.clientY}
  }
});
cv.addEventListener('pointermove',function(e){
  if(state!=='play')return;
  if(e.pointerType==='mouse'){
    mouseBtn(e);
    if(locked())look(e.movementX||0,e.movementY||0,.0024);
    else if(lookId===e.pointerId&&e.buttons){look(e.clientX-lx,e.clientY-ly,.005);lx=e.clientX;ly=e.clientY}
    return;
  }
  if(e.pointerId===joyId){
    var dx=e.clientX-jx0,dy=e.clientY-jy0,d=Math.hypot(dx,dy),m=48;
    if(d>m){dx*=m/d;dy*=m/d}
    jx=dx/m;jy=dy/m;$('knob').style.transform='translate('+dx+'px,'+dy+'px)';
  }else if(e.pointerId===lookId){look(e.clientX-lx,e.clientY-ly,.0055);lx=e.clientX;ly=e.clientY}
});
function pUp(e){
  if(e.pointerType==='mouse'){mouseBtn(e);if(!e.buttons)lookId=null;return}
  if(e.pointerId===joyId){joyId=null;jx=jy=0;$('joy').style.display='none'}
  if(e.pointerId===lookId)lookId=null;
}
cv.addEventListener('pointerup',pUp);cv.addEventListener('pointercancel',pUp);
var lastTouch=0;
cv.addEventListener('contextmenu',function(e){e.preventDefault()});
var FB=$('fire'),flx=0,fly=0;
FB.addEventListener('pointerdown',function(e){
  e.preventDefault();firing=true;touchAim=e.pointerType!=='mouse';fireId=e.pointerId;flx=e.clientX;fly=e.clientY;FB.classList.add('on');
  try{FB.setPointerCapture(e.pointerId)}catch(_){}
});
FB.addEventListener('pointermove',function(e){
  if(e.pointerId===fireId&&state==='play'){look(e.clientX-flx,e.clientY-fly,.0055);flx=e.clientX;fly=e.clientY}
});
function fUp(){firing=false;fireId=null;FB.classList.remove('on')}
FB.addEventListener('pointerup',fUp);FB.addEventListener('pointercancel',fUp);
FB.addEventListener('keydown',function(e){if(e.code==='Enter')firing=true});
FB.addEventListener('keyup',function(e){if(e.code==='Enter')firing=false});
/* 터치 버튼은 pointerdown에서 바로 실행합니다. click은 한 손가락이 이미 화면에 닿아 있으면 발생하지 않습니다.
   키보드로 누른 경우(detail 0)만 click으로 처리합니다. */
function tap(id,fn){
  var e=$(id);
  e.addEventListener('pointerdown',function(ev){ev.preventDefault();ev.stopPropagation();lastTouch=Date.now();fn()});
  e.addEventListener('click',function(ev){if(ev.detail===0)fn()});
}
tap('rel',function(){reload()});tap('aim',function(){if(state==='play'){adsT=!adsT;setAim()}});tap('wpn',function(){cycle(1)});
tap('jmp',jump);tap('dsh',dash);tap('grn',throwG);tap('alt',altFire);tap('pz',pause);
cv.addEventListener('wheel',function(e){cycle(e.deltaY>0?1:-1)},{passive:true});
if(window.matchMedia&&matchMedia('(pointer:coarse)').matches)document.body.classList.add('touch');

function magOf(w){return Math.round(WP[w].mag*PK.mag)}
function relT(w){return WP[w].rel/PK.rel}
function shellT(){return .42/PK.rel}
function reload(){
  if(state!=='play'||P.rel>0||swT>0||P.am[CUR]>=magOf(CUR)||P.rs[CUR]<=0)return;
  P.relE=P.am[CUR]<=0; /* 빈 탄창에서 시작하면 노리쇠 조작 추가 */
  if(CUR===1){P.rel=shellT()+.22;P.rsh=1;nz(.09,.1,'bandpass',600,1400,{q:1})} /* 산탄총: 한 발씩 */
  else{P.rel=relT(CUR);P.dm=0;sReload(CUR)}
}
function sShell(){nz(.045,.16,'bandpass',1300,1000,{q:3});tone('square',210,160,.03,.05)}
function sPump(){nz(.05,.17,'bandpass',1900,1500,{q:3});nz(.06,.19,'bandpass',1150,900,{d:.14,q:3})}
/* 보조 사격: 소총 유탄 · 산탄총 2발 동시 · 저격총 관통탄 */
function altFire(){
  if(state!=='play'||P.rel>0||swT>0)return;
  if(CUR===0){
    if(P.ac>0){note('유탄 준비 중');return}
    var m=null,q;for(q=0;q<GR.length;q++)if(!GR[q].visible){m=GR[q];break}
    if(!m)return;
    var cp=Math.cos(P.pitch),dx=-Math.sin(P.yaw)*cp,dy=Math.sin(P.pitch),dz=-Math.cos(P.yaw)*cp;
    P.ac=5;m.visible=true;gzV+=1.6;gpV+=2.2;nz(.2,.3,'lowpass',700,160,{rev:.4});tone('sine',180,60,.16,.3);hudC='';
    grenades.push({m:m,x:P.x+dx*.8,y:P.y+1.5+dy*.8,z:P.z+dz*.8,vx:dx*30,vy:dy*30+2,vz:dz*30,fuse:-1,r:null,pl:1,imp:1});
  }else if(CUR===1||CUR===2){
    if(P.cd>0)return;
    if(P.am[CUR]<2){note('탄약 2발 필요');return}
    shoot(true);
  }else note('보조 사격 없음');
}
function melee(){
  if(state!=='play'||P.mc>0)return;
  P.mc=.55;melA=1;var fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),q,b,dx,dz,d,hit=false,l=bots.slice();
  nz(.12,.2,'bandpass',2200,500,{q:2});KW='근접';
  for(q=0;q<l.length;q++){b=l[q];if(b.die>0)continue;dx=b.x-P.x;dz=b.z-P.z;d=Math.hypot(dx,dz);
    if(d<2.7*(b.boss?1.6:1)&&(d<.6||(dx*fx+dz*fz)/d>.45)&&Math.abs(b.y-P.y)<2.6){hit=true;dmgBot(b,90*PK.dmg*(P.pw>0?2:1),b.x,b.y+(b.fly?.5:1.3*b.sc),b.z,false,0)}}
  if(hit){hitM=.14;tone('sine',160,60,.12,.3);if(!RM)shake=Math.max(shake,.25)}
}
/* 점프 · 대시 · 수류탄 */
function jump(){if(state==='play'&&P.vy===0){P.y+=.06;P.vy=8.2;tone('sine',240,420,.1,.07);nz(.08,.06,'lowpass',500,200)}}
function dash(){if(state==='play'&&P.dc<=0){P.dq=1}}
function throwG(){
  if(state!=='play'||P.gc>0)return;
  if(P.gr<=0){note('수류탄 없음');return}
  var m=null,q;for(q=0;q<GR.length;q++)if(!GR[q].visible){m=GR[q];break}
  if(!m)return;
  var cp=Math.cos(P.pitch),dx=-Math.sin(P.yaw)*cp,dy=Math.sin(P.pitch),dz=-Math.cos(P.yaw)*cp;
  P.gr--;P.gc=.6;m.visible=true;sLob(P);hudC='';
  grenades.push({m:m,x:P.x+dx*.6,y:P.y+1.5+dy*.6,z:P.z+dz*.6,vx:dx*13,vy:dy*13+4,vz:dz*13,fuse:-1,r:null,pl:1});
}
/* 일시정지 */
function pause(){
  if(state!=='play')return;
  state='pause';firing=false;rmb=false;K={};joyId=lookId=null;jx=jy=0;$('joy').style.display='none';
  try{if(document.exitPointerLock)document.exitPointerLock()}catch(e){}
  $('ttl').textContent='일시정지';$('subt').textContent=MDEF.name+' · 웨이브 '+Math.max(1,wave)+' · 처치 '+kills;
  $('res').hidden=true;$('go').textContent='계속';$('rst').hidden=false;$('ov').hidden=false;$('go').focus();
}
function resume(){if(state!=='pause')return;state='play';$('ov').hidden=true;$('rst').hidden=true;acc=0;try{cv.focus()}catch(e){}}
/* 강화 선택: 2웨이브마다 3개 중 1개 */
var PERKS=[
  ['화력 증폭','모든 무기와 로켓 피해 +15%',function(){PK.dmg*=1.15}],
  ['속사 기구','연사 속도 +12%',function(){PK.rate*=1.12}],
  ['빠른 손','재장전 시간 20% 단축',function(){PK.rel*=1.25}],
  ['확장 탄창','탄창 용량 +25%',function(){PK.mag*=1.25}],
  ['강화 장갑','최대 체력 +25, 즉시 25 회복',function(){P.mhp+=25;P.hp=Math.min(P.mhp,P.hp+25)}],
  ['경량 장비','이동 속도 +8%',function(){PK.spd*=1.08}],
  ['드론 개조','드론·포탑 체력과 화력 +30%',function(){PK.dr*=1.3;for(var q=0;q<drones.length;q++){drones[q].mhp*=1.3;drones[q].hp*=1.3}}],
  ['보급 방어막','웨이브 시작마다 방어막 +20',function(){PK.shw+=20;P.sh=Math.min(120,P.sh+20)}],
  ['폭파병','수류탄 최대 +2, 즉시 2개 보급',function(){PK.grx+=2;P.gr+=2}],
  ['추진기','대시 재사용 대기 30% 단축',function(){PK.dash*=.7}],
  ['연쇄 폭발','처치 시 35% 확률로 소형 폭발',function(){PK.boom=1},'boom'],
  ['위상 대시','대시 중 무적, 스친 적에게 피해 45',function(){PK.phase=1},'phase'],
  ['정밀 회수','헤드샷 명중 시 탄약 1발 반환',function(){PK.refund=1},'refund'],
  ['흡혈 탄환','준 피해의 3%만큼 체력 회복',function(){PK.leech+=.03}],
  ['마지막 탄','탄창의 마지막 3발 피해 +60%',function(){PK.last=1},'last'],
  ['집속탄','수류탄 폭발 뒤 소형 폭발 3회',function(){PK.cluster=1},'cluster'],
  ['처형자','체력 30% 이하인 적에게 피해 +40%',function(){PK.exec=1},'exec']],pkW=0,pkOpt=[];
function openPick(){
  state='pick';firing=false;rmb=false;K={};joyId=lookId=null;jx=jy=0;$('joy').style.display='none';
  try{if(document.exitPointerLock)document.exitPointerLock()}catch(e){}
  var pool=PERKS.filter(function(p){return !p[3]||!PK[p[3]]}),box=$('pkl'),q;pkOpt=[];box.textContent='';
  for(q=0;q<3;q++)pkOpt.push(pool.splice(Math.random()*pool.length|0,1)[0]);
  pkOpt.forEach(function(p,n){
    var b=document.createElement('button'),t=document.createElement('b'),d=document.createElement('span');
    b.type='button';b.className='pkb';t.textContent=(n+1)+'. '+p[0];d.textContent=p[1];b.appendChild(t);b.appendChild(d);
    b.addEventListener('click',function(){choose(n)});box.appendChild(b)});
  $('pk').hidden=false;box.firstChild.focus();sPick('pw');
}
function choose(n){
  if(state!=='pick'||!pkOpt[n])return;
  pkOpt[n][2]();note(pkOpt[n][0]);ST.perks.push(pkOpt[n][0]);var pc=lsGet('ss_perk',{});pc[pkOpt[n][0]]=(pc[pkOpt[n][0]]||0)+1;lsSet('ss_perk',pc);$('pk').hidden=true;state='play';acc=0;hudC='';sPick('sd');try{cv.focus()}catch(e){}
}

/* ================= 갱신 ================= */
function drop(b){
  var r=Math.random(),low=P.hp<45,type,sp2=['rk','dr','sl','sd','as','ov','tu','vp','fz'];
  if(b.el&&Math.random()<.12)type='nk';
  else if(b.tp==='heavy'||b.tp==='shield'||b.el)type=sp2[Math.random()*sp2.length|0];
  else{if(Math.random()>.6)return;
    type=r<.05?'rk':r<.09?'dr':r<.13?'sl':r<.19?'sd':r<.22?'as':r<.26?'ov':r<.29?'tu':r<.33?'vp':r<.37?'fz':r<(low?.72:.56)?'hp':r<(low?.92:.87)?'am':'pw'}
  items.push({g:mkItem(type),type:type,x:b.x,y:floorSafe(b),z:b.z,life:22});
}
function floorSafe(b){var f=floorAt(b.x,b.z,b.y);return f>50?b.y:f}
function shoot(alt){
  if(WP[CUR].flame){flameTick();return}
  var pel=WP[CUR].pel,cost=1,pierce=!!WP[CUR].rail,dmul=1,prc=[];
  if(alt&&CUR===1){pel=16;cost=2}else if(alt&&CUR===2){cost=2;pierce=true;dmul=1.25}
  if(PK.last&&P.am[CUR]<=3)dmul*=1.6;
  KW=WP[CUR].n;ST.shots++;
  var W=WP[CUR],G=guns[CUR],sp=(W.base+bloom*W.sp)*(1-W.af*adsA),pl,hitAny=false,headAny=false,
      shB=false,accL=[],rx=Math.cos(P.yaw),rz=-Math.sin(P.yaw),ox=P.x,oy=P.y+1.6,oz=P.z,R=touchAim?.75:.44,ext=touchAim?.35:0,
      side=.2*(1-adsA),down=.14-.06*adsA,col=P.pw>0?0xc9a9ee:0xffe2b0;
  var k0=kick,ky0=kickY;if(P.ov<=0)P.am[CUR]-=cost;P.cd=W.rate/PK.rate*(P.ov>0?.6:1);recoil=1;flashT=.05;shotN++;
  /* 총 반동(스프링 충격)과 화면 좌우 반동 */
  var rc=RC[CUR],rk=(1-.45*adsA)*(alt?1.5:1);gzV+=rc[0]*rk;gpV+=rc[1]*rk;gyV+=(Math.random()-.5)*rc[2]*rk;grV+=(Math.random()-.5)*rc[3]*rk;
  if(!RM)kickY+=(CUR===0?(shotN%2?1:-1)*.003+(Math.random()-.5)*.004:(Math.random()-.5)*W.kick*.5)*(1-.4*adsA);
  if(W.rocket){puff(P.x+Math.sin(P.yaw)*1.2,P.y+1.5,P.z+Math.cos(P.yaw)*1.2,14,3,.6,.58,.56,.8,Math.sin(P.yaw)*5,.5,Math.cos(P.yaw)*5)}
  bloom=Math.min(1,bloom+W.bl);if(!RM)kick=Math.min(.12,kick+W.kick*(1-.4*adsA));
  sShot(pierce&&CUR===2?5:CUR);mLight.intensity=2.2;
  if(CUR===1||CUR===2)caseP=1; /* 펌프·볼트 조작 때 배출 */
  else if(!W.rocket&&!W.rail){var cs=CASE[caseI];caseI=(caseI+1)%CASE.length;cs.m.position.set(G.g.position.x+.05,G.g.position.y+.04,G.g.position.z+.02);cs.m.visible=true;
  cs.vx=.9+Math.random()*.5;cs.vy=.9+Math.random()*.4;cs.vz=.2+Math.random()*.3;cs.l=.45}
  for(pl=0;pl<pel;pl++){
    prc.length=0;
    var yw=P.yaw+ky0+(Math.random()-.5)*2*sp,pt=P.pitch+k0+(Math.random()-.5)*2*sp,cp=Math.cos(pt),
        dx=-Math.sin(yw)*cp,dy=Math.sin(pt),dz=-Math.cos(yw)*cp,
        wt=ray(ox,oy,oz,dx,dy,dz,90),bt=wt<0?90:wt,hitB=null,head=false,q,b,hl=dx*dx+dz*dz;
    if(hl>1e-5)for(q=0;q<bots.length;q++){
      b=bots[q];if(b.die>0)continue;
      var tt=((b.x-ox)*dx+(b.z-oz)*dz)/hl;if(tt<=0||tt>=bt)continue;
      var hx=ox+dx*tt-b.x,hz=oz+dz*tt-b.z,hy=oy+dy*tt-b.y;
      var bs=b.sc,br=R*(b.hr||bs);if(hx*hx+hz*hz<br*br&&hy>-ext&&hy<2*bs+ext){if(pierce)prc.push([b,tt,hy>1.64*bs&&hy<2.08*bs]);else{hitB=b;bt=tt;head=hy>1.64*bs&&hy<2.08*bs}}
    }
    var ex=ox+dx*bt,ey=oy+dy*bt,ez=oz+dz*bt,blk=false;
    tracer(ox+rx*side+dx*.9,oy-down+dy*.9,oz+rz*side+dz*.9,ex,ey,ez,pierce?0x9fd8ff:col);
    if(pierce){tracer(ox+rx*side+dx*.9,oy-down+dy*.9+.03,oz+rz*side+dz*.9,ex,ey+.03,ez,0xffffff);
      for(q=0;q<prc.length;q++){var pb=prc[q][0],pt2=prc[q][1],ph=prc[q][2];hitAny=true;if(ph)headAny=true;
        puff(ox+dx*pt2,oy+dy*pt2,oz+dz*pt2,8,3.5,.6,.85,1,.35);dmgBot(pb,W.dmg*PK.dmg*dmul*(ph?2.05:1)*(P.pw>0?2:1),ox+dx*pt2,oy+dy*pt2,oz+dz*pt2,ph,0)}}
    /* 방패병: 정면 몸통 사격은 방패가 막음 */
    if(hitB&&hitB.tp==='shield'&&!head&&dx*Math.sin(hitB.rot)+dz*Math.cos(hitB.rot)<-.35&&ey-hitB.y<1.5*hitB.sc)blk=true;
    if(hitB&&blk){puff(ex,ey,ez,5,3,.7,.85,1,.25);sShieldHit(ex,ez);shB=true}
    else if(hitB){
      var dm0=W.dmg*PK.dmg*dmul*(head?2.05:1)*(P.pw>0?2:1);hitAny=true;if(head)headAny=true;
      if(!hitB.acc){hitB.acc=0;accL.push(hitB)}if(!hitB.inv){hitB.acc+=dm0;if(head)hitB.ach=1}
      puff(ex,ey,ez,W.pel>1?3:7,3,.78,.62,.9,.35);dmgBot(hitB,dm0,ex,ey,ez,head,0,true);
    }else if(wt>=0){
      puff(ex,ey,ez,W.pel>1?2:6,2.6,1,.85,.6,.3,-dx,.5,-dz);
      var brl=barrelAt(ex+dx*.08,ey,ez+dz*.08);
      if(brl){brl.hp-=W.dmg*(P.pw>0?2:1);if(brl.hp<=0)blowBarrel(brl);else puff(ex,ey,ez,4,2,1,.5,.3,.3)}
      var px=ex-dx*.2,py=ey-dy*.2,pz=ez-dz*.2,nx=0,ny=0,nz2=0;
      if(!solid(px,ey,ez))nx=dx>0?-1:1;else if(!solid(ex,ey,pz))nz2=dz>0?-1:1;else if(!solid(ex,py,ez))ny=dy>0?-1:1;
      else{nx=-dx;ny=-dy;nz2=-dz}
      if(!brl||!brl.dead){var dm=DC[dcI];dcI=(dcI+1)%DC.length;dm.position.set(ex+nx*.02,ey+ny*.02,ez+nz2*.02);
        v2.set(ex+nx,ey+ny,ez+nz2);dm.lookAt(v2);dm.visible=true}
      if(pl===0&&Math.random()<.35)sRico(ex,ez);
    }
  }
  for(pl=0;pl<accL.length;pl++){b=accL[pl];if(b.acc>0)dmgNum(b.x,b.y+(b.fly?1:1.95*b.sc),b.z,b.acc,b.ach);b.acc=0;b.ach=0}

  if(W.rocket){var cp2=Math.cos(P.pitch+k0);fireRocket(-Math.sin(P.yaw)*cp2,Math.sin(P.pitch+k0),-Math.cos(P.yaw)*cp2,rx,rz)}
  if(hitAny){ST.hits++;if(headAny){ST.heads++;if(PK.refund&&P.am[CUR]<magOf(CUR))P.am[CUR]++}}
  if(hitAny){hitM=.14;sHit(headAny);if(headAny)note('헤드샷')}
  else if(shB)note('방패 · 측면이나 머리 공략');
}
/* 화염방사기: 전방 원뿔 범위에 지속 피해와 화상 */
function flameTick(){
  var W=WP[CUR],cp=Math.cos(P.pitch),dx=-Math.sin(P.yaw)*cp,dy=Math.sin(P.pitch),dz=-Math.cos(P.yaw)*cp,ox=P.x,oy=P.y+1.5,oz=P.z,
      wt=ray(ox,oy,oz,dx,dy,dz,9),rng=wt<0?9:wt,q,b,l=bots.slice(),rx=Math.cos(P.yaw),rz=-Math.sin(P.yaw);
  if(P.ov<=0)P.am[CUR]--;P.cd=W.rate;KW=W.n;flameN++;gzV+=RC[4][0];gyV+=(Math.random()-.5)*RC[4][2];flashT=.03;mLight.intensity=1.2;
  if(flameN%3===0){nz(.16,.12,'bandpass',500+Math.random()*300,1400,{q:.8});tone('sawtooth',70,60,.14,.04)}
  for(q=0;q<3;q++)puff(ox+rx*.2+dx*.9,oy-.14+dy*.9,oz+rz*.2+dz*.9,1,2.2,1,.5+Math.random()*.3,.15,.4+rng*.03,dx*(11+q*3),dy*(11+q*3)+.6,dz*(11+q*3));
  for(q=0;q<l.length;q++){b=l[q];if(b.die>0)continue;
    var bx=b.x-ox,by=b.y+(b.fly?.5:b.sc)-oy,bz=b.z-oz,d=Math.hypot(bx,by,bz);
    if(d<rng+.8&&(d<1.2||(bx*dx+by*dy+bz*dz)/d>.93)){b.burn=2.5;b.fa=(b.fa||0)+W.dmg*PK.dmg;
      var show=b.fa>=35;dmgBot(b,W.dmg*PK.dmg*(P.pw>0?2:1),b.x,b.y+(b.fly?1:1.95*b.sc),b.z,false,0,show?0:true);
      if(show)b.fa=0}}
}
/* 자동 사격 판정: 조준선이 적에 닿았는지 */
function aimHit(){
  var cp=Math.cos(P.pitch),dx=-Math.sin(P.yaw)*cp,dy=Math.sin(P.pitch),dz=-Math.cos(P.yaw)*cp,ox=P.x,oy=P.y+1.6,oz=P.z,
      wt=ray(ox,oy,oz,dx,dy,dz,60),bt=wt<0?60:wt,hl=dx*dx+dz*dz,q,b;
  if(WP[CUR].flame)bt=Math.min(bt,9);
  if(hl<1e-5)return false;
  for(q=0;q<bots.length;q++){b=bots[q];if(b.die>0||b.inv)continue;
    var tt=((b.x-ox)*dx+(b.z-oz)*dz)/hl;if(tt<=0||tt>=bt)continue;
    var hx=ox+dx*tt-b.x,hz=oz+dz*tt-b.z,hy=oy+dy*tt-b.y,br=.5*(b.hr||b.sc);
    if(hx*hx+hz*hz<br*br&&hy>-.2&&hy<2*b.sc+.2)return true}
  return false;
}
function update(dt){
  var q,b;
  look(((K.lR?1:0)-(K.lL?1:0))*dt*440,((K.lD?1:0)-(K.lU?1:0))*dt*300,.0055);
  var fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),rx=Math.cos(P.yaw),rz=-Math.sin(P.yaw),
      f=(K.fwd?1:0)-(K.back?1:0)-jy,s=(K.right?1:0)-(K.left?1:0)+jx,l=Math.hypot(f,s);
  if(l>1){f/=l;s/=l}
  var spd=7.4*PK.spd*(1-.45*adsA)*dt;
  var psx=P.x,psz=P.z;
  if(l>.05){move(P,(fx*f+rx*s)*spd,(fz*f+rz*s)*spd,.3);bobT+=dt*11*Math.min(1,l)}
  /* 대시: 입력 방향(없으면 전방)으로 짧게 가속 */
  P.dc-=dt;P.gc-=dt;
  if(P.dq){P.dq=0;P.dc=2.2*PK.dash;P.ds=.16;P.did++;grV+=(s<0?1:-1)*2.5;if(l>.05){P.dvx=(fx*f+rx*s)/Math.min(1,l);P.dvz=(fz*f+rz*s)/Math.min(1,l)}else{P.dvx=fx;P.dvz=fz}
    nz(.22,.16,'bandpass',700,2600,{q:1.2});tone('sine',300,140,.16,.08);hudC=''}
  if(P.ds>0){P.ds-=dt;move(P,P.dvx*24*dt,P.dvz*24*dt,.3);
    if(PK.phase){var pl2=bots.slice();KW='위상 대시';for(q=0;q<pl2.length;q++){b=pl2[q];if(b.die<=0&&b.did!==P.did&&Math.hypot(b.x-P.x,b.z-P.z)<1.7*(b.boss?1.5:1)&&Math.abs(b.y-P.y)<2.5){b.did=P.did;dmgBot(b,45*PK.dmg,b.x,b.y+b.sc,b.z,false,0)}}}}
  P.ac-=dt;P.mc-=dt;ST.t+=dt;
  if(P.vy!==0)P.air=1;
  if(P.vy>0&&solid(P.x,P.y+1.85,P.z))P.vy=0; /* 머리 위 충돌 */
  grav(P,dt,.3);
  if(P.air&&P.vy===0){P.air=0;gyyV-=.55;gpV-=.8;sStep(P.y>2)} /* 착지 */
  upd2(dt);tipTick(dt);
  stepD+=Math.hypot(P.x-psx,P.z-psz);if(stepD>2.3&&P.vy===0){stepD=0;sStep(P.y>2)}
  if(P.ov>0)P.ov-=dt;if(comboT>0)comboT-=dt;
  if(slowT>0){slowT-=dt;if(slowT<=0)sSlow(0)}ets=slowT>0?.3:1;
  if(P.hp<30){hbT-=dt;if(hbT<=0){hbT=.5+P.hp/60;sHeart();hurt=Math.max(hurt,.35)}}
  /* 지연 폭발: 드럼통 연쇄 · 자폭병 · 공습 */
  for(q=booms.length-1;q>=0;q--){var bm=booms[q];bm.t-=dt;
    if(bm.fall&&bm.t<.45&&bm.fall===1){bm.fall=2;tracer(bm.x+3,bm.y+40,bm.z+2,bm.x,bm.y,bm.z,0xffc070)}
    if(bm.t<=0){booms.splice(q,1);if(bm.r)bm.r.visible=false;if(bm.bar)blowBarrel(bm.bar);else explode(bm.x,bm.y,bm.z,bm.mode);if(state!=='play')return}}
  /* 유탄 */
  for(q=grenades.length-1;q>=0;q--){var gn=grenades[q],gd=gn.pl?dt:dt*ets;
    if(!gn.land){gn.vy-=14*gd;var gx2=gn.x+gn.vx*gd,gy2=gn.y+gn.vy*gd,gz2=gn.z+gn.vz*gd;
      if(gn.imp){for(var gq=0;gq<bots.length;gq++){var gb=bots[gq];if(gb.die<=0&&Math.hypot(gb.x-gx2,gb.z-gz2)<.9*gb.sc&&gy2>gb.y-.2&&gy2<gb.y+2.2*gb.sc){gn.land=1;gn.fuse=0;break}}}
      if(gn.land){gn.x=gx2;gn.y=gy2;gn.z=gz2}
      else if(solid(gx2,gy2,gz2)){gn.land=1;
        if(gn.imp)gn.fuse=0;
        else{gn.fuse=.9;var gf=floorAt(gn.x,gn.z,gn.y+.3);gn.r=ring(gn.x,gf<50?gf:gn.y,gn.z,1.05);tone('square',900,900,.05,.08*sp(gn.x,gn.z).att*2,{pan:sp(gn.x,gn.z).pan})}}
      else{gn.x=gx2;gn.y=gy2;gn.z=gz2}}
    else{gn.fuse-=gd;if(gn.r)gn.r.material.opacity=.35+.35*Math.abs(Math.sin(gn.fuse*14))}
    gn.m.position.set(gn.x,gn.y,gn.z);gn.m.rotation.x+=gd*9;
    if(gn.land&&gn.fuse<=0||gn.y<-5){gn.m.visible=false;if(gn.r)gn.r.visible=false;grenades.splice(q,1);if(gn.pl)KW=gn.imp?'소총 유탄':'수류탄';explode(gn.x,gn.y+.2,gn.z,gn.pl?0:1);
      if(gn.pl&&PK.cluster&&state==='play')for(var cq=0;cq<3;cq++)booms.push({x:gn.x+Math.cos(cq*2.09)*2.2,y:gn.y+.5,z:gn.z+Math.sin(cq*2.09)*2.2,t:.25+cq*.12,mode:5});if(state!=='play')return}}
  P.cd-=dt;recoil=Math.max(0,recoil-dt*9);hurt=Math.max(0,hurt-dt*1.6);hitM-=dt;flashT-=dt;
  bloom=Math.max(0,bloom-dt*1.8);kick=Math.max(0,kick-dt*.35);if(P.pw>0)P.pw-=dt;
  mLight.intensity=Math.max(0,mLight.intensity-dt*30);xLight.intensity=Math.max(0,xLight.intensity-dt*9);shake=Math.max(0,shake-dt*1.9);boomA=Math.max(0,boomA-dt*2.2);
  var W=WP[CUR];
  if(swT>0){swT-=dt;if(swT<=.13&&CUR!==nextW)showGun(nextW)}
  else if(P.rel>0){
    if(P.rsh&&(firing||K.fire)&&P.am[1]>0){P.rel=0;P.rsh=0} /* 산탄총 장전 중 사격으로 끊기 */
    else{P.rel-=dt;if(P.rel<=0){
      if(P.rsh){P.am[1]++;P.rs[1]--;sShell();gpV+=.5;hudC='';
        if(P.am[1]<magOf(1)&&P.rs[1]>0)P.rel=shellT();else{P.rsh=0;if(P.relE){P.cd=.4;caseP=0;sPump()}}}
      else{var need=Math.min(magOf(CUR)-P.am[CUR],P.rs[CUR]);P.am[CUR]+=need;P.rs[CUR]-=need}}}}
  else if((firing||K.fire||autoOn(dt))&&P.cd<=0){if(P.am[CUR]>0)shoot();else if(P.rs[CUR]>0)reload();else{P.cd=.4;beep(500,400,.04,.04,'triangle');note('탄약 없음')}}

  var at=(rmb||adsT)&&P.rel<=0&&swT<=0?1:0;adsA+=Math.max(-dt*7,Math.min(dt*7,at-adsA));
  flowT-=dt;if(flowT<=0){flow();flowT=.3}
  if(CUR>=3&&swT<=0&&P.rel<=0&&P.cd<=0&&P.am[CUR]<=0){if(P.rs[CUR]>0)reload();else switchTo(0)}
  /* 로켓 */
  for(q=rockets.length-1;q>=0;q--){
    var rk=rockets[q],vs=rk.e?17*ets:40,n=Math.max(1,Math.ceil(vs*dt/.3)),k,hit=solid(rk.x,rk.y,rk.z),o2;
    for(k=0;k<n&&!hit;k++){
      rk.x+=rk.dx*vs*dt/n;rk.y+=rk.dy*vs*dt/n;rk.z+=rk.dz*vs*dt/n;
      if(solid(rk.x,rk.y,rk.z)){hit=true;break}
      if(rk.e){if(Math.hypot(P.x-rk.x,P.z-rk.z)<.6&&rk.y>P.y-.1&&rk.y<P.y+1.9)hit=true}
      else for(o2=0;o2<bots.length;o2++){b=bots[o2];if(b.die<=0&&Math.hypot(b.x-rk.x,b.z-rk.z)<.9*b.sc&&rk.y>b.y-.1&&rk.y<b.y+2.1*b.sc){hit=true;break}}
    }
    rk.l-=dt;rk.m.position.set(rk.x,rk.y,rk.z);v2.set(rk.x+rk.dx,rk.y+rk.dy,rk.z+rk.dz);rk.m.lookAt(v2);
    var fs=.8+Math.random()*.6;rk.m.userData.fl.scale.set(fs,fs,fs*2.4);
    puff(rk.x-rk.dx*.4,rk.y-rk.dy*.4,rk.z-rk.dz*.4,2,.7,.78,.74,.72,.6,0,1.4,0);puff(rk.x-rk.dx*.3,rk.y-rk.dy*.3,rk.z-rk.dz*.3,1,1.2,1,.7,.3,.18);
    if(hit||rk.l<=0){rk.m.visible=false;rockets.splice(q,1);explode(rk.x-rk.dx*.25,rk.y-rk.dy*.25,rk.z-rk.dz*.25,rk.e);if(state!=='play')return}
  }
  /* 지원 드론 · 포탑: 각자 체력 보유 */
  var nd=0,dk=0;for(q=0;q<drones.length;q++)if(!drones[q].tur)nd++;
  for(var di=drones.length-1;di>=0;di--){
    var dr=drones[di],oy0=dr.tur?.82:0;dr.hit-=dt;
    if(!dr.tur){var an0=dk++/nd*6.283+tNow*.25,rad=nd<=4?1.9:nd<=8?2.4:2.9,tx0=P.x+Math.cos(an0)*rad,tz0=P.z+Math.sin(an0)*rad,ty0=P.y+2+(dk%3)*.32;
      if(solid(tx0,ty0,tz0)||solid(tx0,ty0+.2,tz0))ty0=P.y+1.45;if(solid(tx0,ty0,tz0)){tx0=P.x;tz0=P.z}
      var kf=Math.min(1,dt*5);dr.x+=(tx0-dr.x)*kf;dr.y+=(ty0-dr.y)*kf;dr.z+=(tz0-dr.z)*kf}
    if(dr.hp<dr.mhp*.4&&Math.random()<dt*7)puff(dr.x,dr.y+oy0+.1,dr.z,1,.6,.3,.3,.32,.7,0,1.2,0);
    dr.cd-=dt;
    if(dr.cd<=0){
      var tb=null,td=34,dd;
      for(q=0;q<bots.length;q++){b=bots[q];if(b.die>0||b.inv)continue;dd=Math.hypot(b.x-dr.x,b.z-dr.z);
        if(dd<td&&los(dr.x,dr.y+oy0,dr.z,b.x,b.y+(b.fly?.5:1.2*b.sc),b.z)){td=dd;tb=b}}
      if(tb){var ty1=tb.y+(tb.fly?.5:1.2*tb.sc);dr.cd=dr.tur?.2:.42;dr.yaw=Math.atan2(tb.x-dr.x,tb.z-dr.z);sDrone(dr.x,dr.z);
        tracer(dr.x,dr.y+oy0-.05,dr.z,tb.x,ty1,tb.z,0xc9a9ee);puff(tb.x,ty1,tb.z,3,2.5,.78,.62,.9,.3);dmgBot(tb,(dr.tur?14:12)*PK.dr,tb.x,ty1,tb.z,false,0,true)}
      else dr.cd=.15;
    }
  }
  /* 적 */
  var rdt=dt,MD={rusher:[11,22,.65],stalker:[16,30,.8],split:[14,22,.9],mite:[4,7,.5]};dt*=ets;
  for(q=bots.length-1;q>=0;q--){
    b=bots[q];b.hit-=rdt;b.fl-=dt;b.im-=rdt;
    if(b.burn>0&&b.die<=0){b.burn-=rdt;KW='화염방사기';if(Math.random()<rdt*8)puff(b.x,b.y+(b.fly?.4:b.sc),b.z,1,1.2,1,.55,.15,.4,0,1.5,0);if(dmgBot(b,11*PK.dmg*rdt,b.x,b.y+b.sc,b.z,false,0,2))continue}
    if(b.die>0){b.die-=rdt;grav(b,rdt,b.r);if(b.die<=0){killMesh(b);bots.splice(q,1)}continue}
    var tp=b.tp;if(tp==='pylon')continue;
    if(b.frz>0){b.frz-=rdt;if(!b.fly)grav(b,rdt,b.r);continue}
    if(tp==='over')overTick(b,dt);
    var sc=b.sc,ex=P.x-b.x,ez=P.z-b.z,d=Math.hypot(ex,ez)||1,ux=ex/d,uz=ez/d,sp0=b.sp*dt,ox=b.x,oz=b.z,
        mvx=0,mvz=0,pathing=false,see;
    /* 시야 검사는 적마다 엇갈려 초당 약 9회 */
    b.vt=(b.vt||0)-dt;if(b.vt<=0){b.vt=.09+Math.random()*.05;b.vs=d<(tp==='sniper'||tp==='mother'||tp==='over'?66:b.boss?50:b.fly?46:36)&&los(b.x,b.y+(b.fly?.7:1.7*sc),b.z,P.x,P.y+1.5,P.z)}see=b.vs;
    if(see&&!b.los)b.cd=Math.max(b.cd,.28+Math.random()*.3);
    b.los=see;b.pm-=dt;if(see)b.ls=0;else{b.ls+=dt;if(tp!=='crusher')b.ch=0}
    if(b.fly){ /* 말벌 드론 · 모선: 벽 위로 넘어와 머리 위에서 공격 */
      var mo=tp==='mother',fty=mo?Math.max(P.y+6.5,7.8):see?P.y+2.8:7.3,fny=b.y+Math.max(-3.2*dt,Math.min(3.2*dt,fty-b.y));
      if(!solid(b.x,fny,b.z)&&!solid(b.x,fny+.75,b.z))b.y=fny;
      if(see){b.st-=dt;if(b.st<=0){b.sd=-b.sd;b.st=1+Math.random()*1.5}var fa=mo?(d>14?1:d<8?-1:0):(d>10?1:d<6?-1:0);mvx=ux*fa-uz*b.sd*.7;mvz=uz*fa+ux*b.sd*.7}else{mvx=ux;mvz=uz}
      var fnx=b.x+mvx*sp0,fnz=b.z+mvz*sp0;
      if(fnx>1&&fnz>1&&fnx<MW*CS-1&&fnz<MH*CS-1&&!solid(fnx,b.y,fnz)&&!solid(fnx,b.y+.75,fnz)){b.x=fnx;b.z=fnz}
      b.rot=Math.atan2(ex,ez);b.ph+=dt*30;
      if(see){b.cd-=dt;if(b.cd<=0){
        if(mo){b.bn--;b.cd=b.bn>0?.12:1.1;if(b.bn<=0)b.bn=6;if(botShot(b,Math.max(.12,.34-d*.005),Math.min(9,5+wave*.15),d))return}
        else{b.cd=.85+Math.random()*.5;if(botShot(b,Math.max(.15,.52-d*.012),Math.min(8,4+wave*.3),d))return}}}
      if(mo){ /* 모선: 말벌 드론 출격 · 폭탄 투하 */
        b.rc-=dt;if(b.rc<=0){b.rc=6;var nf=0,k2;for(k2=0;k2<bots.length;k2++)if(bots[k2].tp==='flyer'&&bots[k2].die<=0)nf++;
          if(nf<6)for(k2=-1;k2<2;k2+=2){var nb=addBot('flyer',[Math.floor(b.x/CS),Math.floor(b.z/CS),0]);nb.x=b.x+k2*1.6;nb.z=b.z;nb.y=b.y-.4}
          tone('square',500,1100,.2,.1*sp(b.x,b.z).att*2,{pan:sp(b.x,b.z).pan})}
        b.sl-=dt;if(b.sl<=0&&d<28){b.sl=4.2;lob(b);lob(b);lob(b)}
      }
      continue;
    }
    if(tp==='medic'){ /* 치유병: 가장 다친 아군 회복 */
      b.hc-=dt;if(b.hc<=0){b.hc=.5;b.tg=null;var br0=.97,o3,a3;for(o3=0;o3<bots.length;o3++){a3=bots[o3];
        if(a3!==b&&a3.die<=0&&!a3.boss&&a3.tp!=='pylon'&&a3.hp<a3.mhp*br0&&Math.hypot(a3.x-b.x,a3.z-b.z)<10){br0=a3.hp/a3.mhp;b.tg=a3}}}
      if(b.tg){if(b.tg.die>0)b.tg=null;else b.tg.hp=Math.min(b.tg.mhp,b.tg.hp+20*dt)}
    }
    if(tp==='gren'&&(see||b.ls<3)&&d<28){b.cd-=dt;if(b.cd<=0){b.cd=2.5+Math.random();b.rot=Math.atan2(ex,ez);lob(b)}}
    if(b.wig>0){b.wig-=dt;mvx=b.wx;mvz=b.wz}
    else if(tp==='crusher'){ /* 분쇄자: 예고선 → 돌진 → 회복. 근접 내려찍기 */
      b.rc-=dt;b.sl-=dt;b.gc-=dt;
      if(b.dash>0){b.dash-=dt;move(b,b.dx*25*dt,b.dz*25*dt,b.r);b.ph+=dt*26;puff(b.x,b.y+.2,b.z,2,2,.7,.66,.6,.5);
        if(!b.dh&&d<2.8&&Math.abs(P.y-b.y)<2.6){b.dh=1;if(!RM)shake=Math.max(shake,1);hitBy='분쇄자 돌진';if(hurtP(38,b.x,b.z))return}
        if(b.dash<=0)b.cd=1.5}
      else if(b.ch>0){b.ch+=dt;if(b.ch<.75)b.rot=Math.atan2(ex,ez);
        if(b.ch>=1.05){b.ch=0;b.dash=.85;b.dh=0;b.dx=Math.sin(b.rot);b.dz=Math.cos(b.rot);sDash(b)}}
      else if(b.cd>0)b.cd-=dt;
      else if(see&&d<26&&d>5&&b.rc<=0&&Math.abs(P.y-b.y)<1.6){b.ch=.01;b.rc=3.6;sCharge(b,1/ets)}
      else if(d<5.5&&Math.abs(P.y-b.y)<2.6&&b.sl<=0){b.sl=1.5;b.fl=.2;if(!RM)shake=Math.max(shake,.9);nz(.4,.5,'lowpass',400,60,{rev:.6});tone('sine',90,28,.4,.6);
        ringFx(b.x,b.y,b.z,0xffd9a0,11,.5);hitBy=BT[tp].n+' 내려찍기';if(hurtP(26,b.x,b.z))return}
      else{if(b.gc<=0&&b.ls>2.5&&d<30){b.gc=5;b.rot=Math.atan2(ex,ez);lob(b);lob(b);lob(b)}
        if(see&&b.pm<=0&&clearLine(b,P.x-ux*1.5,P.z-uz*1.5,b.r)){mvx=ux;mvz=uz;b.rot=Math.atan2(ex,ez)}else pathing=true}
    }else if(MD[tp]||tp==='bomber'){
      var near=d<(tp==='split'?2.8:2.3)&&Math.abs(P.y-b.y)<1.7;
      if(tp==='bomber'){ /* 자폭병: 접근할수록 빨라지는 경고음 */
        b.cd-=dt;if(b.cd<=0&&d<24){b.cd=Math.max(.11,d/24*.7);b.fl=.07;sBeep(b)}
        if(near){b.hp=0;killBot(b,b.x,b.y+1,b.z);continue}
      }else if(see&&near){
        b.rot=Math.atan2(ex,ez);b.cd-=dt;
        if(b.cd<=0){var md=MD[tp];b.cd=md[2];b.fl=.16;sSlash(b);hitBy=BT[tp].n;if(hurtP(Math.min(md[1],md[0]+wave*(tp==='mite'?.2:1)),b.x,b.z))return}
      }
      if(!(see&&near)){
        if(see&&d<18&&b.pm<=0&&clearLine(b,P.x-ux*.8,P.z-uz*.8,b.r)){mvx=ux;mvz=uz;b.rot=Math.atan2(ex,ez)}
        else pathing=true;
      }
    }else if(see&&d<b.rng&&b.pm<=0){
      var bo=tp==='boss'||tp==='over';
      b.st-=dt;if(b.st<=0){b.sd=-b.sd;b.st=.6+Math.random()*1.2}
      var ap=bo?(d>12?1:0):tp==='heavy'?(d>9?1:0):tp==='sniper'?(d<15?-1:0):tp==='shield'?(d>7?1:0):tp==='gren'?(d>20?1:d<10?-.8:0):tp==='medic'?(d<12?-1:d>17?1:0):(d>10?1:d<4.5?-.6:0),
          sf=tp==='heavy'||bo?0:tp==='sniper'?.25:tp==='shield'?.2:tp==='gren'?.4:tp==='medic'?.5:.7;
      mvx=ux*ap-uz*b.sd*sf;mvz=uz*ap+ux*b.sd*sf;b.rot=Math.atan2(ex,ez);if(tp!=='gren')b.cd-=dt;
      if(bo){ /* 거신 · 종말 군주: 내려찍기 · 어깨 로켓 · 연발 */
        b.rc-=dt;b.sl-=dt;
        if(d<5.5*sc/2&&b.sl<=0&&Math.abs(P.y-b.y)<2.6){b.sl=1.6;b.fl=.2;if(!RM)shake=Math.max(shake,.9);nz(.4,.5,'lowpass',400,60,{rev:.6});tone('sine',90,28,.4,.6);
          ringFx(b.x,b.y,b.z,0xffd9a0,12,.5);puff(b.x+ux*2,b.y+.2,b.z+uz*2,24,6,.8,.72,.62,.6);hitBy=BT[tp].n+' 내려찍기';if(hurtP(26,b.x,b.z))return}
        if(b.rc<=0){b.rc=tp==='over'?(b.p3?1.7:2.3):2.8;var bc=Math.cos(b.rot),bsn=Math.sin(b.rot),s2;
          for(s2=-1;s2<2;s2+=2){var lx=b.x+(bc*s2*1.45+bsn*.7)*b.sc/2,lz=b.z+(-bsn*s2*1.45+bc*.7)*b.sc/2,ly=b.y+1.98*b.sc,
              ax=P.x+(Math.random()-.5)*2-lx,ay=P.y+.6-ly,az=P.z+(Math.random()-.5)*2-lz,al2=Math.hypot(ax,ay,az)||1;
            launch(lx,ly,lz,ax/al2,ay/al2,az/al2,1)}
          var so=sp(b.x,b.z,.4);so.q=1.1;nz(.5,.4*so.att*2,'bandpass',260,2400,so)}
        if(b.cd<=0){b.bn--;var bd=botShot(b,Math.max(.12,.38-d*.006),Math.min(11,5+wave*.25),d);
          if(b.bn>0)b.cd=.1;else{b.bn=8;b.cd=1.4+Math.random()*.5}if(bd)return}
      }else if(tp==='sniper'){ /* 저격병: 조준선 예고 후 사격 */
        var ct=Math.max(.9,1.4-wave*.03);
        if(b.cd<=0){if(b.ch===0)sCharge(b,ct/ets);b.ch+=dt;mvx=mvz=0;
          if(b.ch>=ct){b.ch=0;b.cd=1.4+Math.random();if(botShot(b,.82,Math.min(46,26+wave*2),d))return}}
      }else if(tp==='heavy'){ /* 중장갑병: 연발 */
        if(b.cd<=0){b.bn--;var dead=botShot(b,Math.max(.12,.4-d*.008),Math.min(11,5+wave*.5),d);
          if(b.bn>0)b.cd=.1;else{b.bn=7;b.cd=1.5+Math.random()*.6}if(dead)return}
      }else if(tp==='shield'){
        if(b.cd<=0){b.cd=.8+Math.random()*.5;if(botShot(b,Math.max(.14,Math.min(.6,.74-d*.025)),Math.min(14,6+wave),d))return}
      }else if(tp==='medic'){
        if(b.cd<=0){b.cd=1+Math.random()*.5;if(botShot(b,Math.max(.1,.45-d*.015),Math.min(8,4+wave*.3),d))return}
      }else if(tp!=='gren'&&b.cd<=0){b.cd=.65+Math.random()*.55;if(botShot(b,Math.max(.15,Math.min(.68,.8-d*.024)),Math.min(16,7+wave),d))return}
    }else pathing=true;
    if(pathing){
      var c=nodeOf(b),bn=-1,bv=dist[c],ls=adj[c],w;
      for(w=0;w<ls.length;w++)if(dist[ls[w]]<bv){bv=dist[ls[w]];bn=ls[w]}
      if(bn>=0){
        var cc=bn>>1,tx=(cc%MW+.5)*CS,tz=((cc/MW|0)+.5)*CS,own=c>>1,hx=(own%MW+.5)*CS,hz=((own/MW|0)+.5)*CS;
        /* 다음 칸까지 직선이 막히면 현재 칸 중심을 먼저 경유 */
        if(!clearLine(b,tx,tz,b.r)&&Math.hypot(hx-b.x,hz-b.z)>.25){tx=hx;tz=hz}
        tx-=b.x;tz-=b.z;var tl=Math.hypot(tx,tz)||1;mvx=tx/tl;mvz=tz/tl;b.rot=Math.atan2(tx,tz);
        if(!see)sp0*=1.3; /* 교전 전 이동은 더 빠르게 */
      }
    }
    if(mvx||mvz)move(b,mvx*sp0,mvz*sp0,b.r);
    for(var o=0;o<q;o++){var b2=bots[o];if(b2.die>0||b2.fly||b2.tp==='pylon')continue;var sx=b.x-b2.x,sz=b.z-b2.z,sl2=Math.hypot(sx,sz);
      if(sl2<.9&&sl2>.001&&Math.abs(b.y-b2.y)<1){move(b,sx/sl2*dt*1.5,sz/sl2*dt*1.5,b.r);move(b2,-sx/sl2*dt*1.5,-sz/sl2*dt*1.5,b2.r)}}
    grav(b,dt,b.r);
    var mv=Math.hypot(b.x-ox,b.z-oz),want=Math.hypot(mvx,mvz)*sp0;b.ph+=mv*2.6/sc;
    /* 진행이 막히면 방향 전환 */
    if(want>0&&mv<want*.3){b.sk+=dt;if(b.sk>.4){b.sk=0;
      if(pathing||MD[tp]||tp==='bomber'||tp==='crusher'||b.wig>0){var an=Math.random()*6.28;b.wig=.35;b.wx=Math.cos(an);b.wz=Math.sin(an);b.pm=.8}else{b.sd=-b.sd;b.pm=1}}}
    else b.sk=Math.max(0,b.sk-dt);
  }
  dt=rdt;
  for(q=items.length-1;q>=0;q--){
    var it=items[q];it.life-=dt;
    var near=Math.abs(it.x-P.x)<1.2&&Math.abs(it.z-P.z)<1.2&&Math.abs(it.y-P.y)<1.6,take=false;
    if(near){
      if(it.type==='hp'&&P.hp<P.mhp){P.hp=Math.min(P.mhp,P.hp+35);take=true}
      else if(it.type==='am'){for(var wi=0;wi<3;wi++)P.rs[wi]=Math.min(WP[wi].max,P.rs[wi]+WP[wi].add);for(wi=4;wi<6;wi++)if(META.own[WP[wi].own])P.rs[wi]=Math.min(WP[wi].max,P.rs[wi]+WP[wi].add);P.gr=Math.min(5+PK.grx,P.gr+1);take=true}
      else if(it.type==='pw'){P.pw=10;take=true}
      else if(it.type==='rk'){if(P.am[3]<=0){P.am[3]=1;P.rs[3]=Math.min(9,P.rs[3]+2)}else P.rs[3]=Math.min(9,P.rs[3]+3);take=true}
      else if(it.type==='dr'){take=addDrone()}
      else if(it.type==='sl'){if(slowT<=0)sSlow(1);slowT=6;take=true}
      else if(it.type==='sd'){if(P.sh<120){P.sh=Math.min(120,P.sh+60);take=true}}
      else if(it.type==='as'){airstrike();take=true}
      else if(it.type==='ov'){P.ov=8;take=true}
      else if(it.type==='tu'){addTurret(it.x,it.y,it.z);take=true}
      else if(it.type==='vp'){P.vp=12;take=true}
      else if(it.type==='fz'){freezeNova();take=true}
      else if(it.type==='nk'){nuke();take=true}
    }
    if(take){note(ITEM[it.type]);sPick(it.type);puff(it.x,it.y+.6,it.z,10,2.5,.9,.85,.95,.4)}
    if(take||it.life<=0){scene.remove(it.g);items.splice(q,1)}
  }
  var al=0;for(q=0;q<bots.length;q++)if(bots[q].die<=0&&bots[q].tp!=='pylon')al++;
  /* 남은 적 2기 이하 또는 38초 경과 시 다음 웨이브 */
  if(WM==='timed'&&!wmDone){wmT-=dt;st('wtm','display','block');var wt2='제한 시간 '+Math.max(0,Math.ceil(wmT))+'초';if(_sv.wtm!==wt2){_sv.wtm=wt2;$('wtm').textContent=wt2}
    if(al===0){wmDone=1;ST.bonus+=15;note('시간 내 섬멸 · 보급 투하');sClear();st('wtm','display','none');
      ['sd','ov','am'].forEach(function(t,n){items.push({g:mkItem(t),type:t,x:P.x+Math.cos(n*2.1)*1.5,y:P.y,z:P.z+Math.sin(n*2.1)*1.5,life:30})})}
    else if(wmT<=0){wmDone=1;note('시간 초과');st('wtm','display','none')}}
  if(pend<=0&&!(bossB&&bossB.die<=0)&&(al<=(WM==='timed'&&!wmDone?0:2)||waveT>38)){pend=wave?1:.01;if(wave&&!al)sClear()}
  if(pend>0){pend-=dt;if(pend<=0){
    if(wave&&wave%2===0&&pkW!==wave){pkW=wave;pend=.05;openPick();return}
    if(wave){P.hp=Math.min(P.mhp,P.hp+10);if(PK.shw)P.sh=Math.min(120,P.sh+PK.shw)}spawnWave()}}
  if(msgT>0){msgT-=dt;if(msgT<=0)$('msg').textContent=''}
  if(noteT>0){noteT-=dt;if(noteT<=0)$('note').textContent=''}
}
function fx(dt){
  fx2(dt);
  var q,j;
  psUpd(dt);
  for(q=0;q<CASE.length;q++){var c=CASE[q];if(c.l>0){c.l-=dt;c.vy-=7*dt;c.m.position.x+=c.vx*dt;c.m.position.y+=c.vy*dt;c.m.position.z+=c.vz*dt;
    c.m.rotation.x+=dt*14;c.m.rotation.z+=dt*9;if(c.l<=0)c.m.visible=false}}
  for(q=0;q<EX.length;q++){var x=EX[q];if(x.l>0){x.l-=dt;
    var el=1.25-Math.max(0,x.l),k=x.k,p1=Math.min(1,el/.2),p2=Math.min(1,el/.5),e2=1-(1-p2)*(1-p2),p3=Math.min(1,el/.6),p4=el/1.25,w;
    x.core.visible=p1<1;x.core.scale.setScalar((.6+p1*3.4)*k);x.core.material.opacity=1-p1;
    x.fire.visible=p2<1;x.fire.scale.setScalar((.9+e2*5.6)*k);x.fire.material.opacity=(1-p2)*.9;
    x.fir2.visible=p2<1;x.fir2.scale.setScalar((.6+e2*4.4)*k);x.fir2.rotation.y=el*3;x.fir2.material.opacity=(1-p2)*.8;
    x.ring.visible=p3<1;x.ring.scale.setScalar((1+p3*10)*k);x.ring.material.opacity=(1-p3)*.8;
    x.smat.opacity=Math.min(1,el/.15)*(1-p4)*.72;
    for(w=0;w<x.sm.length;w++){var sm=x.sm[w],d=sm.userData.d,sp=(1+p4*1.7)*k;sm.position.set(d[0]*sp,(d[1]+p4*3)*k,d[2]*sp);sm.scale.setScalar((.9+p4*2.3)*k);sm.rotation.y=el+w}
    if(x.l<=0)x.g.visible=false}}
  for(q=0;q<SC.length;q++){var sc=SC[q];if(sc.l>0){sc.l-=dt;sc.m.material.opacity=Math.min(.62,sc.l/5*.62);if(sc.l<=0)sc.m.visible=false}}
  for(q=0;q<TR.length;q++){var t=TR[q];if(t.l>0){t.l-=dt;t.m.material.opacity=Math.max(0,t.l/.07)*.9;if(t.l<=0)t.m.visible=false}}
}

/* ================= 화면 반영 ================= */
/* 고정 간격 시뮬레이션(60Hz) 사이를 화면 주사율에 맞춰 보간 */
function ip(o){
  var px=o.px;
  if(px===undefined||Math.abs(o.x-px)>4||Math.abs(o.z-o.pz)>4){IX=o.x;IY=o.y;IZ=o.z}
  else{IX=px+(o.x-px)*ALPHA;IY=o.py+(o.y-o.py)*ALPHA;IZ=o.pz+(o.z-o.pz)*ALPHA}
}
function savePrev(){
  var q,o;P.px=P.x;P.py=P.y;P.pz=P.z;
  for(q=0;q<bots.length;q++){o=bots[q];o.px=o.x;o.py=o.y;o.pz=o.z}
  for(q=0;q<drones.length;q++){o=drones[q];o.px=o.x;o.py=o.y;o.pz=o.z}
}
function sync(){
  var q,b,m;
  ip(P);cam.position.set(IX,IY+1.6+(RM?0:Math.sin(bobT*2)*.025),IZ);cam.rotation.set(P.pitch+kick,P.yaw+kickY,0);
  mLight.position.copy(cam.position);
  if(shake>0){cam.rotation.x+=(Math.random()-.5)*shake*.07;cam.rotation.y+=(Math.random()-.5)*shake*.05;cam.rotation.z=(Math.random()-.5)*shake*.07}
  dome.position.copy(cam.position);clouds.position.copy(cam.position);clouds.rotation.y=tNow*.004;sun.position.set(P.x+10,P.y+24,P.z+26);sun.target.position.set(P.x,P.y,P.z);sun.target.updateMatrixWorld();
  st('boom','opacity',boomA>0?boomA.toFixed(2):'0');st('slow','opacity',slowT>0?Math.min(1,slowT*2).toFixed(2):'0');
  if(DG&&AC)DG.gain.setTargetAtTime(state==='play'?Math.min(.03,drones.length*.011):0,AC.currentTime,.3);
  st('dir','opacity',dirT>0?Math.min(1,dirT).toFixed(1):'0');if(dirT>0)st('dir','transform','rotate('+dirA.toFixed(2)+'rad)');
  for(q=0;q<bots.length;q++){
    b=bots[q];m=b.m;ip(b);m.g.position.set(IX,IY,IZ);m.g.rotation.y=b.rot;m.sh.visible=!SHD&&b.die<=0;
    /* 먼 적은 그림자 생략 */
    var md1=Math.abs(b.x-P.x)+Math.abs(b.z-P.z);
    if(m.far){var fr=md1>46&&b.die<=0&&!b.boss;if(fr!==m.fv){m.fv=fr;m.far.visible=fr;m.u.visible=!fr}}
    if(m.cm){var nr=md1<45;if(nr!==m.nr){m.nr=nr;for(var cq=0;cq<m.cm.length;cq++)m.cm[cq].castShadow=nr}}
    m.mat.emissive.setHex(b.hit>0?0x8a8a8a:b.frz>0?0x2a5a9a:b.inv?0x5a3a8a:b.burn>0?0x5a2408:b.el?0x3a1f52:b.tp==='pylon'?0x2a1a44:HLC[CFG.hl]);
    if(b.tp==='stalker'){var vis=b.die>0||b.hit>0||b.fl>0||b.frz>0||Math.hypot(P.x-b.x,P.z-b.z)<6.5?.95:.06;m.mat.opacity+=(vis-m.mat.opacity)*Math.min(1,fdt*9)}
    if(b.die>0){var p=Math.min(1,(1.3-b.die)/.35);m.g.rotation.x=-p*p*1.5;if(b.die<.4)m.g.position.y=b.y-(.4-b.die)*1.2*b.sc;m.fl.visible=false;if(m.lz)m.lz.visible=false}
    else if(b.tp==='pylon'){m.cr.rotation.y=tNow*1.5;m.cr.position.y=1.9+Math.sin(tNow*2+q)*.12;
      if(bossB&&bossB.die<=0)beam(m.lz,b.x,b.y+2,b.z,bossB.x,bossB.y+bossB.sc*1.3,bossB.z,2.5+Math.sin(tNow*9)*.6);else m.lz.visible=false}
    else if(b.fly){var mo=b.tp==='mother';m.u.position.y=(mo?1.4:.4)+Math.sin(b.ph*.12)*.06;m.g.rotation.x=mo?.04:.12;m.g.rotation.z=Math.sin(b.ph*.07)*(mo?.04:.1);m.fl.visible=b.fl>0;
      if(b.frz<=0)for(var w2=0;w2<4;w2++)m.rot[w2].rotation.y=b.ph+w2}
    else{var kd=BT[b.tp].geo||b.tp,am=kd==='rusher'||kd==='bomber'?.95:kd==='heavy'||kd==='boss'?.45:.7,sw2=Math.sin(b.ph)*am;
      m.thL.rotation.x=sw2;m.thR.rotation.x=-sw2;m.knL.rotation.x=Math.max(0,Math.sin(b.ph+1.3))*am*1.2;m.knR.rotation.x=Math.max(0,Math.sin(b.ph+1.3+Math.PI))*am*1.2;
      var pt=Math.max(-.5,Math.min(.5,-Math.atan2(P.y-b.y,Math.hypot(P.x-b.x,P.z-b.z))));
      m.up.position.y=1+Math.abs(Math.sin(b.ph))*.035;m.up.rotation.x=(kd==='rusher'||kd==='bomber'?.2:0)+(b.dash>0?.45:0)+pt*.55;m.up.rotation.y=Math.sin(b.ph)*.06;m.head.rotation.x=pt*.45;
      m.fl.visible=b.fl>0;
      if(kd==='rusher'){var lu=b.fl>0?-.5:b.ch>0?.6:Math.sin(b.ph)*.12;m.aR.rotation.x=-1.35+lu;m.aL.rotation.x=-1.35-(b.ch>0?-lu:lu)}
      else if(kd==='boss'&&b.sl>1.2){m.aR.rotation.x=m.aL.rotation.x=-2.4+(1.6-b.sl)*3}
      else if(kd==='boss'){m.aR.rotation.x=m.aL.rotation.x=-1.15}
      if(m.halo)m.halo.rotation.z=tNow*1.5;
      if(m.lz){var ca=Math.cos(b.rot),sa=Math.sin(b.rot);
        if(b.tp==='sniper'&&b.ch>0)beam(m.lz,b.x+(ca*.3+sa*1.2)*b.sc,b.y+1.28*b.sc,b.z+(-sa*.3+ca*1.2)*b.sc,P.x,P.y+1.1,P.z,.3+b.ch*.5);
        else if(b.tp==='crusher'&&b.ch>0)beam(m.lz,b.x,b.y+.5,b.z,b.x+sa*24,b.y+.5,b.z+ca*24,4+b.ch*10);
        else if(b.tp==='medic'&&b.tg)beam(m.lz,b.x,b.y+1.4,b.z,b.tg.x,b.tg.y+(b.tg.fly?.5:b.tg.sc*1.2),b.tg.z,1.6+Math.sin(tNow*12)*.5);
        else m.lz.visible=false}
    }
  }
  for(q=0;q<drones.length;q++){var dr=drones[q],dm=dr.m;
    if(dr.tur){dm.g.position.set(dr.x,dr.y,dr.z);dm.head.rotation.y=dr.yaw}
    else{ip(dr);dm.g.position.set(IX,IY+Math.sin(tNow*4+q*1.7)*.05,IZ);dm.g.rotation.y=dr.yaw;dm.g.rotation.z=Math.sin(tNow*2+q)*.06+(dr.hp<dr.mhp*.4?Math.sin(tNow*17+q)*.08:0);
      for(var w=0;w<4;w++)dm.rot[w].rotation.y=tNow*40+w}}
  for(q=0;q<items.length;q++){var it=items[q],g=it.g;g.position.set(it.x,it.y+.6+Math.sin(tNow*3+q)*.08,it.z);g.rotation.y=tNow*1.8;
    g.userData.ring.rotation.z=-tNow*1.8;g.visible=it.life>4||(tNow*6|0)%2===0}
  /* ---- 1인칭 총 모션 ---- */
  var W=WP[CUR],G=guns[CUR],e0=adsA,a=e0*e0*(3-2*e0),dtg=Math.min(.033,fdt),rT=CUR===1?shellT():relT(CUR),
      rp=P.rel>0?Math.max(0,Math.min(1,(rT-P.rel)/rT)):0,sw=swT>0?Math.sin((1-swT/.26)*Math.PI):0,bk=RM?0:1-a,sc=CUR===2&&a>.85,
      rate=W.rate/PK.rate,cyc=Math.max(0,Math.min(1,1-P.cd/rate));
  function ss(x,a0,b0){x=(x-a0)/(b0-a0);x=x<0?0:x>1?1:x;return x*x*(3-2*x)}
  /* 반동 스프링 */
  gzV+=(-190*gz-19*gzV)*dtg;gz+=gzV*dtg;gpV+=(-170*gp-17*gpV)*dtg;gp+=gpV*dtg;
  gyV+=(-150*gyw-16*gyV)*dtg;gyw+=gyV*dtg;grV+=(-150*gr-15*grV)*dtg;gr+=grV*dtg;gyyV+=(-140*gy-15*gyyV)*dtg;gy+=gyyV*dtg;
  /* 시점 이동에 따른 총 흔들림 */
  var dyw=P.yaw-lyaw,dpt=P.pitch-lpit;lyaw=P.yaw;lpit=P.pitch;if(dyw>3)dyw-=6.283;if(dyw<-3)dyw+=6.283;
  var k1=Math.min(1,fdt*9);swX+=(Math.max(-.07,Math.min(.07,dyw*.8))-swX)*k1;swY+=(Math.max(-.06,Math.min(.06,dpt*.8))-swY)*k1;
  kickY*=Math.max(0,1-fdt*7);if(melA>0)melA=Math.max(0,melA-fdt*3.4);
  var air=Math.max(-.03,Math.min(.03,-P.vy*.004)),ml2=melA>0?Math.sin(melA*Math.PI):0,
      tl=0,magD=0,boltB=0,lhY=0;
  if(P.rsh||CUR===1&&relA>.01){relA+=((P.rsh?1:0)-relA)*Math.min(1,fdt*9);tl=relA}
  else if(rp>0){tl=ss(rp,0,.14)*(1-ss(rp,.7,.9));
    magD=rp<.16?0:rp<.3?ss(rp,.16,.3):rp<.4?1:1-ss(rp,.4,.58);lhY=magD;
    if(P.relE)boltB=ss(rp,.8,.87)*(1-ss(rp,.87,.96));
    if(!P.dm&&rp>.24&&G.mag&&CUR!==3){P.dm=1;var dg=DMAG[dmI];dmI=(dmI+1)%DMAG.length;dg.m.position.set(G.g.position.x,G.g.position.y+G.my-.2,G.g.position.z+(G.mag.position.z||0));
      dg.m.rotation.set(.2,0,-.4);dg.m.visible=true;dg.l=.7;dg.vx=-.15;dg.vy=-.2;dg.vr=3}
    if(rp>.58&&P.dm===1){P.dm=2;gyyV-=.35;gpV+=.6}} /* 탄창 결합 충격 */
  else if(relA>0)relA=0;
  for(q=0;q<DMAG.length;q++){var dg2=DMAG[q];if(dg2.l>0){dg2.l-=fdt;dg2.vy-=4.5*fdt;dg2.m.position.x+=dg2.vx*fdt;dg2.m.position.y+=dg2.vy*fdt;dg2.m.rotation.x+=dg2.vr*fdt;if(dg2.l<=0)dg2.m.visible=false}}
  G.g.position.set(G.hip[0]+(G.ads[0]-G.hip[0])*a+Math.sin(bobT)*.006*bk-swX*.35*(1-a*.6)-tl*.03+ml2*.1,
    G.hip[1]+(G.ads[1]-G.hip[1])*a+Math.abs(Math.cos(bobT))*.006*bk-sw*.3+gy+air+swY*.3-tl*.04,
    G.hip[2]+(G.ads[2]-G.hip[2])*a+gz*(1-a*.35)-ml2*.28);
  G.g.rotation.set(gp*(1-a*.5)-sw*.9-swY+tl*.28+(P.ds>0?-.12:0),gyw*(1-a*.5)+swX+tl*.2+ml2*.9,gr*(1-a*.4)-tl*.5-swX*.6-ml2*.5);G.g.visible=!sc;
  if(G.mag){G.mag.position.y=G.my-magD*.24;G.mag.visible=!(rp>.3&&rp<.4)}
  if(G.lh){G.lh.position.y=-lhY*.2;G.lh.position.z=lhY*.05}
  if(G.bolt)G.bolt.position.z=G.bz+Math.max(recoil*.045,boltB*.05); /* 소총 노리쇠 */
  if(G.core)G.core.scale.z=1+recoil*.8+(cyc<1?(1-cyc)*.6:0);
  if(G.war){var wr=P.rel>0?ss(rp,.4,.8):1;G.war.visible=P.am[3]>0||P.rel>0&&rp>.4;G.war.position.z=-.7-(1-wr)*.3}
  if(G.pump){var pb2=cyc>.15&&cyc<.75?Math.sin((cyc-.15)/.6*Math.PI):0;G.pump.position.z=-.32+pb2*.09;
    if(caseP&&cyc>.38&&P.rel<=0){caseP=0;eject(G);sPump()}
    G.shell.visible=!!P.rsh;if(P.rsh){var sp3=ss(rp,.1,.8);G.shell.position.set(.03*(1-sp3),-.2+sp3*.13,.06-sp3*.04)}}
  if(G.sbolt){ /* 저격총 볼트: 들기 → 당기기 → 밀기 → 내리기 */
    var up2=ss(cyc,.14,.3)*(1-ss(cyc,.74,.9)),bk2=ss(cyc,.3,.48)*(1-ss(cyc,.52,.72));
    if(P.rel>0&&P.relE){up2=ss(rp,.78,.84)*(1-ss(rp,.93,.99));bk2=ss(rp,.84,.88)*(1-ss(rp,.89,.93))}
    G.sbolt.rotation.z=up2*.9;G.sbolt.position.z=.1+bk2*.07;G.g.rotation.z+=up2*.06;G.g.rotation.x+=bk2*.03;
    if(caseP&&cyc>.44&&P.rel<=0){caseP=0;eject(G);nz(.04,.12,'bandpass',2500,2100,{q:4})}}
  var tf=BF+(W.ads*BF/70-BF)*a;if(Math.abs(cam.fov-tf)>.01){cam.fov=tf;cam.updateProjectionMatrix()}
  st('scope','opacity',sc?'1':'0');st('hud','visibility',sc?'hidden':'');var cc=sc?'sc':a>.5?'ads':'';if(_sv.chc!==cc){_sv.chc=cc;$('ch').className=cc}
  flash.visible=flashT>0;if(flashT>0){flash.rotation.z=Math.random()*6.3;var s=.8+Math.random()*.7;flash.scale.set(s,s,s)}
  var cg=Math.round(6+bloom*14+(CUR===1?10:CUR===2?8:CUR===4?12:0));if(_sv.chg!==cg){_sv.chg=cg;$('ch').style.setProperty('--g',cg+'px')}st('hm','opacity',hitM>0?'1':'0');
}
var WM=null,wmT=0,wmDone=0;
function autoOn(dt){if(!CFG.auto||!touchAim)return false;afT-=dt;if(afT<=0){afT=.07;afOn=P.am[CUR]>0&&aimHit()}return afOn}
/* 첫 실행 안내 */
var tipOn=false,tipI=0,tipT=0,TIPS=[];
function tipTick(dt){if(!tipOn)return;tipT-=dt;if(tipT>0)return;tipI++;
  if(tipI>=TIPS.length){tipOn=false;$('tip').textContent='';try{localStorage.setItem('ss_tut','1')}catch(e){}}else{$('tip').textContent=TIPS[tipI];tipT=5.5}}
var hudC='',mmT=0,mmB=null,MMS=132;
/* 미니맵: 북쪽 고정. 플레이어 삼각형 · 적 원 · 보스 사각형 · 아이템 마름모 */
function drawMini(){
  var c=$('mm'),g=c.getContext('2d'),k=MMS*2/Math.max(MW,MH)/CS,ox=(MMS*2-MW*CS*k)/2,oz=(MMS*2-MH*CS*k)/2,q,b,x,z,cs=CS*k;
  if(!mmB){mmB=document.createElement('canvas');mmB.width=mmB.height=MMS*2;var h=mmB.getContext('2d');
    h.fillStyle='rgba(34,34,34,.78)';h.fillRect(0,0,MMS*2,MMS*2);
    for(z=0;z<MH;z++)for(x=0;x<MW;x++){var t=MAP[z][x];if(t==='#')continue;h.fillStyle=t==='.'?'#4a464e':t==='U'?'#7d7686':'#635d6b';h.fillRect(ox+x*cs,oz+z*cs,cs+.5,cs+.5)}
    h.strokeStyle='#C1BDC6';h.lineWidth=2;for(q=0;q<PORT.length;q++)for(b=0;b<2;b++){h.beginPath();h.arc(ox+(PORT[q][b][0]+.5)*cs,oz+(PORT[q][b][1]+.5)*cs,cs*.4,0,6.3);h.stroke()}}
  g.clearRect(0,0,MMS*2,MMS*2);g.drawImage(mmB,0,0);
  g.fillStyle='#d3bba3';for(q=0;q<items.length;q++){x=ox+items[q].x*k;z=oz+items[q].z*k;g.beginPath();g.moveTo(x,z-5);g.lineTo(x+5,z);g.lineTo(x,z+5);g.lineTo(x-5,z);g.fill()}
  for(q=0;q<bots.length;q++){b=bots[q];if(b.die>0)continue;x=ox+b.x*k;z=oz+b.z*k;
    if(b.boss){g.fillStyle='#EEECE9';g.fillRect(x-8,z-8,16,16);g.fillStyle='#d9776c';g.fillRect(x-6,z-6,12,12)}
    else{g.fillStyle=b.tp==='pylon'?'#c9a9ee':'#e89088';g.beginPath();g.arc(x,z,b.el?6:4,0,6.3);g.fill()}}
  x=ox+P.x*k;z=oz+P.z*k;g.save();g.translate(x,z);g.rotate(-P.yaw);g.fillStyle='#EEECE9';g.strokeStyle='#222';g.lineWidth=2;
  g.beginPath();g.moveTo(0,-11);g.lineTo(7,8);g.lineTo(0,4);g.lineTo(-7,8);g.closePath();g.fill();g.stroke();g.restore();
}
function hud(){
  var pw=P.pw>0?Math.ceil(P.pw):0,dn=drones.length,vp=P.vp>0?Math.ceil(P.vp):0,sl=slowT>0?Math.ceil(slowT):0,ov=P.ov>0?Math.ceil(P.ov):0,s=META.cur+'|'+(P.ac>0)+'|'+P.gr+'|'+(P.dc>0)+'|'+P.mhp+'|'+vp+'|'+P.sh+'|'+sl+'|'+ov+'|'+P.hp+'|'+CUR+'|'+P.am[CUR]+'|'+P.rs[CUR]+'|'+wave+'|'+kills+'|'+(P.rel>0)+'|'+pw+'|'+dn;
  if(s!==hudC){hudC=s;$('hp').textContent=P.hp;$('hpb').style.width=Math.max(0,P.hp/P.mhp*100)+'%';$('wn').textContent=WP[CUR].n;$('am').textContent=P.am[CUR]+' / '+P.rs[CUR];
    $('wv').textContent=Math.max(1,wave);$('kl').textContent=kills;
    var tx=[];if(P.rel>0)tx.push('재장전 중');else if(P.am[CUR]<WP[CUR].low)tx.push('탄약 부족');if(pw)tx.push('강화탄 '+pw+'초');if(dn)tx.push('드론 '+dn+'기');if(P.sh>0)tx.push('방어막 '+P.sh);if(vp)tx.push('흡혈 '+vp+'초');if(sl)tx.push('감속 '+sl+'초');if(ov)tx.push('과열 '+ov+'초');tx.push('수류탄 '+P.gr);if(CUR===0&&P.ac<=0)tx.push('유탄 준비');if(P.dc>0)tx.push('대시 대기');
    $('rl').textContent=tx.join(' · ')||'\u00a0'}
  st('hurt','opacity',hurt>0?(hurt*.8).toFixed(2):'0');
  if(CFG.mini&&tNow-mmT>.1){mmT=tNow;drawMini()}
  var bo=bossB&&bossB.die<=0;if($('boss').hidden===bo)$('boss').hidden=!bo;
  if(bo){st('bbi','width',Math.max(0,bossB.hp/bossB.mhp*100).toFixed(1)+'%');var bt=BT[bossB.tp].n+(bossB.inv?' · 무적':'')+' · '+Math.max(0,Math.ceil(bossB.hp));if(_sv.bn!==bt){_sv.bn=bt;$('bn').textContent=bt}}
}

/* ================= 흐름 ================= */
function start(){
  initAudio();
  if(AC&&AC.state==='suspended'){try{AC.resume()}catch(e){}}
  bank();cap=null;reset();state='play';$('ov').hidden=true;$('rst').hidden=true;$('pk').hidden=true;firing=false;K={};acc=0;
  var sw0=+$('sw').value||1; /* 상위 웨이브 시작 시 보급 */
  if(sw0>1){wave=sw0-1;P.rs[0]=72+sw0*8;P.rs[1]=18+sw0;P.rs[2]=15+(sw0>>1);P.rs[3]=Math.min(9,2+(sw0/5|0));P.am[3]=1;P.sh=Math.min(120,40+sw0*3);
    for(var q=0;q<Math.min(5,1+(sw0/8|0));q++)addDrone();for(q=2;q<=sw0;q++)if(INTRO[q])seen[INTRO[q]]=1}
  /* 해금 효과 */
  var o=META.own;if(o.shield)P.sh=Math.max(P.sh,40);if(o.gren){PK.grx+=2;P.gr+=2}if(o.rocket){P.am[3]=1;P.rs[3]=Math.max(P.rs[3],2)}if(o.drone)addDrone();
  var seenT=false;try{seenT=!!localStorage.getItem('ss_tut')}catch(e){}
  tipOn=!seenT;tipI=-1;tipT=1.2;$('tip').textContent='';
  TIPS=document.body.classList.contains('touch')?['왼쪽 화면을 드래그해 이동','오른쪽 화면을 드래그해 조준','사격 버튼을 누른 채 드래그하면 조준 유지','장전 · 무기 · 조준 버튼은 이동 중에도 동작','점프로 낮은 상자에 오르고, 대시로 위험에서 이탈']
    :['WASD로 이동, 화면을 클릭해 마우스 조준','좌클릭 사격 · 우클릭 정조준 · R 재장전','E 점프 · 왼쪽 Shift 대시 · G 수류탄','X 보조 사격 · V 근접 공격 · 1~6 무기 교체','P 또는 Esc로 일시정지와 설정'];
  try{cv.focus()}catch(e){}
  if(o.perk)openPick();
}
/* 런 종료 정산: 스프링클 적립과 기록 저장 */
function bank(){
  if(!ST||ST.banked||ST.t===undefined||ST.t<3)return 0;
  ST.banked=true;var earn=kills+wave*5+ST.boss*30+ST.bonus;META.cur+=earn;saveMeta();
  var runs=lsGet('ss_runs',[]);runs.unshift({m:MDEF.name,w:wave,k:kills,t:Math.round(ST.t),a:ST.shots?Math.round(ST.hits/ST.shots*100):0,c:ST.cause||'중단',p:ST.perks.length});
  lsSet('ss_runs',runs.slice(0,30));drawShop();drawLog();return earn;
}
function fmtT(t){return (t/60|0)+'분 '+(t%60|0)+'초'}
function over(){
  state='dead';firing=false;rmb=false;adsT=false;adsA=0;setAim();K={};joyId=lookId=null;$('joy').style.display='none';
  try{if(document.exitPointerLock)document.exitPointerLock()}catch(e){}
  $('rst').hidden=true;$('pk').hidden=true;
  var nb=kills>best;if(nb){best=kills;try{localStorage.setItem(BKEY,best)}catch(e){}}
  $('ttl').textContent='전투 종료';$('subt').textContent=nb?'최고 기록 갱신':'다음 도전 대기';
  var earn=bank(),top='없음',tv=0,k2;for(k2 in ST.kw)if(ST.kw[k2]>tv){tv=ST.kw[k2];top=k2}
  var rows=[['처치',kills],['웨이브',wave],['최고 기록',best],['생존 시간',fmtT(ST.t)],['명중률',ST.shots?Math.round(ST.hits/ST.shots*100)+'%':'-'],['헤드샷',ST.heads],
    ['최다 처치',top+(tv?' '+tv:'')],['사망 원인',ST.cause],['획득 스프링클','+'+earn],['보유 스프링클',META.cur]],rs=$('res');
  rs.textContent='';rows.forEach(function(r){var d=document.createElement('div'),t=document.createElement('dt'),v=document.createElement('dd');t.textContent=r[0];v.textContent=r[1];d.appendChild(t);d.appendChild(v);rs.appendChild(d)});
  $('boss').hidden=true;rs.hidden=false;$('tip').textContent='';st('wtm','display','none');
  $('go').textContent='다시 시작';$('msg').textContent='';$('note').textContent='';
  hud();$('ov').hidden=false;$('go').focus();
}
$('go').addEventListener('click',function(){if(state==='pause')resume();else start()});
$('rst').addEventListener('click',start);
/* 메뉴: 한 번에 하나만 펼침 */
(function(){
  var bs=document.querySelectorAll('.t');
  function open(b,on){b.setAttribute('aria-expanded',on);$(b.getAttribute('data-p')).hidden=!on}
  Array.prototype.forEach.call(bs,function(b){b.addEventListener('click',function(){
    var on=b.getAttribute('aria-expanded')!=='true';Array.prototype.forEach.call(bs,function(o){open(o,false)});open(b,on);cap=null;
    if(on&&b.getAttribute('data-p')==='shop')drawShop();if(on&&b.getAttribute('data-p')==='logP')drawLog()})});
})();
/* 해금 */
var SHOP=[['flame','화염방사기','5번 무기 · 근거리 지속 화염과 화상',200],['rail','레일건','6번 무기 · 모든 적을 관통',350],['perk','시작 강화','시작할 때 강화 1개 선택',150],
  ['drone','시작 드론','드론 1기와 함께 시작',200],['shield','시작 방어막','방어막 40으로 시작',120],['gren','수류탄 주머니','수류탄 2개 추가 보유',80],['rocket','시작 로켓','로켓 3발과 함께 시작',150]];
function drawShop(){
  var box=$('shopl');if(!box)return;box.textContent='';$('cur').textContent=META.cur;
  SHOP.forEach(function(it){
    var own=!!META.own[it[0]],can=META.cur>=it[3],b=document.createElement('button'),l=document.createElement('span'),n=document.createElement('b'),d=document.createElement('span'),c=document.createElement('i');
    b.type='button';b.className='sh'+(own?' own':'');n.textContent=it[1];d.textContent=it[2];l.appendChild(n);l.appendChild(d);
    c.textContent=own?'보유 중':it[3]+' 스프링클';b.appendChild(l);b.appendChild(c);
    if(own||!can)b.setAttribute('aria-disabled','true');
    b.setAttribute('aria-label',it[1]+', '+it[2]+', '+(own?'보유 중':it[3]+' 스프링클'+(can?'':', 부족')));
    b.addEventListener('click',function(){if(META.own[it[0]]||META.cur<it[3])return;META.cur-=it[3];META.own[it[0]]=1;saveMeta();sPick('sd');drawShop();
      var f=$('shopl').querySelectorAll('.sh')[SHOP.indexOf(it)];if(f)f.focus()});
    box.appendChild(b)});
}
/* 기록: 최근 30판과 요약 */
function drawLog(){
  var t=$('logt');if(!t)return;var runs=lsGet('ss_runs',[]),pc=lsGet('ss_perk',{}),q;t.textContent='';
  if(!runs.length){$('logs').textContent='기록 없음';return}
  var aw=0,cs={},tc='',tn=0,k;runs.forEach(function(r){aw+=r.w;cs[r.c]=(cs[r.c]||0)+1});for(k in cs)if(cs[k]>tn){tn=cs[k];tc=k}
  var pk=Object.keys(pc).sort(function(a,b){return pc[b]-pc[a]}).slice(0,3).map(function(n){return n+' '+pc[n]+'회'}).join(', ');
  $('logs').textContent='최근 '+runs.length+'판 · 평균 웨이브 '+(aw/runs.length).toFixed(1)+' · 최다 사망 원인 '+tc+(pk?' · 자주 고른 강화: '+pk:'');
  var hr=t.insertRow();['맵','웨이브','처치','시간','명중률','사망 원인'].forEach(function(h){var th=document.createElement('th');th.scope='col';th.textContent=h;hr.appendChild(th)});
  runs.forEach(function(r){var tr=t.insertRow();[r.m,r.w,r.k,fmtT(r.t),r.a+'%',r.c].forEach(function(v){tr.insertCell().textContent=v})});
}
$('logc').addEventListener('click',function(){lsSet('ss_runs',[]);lsSet('ss_perk',{});drawLog()});
/* 맵 선택: 저장 후 새로고침으로 적용 */
(function(){
  var sel=$('mp');MAPS.forEach(function(m,n){var o=document.createElement('option');o.value=n;o.textContent=m.name+' · '+m.desc;sel.appendChild(o)});
  sel.value=MAPI;$('subt').textContent=MDEF.name+' · 웨이브 생존전'+(best?' · 최고 '+best:'');
  sel.addEventListener('change',function(){try{localStorage.setItem('ss_map',sel.value)}catch(e){}location.reload()});
})();
/* 설정 */
function applyCfg(){
  if(MG)MG.gain.value=snd?.9*CFG.vol:0;
  document.documentElement.style.setProperty('--bs',CFG.bsz);
  st('fps','display',CFG.fps?'block':'none');st('mm','display',CFG.mini?'block':'none');
  if(!CFG.dyn&&rsc!==1){rsc=1;applyRes()}
}
(function(){
  function bind(id,key,num){var e=$(id);if(e.type==='checkbox')e.checked=CFG[key];else e.value=CFG[key];
    e.addEventListener(e.type==='range'?'input':'change',function(){CFG[key]=e.type==='checkbox'?e.checked:num?+e.value:e.value;saveCfg();applyCfg();out()})}
  function out(){$('sensv').textContent=CFG.sens.toFixed(1)+'배';$('volv').textContent=Math.round(CFG.vol*100)+'%';$('bszv').textContent=Math.round(CFG.bsz*100)+'%';$('shkv').textContent=Math.round(CFG.shk*100)+'%';$('flsv').textContent=Math.round(CFG.fls*100)+'%'}
  bind('sens','sens',1);bind('vol','vol',1);bind('cap','cap',1);bind('diff','diff',1);bind('fpsc','fps');bind('dync','dyn');bind('minic','mini');bind('bsz','bsz',1);bind('autoc','auto');bind('shk','shk',1);bind('fls','fls',1);bind('hl','hl',1);out();applyCfg();
})();
function setShd(v){SHD=v;sun.castShadow=v;var b=$('shd');b.setAttribute('aria-pressed',v);b.textContent=v?'그림자 켬':'그림자 끔';try{localStorage.setItem('botarena3d_shadow',v?'1':'0')}catch(e){}}
$('shd').addEventListener('click',function(){setShd(!SHD)});setShd(SHD);
function setHQ(v){
  if(v&&!PP){PP=mkPost();if(PP)PP.size(innerWidth,Math.max(1,innerHeight));else v=false}
  HQ=v;for(var q=0;q<BUMP.length;q++){BUMP[q][0].bumpMap=v?BUMP[q][1]:null;BUMP[q][0].needsUpdate=true}
  var b=$('hq');b.setAttribute('aria-pressed',v);b.textContent=v?'고급 효과 켬':'고급 효과 끔';try{localStorage.setItem('botarena3d_hq',v?'1':'0')}catch(e){}
}
$('hq').addEventListener('click',function(){setHQ(!HQ)});setHQ(HQ);
$('kbtn').addEventListener('click',function(){var k=$('keys'),open=k.hidden;k.hidden=!open;cap=null;this.setAttribute('aria-expanded',open);if(open)drawKeys()});
$('kdef').addEventListener('click',function(){for(var a in DEF)BIND[a]=DEF[a];cap=null;saveB();drawKeys()});
$('snd').addEventListener('click',function(){
  snd=!snd;this.setAttribute('aria-pressed',snd);this.textContent=snd?'소리 켬':'소리 끔';if(MG)MG.gain.value=snd?.9*CFG.vol:0;
});
var lt=0,acc=0,ALPHA=1,STEP=1/60,fdt=.016,IX=0,IY=0,IZ=0,lastSh=0,
    pf={n:0,sum:0,mn:1e9,bad:0,t:0,ref:16.7,up:4,bk:1,trial:false};
/* 0.5초 단위 프레임 통계. 목표 프레임 시간을 넘기면 렌더 해상도를 낮추고, 여유가 이어지면 다시 올림 */
function perfTick(raw){
  if(raw>250||raw<=0){pf.bad=1;return}
  pf.n++;pf.sum+=raw;if(raw<pf.mn)pf.mn=raw;pf.t+=raw;
  if(pf.t<500)return;
  var am=pf.sum/pf.n,bad=pf.bad,mn=pf.mn;
  pf.n=0;pf.sum=0;pf.mn=1e9;pf.t=0;pf.bad=0;
  if(CFG.fps)$('fps').textContent=Math.round(1000/am)+' FPS · '+am.toFixed(1)+'ms · 해상도 '+Math.round(rsc*100)+'%';
  if(bad||!CFG.dyn||state!=='play')return;
  if(mn<12)pf.ref=Math.min(pf.ref,Math.max(6.9,mn)); /* 고주사율 화면 감지 */
  var target=Math.max(pf.ref,CFG.cap?1000/CFG.cap:0);
  if(am>target*1.18){
    if(pf.trial)pf.bk=Math.min(16,pf.bk*2); /* 올리자마자 떨어졌으면 재시도 간격을 늘림 */
    pf.trial=false;pf.up=4*pf.bk;
    if(rsc>.5){rsc=Math.max(.5,+(rsc-.1).toFixed(2));applyRes()}
  }else{
    pf.up-=.5;if(pf.trial&&pf.up<=4*pf.bk-1.5)pf.trial=false;
    if(pf.up<=0&&rsc<1){rsc=Math.min(1,+(rsc+.1).toFixed(2));applyRes();pf.trial=true;pf.up=4*pf.bk}
  }
}
function frame(t){
  requestAnimationFrame(frame);
  var raw=t-lt;
  if(CFG.cap&&raw<1000/CFG.cap-1.5)return; /* 프레임 제한 */
  lt=t;perfTick(raw);
  var dt=Math.min(.1,raw/1000||0),n=0,slo;fdt=dt;tNow=t/1000;
  if(state==='play'){
    acc+=dt;
    while(acc>=STEP-1e-6&&n<6&&state==='play'){savePrev();slo=bulletT>0?.3:1;if(bulletT>0)bulletT-=STEP;update(STEP*slo);acc-=STEP;n++}
    if(n===6&&acc>STEP)acc=0; /* 10fps 미만에서는 게임 시간을 늦춤 */
    ALPHA=Math.max(0,Math.min(1,acc/STEP));
    if(state==='play')hud();
  }else if(state==='menu'){P.yaw+=dt*.15}
  if(state!=='pause'&&state!=='pick')fx(dt*(bulletT>0?.3:1));
  sync();
  if(SHD&&t-lastSh>=15.5){renderer.shadowMap.needsUpdate=true;lastSh=t}
  if(HQ&&PP)renderPost();
  else{renderer.setRenderTarget(null);renderer.clear();renderer.render(scene,cam);renderer.clearDepth();renderer.render(gScene,gCam)}
}
reset();flow();requestAnimationFrame(frame);
})();

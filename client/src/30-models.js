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


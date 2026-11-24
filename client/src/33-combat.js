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
  if(NET.guest){netHit(b,amt,x,y,z,head,src,noNum);return false}
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
      tx=(TG||P).x+(Math.random()-.5)*2.4,tz=(TG||P).z+(Math.random()-.5)*2.4;
  m.visible=true;b.fl=.1;sLob(b);
  grenades.push({m:m,x:gx,y:gy,z:gz,vx:(tx-gx)/T2,vz:(tz-gz)/T2,vy:((TG||P).y-gy)/T2+.5*14*T2,fuse:-1,r:null});
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
  P.hp-=dmg;hurt=1;sHurt(0);if(P.hp<=0){P.hp=0;if(NET.guest){netDown();return true}ST.cause=hitBy||'알 수 없음';over();return true}return false;
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
  if((en===1||en===2)&&NET.on&&NET.host)netBlast(x,y,z);
  if(en===1||en===2){l=drones.slice();for(q=0;q<l.length;q++){d=Math.hypot(l[q].x-x,l[q].y-y,l[q].z-z);if(d<4.6)hurtDrone(l[q],60*(1-d/4.6))}}
  if(en!==3&&en!==5&&state==='play'){hitBy=en===0?'자신의 폭발물':'폭발';d=Math.hypot(P.x-x,P.y+1-y,P.z-z);var pr=en===0?4:4.6;if(d<pr)hurtP((en===0?40:36)*(1-d/pr),x,z)}
}
function launch(x,y,z,dx,dy,dz,en){
  var m=null,q;for(q=0;q<RK.length;q++)if(!RK[q].visible){m=RK[q];break}
  if(!m)return;m.visible=true;m.position.set(x,y,z);
  rockets.push({m:m,x:x,y:y,z:z,dx:dx,dy:dy,dz:dz,l:en?6:3,e:en});
}
function fireRocket(dx,dy,dz,rx,rz){launch(P.x+dx*.9+rx*.18,P.y+1.5+dy*.9,P.z+dz*.9+rz*.18,dx,dy,dz,0)}
function botShot(b,ch,dmg,d){if(!TG)TG=P; /* 반환값 true = 플레이어 사망 */
  var sc=b.sc,ca=Math.cos(b.rot),sa=Math.sin(b.rot),k=b.fly?(b.tp==='mother'?1.5:.4):sc,gx=b.x+(ca*.3+sa*.9)*k,gz=b.z+(-sa*.3+ca*.9)*k,
      gy=b.y+(b.fly?(b.tp==='mother'?.9:.3):1.25*sc),ty=TG.y+.95;
  b.fl=.07;sBot(b);
  /* 일부 사격은 드론 · 포탑을 노림 */
  if(drones.length&&Math.random()<.28){var dr=drones[Math.random()*drones.length|0],dy0=dr.y+(dr.tur?.8:0);
    if(Math.hypot(dr.x-gx,dr.z-gz)<40&&los(gx,gy,gz,dr.x,dy0,dr.z)){tracer(gx,gy,gz,dr.x,dy0,dr.z,0xff9f8a);if(Math.random()<Math.min(.8,ch+.25))hurtDrone(dr,dmg*1.3);return false}}
  if(!los(gx,gy,gz,TG.x,ty,TG.z)){ /* 엄폐물에 막힌 사격 */
    var bl=Math.hypot(TG.x-gx,ty-gy,TG.z-gz)||1,bx=(TG.x-gx)/bl,by=(ty-gy)/bl,bz=(TG.z-gz)/bl,bt=ray(gx,gy,gz,bx,by,bz,bl);
    if(bt<0)bt=bl;tracer(gx,gy,gz,gx+bx*bt,gy+by*bt,gz+bz*bt,0xff9f8a);puff(gx+bx*bt,gy+by*bt,gz+bz*bt,5,2.4,1,.85,.6,.3);sRico(gx+bx*bt,gz+bz*bt);
    return false;
  }
  var hitP=Math.random()<ch,off=hitP?.15:1.1;
  tracer(gx,gy,gz,TG.x+(Math.random()-.5)*off*2,TG.y+1.2+(Math.random()-.5)*off,TG.z+(Math.random()-.5)*off*2,0xff9f8a);
  if(!hitP)sWhiz(sp(b.x,b.z).pan*-.6);
  if(hitP)hitBy=BT[b.tp].n;
  return hitP?hurtT(dmg,b.x,b.z):false;
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


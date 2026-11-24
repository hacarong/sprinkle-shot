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

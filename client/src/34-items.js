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


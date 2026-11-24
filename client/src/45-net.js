/* ================= 협동 멀티 (1단계) =================
   방장의 브라우저가 적·웨이브를 시뮬레이션하고 초당 12회 스냅숏을 보냅니다.
   참가자는 자기 캐릭터만 직접 움직이고, 적에게 준 피해를 방장에게 전달합니다.
   서버(/ws)는 같은 방 안에서 메시지를 중계만 합니다. */
var NET={on:false,ws:null,id:0,host:false,hostId:0,room:'',guest:false,names:{},pT:0,wT:0,tT:0,hq:{},hT:0},
    PEER={},NB={},NID=0,TG=null,TPN=Object.keys(BT),avG=null,avM=null;
function netSend(s){if(NET.ws&&NET.ws.readyState===1)try{NET.ws.send(JSON.stringify({t:'state',s:s}))}catch(e){}}
function r1(v){return Math.round(v*10)/10}
function netStatus(t){var e=$('nst');if(e)e.textContent=t}
function netList(){
  var ids=Object.keys(NET.names),l=ids.map(function(i){return NET.names[i]+(+i===NET.hostId?' (방장)':'')+(+i===NET.id?' (나)':'')}).join(', ');
  netStatus(NET.on?'방 '+NET.room+' · '+ids.length+'명 · '+l+(NET.host?' · 시작을 누르면 참가자도 함께 시작':' · 방장이 시작하면 자동 합류'):'연결 안 됨');
  $('njoin').hidden=NET.on;$('nleave').hidden=!NET.on;$('go').textContent=NET.on&&!NET.host&&state!=='pause'?'방장 시작 대기':state==='pause'?'계속':state==='dead'?'다시 시작':'시작';
}
function netJoin(){
  if(NET.ws)return;
  var name=($('nname').value||'').trim(),room=($('nroom').value||'').trim().toUpperCase();
  if(!/^[A-Z0-9]{4,8}$/.test(room)){netStatus('방 코드는 영문·숫자 4~8자');$('nroom').focus();return}
  CFG.name=name.slice(0,12);saveCfg();
  var ws;try{ws=new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host+'/ws')}catch(e){netStatus('이 환경에서는 멀티 서버에 연결할 수 없음');return}
  NET.ws=ws;netStatus('연결 중');
  ws.onopen=function(){ws.send(JSON.stringify({t:'join',room:room,name:CFG.name||'플레이어'}))};
  ws.onerror=function(){netStatus('멀티 서버에 연결할 수 없음')};
  ws.onclose=function(){var was=NET.on,g=NET.guest;netReset();if(was)netStatus('연결 종료');if(g&&state!=='menu'&&state!=='dead'){ST.cause='연결 종료';over()}};
  ws.onmessage=function(ev){var m;try{m=JSON.parse(ev.data)}catch(e){return}
    if(m.t==='joined'){NET.on=true;NET.id=m.id;NET.room=m.room;NET.hostId=m.host;NET.host=m.host===m.id;NET.names={};m.players.forEach(function(p){NET.names[p.id]=p.name});netList()}
    else if(m.t==='peer_join'){NET.names[m.player.id]=m.player.name;netList();note(m.player.name+' 입장')}
    else if(m.t==='peer_leave'){note((NET.names[m.id]||'참가자')+' 퇴장');delete NET.names[m.id];netDrop(m.id);
      if(m.id===NET.hostId&&!NET.host){NET.ws.close()}else netList()}
    else if(m.t==='error'){netStatus(m.reason==='full'?'방이 가득 참(최대 4명)':'방 코드가 올바르지 않음');ws.close()}
    else if(m.t==='state'&&m.s)netMsg(m.id,m.s)};
}
function netReset(){
  for(var i in PEER)netDrop(i);
  NET.on=false;NET.ws=null;NET.host=false;NET.guest=false;NET.id=0;NET.names={};netList();
}
function netLeave(){if(NET.ws)NET.ws.close()}
function netDrop(id){var p=PEER[id];if(p){scene.remove(p.g);delete PEER[id]}}
/* 다른 플레이어 표시 모델 */
function mkAvatar(name){
  if(!avM){avM=[new T.MeshPhongMaterial({color:0x52cdb6,shininess:40}),new T.MeshPhongMaterial({color:0x2e3036}),new T.MeshBasicMaterial({color:0xeeece9})]}
  var g=new T.Group(),c=document.createElement('canvas'),x;c.width=256;c.height=64;x=c.getContext('2d');
  box(.5,.6,.3,avM[0],0,1.25,0,g).castShadow=true;box(.44,.2,.28,avM[1],0,.88,0,g);box(.3,.3,.3,avM[1],0,1.72,0,g);box(.24,.07,.04,avM[2],0,1.74,-.16,g);
  box(.16,.8,.2,avM[1],-.13,.4,0,g);box(.16,.8,.2,avM[1],.13,.4,0,g);box(.08,.12,.6,avM[1],.24,1.3,-.4,g);box(.14,.4,.14,avM[0],.32,1.3,-.1,g);box(.14,.4,.14,avM[0],-.32,1.25,-.05,g);
  x.font='bold 30px sans-serif';x.textAlign='center';x.textBaseline='middle';x.lineWidth=6;x.strokeStyle='#161616';x.fillStyle='#EEECE9';x.strokeText(name,128,32);x.fillText(name,128,32);
  var sp=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c),transparent:true,depthTest:false}));sp.scale.set(2,.5,1);sp.position.y=2.3;g.add(sp);
  scene.add(g);return g;
}
function netMsg(from,s){
  if(s.k==='p'){ /* 플레이어 위치 */
    var p=PEER[from];if(!p){p=PEER[from]={id:from,g:mkAvatar(s.n||NET.names[from]||'플레이어'),x:s.x,y:s.y,z:s.z,yw:s.yw};p.g.position.set(s.x,s.y,s.z)}
    p.nx=s.x;p.ny=s.y;p.nz=s.z;p.yw=s.yw;p.hp=s.hp;p.alive=s.hp>0;p.t=tNow;
  }else if(s.k==='w'){if(!NET.host&&from===NET.hostId)netWorld(s)}
  else if(s.k==='h'){ /* 참가자가 준 피해 → 방장이 적용 */
    if(!NET.host||state==='dead'||state==='menu')return;
    for(var q=0;q<bots.length;q++)if(bots[q].nid===s.b){if(bots[q].die<=0){KW='동료';dmgBot(bots[q],+s.d||0,s.x,s.y,s.z,!!s.hd,s.g?1:0,s.n?true:0)}break}
  }else if(s.k==='d'){if(s.to===NET.id&&NET.guest&&state==='play'){hitBy=s.by||'적';hurtP(s.d,s.sx,s.sz)}}
  else if(s.k==='t'){tracer(s.a[0],s.a[1],s.a[2],s.b[0],s.b[1],s.b[2],0x9fe8d8)}
  else if(s.k==='o'){if(NET.guest&&state!=='dead'&&state!=='menu'){ST.cause='방장 사망';over()}}
}
/* 참가자: 방장 스냅숏으로 적 상태 갱신 */
function netWorld(s){
  if(s.m!==MAPI){try{localStorage.setItem('ss_map',s.m);sessionStorage.setItem('ss_join',JSON.stringify({room:NET.room,name:CFG.name}))}catch(e){}location.reload();return}
  if(s.st===0)return;
  if(state==='menu'||state==='dead'||!NET.guest)startGuest();
  if(s.w!==wave){var first=wave===0;wave=s.w;hudC='';if(!first){say('웨이브 '+wave);P.hp=Math.min(P.mhp,P.hp+15);for(var wi=0;wi<WP.length;wi++)if(wi<3||P.am[wi]+P.rs[wi]>0||META.own[WP[wi].own])P.rs[wi]=Math.min(WP[wi].max,P.rs[wi]+WP[wi].add);P.gr=Math.min(5+PK.grx,P.gr+1);
      if((wave-1)%2===0&&pkW!==wave-1&&state==='play'){pkW=wave-1;openPick()}}}
  kills=s.kl;
  for(var q=0;q<s.b.length;q++){var a=s.b[q],b=NB[a[0]];
    if(!b||bots.indexOf(b)<0){if(a[7]&1)continue;b=addBot(TPN[a[1]],[0,0,0],1,!!(a[7]&2));b.nid=a[0];NB[a[0]]=b;b.x=a[2];b.y=a[3];b.z=a[4];b.px=undefined;if(b.boss)bossB=b}
    b.nx=a[2];b.ny=a[3];b.nz=a[4];b.nrot=a[5];b.hp=a[6]/100*b.mhp;b.nt=tNow;b.frz=a[7]&4?1:0;b.inv=a[7]&8?1:0;b.burn=a[7]&16?1:0;
    if(a[7]&1&&b.die<=0){b.die=b.tp==='bomber'||b.tp==='mite'||b.tp==='pylon'?.05:1.3;b.m.sh.visible=false;sKill(b);chunks(b.x,b.y+b.sc,b.z,b.boss?44:6,BT[b.tp].col,b.boss?10:5)}}
}
function netBots(dt){
  for(var q=bots.length-1;q>=0;q--){var b=bots[q];b.hit-=dt;b.fl-=dt;
    if(b.die>0){b.die-=dt;if(b.die<=0){killMesh(b);bots.splice(q,1)}continue}
    if(tNow-b.nt>1.5){killMesh(b);bots.splice(q,1);continue}
    var k=Math.min(1,dt*12),ox=b.x,oz=b.z;b.x+=(b.nx-b.x)*k;b.y+=(b.ny-b.y)*k;b.z+=(b.nz-b.z)*k;b.rot=b.nrot;
    b.ph+=b.fly?dt*30:Math.hypot(b.x-ox,b.z-oz)*2.6/b.sc}
}
/* 참가자의 피해는 방장에게 전달. 지속 피해는 0.1초 단위로 모아서 보냄 */
function netHit(b,amt,x,y,z,head,src,noNum){
  if(b.die>0||b.inv)return;
  if(noNum!==2)b.hit=.1;if(!noNum)dmgNum(x,y+.3,z,amt,head);
  if(noNum===2){NET.hq[b.nid]=(NET.hq[b.nid]||0)+amt;return}
  netSend({k:'h',b:b.nid,d:Math.round(amt),hd:head?1:0,g:src===1?1:0,n:1,x:r1(x),y:r1(y),z:r1(z)});
}
function netDown(){ /* 참가자 쓰러짐: 시작 지점에서 재투입 */
  note('쓰러짐 · 시작 지점에서 재투입');P.hp=P.mhp;P.x=(MDEF.start[0]+.5)*CS;P.z=(MDEF.start[1]+.5)*CS;P.y=0;P.vy=0;P.px=undefined;P.sh=40;hurt=1;hudC='';
}
/* 방장: 적마다 가장 가까운 생존 플레이어를 노림 */
function netTarget(b){
  var best=P,bd=Math.hypot(P.x-b.x,P.z-b.z),i,p,d;
  for(i in PEER){p=PEER[i];if(!p.alive||tNow-p.t>2)continue;d=Math.hypot(p.x-b.x,p.z-b.z);if(d<bd){bd=d;best=p}}
  return best;
}
function hurtT(dmg,sx,sz){
  if(!TG||TG===P)return hurtP(dmg,sx,sz);
  netSend({k:'d',to:TG.id,d:Math.round(dmg),sx:r1(sx),sz:r1(sz),by:hitBy});return false;
}
function netBlast(x,y,z){ /* 방장: 폭발에 휘말린 참가자에게 피해 전달 */
  for(var i in PEER){var p=PEER[i],d=Math.hypot(p.x-x,p.y+1-y,p.z-z);if(p.alive&&d<4.6)netSend({k:'d',to:p.id,d:Math.round(36*(1-d/4.6)),sx:r1(x),sz:r1(z),by:'폭발'})}
}
function netFrame(dt){
  var i,p,k;
  for(i in PEER){p=PEER[i];k=Math.min(1,dt*12);p.x+=(p.nx-p.x)*k;p.y+=(p.ny-p.y)*k;p.z+=(p.nz-p.z)*k;p.g.position.set(p.x,p.y,p.z);p.g.rotation.y=p.yw;p.g.visible=p.alive&&tNow-p.t<3}
  if(!NET.on)return;
  var live=state==='play'||state==='pick'||state==='pause';
  NET.pT+=dt;if(NET.pT>=.08&&live){NET.pT=0;netSend({k:'p',x:r1(P.x),y:r1(P.y),z:r1(P.z),yw:Math.round(P.yaw*100)/100,hp:Math.max(0,Math.round(P.hp)),n:CFG.name||'플레이어'})}
  if(NET.guest){NET.hT+=dt;if(NET.hT>=.1){NET.hT=0;for(i in NET.hq){if(NET.hq[i]>=1)netSend({k:'h',b:+i,d:Math.round(NET.hq[i]),n:1});delete NET.hq[i]}}}
  if(NET.host){NET.wT+=dt;if(NET.wT>=.085){NET.wT=0;var arr=[],q,b;
    if(live)for(q=0;q<bots.length;q++){b=bots[q];arr.push([b.nid,TPN.indexOf(b.tp),r1(b.x),r1(b.y),r1(b.z),Math.round(b.rot*100)/100,Math.max(0,Math.round(b.hp/b.mhp*100)),(b.die>0?1:0)|(b.el?2:0)|(b.frz>0?4:0)|(b.inv?8:0)|(b.burn>0?16:0)])}
    netSend({k:'w',m:MAPI,w:wave,kl:kills,st:live?1:0,b:arr})}}
}
function startGuest(){
  initAudio();if(AC&&AC.state==='suspended'){try{AC.resume()}catch(e){}}
  bank();cap=null;reset();NET.guest=true;state='play';$('ov').hidden=true;$('rst').hidden=true;$('pk').hidden=true;firing=false;K={};acc=0;pend=1e9;
  ST.sw=0;P.x+=(NET.id%3-1)*1.5;tipOn=false;$('tip').textContent='';note('협동 합류 · 적 피해는 방장이 판정');try{cv.focus()}catch(e){}
}
(function(){
  $('nname').value=CFG.name||'';
  $('njoin').addEventListener('click',netJoin);$('nleave').addEventListener('click',netLeave);
  $('nroom').addEventListener('keydown',function(e){if(e.key==='Enter')netJoin()});
  /* 맵이 달라 새로고침한 뒤 자동 재입장 */
  var j=null;try{j=JSON.parse(sessionStorage.getItem('ss_join'));sessionStorage.removeItem('ss_join')}catch(e){}
  if(j&&j.room){$('nroom').value=j.room;$('nname').value=j.name||'';setTimeout(netJoin,300)}
})();

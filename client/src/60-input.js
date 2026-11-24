/* ================= 입력 ================= */
var K={},firing=false,joyId=null,jx0=0,jy0=0,jx=0,jy=0,lookId=null,lx=0,ly=0,fireId=null,touchAim=false;
var DEF={fwd:'KeyW',back:'KeyS',left:'KeyA',right:'KeyD',fire:'KeyJ',rel:'KeyR',aim:'KeyF',next:'KeyQ',w1:'Digit1',w2:'Digit2',w3:'Digit3',w4:'Digit4',w5:'Digit5',w6:'Digit6',alt:'KeyX',melee:'KeyV',jump:'Space',dash:'ShiftLeft',gren:'KeyG',pause:'KeyP',lL:'ArrowLeft',lR:'ArrowRight',lU:'ArrowUp',lD:'ArrowDown'},
    ANAME={fwd:'전진',back:'후진',left:'좌 이동',right:'우 이동',fire:'사격',rel:'재장전',aim:'정조준',next:'다음 무기',w1:'소총',w2:'산탄총',w3:'저격총',w4:'로켓런처',w5:'화염방사기',w6:'레일건',alt:'보조 사격',melee:'근접 공격',jump:'점프',dash:'대시',gren:'수류탄',pause:'일시정지',lL:'조준 좌',lR:'조준 우',lU:'조준 상',lD:'조준 하'},
    BIND={},ACT={},cap=null;
function mapB(){ACT={};for(var a in BIND)if(BIND[a])ACT[BIND[a]]=a}
function loadB(){var o={},a;try{o=JSON.parse(localStorage.getItem('botarena3d_keys'))||{}}catch(e){}
  /* 0.6: 기본 키 변경(Space 점프, J 사격). 이전 기본값을 그대로 쓰던 저장값은 새 기본값으로 옮김 */
  var kv=0;try{kv=+localStorage.getItem('ss_keyv')||0}catch(e){}
  if(kv<1){if(o.fire==='Space')delete o.fire;if(o.jump==='KeyE')delete o.jump;try{localStorage.setItem('ss_keyv','1')}catch(e){}}
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
  if(state==='pick'){var n=e.code==='Digit1'||e.code==='Numpad1'?0:e.code==='Digit2'||e.code==='Numpad2'?1:e.code==='Digit3'||e.code==='Numpad3'?2:-1;if(n>=0){e.preventDefault();choose(n)}
    else if(/^Arrow/.test(e.code)){var cs=$('pkl').children,ci=Array.prototype.indexOf.call(cs,document.activeElement),d=e.code==='ArrowLeft'||e.code==='ArrowUp'?-1:1;
      e.preventDefault();cs[(Math.max(0,ci)+d+cs.length)%cs.length].focus()}
    return}
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
function resume(){if(state!=='pause')return;state='play';$('ov').hidden=true;$('rst').hidden=true;acc=0;try{cv.focus()}catch(e){}relock()}
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
/* 마우스 조준 복귀: 버튼 클릭이나 키 입력 직후 포인터 잠금을 다시 요청 */
function relock(){
  if(touchAim||locked())return;
  if(window.matchMedia&&!matchMedia('(pointer:fine)').matches)return;
  try{var p=cv.requestPointerLock();if(p&&p.catch)p.catch(function(){})}catch(e){}
  /* 브라우저가 거부한 경우(Esc 직후 등) 안내 */
  setTimeout(function(){if(state==='play'&&!locked()&&!touchAim)note('화면을 클릭하면 조준 재개')},350);
}
var PCAT={'화력 증폭':0,'속사 기구':0,'빠른 손':0,'확장 탄창':0,'강화 장갑':1,'보급 방어막':1,'경량 장비':2,'추진기':2,'드론 개조':3,'폭파병':3},
    PCN=['공격','방어','기동','지원','조합'],PCC=['#F0806C','#6FA8F0','#F0CC55','#52CDB6','#B98CF5'],
    /* 강화별 아이콘(24×24, 선) */
    PIC={'화력 증폭':'<path d="M12 3c1 3 4 5 4 9a4 4 0 0 1-8 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 0-8z"/>',
      '속사 기구':'<path d="M4 7l5 5-5 5M10 7l5 5-5 5M16 7l5 5-5 5"/>',
      '빠른 손':'<path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/>',
      '확장 탄창':'<path d="M7 4h10v16H7zM7 9h10M7 14h10"/>',
      '강화 장갑':'<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
      '보급 방어막':'<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M12 9v6M9 12h6"/>',
      '경량 장비':'<path d="M3 8h10a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7"/>',
      '추진기':'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
      '드론 개조':'<rect x="5" y="8" width="14" height="11" rx="2"/><path d="M12 8V4M9 13v2M15 13v2M2 13h3M19 13h3"/>',
      '폭파병':'<circle cx="11" cy="14" r="6"/><path d="M15 9l3-3M18 3v3h3"/>',
      '연쇄 폭발':'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/><circle cx="12" cy="12" r="2"/>',
      '위상 대시':'<path d="M3 12h11M10 6l6 6-6 6M20 5v14"/>',
      '정밀 회수':'<circle cx="12" cy="12" r="7"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/>',
      '흡혈 탄환':'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
      '마지막 탄':'<path d="M9 21V10c0-3 1.5-6 3-7 1.5 1 3 4 3 7v11zM9 16h6"/>',
      '집속탄':'<circle cx="12" cy="6" r="3"/><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/>',
      '처형자':'<path d="M5 5l14 14M19 5L5 19"/><circle cx="12" cy="12" r="9"/>'},
    pkAt=0,pkRe=0;
function drawPick(){
  var owned={},box=$('pkl'),q;ST.perks.forEach(function(n){owned[n]=(owned[n]||0)+1});
  var pool=PERKS.filter(function(p){return (!p[3]||!PK[p[3]])&&pkOpt.indexOf(p)<0});
  if(pool.length<3)pool=PERKS.filter(function(p){return !p[3]||!PK[p[3]]});
  pkOpt=[];box.textContent='';
  for(q=0;q<3;q++)pkOpt.push(pool.splice(Math.random()*pool.length|0,1)[0]);
  pkOpt.forEach(function(p,n){
    var c=PCAT[p[0]]===undefined?4:PCAT[p[0]],b=document.createElement('button'),own=owned[p[0]]||0;
    b.type='button';b.className='pkb';
    b.style.setProperty('--pc',PCC[c]);
    b.innerHTML='<span class="pkk" aria-hidden="true">'+(n+1)+'</span><span class="pkic"><svg class="pki" viewBox="0 0 24 24" aria-hidden="true">'+(PIC[p[0]]||'')+'</svg></span><span class="pkc"></span><b></b><span class="pkd"></span><span class="pko"></span>';
    b.querySelector('.pkc').textContent=PCN[c];b.querySelector('b').textContent=p[0];b.querySelector('.pkd').textContent=p[1];
    b.querySelector('.pko').textContent=own?'보유 '+own:'신규';
    b.setAttribute('aria-label',(n+1)+'번, '+PCN[c]+', '+p[0]+', '+p[1]+', '+(own?'보유 '+own:'신규'));
    b.addEventListener('click',function(){choose(n)});box.appendChild(b)});
  var r=$('pkr');r.disabled=!pkRe;r.textContent=pkRe?'다시 뽑기 (1회)':'다시 뽑기 사용함';
}
function openPick(){
  state='pick';firing=false;rmb=false;K={};joyId=lookId=null;jx=jy=0;$('joy').style.display='none';
  try{if(document.exitPointerLock)document.exitPointerLock()}catch(e){}
  pkOpt=[];pkRe=1;pkAt=performance.now();drawPick();$('msg').textContent='';msgT=0;
  $('pks').textContent=(wave?'웨이브 '+wave+' 완료':'출전 준비')+' · 강화 '+ST.perks.length+'개 보유';
  $('pk').hidden=false;$('pk').classList.remove('rdy');setTimeout(function(){$('pk').classList.add('rdy')},450);
  $('pkl').firstChild.focus();sPick('pw');
}
function choose(n){
  if(state!=='pick'||!pkOpt[n])return;
  if(performance.now()-pkAt<450)return; /* 사격 중 열리자마자 눌리는 오선택 방지 */
  pkOpt[n][2]();note(pkOpt[n][0]);ST.perks.push(pkOpt[n][0]);var pc=lsGet('ss_perk',{});pc[pkOpt[n][0]]=(pc[pkOpt[n][0]]||0)+1;lsSet('ss_perk',pc);
  $('pk').hidden=true;state='play';acc=0;hudC='';sPick('sd');try{cv.focus()}catch(e){}
  relock();
}
$('pkr').addEventListener('click',function(){if(state!=='pick'||!pkRe)return;pkRe=0;drawPick();$('pkl').firstChild.focus();sPick('am')});


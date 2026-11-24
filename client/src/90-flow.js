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
    :['WASD로 이동, 화면을 클릭해 마우스 조준','좌클릭 사격 · 우클릭 정조준 · R 재장전','Space 점프 · 왼쪽 Shift 대시 · G 수류탄','X 보조 사격 · V 근접 공격 · 1~6 무기 교체','P 또는 Esc로 일시정지와 설정'];
  try{cv.focus()}catch(e){}
  if(o.perk)openPick();else relock();
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

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
  if(shake>0){var sk=shake*CFG.shk;cam.rotation.x+=(Math.random()-.5)*sk*.07;cam.rotation.y+=(Math.random()-.5)*sk*.05;cam.rotation.z=(Math.random()-.5)*sk*.07}
  dome.position.copy(cam.position);clouds.position.copy(cam.position);clouds.rotation.y=tNow*.004;sun.position.set(P.x+10,P.y+24,P.z+26);sun.target.position.set(P.x,P.y,P.z);sun.target.updateMatrixWorld();
  st('boom','opacity',boomA>0?(boomA*CFG.fls).toFixed(2):'0');st('slow','opacity',slowT>0?Math.min(1,slowT*2).toFixed(2):'0');
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


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
    if(NET.on&&pl===0&&tNow-NET.tT>.12){NET.tT=tNow;netSend({k:'t',a:[r1(ox),r1(oy-.2),r1(oz)],b:[r1(ex),r1(ey),r1(ez)]})}
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
        tracer(dr.x,dr.y+oy0-.05,dr.z,tb.x,ty1,tb.z,0xc9a9ee);puff(tb.x,ty1,tb.z,3,2.5,.78,.62,.9,.3);KW=dr.tur?'포탑':'드론';dmgBot(tb,(dr.tur?14:12)*PK.dr,tb.x,ty1,tb.z,false,0,true)}
      else dr.cd=.15;
    }
  }
  /* 적 */
  var rdt=dt,MD={rusher:[11,22,.65],stalker:[16,30,.8],split:[14,22,.9],mite:[4,7,.5]};dt*=ets;
  if(NET.guest)netBots(rdt);
  for(q=NET.guest?-1:bots.length-1;q>=0;q--){
    b=bots[q];TG=NET.on&&NET.host?netTarget(b):P;b.hit-=rdt;b.fl-=dt;b.im-=rdt;
    if(b.burn>0&&b.die<=0){b.burn-=rdt;KW='화염방사기';if(Math.random()<rdt*8)puff(b.x,b.y+(b.fly?.4:b.sc),b.z,1,1.2,1,.55,.15,.4,0,1.5,0);if(dmgBot(b,11*PK.dmg*rdt,b.x,b.y+b.sc,b.z,false,0,2))continue}
    if(b.die>0){b.die-=rdt;grav(b,rdt,b.r);if(b.die<=0){killMesh(b);bots.splice(q,1)}continue}
    var tp=b.tp;if(tp==='pylon')continue;
    if(b.frz>0){b.frz-=rdt;if(!b.fly)grav(b,rdt,b.r);continue}
    if(tp==='over')overTick(b,dt);
    var sc=b.sc,ex=TG.x-b.x,ez=TG.z-b.z,d=Math.hypot(ex,ez)||1,ux=ex/d,uz=ez/d,sp0=b.sp*dt,ox=b.x,oz=b.z,
        mvx=0,mvz=0,pathing=false,see;
    /* 시야 검사는 적마다 엇갈려 초당 약 9회 */
    b.vt=(b.vt||0)-dt;if(b.vt<=0){b.vt=.09+Math.random()*.05;b.vs=d<(tp==='sniper'||tp==='mother'||tp==='over'?66:b.boss?50:b.fly?46:36)&&los(b.x,b.y+(b.fly?.7:1.7*sc),b.z,TG.x,TG.y+1.5,TG.z)}see=b.vs;
    if(see&&!b.los)b.cd=Math.max(b.cd,.28+Math.random()*.3);
    b.los=see;b.pm-=dt;if(see)b.ls=0;else{b.ls+=dt;if(tp!=='crusher')b.ch=0}
    if(b.fly){ /* 말벌 드론 · 모선: 벽 위로 넘어와 머리 위에서 공격 */
      var mo=tp==='mother',fty=mo?Math.max(TG.y+6.5,7.8):see?TG.y+2.8:7.3,fny=b.y+Math.max(-3.2*dt,Math.min(3.2*dt,fty-b.y));
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
        if(!b.dh&&d<2.8&&Math.abs(TG.y-b.y)<2.6){b.dh=1;if(!RM)shake=Math.max(shake,1);hitBy='분쇄자 돌진';if(hurtT(38,b.x,b.z))return}
        if(b.dash<=0)b.cd=1.5}
      else if(b.ch>0){b.ch+=dt;if(b.ch<.75)b.rot=Math.atan2(ex,ez);
        if(b.ch>=1.05){b.ch=0;b.dash=.85;b.dh=0;b.dx=Math.sin(b.rot);b.dz=Math.cos(b.rot);sDash(b)}}
      else if(b.cd>0)b.cd-=dt;
      else if(see&&d<26&&d>5&&b.rc<=0&&Math.abs(TG.y-b.y)<1.6){b.ch=.01;b.rc=3.6;sCharge(b,1/ets)}
      else if(d<5.5&&Math.abs(TG.y-b.y)<2.6&&b.sl<=0){b.sl=1.5;b.fl=.2;if(!RM)shake=Math.max(shake,.9);nz(.4,.5,'lowpass',400,60,{rev:.6});tone('sine',90,28,.4,.6);
        ringFx(b.x,b.y,b.z,0xffd9a0,11,.5);hitBy=BT[tp].n+' 내려찍기';if(hurtT(26,b.x,b.z))return}
      else{if(b.gc<=0&&b.ls>2.5&&d<30){b.gc=5;b.rot=Math.atan2(ex,ez);lob(b);lob(b);lob(b)}
        if(see&&b.pm<=0&&clearLine(b,TG.x-ux*1.5,TG.z-uz*1.5,b.r)){mvx=ux;mvz=uz;b.rot=Math.atan2(ex,ez)}else pathing=true}
    }else if(MD[tp]||tp==='bomber'){
      var near=d<(tp==='split'?2.8:2.3)&&Math.abs(TG.y-b.y)<1.7;
      if(tp==='bomber'){ /* 자폭병: 접근할수록 빨라지는 경고음 */
        b.cd-=dt;if(b.cd<=0&&d<24){b.cd=Math.max(.11,d/24*.7);b.fl=.07;sBeep(b)}
        if(near){b.hp=0;killBot(b,b.x,b.y+1,b.z);continue}
      }else if(see&&near){
        b.rot=Math.atan2(ex,ez);b.cd-=dt;
        if(b.cd<=0){var md=MD[tp];b.cd=md[2];b.fl=.16;sSlash(b);hitBy=BT[tp].n;if(hurtT(Math.min(md[1],md[0]+wave*(tp==='mite'?.2:1)),b.x,b.z))return}
      }
      if(!(see&&near)){
        if(see&&d<18&&b.pm<=0&&clearLine(b,TG.x-ux*.8,TG.z-uz*.8,b.r)){mvx=ux;mvz=uz;b.rot=Math.atan2(ex,ez)}
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
        if(d<5.5*sc/2&&b.sl<=0&&Math.abs(TG.y-b.y)<2.6){b.sl=1.6;b.fl=.2;if(!RM)shake=Math.max(shake,.9);nz(.4,.5,'lowpass',400,60,{rev:.6});tone('sine',90,28,.4,.6);
          ringFx(b.x,b.y,b.z,0xffd9a0,12,.5);puff(b.x+ux*2,b.y+.2,b.z+uz*2,24,6,.8,.72,.62,.6);hitBy=BT[tp].n+' 내려찍기';if(hurtT(26,b.x,b.z))return}
        if(b.rc<=0){b.rc=tp==='over'?(b.p3?1.7:2.3):2.8;var bc=Math.cos(b.rot),bsn=Math.sin(b.rot),s2;
          for(s2=-1;s2<2;s2+=2){var lx=b.x+(bc*s2*1.45+bsn*.7)*b.sc/2,lz=b.z+(-bsn*s2*1.45+bc*.7)*b.sc/2,ly=b.y+1.98*b.sc,
              ax=TG.x+(Math.random()-.5)*2-lx,ay=TG.y+.6-ly,az=TG.z+(Math.random()-.5)*2-lz,al2=Math.hypot(ax,ay,az)||1;
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
  TG=P;
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
  if(!NET.guest&&pend<=0&&!(bossB&&bossB.die<=0)&&(al<=(WM==='timed'&&!wmDone?0:2)||waveT>38)){pend=wave?1:.01;if(wave&&!al)sClear()}
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


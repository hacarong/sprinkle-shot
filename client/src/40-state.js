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


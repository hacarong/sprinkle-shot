/* ================= 소리 ================= */
/* 합성음: 압축기 → 마스터, 잔향 버스, 좌우 패닝과 거리 감쇠 */
var AC=null,snd=true,NB=null,MG=null,RV=null,DG=null;
function initAudio(){
  if(AC)return;
  try{
    AC=new (window.AudioContext||window.webkitAudioContext)();
    var q,d,len=AC.sampleRate,cmp=AC.createDynamicsCompressor();
    NB=AC.createBuffer(1,len,AC.sampleRate);d=NB.getChannelData(0);for(q=0;q<len;q++)d[q]=Math.random()*2-1;
    MG=AC.createGain();MG.gain.value=snd?.9*CFG.vol:0;MG.connect(cmp);cmp.connect(AC.destination);
    var il=AC.sampleRate*1.7|0,ib=AC.createBuffer(2,il,AC.sampleRate),c2,cvn=AC.createConvolver();
    for(c2=0;c2<2;c2++){d=ib.getChannelData(c2);for(q=0;q<il;q++)d[q]=(Math.random()*2-1)*Math.pow(1-q/il,2.8)}
    cvn.buffer=ib;RV=AC.createGain();RV.gain.value=.5;RV.connect(cvn);cvn.connect(MG);
    /* 바람 소리 · 드론 구동음 */
    var w=AC.createBufferSource(),wf=AC.createBiquadFilter(),wg=AC.createGain();w.buffer=NB;w.loop=true;wf.type='lowpass';wf.frequency.value=320;wg.gain.value=.05;
    w.connect(wf);wf.connect(wg);wg.connect(MG);w.start();
    var o=AC.createOscillator(),o2=AC.createOscillator(),of=AC.createBiquadFilter();o.type='sawtooth';o.frequency.value=92;o2.type='sawtooth';o2.frequency.value=139;
    of.type='lowpass';of.frequency.value=420;DG=AC.createGain();DG.gain.value=0;o.connect(of);o2.connect(of);of.connect(DG);DG.connect(MG);o.start();o2.start();
  }catch(e){AC=null}
}
function route(g,o){
  var last=g;
  if(o.pan&&AC.createStereoPanner){var p=AC.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,o.pan));g.connect(p);last=p}
  last.connect(MG);if(o.rev){var r=AC.createGain();r.gain.value=o.rev;last.connect(r);r.connect(RV)}
}
function env(g,t,vol,dur,a){g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(Math.max(.0002,vol),t+(a||.004));g.gain.exponentialRampToValueAtTime(.0001,t+dur)}
function tone(type,f0,f1,dur,vol,o){
  if(!snd||!AC||vol<.004)return;o=o||{};
  try{var t=AC.currentTime+(o.d||0),os=AC.createOscillator(),g=AC.createGain();os.type=type;
    os.frequency.setValueAtTime(Math.max(20,f0),t);os.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
    env(g,t,vol,dur,o.a);os.connect(g);route(g,o);os.start(t);os.stop(t+dur+.03)}catch(e){}
}
function nz(dur,vol,ft,f0,f1,o){
  if(!snd||!AC||!NB||vol<.004)return;o=o||{};
  try{var t=AC.currentTime+(o.d||0),sr=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();sr.buffer=NB;sr.loop=true;
    f.type=ft;f.Q.value=o.q||.8;f.frequency.setValueAtTime(Math.max(30,f0),t);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);
    env(g,t,vol,dur,o.a);sr.connect(f);f.connect(g);route(g,o);sr.start(t,Math.random()*.8);sr.stop(t+dur+.03)}catch(e){}
}
function beep(f0,f1,t,v,type){tone(type||'square',f0,f1,t,v)}
function bang(v,fq,dur){nz(dur||.16,v,'lowpass',fq,fq*.5);tone('sine',160,45,.1,v*.7)}
/* 위치 → 패닝 · 감쇠 */
function sp(x,z,rev){var dx=x-P.x,dz=z-P.z,d=Math.hypot(dx,dz);return {pan:d<.6?0:(dx*Math.cos(P.yaw)-dz*Math.sin(P.yaw))/d*.85,att:1/(1+d/12),rev:rev||0,d:0}}
function sShot(w){
  if(w===5){nz(.5,.5,'bandpass',5000,300,{q:1.5,rev:.9});tone('sawtooth',1800,90,.35,.3,{rev:.7});tone('sine',90,30,.4,.6);tone('square',3200,3200,.05,.1);return}
  if(w===0){nz(.08,.3,'highpass',1100,500,{rev:.25});nz(.17,.24,'lowpass',2800,420,{rev:.35});tone('triangle',200,52,.09,.34);tone('square',2600,900,.018,.05)}
  else if(w===1){nz(.32,.55,'lowpass',1500,150,{rev:.6});tone('sine',125,36,.26,.6);nz(.07,.32,'highpass',1700,800);
    nz(.05,.16,'bandpass',1900,1500,{d:.3,q:3});nz(.06,.18,'bandpass',1150,900,{d:.45,q:3});tone('square',240,180,.03,.05,{d:.45})}
  else if(w===2){nz(.12,.55,'highpass',1300,280,{rev:.8});nz(.55,.4,'lowpass',3400,170,{rev:.9});tone('sine',155,30,.32,.6);
    nz(.04,.13,'bandpass',2500,2100,{d:.5,q:4});nz(.05,.15,'bandpass',1500,1250,{d:.7,q:4})}
  else{nz(.55,.42,'bandpass',260,2600,{q:1.1,rev:.5});tone('sawtooth',80,250,.4,.2);nz(.14,.34,'lowpass',900,180);tone('sine',70,40,.2,.4)}
}
function sBoom(x,z,k){
  var o=sp(x,z,.9),a=Math.min(1,o.att*2.2)*k,q;
  nz(1.15,.75*a,'lowpass',1000,55,o);tone('sine',115,23,.95,.85*a,{pan:o.pan});tone('triangle',62,27,1.15,.42*a,{pan:o.pan,rev:.5});nz(.1,.5*a,'highpass',900,300,o);
  for(q=0;q<6;q++)nz(.05,.16*a,'highpass',2400+Math.random()*2500,1500,{pan:o.pan+(Math.random()-.5)*.6,d:.12+q*.07+Math.random()*.06});
}
function sBot(b){
  var o=sp(b.x,b.z,.35),a=o.att*1.6,tp=b.tp;
  if(tp==='heavy'||b.boss&&!b.fly){nz(.1,.3*a,'lowpass',900,300,o);tone('triangle',120,48,.08,.3*a,{pan:o.pan})}
  else if(tp==='sniper'){nz(.4,.4*a,'lowpass',3200,200,sp(b.x,b.z,.9));nz(.08,.3*a,'highpass',1400,500,o);tone('sine',150,34,.25,.4*a,{pan:o.pan})}
  else if(b.fly){tone('square',tp==='mother'?700:1500,tp==='mother'?220:480,.09,.1*a,{pan:o.pan});nz(.05,.08*a,'highpass',3000,2000,o)}
  else if(tp==='shield'){nz(.07,.24*a,'lowpass',2200,700,o);tone('triangle',260,90,.06,.2*a,{pan:o.pan})}
  else{nz(.11,.26*a,'lowpass',1700,450,o);tone('triangle',180,58,.08,.22*a,{pan:o.pan})}
}
function sWhiz(pan){nz(.13,.11,'bandpass',3400,800,{q:7,pan:pan})}
function sRico(x,z){var o=sp(x,z);tone('sine',2300+Math.random()*1500,800,.18,.07*o.att*2,{pan:o.pan});nz(.04,.14*o.att*2,'highpass',3200,2000,o)}
function sReload(w){
  var r=relT(w);
  if(w===1){for(var q=0;q<3;q++){nz(.04,.15,'bandpass',1300,1000,{d:.2+q*r*.22,q:3});tone('square',210,160,.03,.05,{d:.2+q*r*.22})}
    nz(.05,.17,'bandpass',1900,1500,{d:r-.3,q:3});nz(.06,.19,'bandpass',1150,900,{d:r-.15,q:3})}
  else if(w===3){nz(.1,.16,'bandpass',600,300,{d:.25,q:2});tone('sine',150,90,.12,.2,{d:r*.55});nz(.08,.2,'bandpass',900,500,{d:r*.55,q:2});nz(.05,.16,'bandpass',1800,1400,{d:r-.2,q:4})}
  else{nz(.04,.17,'bandpass',1500,1100,{d:.12,q:3});tone('square',330,220,.03,.05,{d:.12});
    nz(.05,.2,'bandpass',950,700,{d:r*.55,q:2.5});tone('square',185,140,.04,.07,{d:r*.55});
    nz(.035,.17,'bandpass',2300,1900,{d:r-.26,q:4});nz(.045,.19,'bandpass',1400,1100,{d:r-.14,q:4})}
}
function sSwitch(){nz(.09,.1,'bandpass',600,1500,{q:1});tone('square',270,200,.03,.045,{d:.09});nz(.04,.1,'bandpass',1700,1300,{d:.2,q:3})}
function sHit(head){tone('sine',head?1950:1350,head?1500:1000,.06,.1);if(head){tone('triangle',2700,2700,.14,.07,{d:.03});tone('sine',3600,3600,.1,.035,{d:.05})}}
function sKill(b){var o=sp(b.x,b.z);tone('sawtooth',170,40,.3,.1*Math.min(1,o.att*2),{pan:o.pan});tone('sine',640,960,.1,.08);tone('sine',960,1280,.13,.07,{d:.07})}
function sHurt(sh){if(sh){tone('sine',1500,500,.14,.14);nz(.08,.12,'highpass',2500,1500)}else{tone('sine',150,55,.22,.42);nz(.1,.22,'lowpass',600,200)}}
function sStep(up){nz(.07,.06,'lowpass',up?620:340,120);tone('sine',up?120:82,50,.06,.07)}
function sPick(t){
  var m={hp:[523,659,784],am:[330,330,440],pw:[440,554,740],rk:[196,262,330],dr:[660,880,1320],sl:[880,660,440],sd:[392,523,784],as:[262,392,523],ov:[587,740,988]}[t]||[523,659,784],q;
  for(q=0;q<3;q++)tone(t==='am'||t==='rk'?'square':'triangle',m[q],m[q],.16,t==='am'||t==='rk'?.05:.09,{d:q*.07,rev:.3});
}
function sCharge(b,dur){var o=sp(b.x,b.z);tone('sawtooth',300,1700,dur,.06*Math.min(1,o.att*2.4),{pan:o.pan,a:dur*.6})}
function sBeep(b){var o=sp(b.x,b.z);tone('square',1850,1850,.05,.1*Math.min(1,o.att*2.5),{pan:o.pan})}
function sSlash(b){var o=sp(b.x,b.z);o.q=2;nz(.13,.24,'bandpass',2600,600,o);tone('sawtooth',700,200,.08,.06,{pan:o.pan})}
function sRoar(){tone('sawtooth',72,38,1.5,.5,{rev:.9,a:.25});tone('sawtooth',108,56,1.5,.3,{rev:.9,a:.25});nz(1.3,.3,'lowpass',420,90,{rev:.9,a:.2})}
function sWave(){tone('triangle',220,220,.2,.12,{rev:.4});tone('triangle',330,330,.34,.12,{d:.2,rev:.4})}
function sClear(){[392,523,659,784].forEach(function(f,q){tone('triangle',f,f,.22,.09,{d:q*.09,rev:.4})})}
function sHeart(){tone('sine',72,40,.12,.5);tone('sine',62,38,.12,.36,{d:.22})}
function sCombo(n){var f=440*Math.pow(1.19,Math.min(n,6));tone('square',f,f,.09,.06,{rev:.3});tone('square',f*1.5,f*1.5,.14,.06,{d:.08,rev:.3})}
function sSlow(on){if(on){tone('sine',900,110,.9,.2,{rev:.6});nz(.9,.12,'lowpass',2500,150,{rev:.6})}else tone('sine',130,800,.5,.14,{rev:.4})}
function sShieldHit(x,z){var o=sp(x,z);tone('sine',1700,2400,.09,.1*Math.min(1,o.att*2.5),{pan:o.pan});nz(.05,.16*Math.min(1,o.att*2.5),'highpass',3500,2500,o)}
function sAir(x,z,d){var o=sp(x,z);tone('sine',2600,420,1,.09*Math.min(1,o.att*2.5),{pan:o.pan,d:d,a:.3})}
function sLob(b){var o=sp(b.x,b.z);tone('sine',320,110,.14,.24*Math.min(1,o.att*2),{pan:o.pan});nz(.08,.2*Math.min(1,o.att*2),'lowpass',900,300,o)}
function sPad(){tone('sine',220,900,.26,.2);tone('triangle',330,1350,.26,.1);nz(.2,.1,'bandpass',500,2500,{q:1.5})}
function sTele(){nz(.45,.2,'bandpass',300,3200,{q:2,rev:.6});tone('sine',1300,180,.4,.14,{rev:.6});tone('sine',180,1300,.35,.08,{d:.1,rev:.6})}
function sFreeze(){tone('sine',2300,3400,.5,.1,{rev:.8});tone('triangle',3100,4200,.6,.06,{d:.05,rev:.8});nz(.6,.16,'highpass',6000,3000,{rev:.8})}
function sDash(b){var o=sp(b.x,b.z,.5);o.q=1;nz(.8,.5*Math.min(1,o.att*2.5),'bandpass',200,1800,o);tone('sawtooth',60,180,.7,.3*Math.min(1,o.att*2.5),{pan:o.pan})}
function sDrone(x,z){var o=sp(x,z);tone('square',1250,700,.06,.045,{pan:o.pan});nz(.04,.05,'highpass',3000,2200,o)}
document.addEventListener('visibilitychange',function(){if(!AC)return;try{if(document.hidden)AC.suspend();else AC.resume()}catch(e){}});


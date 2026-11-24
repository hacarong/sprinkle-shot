/* ================= 렌더러 ================= */
var renderer;
try{renderer=new T.WebGLRenderer({canvas:cv,antialias:(window.devicePixelRatio||1)<2,powerPreference:'high-performance'})}
catch(e){$('subt').textContent='WebGL 미지원 환경';$('go').disabled=true;return}
renderer.autoClear=false;
var scene=new T.Scene(),BG=0x8a6f72;scene.background=new T.Color(BG);scene.fog=new T.Fog(BG,22,104);
var cam=new T.PerspectiveCamera(70,1,.08,140);cam.rotation.order='YXZ';
var gScene=new T.Scene(),gCam=new T.PerspectiveCamera(58,1,.01,10),BF=70;
var rsc=1; /* 동적 해상도 배율 */
function applyRes(){var w=innerWidth,h=Math.max(1,innerHeight);renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5)*rsc);renderer.setSize(w,h,false);if(PP)PP.size(w,h)}
function resize(){
  var w=innerWidth,h=Math.max(1,innerHeight);
  applyRes();
  cam.aspect=gCam.aspect=w/h;BF=w<h?86:70;cam.fov=BF;gCam.fov=w<h?74:58;cam.updateProjectionMatrix();gCam.updateProjectionMatrix();
}
var PP=null;
function mkPost(){
  try{
    var o={minFilter:T.LinearFilter,magFilter:T.LinearFilter,format:T.RGBAFormat},
        rs=renderer.capabilities.isWebGL2&&T.WebGLMultisampleRenderTarget?new T.WebGLMultisampleRenderTarget(4,4,o):new T.WebGLRenderTarget(4,4,o),
        ra=new T.WebGLRenderTarget(4,4,{minFilter:T.LinearFilter,magFilter:T.LinearFilter,format:T.RGBAFormat,depthBuffer:false}),rb=ra.clone(),
        vs='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
    function SM(u,fs){return new T.ShaderMaterial({uniforms:u,vertexShader:vs,fragmentShader:'varying vec2 vUv;'+fs,depthTest:false,depthWrite:false})}
    var mB=SM({tD:{value:null},px:{value:new T.Vector2()}},
      'uniform sampler2D tD;uniform vec2 px;void main(){vec3 c=(texture2D(tD,vUv+px*vec2(-1.,-1.)).rgb+texture2D(tD,vUv+px*vec2(1.,-1.)).rgb+texture2D(tD,vUv+px*vec2(-1.,1.)).rgb+texture2D(tD,vUv+px).rgb)*.25;'+
      'float l=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c*smoothstep(.8,1.,l)*.9,1.);}'),
    mG=SM({tD:{value:null},dir:{value:new T.Vector2()}},
      'uniform sampler2D tD;uniform vec2 dir;void main(){vec3 c=texture2D(tD,vUv).rgb*.227;'+
      'c+=(texture2D(tD,vUv+dir*1.38).rgb+texture2D(tD,vUv-dir*1.38).rgb)*.316;c+=(texture2D(tD,vUv+dir*3.23).rgb+texture2D(tD,vUv-dir*3.23).rgb)*.07;gl_FragColor=vec4(c,1.);}'),
    mF=SM({tS:{value:null},tB:{value:null},uBloom:{value:.7},uAb:{value:0},uT:{value:0},uSat:{value:1.1},uVig:{value:.85},uTint:{value:new T.Vector3(1,1,1)},uRes:{value:new T.Vector2(1,1)}},
      'uniform sampler2D tS,tB;uniform float uBloom,uAb,uT,uSat,uVig;uniform vec3 uTint;uniform vec2 uRes;'+
      'float hh(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}'+
      'void main(){vec2 c=vUv-.5;float r2=dot(c,c);vec2 o=c*uAb*(.3+r2*3.);'+
      'vec3 col=vec3(texture2D(tS,vUv+o).r,texture2D(tS,vUv).g,texture2D(tS,vUv-o).b);col+=texture2D(tB,vUv).rgb*uBloom;'+
      'col=(col-.5)*1.07+.5;float l=dot(col,vec3(.299,.587,.114));col=mix(vec3(l),col,uSat)*uTint;'+
      'col*=1.-r2*uVig;col+=(hh(vUv*uRes+uT)-.5)*.022;gl_FragColor=vec4(clamp(col,0.,1.),1.);}'),
    sc=new T.Scene(),cm=new T.OrthographicCamera(-1,1,1,-1,0,1),q=new T.Mesh(new T.PlaneGeometry(2,2),mB);
    q.frustumCulled=false;sc.add(q);
    return {rs:rs,ra:ra,rb:rb,mB:mB,mG:mG,mF:mF,sc:sc,cm:cm,q:q,w:4,h:4,
      size:function(w,h){var pr=renderer.getPixelRatio(),W=Math.max(4,w*pr|0),H=Math.max(4,h*pr|0);this.w=W;this.h=H;rs.setSize(W,H);ra.setSize(W/3|0,H/3|0);rb.setSize(W/3|0,H/3|0);mF.uniforms.uRes.value.set(W,H)}};
  }catch(e){return null}
}
function renderPost(){
  var p=PP,bw=p.w/3|0,bh=p.h/3|0,u=p.mF.uniforms,k;
  renderer.setRenderTarget(p.rs);renderer.clear();renderer.render(scene,cam);renderer.clearDepth();renderer.render(gScene,gCam);
  p.q.material=p.mB;p.mB.uniforms.tD.value=p.rs.texture;p.mB.uniforms.px.value.set(1/p.w,1/p.h);renderer.setRenderTarget(p.ra);renderer.render(p.sc,p.cm);
  p.q.material=p.mG;
  for(k=0;k<2;k++){var r=k?2.4:1;
    p.mG.uniforms.tD.value=p.ra.texture;p.mG.uniforms.dir.value.set(r/bw,0);renderer.setRenderTarget(p.rb);renderer.render(p.sc,p.cm);
    p.mG.uniforms.tD.value=p.rb.texture;p.mG.uniforms.dir.value.set(0,r/bh);renderer.setRenderTarget(p.ra);renderer.render(p.sc,p.cm)}
  var play=state==='play',slo=play&&slowT>0;
  u.tS.value=p.rs.texture;u.tB.value=p.ra.texture;u.uT.value=tNow%10;
  u.uAb.value=RM?0:.0012+(play?hurt*.007+boomA*.014*CFG.fls+shake*.004*CFG.shk+(slo?.004:0):0);
  u.uSat.value=play&&P.hp<30?.7:slo?.8:1.1;if(slo)u.uTint.value.set(.9,.98,1.1);else u.uTint.value.set(1.03,1,.97);
  p.q.material=p.mF;renderer.setRenderTarget(null);renderer.render(p.sc,p.cm);
}
addEventListener('resize',resize);resize();

scene.add(new T.HemisphereLight(0xeadfee,0x43363c,.7));
var sun=new T.DirectionalLight(0xffd9b0,.82),SHD=!(window.matchMedia&&matchMedia('(pointer:coarse)').matches),dome,clouds,HQ=SHD,BUMP=[];
try{var hv=localStorage.getItem('botarena3d_hq');if(hv!==null)HQ=hv==='1'}catch(e){}
try{var sv=localStorage.getItem('botarena3d_shadow');if(sv!==null)SHD=sv==='1'}catch(e){}
sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-36;sun.shadow.camera.right=36;sun.shadow.camera.top=36;sun.shadow.camera.bottom=-36;
sun.shadow.camera.near=2;sun.shadow.camera.far=95;sun.shadow.bias=-.0012;sun.shadow.normalBias=.06;
renderer.shadowMap.enabled=true;renderer.shadowMap.autoUpdate=false; /* 그림자 갱신은 frame()에서 최대 60Hz */
renderer.shadowMap.type=T.PCFSoftShadowMap;sun.castShadow=SHD;
scene.add(sun);scene.add(sun.target);
var rim=new T.DirectionalLight(0x9db4ff,.32);rim.position.set(-12,14,-24);scene.add(rim); /* 반대편 보조광 */
var mLight=new T.PointLight(0xffd9a0,0,16);scene.add(mLight);
gScene.add(new T.HemisphereLight(0xeee6f0,0x4a3f44,1));
var gl2=new T.DirectionalLight(0xffe6c8,.75);gl2.position.set(1,2,1.5);gScene.add(gl2);
(function(){ /* 하늘 돔: 노을 그라데이션과 태양 */
  var c=document.createElement('canvas');c.width=512;c.height=256;var g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);
  gr.addColorStop(0,'#1f2238');gr.addColorStop(.3,'#45406a');gr.addColorStop(.45,'#a8727a');gr.addColorStop(.5,'#e6aa82');gr.addColorStop(.55,'#8a6f72');gr.addColorStop(1,'#8a6f72');
  g.fillStyle=gr;g.fillRect(0,0,512,256);
  var r=g.createRadialGradient(150,112,2,150,112,70);r.addColorStop(0,'rgba(255,244,220,1)');r.addColorStop(.12,'rgba(255,220,170,.95)');r.addColorStop(1,'rgba(255,180,120,0)');
  g.fillStyle=r;g.fillRect(60,30,190,170);
  dome=new T.Mesh(new T.SphereGeometry(125,24,14),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),side:T.BackSide,fog:false,depthWrite:false}));
  dome.renderOrder=-1;scene.add(dome);
  /* 구름층 */
  var c2=document.createElement('canvas');c2.width=1024;c2.height=256;var g2=c2.getContext('2d'),q,x,y,w,a,rg;
  for(q=0;q<70;q++){x=Math.random()*1024;y=40+Math.random()*82;w=40+Math.random()*110;a=.05+Math.random()*.16*(y/122);
    g2.save();g2.translate(x,y);g2.scale(1,.28);rg=g2.createRadialGradient(0,0,2,0,0,w);
    rg.addColorStop(0,'rgba(255,214,186,'+a+')');rg.addColorStop(.6,'rgba(236,160,150,'+a*.5+')');rg.addColorStop(1,'rgba(200,130,150,0)');
    g2.fillStyle=rg;g2.fillRect(-w,-w,w*2,w*2);if(x<w){g2.translate(1024,0);g2.fillRect(-w,-w,w*2,w*2)}g2.restore()}
  clouds=new T.Mesh(new T.SphereGeometry(118,24,14),new T.MeshBasicMaterial({map:new T.CanvasTexture(c2),side:T.BackSide,fog:false,transparent:true,depthWrite:false}));
  clouds.renderOrder=-1;scene.add(clouds);
})();

function tex(fn,rx,ry){
  var c=document.createElement('canvas'),g=c.getContext('2d');c.width=c.height=256;g.scale(2,2);fn(g);
  var t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rx||1,ry||rx||1);
  t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;
}
/* 월드 재질: 퐁 셰이딩 + 텍스처 기반 요철(고급 효과 시) */
function WM(t,spc,shn,bs){var m=new T.MeshPhongMaterial({map:t,specular:spc,shininess:shn,bumpMap:HQ?t:null,bumpScale:bs});BUMP.push([m,t]);return m}
function speck(g,n,a){for(var q=0;q<n;q++){g.fillStyle='rgba('+(Math.random()<.5?'0,0,0,':'255,255,255,')+a+')';g.fillRect(Math.random()*128,Math.random()*128,2,2)}}
function sh(o,c,r){o.castShadow=c;o.receiveShadow=r;return o}
var tFloor=tex(function(g){g.fillStyle='#6b635c';g.fillRect(0,0,128,128);
  for(var r=0;r<4;r++)for(var c=0;c<4;c++){var ox=c*32+(r%2?16:0),v=92+((r*7+c*13)%5)*6;g.fillStyle='rgb('+(v+14)+','+(v+6)+','+v+')';
    g.fillRect(ox+2,r*32+2,28,28);if(ox+32>128)g.fillRect(ox-128+2,r*32+2,28,28)}
  speck(g,300,.06)},MW*2,MH*2);
function plaster(g,base){g.fillStyle=base;g.fillRect(0,0,128,128);speck(g,260,.05);
  var gr=g.createLinearGradient(0,70,0,128);gr.addColorStop(0,'rgba(60,40,30,0)');gr.addColorStop(1,'rgba(60,40,30,.35)');g.fillStyle=gr;g.fillRect(0,70,128,58);
  g.fillStyle='#8f7560';g.fillRect(0,116,128,12);g.fillStyle='#d6bfa2';g.fillRect(0,0,128,5);g.fillStyle='#7d6a58';g.fillRect(0,5,128,2);
  g.strokeStyle='rgba(70,50,40,.5)';g.lineWidth=1;g.beginPath();g.moveTo(20,8);g.lineTo(28,30);g.lineTo(24,52);g.moveTo(100,116);g.lineTo(94,96);g.lineTo(101,80);g.stroke()}
var tWall=tex(function(g){plaster(g,'#b99c82')},1,2),
tWin=tex(function(g){plaster(g,'#c4a184');
  g.fillStyle='#d8c4a8';g.fillRect(30,24,68,74);g.fillStyle='#2e2a30';g.fillRect(36,30,56,62);
  g.fillStyle='#4f7d78';g.fillRect(36,30,22,62);g.fillRect(70,30,22,62);g.fillStyle='#3c625e';for(var q=0;q<8;q++){g.fillRect(38,34+q*7,18,2);g.fillRect(72,34+q*7,18,2)}
  g.fillStyle='#e6d3b8';g.fillRect(26,96,76,6);g.fillStyle='#7d6a58';g.fillRect(26,102,76,2)},1,2),
tBrick=tex(function(g){g.fillStyle='#c9b29a';g.fillRect(0,0,128,128);
  for(var r=0;r<8;r++)for(var c=-1;c<4;c++){var v=(r*5+c*11)%4;g.fillStyle=['#a66b55','#b0745c','#9c624e','#aa7059'][v<0?0:v];g.fillRect(c*32+(r%2?16:0)+1,r*16+1,30,14)}
  speck(g,220,.06);g.fillStyle='#8f7560';g.fillRect(0,118,128,10)},1,2),
tSlab=tex(function(g){g.fillStyle='#9a8f88';g.fillRect(0,0,128,128);speck(g,160,.05);
  g.strokeStyle='#6a5f58';g.lineWidth=6;g.strokeRect(3,3,122,122);g.strokeStyle='#bdb2a8';g.lineWidth=1;g.strokeRect(10,10,108,108);
  g.fillStyle='#7d726b';for(var q=0;q<3;q++)g.fillRect(12,38+q*26,104,2)}),
tRamp=tex(function(g){g.fillStyle='#93877f';g.fillRect(0,0,128,128);g.fillStyle='#6e635c';for(var q=0;q<8;q++)g.fillRect(q*16,0,4,128);g.fillStyle='#b5a99f';for(q=0;q<8;q++)g.fillRect(q*16+4,0,2,128)});

var floor=sh(new T.Mesh(new T.PlaneGeometry(MW*CS,MH*CS),WM(tFloor,0x34302c,26,.05)),false,true);
floor.rotation.x=-Math.PI/2;floor.position.set(MW*CS/2,0,MH*CS/2);scene.add(floor);
(function(){
  var cnt=[0,0,0],ns=0,m4=new T.Matrix4(),idx=[0,0,0],a=0,b=0,cx,cz,h=CS/2,wg=new T.BoxGeometry(CS,WH,CS);
  function vr(cx,cz){var v=(cx*7+cz*13)%6;return v===0?1:v===3?2:0}
  for(cz=0;cz<MH;cz++)for(cx=0;cx<MW;cx++){if(MAP[cz][cx]==='#')cnt[vr(cx,cz)]++;if(MAP[cz][cx]==='U')ns++}
  var nw=cnt[0]+cnt[1]+cnt[2],
      W=[tWall,tWin,tBrick].map(function(t,n){return sh(new T.InstancedMesh(wg,WM(t,0x161616,8,.04),cnt[n]),true,true)}),
      cap=sh(new T.InstancedMesh(new T.BoxGeometry(CS+.3,.3,CS+.3),new T.MeshLambertMaterial({color:0x9a5a48}),nw),true,true),
      skirt=sh(new T.InstancedMesh(new T.BoxGeometry(CS+.12,.5,CS+.12),new T.MeshLambertMaterial({color:0x7a6a5e}),nw),false,true),
      slabs=sh(new T.InstancedMesh(new T.BoxGeometry(CS,.4,CS),WM(tSlab,0x202020,14,.03),ns),true,true),
      trim=new T.InstancedMesh(new T.BoxGeometry(CS+.08,.1,CS+.08),new T.MeshLambertMaterial({color:0x5e5048}),ns),
      rm=WM(tRamp,0x202020,14,.03);rm.side=T.DoubleSide;
  for(cz=0;cz<MH;cz++)for(cx=0;cx<MW;cx++){
    var t=MAP[cz][cx],wx=cx*CS+h,wz=cz*CS+h;
    if(t==='#'){var v=vr(cx,cz);W[v].setMatrixAt(idx[v]++,m4.makeTranslation(wx,WH/2,wz));cap.setMatrixAt(a,m4.makeTranslation(wx,WH+.15,wz));skirt.setMatrixAt(a++,m4.makeTranslation(wx,.25,wz))}
    else if(t==='U'){slabs.setMatrixAt(b,m4.makeTranslation(wx,UP-.2,wz));trim.setMatrixAt(b++,m4.makeTranslation(wx,UP-.38,wz))}
    else if(RD[t]){
      var h0=RS[cz*MW+cx]?1.5:0,h1=h0+1.5,
      vv=[-h,h0,-h, -h,h0,h, h,h1,h,  -h,h0,-h, h,h1,h, h,h1,-h,
         -h,0,h, h,0,h, h,h1,h,  -h,0,h, h,h1,h, -h,h0,h,
         -h,0,-h, h,h1,-h, h,0,-h,  -h,0,-h, -h,h0,-h, h,h1,-h,
         h,0,-h, h,h1,-h, h,h1,h,  h,0,-h, h,h1,h, h,0,h],
      uv=[],q;for(q=0;q<vv.length;q+=3)uv.push((vv[q]+h)/CS,(vv[q+2]+h)/CS+vv[q+1]/CS);
      var ge=new T.BufferGeometry();ge.setAttribute('position',new T.Float32BufferAttribute(vv,3));
      ge.setAttribute('uv',new T.Float32BufferAttribute(uv,2));ge.computeVertexNormals();
      var me=sh(new T.Mesh(ge,rm),true,true);me.position.set(wx,0,wz);me.rotation.y=t==='>'?0:t==='<'?Math.PI:t==='^'?Math.PI/2:-Math.PI/2;scene.add(me);
    }
  }
  W.forEach(function(w){scene.add(w)});scene.add(cap);scene.add(skirt);scene.add(slabs);scene.add(trim);
  /* 사이트 표식 */
  function mark(ch,px,pz){
    var c=document.createElement('canvas');c.width=c.height=128;var g=c.getContext('2d');
    g.strokeStyle='#f1e2c8';g.lineWidth=7;g.beginPath();g.arc(64,64,54,0,6.3);g.stroke();g.fillStyle='#f1e2c8';g.font='bold 78px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(ch,64,68);
    var m=new T.Mesh(new T.PlaneGeometry(5,5),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,opacity:.5,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
    m.rotation.x=-Math.PI/2;m.position.set(px,.03,pz);scene.add(m);
  }
  MDEF.marks.forEach(function(a){mark(a[0],a[1]*CS,a[2]*CS)});
})();


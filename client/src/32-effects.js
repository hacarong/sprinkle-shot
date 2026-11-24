/* 효과: 입자 · 예광탄 · 탄흔 */
var softT=tex(function(g){var r=g.createRadialGradient(64,64,2,64,64,62);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.35,'rgba(255,255,255,.5)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,128,128)});
function mkPS(n,mat,grav,drag){
  var o={n:n,p:new Float32Array(n*3),c:new Float32Array(n*3),v:new Float32Array(n*3),l:new Float32Array(n),i:0,g:grav,d:drag},q,ge=new T.BufferGeometry();
  for(q=0;q<n;q++)o.p[q*3+1]=-999;ge.setAttribute('position',new T.BufferAttribute(o.p,3));ge.setAttribute('color',new T.BufferAttribute(o.c,3));
  o.geo=ge;o.pts=new T.Points(ge,mat);o.pts.frustumCulled=false;scene.add(o.pts);return o;
}
var PSK=mkPS(460,new T.PointsMaterial({size:.27,map:softT,vertexColors:true,transparent:true,blending:T.AdditiveBlending,depthWrite:false}),12,0),
    PSM=mkPS(240,new T.PointsMaterial({size:.55,map:softT,vertexColors:true,transparent:true,opacity:.3,depthWrite:false}),-.8,1.5);
/* 회색 계열은 연기, 그 외는 가산 혼합 불꽃 */
function puff(px,py,pz,n,sp,r,g,b,life,bx,by,bz){
  var s=Math.abs(r-g)<.07&&Math.abs(g-b)<.07&&r<.82?PSM:PSK,q,j;
  for(q=0;q<n;q++){j=s.i*3;s.i=(s.i+1)%s.n;
    s.p[j]=px;s.p[j+1]=py;s.p[j+2]=pz;s.c[j]=r;s.c[j+1]=g;s.c[j+2]=b;
    s.v[j]=(Math.random()-.5)*sp+(bx||0);s.v[j+1]=Math.random()*sp*.8+(by||0);s.v[j+2]=(Math.random()-.5)*sp+(bz||0);
    s.l[j/3]=life*(.6+Math.random()*.6)*(s===PSM?1.7:1)}
}
function psUpd(dt){
  for(var n=0;n<2;n++){var s=n?PSM:PSK,q,j,k=Math.max(0,1-s.d*dt),fd=Math.max(0,1-dt*5);
    for(q=0;q<s.n;q++)if(s.l[q]>0){j=q*3;s.l[q]-=dt;
      if(s.l[q]<=0){s.p[j+1]=-999;continue}
      s.v[j]*=k;s.v[j+2]*=k;s.v[j+1]=s.v[j+1]*k-s.g*dt;s.p[j]+=s.v[j]*dt;s.p[j+1]+=s.v[j+1]*dt;s.p[j+2]+=s.v[j+2]*dt;
      if(!n){if(s.p[j+1]<.03){s.p[j+1]=.03;s.v[j+1]*=-.35;s.v[j]*=.6;s.v[j+2]*=.6}
        if(s.l[q]<.2){s.c[j]*=fd;s.c[j+1]*=fd;s.c[j+2]*=fd}}}
    s.geo.attributes.position.needsUpdate=true;s.geo.attributes.color.needsUpdate=true}
}
var TR=[];
for(i=0;i<24;i++){var tm=new T.Mesh(trG,new T.MeshBasicMaterial({color:0xffe2b0,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));tm.visible=false;tm.frustumCulled=false;scene.add(tm);TR.push({m:tm,l:0})}
var trI=0,v1=new T.Vector3(),v2=new T.Vector3();
function tracer(ax,ay,az,bx,by,bz,col){
  var t=TR[trI];trI=(trI+1)%TR.length;v1.set(ax,ay,az);v2.set(bx,by,bz);
  t.m.position.copy(v1).add(v2).multiplyScalar(.5);t.m.scale.z=Math.max(.1,v1.distanceTo(v2));t.m.lookAt(v2);
  t.m.material.color.setHex(col);t.m.material.opacity=.9;t.m.visible=true;t.l=.07;
}
var DC=[],dcG=new T.CircleGeometry(.075,8),dcM=new T.MeshBasicMaterial({color:0x131216,transparent:true,opacity:.85,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),dcI=0;
for(i=0;i<44;i++){var dm=new T.Mesh(dcG,dcM);dm.visible=false;scene.add(dm);DC.push(dm)}


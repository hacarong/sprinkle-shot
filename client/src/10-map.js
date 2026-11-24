/* ================= 맵 ================= */
/* 맵 정의는 maps.js. 선택한 맵은 로컬 저장소에 저장되고, 변경 시 새로고침으로 적용 */
var MAPI=0;try{MAPI=+localStorage.getItem('ss_map')||0}catch(e){}
if(!MAPS[MAPI])MAPI=0;
var MDEF=MAPS[MAPI],MAP=MDEF.grid;
var MW=MAP[0].length,MH=MAP.length,CS=3,UP=3,WH=6,RD={'>':[1,0],'<':[-1,0],'^':[0,-1],'v':[0,1]},RS=new Uint8Array(MW*MH),x,z,i,k;
function mt(cx,cz){return cx<0||cz<0||cx>=MW||cz>=MH?'#':MAP[cz][cx]}
for(z=0;z<MH;z++)for(x=0;x<MW;x++){var d0=RD[MAP[z][x]];if(d0&&mt(x-d0[0],z-d0[1])===MAP[z][x])RS[z*MW+x]=1}
function rampH(cx,cz,px,pz){
  var d=RD[MAP[cz][cx]],fx=px/CS-cx,fz=pz/CS-cz,f=d[0]>0?fx:d[0]<0?1-fx:d[1]<0?1-fz:fz;
  return (RS[cz*MW+cx]?1.5:0)+1.5*Math.max(0,Math.min(1,f));
}
/* 엄폐물: 상자(칸 모서리) · 방벽(칸 경계) */
var COV=[],CB=[],BLK={};for(i=0;i<MW*MH;i++)CB[i]=[];
function addCov(x0,z0,x1,z1,b,h,kind){
  var c={x0:x0,z0:z0,x1:x1,z1:z1,b:b,t:b+h,h:h,kind:kind},cx,cz;COV.push(c);
  for(cz=Math.floor(z0/CS);cz<=Math.floor(z1/CS);cz++)for(cx=Math.floor(x0/CS);cx<=Math.floor(x1/CS);cx++)CB[cz*MW+cx].push(c);
}
function crate(cx,cz,qx,qz,h,b){var mx=(cx+.5)*CS+qx*.95,mz=(cz+.5)*CS+qz*.95;addCov(mx-.5,mz-.5,mx+.5,mz+.5,b||0,h,0)}
function bar(cx,cz,ax){
  var a=cz*MW+cx,b=ax==='x'?a+1:a+MW;BLK[a+'_'+b]=BLK[b+'_'+a]=1;
  if(ax==='x')addCov((cx+1)*CS-.25,cz*CS+.2,(cx+1)*CS+.25,cz*CS+2.8,0,1.2,1);
  else addCov(cx*CS+.2,(cz+1)*CS-.25,cx*CS+2.8,(cz+1)*CS+.25,0,1.2,1);
}
MDEF.crates.forEach(function(a){crate.apply(null,a)});
/* 낮은 상자 일부는 드럼통으로 */
COV.forEach(function(c,n){if(c.h===1.2&&c.b===0&&n%3===1){c.kind=2;c.x0+=.1;c.x1-=.1;c.z0+=.1;c.z1-=.1;c.h=1.15;c.t=1.15}});
MDEF.bars.forEach(function(a){bar(a[0],a[1],a[2])});
function floorAt(px,pz,y){
  var cx=Math.floor(px/CS),cz=Math.floor(pz/CS),t=mt(cx,cz),f;
  if(t==='#')return 99;
  if(t==='.')f=0;else if(t==='U')f=y>=UP-.6?UP:0;
  else{f=rampH(cx,cz,px,pz);if(f>y+.6)return 99}
  var l=CB[cz*MW+cx],q,c;
  for(q=0;q<l.length;q++){c=l[q];
    if(!c.dead&&px>c.x0&&px<c.x1&&pz>c.z0&&pz<c.z1&&y>c.b-.5){if(c.t>y+.6)return 99;if(c.t>f)f=c.t}}
  return f;
}
function solid(px,py,pz){
  if(py<0)return true;if(py>WH)return false;
  var cx=Math.floor(px/CS),cz=Math.floor(pz/CS),t=mt(cx,cz);
  if(t==='#')return true;
  if(t==='U'){if(py>UP-.4&&py<UP)return true}
  else if(t!=='.'&&py<rampH(cx,cz,px,pz))return true;
  var l=CB[cz*MW+cx],q,c;
  for(q=0;q<l.length;q++){c=l[q];if(!c.dead&&px>c.x0&&px<c.x1&&pz>c.z0&&pz<c.z1&&py>=c.b&&py<c.t)return true}
  return false;
}
function barrelAt(px,py,pz){
  var cx=Math.floor(px/CS),cz=Math.floor(pz/CS);if(cx<0||cz<0||cx>=MW||cz>=MH)return null;
  var l=CB[cz*MW+cx],q,c;
  for(q=0;q<l.length;q++){c=l[q];if(c.kind===2&&!c.dead&&px>c.x0-.1&&px<c.x1+.1&&pz>c.z0-.1&&pz<c.z1+.1&&py>=c.b-.1&&py<c.t+.1)return c}
  return null;
}
function ray(ox,oy,oz,dx,dy,dz,max){
  for(var t=.15;t<max;t+=.15)if(solid(ox+dx*t,oy+dy*t,oz+dz*t)){
    var a=t-.15,b=t,m,n;for(n=0;n<5;n++){m=(a+b)/2;if(solid(ox+dx*m,oy+dy*m,oz+dz*m))b=m;else a=m}
    return a;
  }
  return -1;
}
function los(ax,ay,az,bx,by,bz){
  var dx=bx-ax,dy=by-ay,dz=bz-az,n=Math.ceil(Math.sqrt(dx*dx+dy*dy+dz*dz)/.4),q;
  for(q=1;q<n;q++)if(solid(ax+dx*q/n,ay+dy*q/n,az+dz*q/n))return false;return true;
}
function ok(e,px,pz,r){return floorAt(px-r,pz-r,e.y)<50&&floorAt(px+r,pz-r,e.y)<50&&floorAt(px-r,pz+r,e.y)<50&&floorAt(px+r,pz+r,e.y)<50}
function move(e,dx,dz,r){
  if(!ok(e,e.x,e.z,r)){ /* 겹친 상태: 가장 가까운 빈 자리로 밀어내기 */
    for(var d=.15;d<1.6;d+=.15)for(var a=0;a<8;a++){var ux=Math.cos(a*.785)*d,uz=Math.sin(a*.785)*d;
      if(ok(e,e.x+ux,e.z+uz,r)){e.x+=ux;e.z+=uz;return}}
  }
  if(ok(e,e.x+dx,e.z,r))e.x+=dx;if(ok(e,e.x,e.z+dz,r))e.z+=dz;
}
/* 발 둘레 전체에서 가장 높은 바닥을 사용: 모서리가 상자·경사로에 걸친 채 가라앉지 않음 */
function grav(e,dt,r){
  var f=floorAt(e.x,e.z,e.y),q,v;if(f>50)f=-1;
  for(q=0;q<4;q++){v=floorAt(e.x+(q&1?r:-r),e.z+(q&2?r:-r),e.y);if(v<50&&v>f)f=v}
  if(f<0)f=e.y;
  if(e.y>f+.001){e.vy-=22*dt;e.y+=e.vy*dt;if(e.y<=f){e.y=f;e.vy=0}}
  else{e.y+=Math.min(f-e.y,9*dt);e.vy=0}
}
function clearLine(e,tx,tz,r){
  var dx=tx-e.x,dz=tz-e.z,n=Math.ceil(Math.hypot(dx,dz)/.3),q;
  for(q=1;q<=n;q++)if(!ok(e,e.x+dx*q/n,e.z+dz*q/n,r))return false;return true;
}
/* 경로 그래프: 노드 = 칸*2 + 층 */
var NN=MW*MH*2,adj=[],radj=[],dist=new Int16Array(NN);
for(i=0;i<NN;i++){adj[i]=[];radj[i]=[]}
function E(a,b){adj[a].push(b);radj[b].push(a)}
function gnd(t){return t==='.'||t==='U'}
var D4=[[1,0],[-1,0],[0,1],[0,-1]];
for(z=0;z<MH;z++)for(x=0;x<MW;x++){
  var t=MAP[z][x],c=z*MW+x;if(t==='#')continue;
  for(k=0;k<4;k++){
    var dx=D4[k][0],dz=D4[k][1],u=mt(x+dx,z+dz),n=(z+dz)*MW+x+dx,d;if(u==='#')continue;
    if(gnd(t)&&gnd(u)&&!BLK[c+'_'+n])E(c*2,n*2);
    if(t==='U'&&u==='U')E(c*2+1,n*2+1);
    if(t==='U'&&u==='.')E(c*2+1,n*2);
    if(RD[t]){d=RD[t];
      if(dx===d[0]&&dz===d[1]){if(u===t)E(c*2,n*2);else if(RS[c]&&u==='U')E(c*2,n*2+1)}
      if(dx===-d[0]&&dz===-d[1]){if(u===t)E(c*2,n*2);else if(!RS[c]&&gnd(u))E(c*2,n*2)}
    }else if(RD[u]){d=RD[u];
      if(gnd(t)&&!RS[n]&&dx===d[0]&&dz===d[1])E(c*2,n*2);
      if(t==='U'&&RS[n]&&dx===-d[0]&&dz===-d[1])E(c*2+1,n*2);
    }
  }
}
function nodeOf(e){var cx=Math.floor(e.x/CS),cz=Math.floor(e.z/CS);return (cz*MW+cx)*2+(mt(cx,cz)==='U'&&e.y>2.2?1:0)}
function flow(){
  dist.fill(999);var q=[nodeOf(P)],h=0,a,b,l;dist[q[0]]=0;
  while(h<q.length){a=q[h++];l=radj[a];for(b=0;b<l.length;b++)if(dist[l[b]]>dist[a]+1){dist[l[b]]=dist[a]+1;q.push(l[b])}}
}
var SPAWN=MDEF.spawn;


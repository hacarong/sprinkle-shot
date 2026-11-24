(function(){
'use strict';
var _el={},_sv={};
var $=function(id){return _el[id]||(_el[id]=document.getElementById(id))};
/* 값이 바뀔 때만 DOM에 기록 */
function st(id,prop,val){var k=id+prop;if(_sv[k]!==val){_sv[k]=val;$(id).style[prop]=val}}
var CFG={sens:1,vol:1,cap:0,fps:false,dyn:true,mini:true,diff:1,bsz:1,auto:false,shk:1,fls:1,hl:0};
try{var c0=JSON.parse(localStorage.getItem('ss_cfg'))||{};for(var ck in CFG)if(typeof c0[ck]===typeof CFG[ck])CFG[ck]=c0[ck]}catch(e){}
function saveCfg(){try{localStorage.setItem('ss_cfg',JSON.stringify(CFG))}catch(e){}}
var DFD=[.7,1,1.35],DFH=[.85,1,1.2]; /* 난이도: 받는 피해 · 적 체력 */
/* 강화 */
function newPK(){return {dmg:1,rate:1,rel:1,mag:1,spd:1,dr:1,shw:0,grx:0,dash:1,boom:0,phase:0,refund:0,leech:0,last:0,cluster:0,exec:0}}
var PK=newPK();
/* 영구 진행: 스프링클(재화)과 해금 */
var META={cur:0,own:{}};
try{var m0=JSON.parse(localStorage.getItem('ss_meta'));if(m0&&typeof m0.cur==='number'){META.cur=m0.cur;META.own=m0.own||{}}}catch(e){}
function saveMeta(){try{localStorage.setItem('ss_meta',JSON.stringify(META))}catch(e){}}
function lsGet(k,d){try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
var ST={},KW='',hitBy='',HLC=[0,0x4a1010,0x4a4208,0x083f44];
if(!window.THREE){$('subt').textContent='3D 라이브러리 로드 실패 · 네트워크 확인 후 새로고침';$('go').disabled=true;return}
var T=THREE,cv=$('c');
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;


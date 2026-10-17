(()=>{
'use strict';
const $=id=>document.getElementById(id);
const targets=[['name','Nome ZixLima'],['slogan','Frase do anúncio'],['logo','Foto do logotipo'],['photo','Foto do slogan']];
const colorChoices=[['','Manter cor atual'],['#ffffff','Branco'],['#111111','Preto'],['#16a34a','Verde'],['#ffdf45','Amarelo'],['#e5e7eb','Prateado'],['#f7c948','Dourado'],['#438bff','Azul']];
const num=(n,d=0)=>Number.isFinite(Number(n))?Number(n):d;
function state(){return window.zixQuickData||(window.zixQuickData={});}
function entry(device,target){const all=state();all[device]??={};all[device][target]??={x:0,y:0,size:0,color:''};return all[device][target]}
const ids={mobile:{name:'zzMiniNameM',slogan:'zzMiniSloganTextM',logo:'zzMiniLogoM',photo:'zzMiniSloganImgM'},desktop:{name:'zzMiniNameD',slogan:'zzMiniSloganTextD',logo:'zzMiniLogoD',photo:'zzMiniSloganImgD'}};
function baseFont(device,target){const ref=target==='name'?(device==='mobile'?'zzNameSm':'zzNameSd'):(device==='mobile'?'zzSloganTextSm':'zzSloganTextSd');return num($(ref)?.value,target==='name'?30:22)}
function baseSize(device,target){const pre=target==='logo'?'zzLogo':'zzSlogan'; const suf=device==='mobile'?'m':'d';const w=num($(pre+'W'+suf)?.value,56),h=num($(pre+'H'+suf)?.value,56);return [w,h]}
function draw(){for(const device of ['mobile','desktop'])for(const [target] of targets){const el=$(ids[device][target]);if(!el)continue;const e=entry(device,target);const card=el.closest('.zix-preview-card'); const box=card?.querySelector('.zix-shot-bar');const available=Math.max(125,(box?.clientWidth||290)-44);const y=num(e.y),x=num(e.x),sz=num(e.size);if(target==='name'||target==='slogan'){
 const base=baseFont(device,target);const factor=device==='desktop'?0.54:0.79;
 el.style.setProperty('font-size',Math.max(11,Math.min(36,(base+sz)*factor))+'px','important');
 el.style.setProperty('max-width','100%');el.style.setProperty('white-space','normal');el.style.setProperty('overflow-wrap','break-word');
 if(e.color) {el.style.setProperty('color',e.color,'important');el.style.setProperty('-webkit-text-fill-color',e.color,'important')}
 }else{const [w,h]=baseSize(device,target);const maxW=Math.min(available*.49,device==='mobile'?96:142);const ratio=Math.max(.1,Math.min(1,maxW/Math.max(1,w+sz)));el.style.setProperty('width',Math.max(12,Math.round((w+sz)*ratio))+'px','important');el.style.setProperty('height',Math.max(12,Math.round((h+sz)*ratio))+'px','important');el.style.setProperty('object-fit','contain');}
 el.style.setProperty('transform',`translate(${x}px,${y}px)`,'important');
 }}
function make(device){const card=$(ids[device].name)?.closest('.zix-preview-card');if(!card||card.querySelector('.zix-directional'))return;
const p=document.createElement('div');p.className='zix-directional';p.dataset.device=device;
p.innerHTML=`<div class="zix-quick-caption">🎛️ Direcional ${device==='mobile'?'celular':'desktop'}</div>
<label>O que deseja editar?<select class="zix-q-target">${targets.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select></label>
<label class="zix-q-text-label">Digite a frase<input class="zix-q-text" type="text" maxlength="160"/></label>
<label>Cor da letra<select class="zix-q-color">${colorChoices.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select></label>
<div class="zix-q-direction"><button type="button" data-do="up" aria-label="Subir">▲</button><div><button type="button" data-do="left" aria-label="Esquerda">◀</button><button type="button" data-do="right" aria-label="Direita">▶</button></div><button type="button" data-do="down" aria-label="Descer">▼</button></div>
<div class="zix-q-scale"><button type="button" data-do="smaller">−</button><span>Tamanho</span><button type="button" data-do="bigger">+</button></div><small class="zix-q-readout"></small>`;
card.appendChild(p);const choose=p.querySelector('.zix-q-target'),color=p.querySelector('.zix-q-color'),inp=p.querySelector('.zix-q-text'),label=p.querySelector('.zix-q-text-label');
const refresh=()=>{const target=choose.value,e=entry(device,target);label.hidden=!(target==='name'||target==='slogan');p.querySelector('.zix-q-color').parentElement.hidden=label.hidden;inp.value=$(target==='name'?'zzTextoMarca':'zzTextoSlogan')?.value||'';color.value=e.color||'';p.querySelector('.zix-q-readout').textContent=`Posição: ${num(e.x)}, ${num(e.y)} px · Tamanho: ${num(e.size)>0?'+':''}${num(e.size)} px`;};
choose.addEventListener('change',refresh);
color.addEventListener('change',()=>{entry(device,choose.value).color=color.value;draw();refresh()});
inp.addEventListener('input',()=>{const master=$(choose.value==='name'?'zzTextoMarca':'zzTextoSlogan');if(master){master.value=inp.value;master.dispatchEvent(new Event('input',{bubbles:true}));}});
p.querySelectorAll('button[data-do]').forEach(btn=>btn.addEventListener('click',()=>{const e=entry(device,choose.value),k=btn.dataset.do;const delta={up:['y',-1],down:['y',1],left:['x',-1],right:['x',1],smaller:['size',-1],bigger:['size',1]}[k];e[delta[0]]=Math.max(-250,Math.min(250,num(e[delta[0]])+delta[1]));draw();refresh();}));refresh();}
function init(){make('mobile');make('desktop');draw();}
window.zixQuickRender=draw;window.zixQuickSync=()=>{draw();for(const p of document.querySelectorAll('.zix-directional'))p.querySelector('.zix-q-target')?.dispatchEvent(new Event('change'))};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
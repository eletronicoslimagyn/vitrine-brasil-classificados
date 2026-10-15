(()=>{
const body=document.body,t=document.getElementById('zzThemeToggle'),p=document.getElementById('zzPalette'),b=document.getElementById('zzPaletteToggle');
let theme='light',color='blue';
try{theme=localStorage.getItem('zz-theme')==='dark'?'dark':'light';color=localStorage.getItem('zz-color')||'blue'}catch{}
if(!['blue','green','sand','purple'].includes(color))color='blue';
function paint(){body.dataset.zzTheme=theme;body.dataset.zzColor=color;t.textContent=theme==='dark'?'☀️':'🌙'}
paint();
t.onclick=()=>{theme=theme==='dark'?'light':'dark';try{localStorage.setItem('zz-theme',theme)}catch{}paint()};
b.onclick=()=>p.classList.toggle('open');
p.querySelectorAll('button').forEach(x=>x.onclick=()=>{color=x.dataset.color;try{localStorage.setItem('zz-color',color)}catch{}paint();p.classList.remove('open')});
document.addEventListener('click',e=>{if(!p.contains(e.target)&&!b.contains(e.target))p.classList.remove('open')});
})();
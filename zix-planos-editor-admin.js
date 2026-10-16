import {SUPABASE_URL,SUPABASE_ANON_KEY} from './config.js';
const $=id=>document.getElementById(id);
const msg=$('zixPlanEditMsg'),form=$('zixPlanEditForm'),list=$('zixPlanEditList');
let db,rows=[];
try{
 const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
 db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
}catch(e){msg.textContent='Erro de conexão: '+e.message}
const names=x=>x.replace(/\W/g,'');
const format=x=>Number(x).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
async function adminReady(){
 if(!db || $('painel').style.display!=='block')throw Error('Entre no painel Admin');
 const {data:{user},error}=await db.auth.getUser();
 if(error||!user)throw Error('Sessão expirada');
 const {data:adm,error:aError}=await db.from('admins').select('user_id').eq('user_id',user.id).maybeSingle();
 if(aError||!adm)throw Error('Conta sem permissão administrativa');
}
const input=(k)=>form.elements.namedItem(k);
const isoLocal=x=>{if(!x)return '';const d=new Date(x);const pad=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`};
function fill(p){
 form.reset();
 for(const k of ['id','name','description','price','ad_count','days','discount_percent','sort_order'])input(k).value=p?.[k]??({discount_percent:0,sort_order:100}[k]??'');
 input('visible').checked=p?.visible??true;
 input('featured').checked=p?.featured??false;
 input('promo_start').value=isoLocal(p?.promo_start);
 input('promo_end').value=isoLocal(p?.promo_end);
 input('id').readOnly=!!p;
 $('zixPlanEditTitle').textContent=p?'Editar plano: '+p.name:'Criar novo plano';
 msg.textContent='';
}
async function refresh(){
 try{await adminReady();
  const {data,error}=await db.from('zix_plan_catalog').select('*').order('sort_order').order('name');
  if(error)throw error;rows=data||[];list.replaceChildren();
  for(const p of rows){
   const line=document.createElement('div');line.className='zix-plano-linha';
   const label=document.createElement('span');label.textContent=`${p.name} — ${format(p.price)} — ${p.ad_count} anúncio(s), ${p.days} dias — ${p.visible?'Visível':'Oculto'}`;
   const btn=document.createElement('button');btn.type='button';btn.textContent='✏️ Editar';btn.onclick=()=>{fill(p);form.scrollIntoView({behavior:'smooth',block:'start'})};
   line.append(label,btn);list.append(line);
  }
  // Atualiza o seletor antigo de concessão de créditos, preservando seu funcionamento.
  const selector=$('zixConcederPlano');if(selector){const current=selector.value;selector.replaceChildren();for(const p of rows.filter(x=>x.visible)){
   const opt=document.createElement('option');opt.value=p.id;opt.textContent=`${p.name} — ${p.ad_count} anúncio(s), ${p.days} dias`;selector.append(opt);
  }if(rows.some(x=>x.id===current&&x.visible))selector.value=current;}
  msg.textContent=`${rows.length} plano(s) cadastrado(s).`;
 }catch(e){msg.textContent='Não foi possível listar: '+e.message}
}
form.addEventListener('submit',async e=>{
 e.preventDefault();const btn=form.querySelector('[type=submit]');btn.disabled=true;
 try{await adminReady();
  const id=input('id').value.trim().toLowerCase();
  if(!/^[a-z][a-z0-9_]{2,39}$/.test(id))throw Error('Código: 3 a 40 caracteres, apenas letras minúsculas, números e _.');
  const start=input('promo_start').value,end=input('promo_end').value;
  if(start&&end&&new Date(start)>=new Date(end))throw Error('A promoção deve terminar depois de começar.');
  const params={p_id:id,p_name:input('name').value.trim(),p_description:input('description').value.trim(),p_price:Number(input('price').value),p_ad_count:Number(input('ad_count').value),p_days:Number(input('days').value),p_discount_percent:Number(input('discount_percent').value),p_promo_start:start?new Date(start).toISOString():null,p_promo_end:end?new Date(end).toISOString():null,p_visible:input('visible').checked,p_featured:input('featured').checked,p_sort_order:Number(input('sort_order').value)};
  const {error}=await db.rpc('zix_save_plan',params);if(error)throw error;
  await refresh();fill(rows.find(x=>x.id===id));msg.textContent='Plano salvo no Supabase. A vitrine pública exibirá a alteração após atualizar a página.';
 }catch(e){msg.textContent='Não foi possível salvar: '+e.message}finally{btn.disabled=false}
});
$('zixPlanNew').onclick=()=>fill(null);
$('zixPlanRefresh').onclick=refresh;
const observer=new MutationObserver(()=>{if($('painel').style.display==='block')refresh()});
observer.observe($('painel'),{attributes:true,attributeFilter:['style']});
if($('painel').style.display==='block')refresh();

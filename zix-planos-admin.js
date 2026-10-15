import {SUPABASE_URL,SUPABASE_ANON_KEY} from './config.js';
const $=id=>document.getElementById(id);
let db;try{const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY)}catch(e){$('zixFinanceiroMsg').textContent=e.message}
async function ready(){if(!db)throw Error('Supabase indisponível');if($('painel').style.display!=='block')throw Error('Faça login no Admin');const {data:{user}}=await db.auth.getUser();if(!user)throw Error('Login necessário');const {data:a,error}=await db.from('admins').select('user_id').eq('user_id',user.id).maybeSingle();if(error||!a)throw Error('Sem permissão administrativa')}
async function load(){try{await ready();const {data,error}=await db.from('zix_billing_settings').select('*').eq('id',1).single();if(error)throw error;$('zixCobrar').checked=data.charging_enabled;$('zixPlanoAlvo').value=data.discount_plan;$('zixDesconto').value=data.discount_percent}catch(e){$('zixFinanceiroMsg').textContent='Configuração: '+e.message+' — execute primeiro o SQL no Supabase.'}}
$('zixSalvarFinanceiro').onclick=async()=>{try{await ready();const discount=Number($('zixDesconto').value);if(!Number.isInteger(discount)||discount<0||discount>100)throw Error('Desconto deve ser de 0 a 100');const {error}=await db.rpc('zix_set_billing',{p_enabled:$('zixCobrar').checked,p_plan:$('zixPlanoAlvo').value,p_discount:discount});if(error)throw error;$('zixFinanceiroMsg').textContent='Configurações salvas no Supabase.'}catch(e){$('zixFinanceiroMsg').textContent=e.message}};
$('zixConceder').onclick=async()=>{try{await ready();if(!confirm('Você confirmou o pagamento Pix (ou a gratuidade) e deseja conceder créditos?'))return;const {error}=await db.rpc('zix_grant_credits',{p_user:$('zixClienteId').value.trim(),p_plan:$('zixConcederPlano').value});if(error)throw error;$('zixCreditoMsg').textContent='Créditos concedidos.'}catch(e){$('zixCreditoMsg').textContent=e.message}};
$('zixAplicarPrazo').onclick=async()=>{try{await ready();const {error}=await db.rpc('zix_manage_listing',{p_listing:$('zixAnuncioId').value.trim(),p_action:$('zixAcao').value,p_days:Number($('zixDias').value),p_reason:$('zixMotivo').value.trim()});if(error)throw error;$('zixPrazoMsg').textContent='Prazo atualizado.'}catch(e){$('zixPrazoMsg').textContent=e.message}};
const observer=new MutationObserver(()=>{if($('painel').style.display==='block'){observer.disconnect();load()}});observer.observe($('painel'),{attributes:true,attributeFilter:['style']});if($('painel').style.display==='block')load();

// Desconto individual, gravado com RPC administrativa no Supabase.
$('zixDiscountSave')?.addEventListener('click',async()=>{
 const out=$('zixDiscountMsg');
 try{await ready();const pct=Number($('zixDiscountPercent').value);
 if(!Number.isInteger(pct)||pct<0||pct>100)throw Error('Desconto invalido (0 a 100).');
 const {error}=await db.rpc('zix_set_discount',{p_plan:$('zixDiscountPlan').value,p_percent:pct,p_enabled:$('zixDiscountEnabled').checked});
 if(error)throw error;out.textContent='Desconto individual salvo no Supabase.';
 }catch(e){out.textContent='Nao foi possivel salvar: '+e.message}
});

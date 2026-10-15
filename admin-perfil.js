import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';
import {SUPABASE_URL,SUPABASE_ANON_KEY} from './config.js';
const db=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
const $=id=>document.getElementById(id);
async function showProfile(){
 const {data:{user}}=await db.auth.getUser();
 if(!user || $('painel').style.display!=='block')return;
 const m=user.user_metadata||{};
 $('zzPerfilNome').value=m.nome||'';
 $('zzPerfilFone').value=m.telefone||'';
 $('zzPerfilCidade').value=m.cidade||'';
}
$('zzSalvarPerfil').onclick=async()=>{
 if($('painel').style.display!=='block')return;
 const button=$('zzSalvarPerfil');button.disabled=true;
 const data={nome:$('zzPerfilNome').value.trim(),telefone:$('zzPerfilFone').value.trim(),cidade:$('zzPerfilCidade').value.trim()};
 const {error}=await db.auth.updateUser({data});
 $('zzPerfilMensagem').textContent=error?'Erro: '+error.message:'Perfil salvo no Supabase.';
 button.disabled=false;
};
db.auth.onAuthStateChange(()=>setTimeout(showProfile,150));
showProfile();

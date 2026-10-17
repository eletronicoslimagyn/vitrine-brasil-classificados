(async()=>{try{
 const r=await fetch('./site-brand-settings.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)return;
 const c=await r.json(),quick=c.quick||{},pick=(dev,key)=>quick[dev]?.[key]||{};
 const nums=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
 const rules=[];
 for(const [dev,media,letter] of [['mobile','(max-width:700px)','m'],['desktop','(min-width:701px)','d']]){
  const q=t=>pick(dev,t);const px=(target,k)=>nums(q(target)[k]);
  const font=(target,original)=>Math.max(10,nums(original)+px(target,'size'));
  const width=(target,original)=>Math.max(15,nums(original)+px(target,'size'));
  const color=(target)=>/^#[0-9a-fA-F]{6}$/.test(q(target).color||'')?`color:${q(target).color}!important;-webkit-text-fill-color:${q(target).color}!important;`:'';
  rules.push(`@media ${media}{
#siteBrand{font-size:${font('name',c[dev==='mobile'?'nameSm':'nameSd'])}px!important;transform:translate(${px('name','x')}px,${nums(c.nameY)+px('name','y')}px) scale(${nums(c.nameSx,100)/100},${nums(c.nameSy,100)/100})!important;${color('name')}}
#siteHero{font-size:${font('slogan',c[dev==='mobile'?'sloganTextSm':'sloganTextSd'])}px!important;transform:translate(${nums(c.sloganX)+px('slogan','x')}px,${nums(c.sloganY)+px('slogan','y')}px)!important;${color('slogan')}}
body.zz-has-custom-logo #zzCustomBrandLogo{width:${width('logo',c['logoW'+letter])}px!important;height:${width('logo',c['logoH'+letter])}px!important;transform:translate(${nums(c['logoX'+letter])+px('logo','x')}px,${nums(c['logoY'+letter])+px('logo','y')}px)!important}
body.zz-has-slogan-icon #zzSloganIcon{width:${width('photo',c['sloganW'+letter])}px!important;height:${width('photo',c['sloganH'+letter])}px!important;transform:translate(${nums(c.sloganImgX)+px('photo','x')}px,${nums(c.sloganImgY)+px('photo','y')}px)!important}
}`);
 }
 const style=document.createElement('style');style.textContent=rules.join('\n');document.head.appendChild(style);
}catch(e){console.warn('Direcional ZixLima:',e)}})();
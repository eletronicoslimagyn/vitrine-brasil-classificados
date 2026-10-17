function zzColorMap(nome){
  const mapa = {
    'preto':'#111111',
    'branco':'#ffffff',
    'prateado':'#d9dee7',
    'dourado':'#f6c84c',
    'verde':'#16a34a',
    'verde-led':'#7dff61',
    'amarelo':'#ffd800',
    'azul':'#4db3ff',
    'vermelho':'#ff4d4d'
  };
  return mapa[nome] || nome || '#ffffff';
}
function zzApplyLed(el, corTexto, corLed, efeito, intensidade){
  if(!el) return;
  const txt = zzColorMap(corTexto);
  const led = zzColorMap(corLed);
  const i = Math.max(0, Math.min(20, Number(intensidade || 0)));

  el.style.color = txt;
  el.style.textShadow = 'none';
  el.style.animation = 'none';
  el.style.backgroundImage = 'none';
  el.style.webkitTextFillColor = '';
  el.style.backgroundClip = '';
  el.style.webkitBackgroundClip = '';

  if(!efeito || efeito === 'sem-luz') return;

  const sombra =
    `0 0 ${Math.max(2,i)}px ${led},
     0 0 ${Math.max(4,i*2)}px ${led},
     0 0 ${Math.max(6,i*3)}px ${led}`;

  if(efeito === 'luz-fixa'){
    el.style.textShadow = sombra;
    return;
  }

  if(efeito === 'led-pulsante'){
    el.style.textShadow = sombra;
    el.style.animation = 'zzPulseGlow 1.3s ease-in-out infinite';
    return;
  }

  if(efeito === 'led-movimento'){
    el.style.textShadow = sombra;
    el.style.backgroundImage = `linear-gradient(90deg, ${txt}, ${led}, ${txt})`;
    el.style.backgroundSize = '200% auto';
    el.style.webkitBackgroundClip = 'text';
    el.style.backgroundClip = 'text';
    el.style.webkitTextFillColor = 'transparent';
    el.style.animation = 'zzMoveGlow 2s linear infinite';
  }
}
(async () => {
  try{
    const r = await fetch('./site-brand-settings.json?ts=' + Date.now(), {cache:'no-store'});
    if(!r.ok) return;
    const c = await r.json();

    const root = document.documentElement.style;

    const setNumVar = (name, value, suffix='px') => {
      if(value === undefined || value === null || value === '') return;
      if(suffix){
        root.setProperty(name, String(value) + suffix);
      }else{
        root.setProperty(name, String(value));
      }
    };

    setNumVar('--zz-logo-wm', c.logoWm);
    setNumVar('--zz-logo-hm', c.logoHm);
    setNumVar('--zz-logo-wd', c.logoWd);
    setNumVar('--zz-logo-hd', c.logoHd);
    const limite = (v, max) => Math.max(-max,Math.min(max,Number(v)||0));
    setNumVar('--zz-logo-xm', limite(c.logoXm,300));
    setNumVar('--zz-logo-ym', limite(c.logoYm,300));
    setNumVar('--zz-logo-xd', limite(c.logoXd,500));
    setNumVar('--zz-logo-yd', limite(c.logoYd,500));
    setNumVar('--zz-name-sm', c.nameSm);
    setNumVar('--zz-name-sd', c.nameSd);
    setNumVar('--zz-name-y', c.nameY);
    setNumVar('--zz-name-ls', c.nameLs);

    if(Number.isFinite(Number(c.nameSx))){
      root.setProperty('--zz-name-sx', String(Number(c.nameSx)/100));
    }
    if(Number.isFinite(Number(c.nameSy))){
      root.setProperty('--zz-name-sy', String(Number(c.nameSy)/100));
    }

    setNumVar('--zz-slogan-text-sm', c.sloganTextSm);
    setNumVar('--zz-slogan-text-sd', c.sloganTextSd);
    setNumVar('--zz-slogan-wm', c.sloganWm);
    setNumVar('--zz-slogan-hm', c.sloganHm);
    setNumVar('--zz-slogan-wd', c.sloganWd);
    setNumVar('--zz-slogan-hd', c.sloganHd);


    const palette={original:'',white:'#ffffff',green:'#5dff62',yellow:'#ffef53',gold:'#ffd058',silver:'#e1eaf5',blue:'#49b9ff',red:'#ff6262',black:'#111827'};
    function led(el,color,mode,glow){
      if(!el)return;
      const hex=palette[color]||'';
      if(hex){
        el.style.setProperty('color',hex,'important');
        el.style.setProperty('-webkit-text-fill-color',hex,'important');
        el.style.setProperty('background-image','none','important');
      }
      el.style.setProperty('--zz-led-shine',hex||'#66ff77');
      el.style.setProperty('--zz-led-blur',Math.max(0,Math.min(20,Number(glow)||0))+'px');
      el.classList.toggle('zz-led-steady',mode==='steady');
      el.classList.toggle('zz-led-pulse',mode==='pulse');
      el.classList.toggle('zz-led-cycle',mode==='cycle');
    }
    led(document.getElementById('siteBrand'),c.nameColor,c.nameLed,c.nameGlow);
    led(document.getElementById('siteHero'),c.sloganColor,c.sloganLed,c.sloganGlow);
    const bound=n=>Math.max(-300,Math.min(300,Number(n)||0));
    root.setProperty('--zz-slogan-x',bound(c.sloganX)+'px');
    root.setProperty('--zz-slogan-y',bound(c.sloganY)+'px');
    root.setProperty('--zz-slogan-img-x',bound(c.sloganImgX)+'px');
    root.setProperty('--zz-slogan-img-y',bound(c.sloganImgY)+'px');

    const siteBrand = document.getElementById('siteBrand');
    if(siteBrand){
      zzApplyLed(siteBrand, c.nameColor, c.nameGlowColor, c.nameLightEffect, c.nameLightIntensity);
    }

    const heroText = document.getElementById('siteHero');
    if(heroText){
      zzApplyLed(heroText, c.sloganColor, c.sloganGlowColor, c.sloganLightEffect, c.sloganLightIntensity);
    }

    const brand = document.querySelector('header .top > a.brand');
    if(brand && c.logoPath){
      let img = document.getElementById('zzCustomBrandLogo');
      if(!img){
        img = document.createElement('img');
        img.id = 'zzCustomBrandLogo';
        img.alt = 'Logo da empresa';
        brand.insertBefore(img, brand.firstChild);
      }
      img.src = c.logoPath + '?ts=' + Date.now();
      document.body.classList.add('zz-has-custom-logo');
    }

    const hero = document.getElementById('siteHero');
    if(hero){
      let wrap = hero.parentElement;
      if(!wrap.classList.contains('zz-siteHeroTitleWrap')){
        wrap.classList.add('zz-siteHeroTitleWrap');
      }
      if(c.sloganPath){
        let icon = document.getElementById('zzSloganIcon');
        if(!icon){
          icon = document.createElement('img');
          icon.id = 'zzSloganIcon';
          icon.alt = 'Ícone do slogan';
          wrap.insertBefore(icon, hero);
        }
        icon.src = c.sloganPath + '?ts=' + Date.now();
        document.body.classList.add('zz-has-slogan-icon');
      }
    }
  }catch(e){
    console.warn('Editor visual da marca indisponível', e);
  }
})();

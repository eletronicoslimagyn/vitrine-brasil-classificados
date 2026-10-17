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

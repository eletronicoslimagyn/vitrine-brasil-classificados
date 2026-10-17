(() => {
  const $ = id => document.getElementById(id);
  const repo = 'eletronicoslimagyn/zixlima';
  const defaults = {
    logoPath: '',
    sloganPath: '',
    logoWm: 56,
    logoHm: 56,
    logoWd: 84,
    logoHd: 84,
    nameSm: 36,
    nameSd: 72,
    nameSx: 100,
    nameSy: 100,
    nameY: 0,
    nameLs: -1,
    sloganTextSm: 24,
    sloganTextSd: 40,
    sloganWm: 36,
    sloganHm: 36,
    sloganWd: 52,
    sloganHd: 52
  };

  const ids = [
    'zzLogoWm','zzLogoHm','zzLogoWd','zzLogoHd',
    'zzNameSm','zzNameSd','zzNameSx','zzNameSy','zzNameY','zzNameLs',
    'zzSloganTextSm','zzSloganTextSd','zzSloganWm','zzSloganHm','zzSloganWd','zzSloganHd'
  ];

  let current = {...defaults};
  const savedText = {nome:'ZixLima', slogan:'ZixLima Anúncie Aqui'};

  function msg(t, ok=false){
    const el = $('zzMarcaMensagem');
    if(!el) return;
    el.style.color = ok ? '#15803d' : '#b91c1c';
    el.textContent = t || '';
  }

  function val(id, fallback=0){
    const n = Number($(id)?.value);
    return Number.isFinite(n) ? n : fallback;
  }

  function collect(){
    return {
      logoPath: current.logoPath || '',
      sloganPath: current.sloganPath || '',
      logoWm: val('zzLogoWm',56),
      logoHm: val('zzLogoHm',56),
      logoWd: val('zzLogoWd',84),
      logoHd: val('zzLogoHd',84),
      nameSm: val('zzNameSm',36),
      nameSd: val('zzNameSd',72),
      nameSx: val('zzNameSx',100),
      nameSy: val('zzNameSy',100),
      nameY: val('zzNameY',0),
      nameLs: val('zzNameLs',-1),
      sloganTextSm: val('zzSloganTextSm',24),
      sloganTextSd: val('zzSloganTextSd',40),
      sloganWm: val('zzSloganWm',36),
      sloganHm: val('zzSloganHm',36),
      sloganWd: val('zzSloganWd',52),
      sloganHd: val('zzSloganHd',52)
    };
  }

  function fill(data={}){
    current = {...defaults, ...data};
    $('zzLogoWm').value = current.logoWm;
    $('zzLogoHm').value = current.logoHm;
    $('zzLogoWd').value = current.logoWd;
    $('zzLogoHd').value = current.logoHd;
    $('zzNameSm').value = current.nameSm;
    $('zzNameSd').value = current.nameSd;
    $('zzNameSx').value = current.nameSx;
    $('zzNameSy').value = current.nameSy;
    $('zzNameY').value = current.nameY;
    $('zzNameLs').value = current.nameLs;
    $('zzSloganTextSm').value = current.sloganTextSm;
    $('zzSloganTextSd').value = current.sloganTextSd;
    $('zzSloganWm').value = current.sloganWm;
    $('zzSloganHm').value = current.sloganHm;
    $('zzSloganWd').value = current.sloganWd;
    $('zzSloganHd').value = current.sloganHd;
    renderPreview();
    if(current.logoPath) showPreviewImage('zzLogoPreviewBox', current.logoPath);
    if(current.sloganPath) showPreviewImage('zzSloganPreviewBox', current.sloganPath);
  }

  function fileToDataURL(file){
    return new Promise((resolve,reject)=>{
      const r = new FileReader();
      r.onload = () => resolve(String(r.result||''));
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  function showPreviewImage(boxId, src){
    const box = $(boxId);
    if(!box) return;
    box.innerHTML = '';
    const img = document.createElement('img');
    img.src = src;
    box.appendChild(img);
  }

  function renderPreview(){
    const c = collect();

    const miniName = $('zzMiniName');
    miniName.textContent = $('zzTextoMarca')?.value?.trim() || 'ZixLima';
    miniName.style.fontSize = c.nameSm + 'px';
    miniName.style.transform = `translateY(${c.nameY}px) scaleX(${c.nameSx/100}) scaleY(${c.nameSy/100})`;
    miniName.style.letterSpacing = c.nameLs + 'px';

    const sloganText = $('zzMiniSloganText');
    sloganText.textContent = $('zzTextoSlogan')?.value?.trim() || 'ZixLima Anúncie Aqui';
    const modoDesktop = window.matchMedia('(min-width: 701px)').matches;
    sloganText.style.fontSize = (modoDesktop ? c.sloganTextSd : c.sloganTextSm) + 'px';
    sloganText.style.lineHeight = '1.15';
    sloganText.style.overflowWrap = 'anywhere';

    const logo = $('zzMiniLogo');
    logo.style.width = c.logoWm + 'px';
    logo.style.height = c.logoHm + 'px';

    const slog = $('zzMiniSloganImg');
    slog.style.width = c.sloganWm + 'px';
    slog.style.height = c.sloganHm + 'px';
  }

  async function request(path, opts={}){
    const token = $('zzToken')?.value?.trim();
    if(!token) throw new Error('Informe o token GitHub.');
    const r = await fetch('https://api.github.com/repos/' + repo + path, {
      ...opts,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: 'Bearer ' + token,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(opts.headers || {})
      }
    });
    const data = await r.json().catch(()=>({}));
    if(!r.ok){
      const e = new Error('HTTP ' + r.status + ': ' + (data.message || 'Erro GitHub'));
      e.status = r.status;
      throw e;
    }
    return data;
  }

  async function putTextFile(path, text, message){
    let sha = null;
    try{
      const old = await request('/contents/' + path);
      sha = old.sha;
    }catch(e){
      if(e.status !== 404) throw e;
    }

    const bytes = new TextEncoder().encode(text);
    let bin = '';
    for(const b of bytes) bin += String.fromCharCode(b);

    const payload = {
      message,
      content: btoa(bin),
      branch: 'main'
    };
    if(sha) payload.sha = sha;

    await request('/contents/' + path, {
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
  }

  async function putBinaryFile(path, base64Content, message){
    let sha = null;
    try{
      const old = await request('/contents/' + path);
      sha = old.sha;
    }catch(e){
      if(e.status !== 404) throw e;
    }

    const payload = {
      message,
      content: base64Content,
      branch: 'main'
    };
    if(sha) payload.sha = sha;

    await request('/contents/' + path, {
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
  }

  async function saveVisualBrand(){
    const btn = $('zzSalvarMarcaGithub');
    const logoFile = $('zzLogoFile')?.files?.[0];
    const sloganFile = $('zzSloganFile')?.files?.[0];

    try{
      btn.disabled = true;
      msg('Enviando personalização visual...');

      if(logoFile){
        const dataUrl = await fileToDataURL(logoFile);
        const base64 = dataUrl.split(',')[1];
        await putBinaryFile('assets/zixlima-logo-topo-custom.png', base64, 'Atualizar logo do topo pelo Admin');
        current.logoPath = './assets/zixlima-logo-topo-custom.png';
      }

      if(sloganFile){
        const dataUrl = await fileToDataURL(sloganFile);
        const base64 = dataUrl.split(',')[1];
        await putBinaryFile('assets/zixlima-slogan-icone-custom.png', base64, 'Atualizar icone do slogan pelo Admin');
        current.sloganPath = './assets/zixlima-slogan-icone-custom.png';
      }

      const settings = collect();
      settings.logoPath = current.logoPath || '';
      settings.sloganPath = current.sloganPath || '';

      // Mesma fonte de textos da página principal; preserva contatos públicos atuais.
      const nome = $('zzTextoMarca').value.trim();
      const slogan = $('zzTextoSlogan').value.trim();
      if(!nome || nome.length>60 || !slogan || slogan.length>160){
        throw new Error('Preencha os dois textos (nome até 60, slogan até 160 caracteres).');
      }
      const existing = await request('/contents/site-settings.json');
      const bytes = Uint8Array.from(atob(existing.content.replace(/\s/g,'')), ch=>ch.charCodeAt(0));
      const siteSettings = JSON.parse(new TextDecoder().decode(bytes));
      siteSettings.nome = nome;
      siteSettings.slogan = slogan;
      await putTextFile('site-settings.json', JSON.stringify(siteSettings,null,2)+'\n', 'Atualizar textos da marca pelo Admin');
      // Mantém o editor de medidas/fotos no arquivo visual já existente.
      await putTextFile(
        'site-brand-settings.json',
        JSON.stringify(settings, null, 2) + '\n',
        'Atualizar editor visual da marca pelo Admin'
      );

      msg('Marca visual publicada no GitHub! Aguarde a atualização do Pages.', true);
    }catch(e){
      msg('Falha: ' + e.message, false);
    }finally{
      btn.disabled = false;
    }
  }

  function setupFilePreviews(){
    const logoInput = $('zzLogoFile');
    const sloganInput = $('zzSloganFile');

    logoInput?.addEventListener('change', async e => {
      const f = e.target.files?.[0];
      if(!f) return;
      const dataUrl = await fileToDataURL(f);
      showPreviewImage('zzLogoPreviewBox', dataUrl);
      $('zzMiniLogo').src = dataUrl;
      $('zzMiniLogo').style.display = 'block';
    });

    sloganInput?.addEventListener('change', async e => {
      const f = e.target.files?.[0];
      if(!f) return;
      const dataUrl = await fileToDataURL(f);
      showPreviewImage('zzSloganPreviewBox', dataUrl);
      $('zzMiniSloganImg').src = dataUrl;
      $('zzMiniSloganImg').style.display = 'block';
    });
  }

  function setupPreview(){
    ids.forEach(id => $(id)?.addEventListener('input', renderPreview));
    $('zzTextoMarca')?.addEventListener('input', renderPreview);
    $('zzTextoSlogan')?.addEventListener('input', renderPreview);
    $('zzAplicarMarcaPreview')?.addEventListener('click', renderPreview);
  }

  function restoreDefaults(){
    current = {...defaults, logoPath:'', sloganPath:''};
    $('zzLogoFile').value = '';
    $('zzSloganFile').value = '';
    $('zzLogoPreviewBox').textContent = 'Sem logo selecionado';
    $('zzSloganPreviewBox').textContent = 'Sem imagem do slogan';
    $('zzMiniLogo').style.display = 'none';
    $('zzMiniSloganImg').style.display = 'none';
    fill(current);
    $('zzTextoMarca').value='ZixLima';
    $('zzTextoSlogan').value='ZixLima Anúncie Aqui';
    renderPreview();
    msg('Medidas e textos padrão restaurados na prévia. Clique em salvar para publicar.', true);
  }

  function setupPasswordEye(){
    const btn = $('zzToggleSenhaLogin');
    const inp = $('senha');
    if(btn && inp){
      btn.addEventListener('click', ()=>{
        const visivel = inp.type === 'text';
        inp.type = visivel ? 'password' : 'text';
        btn.textContent = visivel ? '👁️' : '🙈';
      });
    }

    const chk = $('zixSenhaAdminMostrar');
    const n1 = $('zixSenhaAdminNova');
    const n2 = $('zixSenhaAdminConfirma');
    if(chk && n1 && n2){
      chk.addEventListener('change', ()=>{
        const t = chk.checked ? 'text' : 'password';
        n1.type = t;
        n2.type = t;
      });
    }
  }

  async function loadSaved(){
    try{
      const r = await fetch('./site-brand-settings.json?ts=' + Date.now(), {cache:'no-store'});
      if(!r.ok) throw new Error('sem arquivo');
      const data = await r.json();
      fill(data);
      if(data.logoPath){
        $('zzMiniLogo').src = data.logoPath + '?ts=' + Date.now();
        $('zzMiniLogo').style.display = 'block';
      }
      if(data.sloganPath){
        $('zzMiniSloganImg').src = data.sloganPath + '?ts=' + Date.now();
        $('zzMiniSloganImg').style.display = 'block';
      }
    }catch{
      fill(defaults);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if(!$('zzixbrConfig')) return;
    setupPasswordEye();
    setupFilePreviews();
    setupPreview();
    $('zzRestaurarMarca')?.addEventListener('click', restoreDefaults);
    fetch('./site-settings.json?ts='+Date.now(),{cache:'no-store'})
      .then(r=>r.ok?r.json():Promise.reject(new Error('Arquivo de textos ausente')))
      .then(c=>{
        if(typeof c.nome==='string') $('zzTextoMarca').value=c.nome;
        if(typeof c.slogan==='string') $('zzTextoSlogan').value=c.slogan;
        renderPreview();
      }).catch(()=>{});
    $('zzSalvarMarcaGithub')?.addEventListener('click', saveVisualBrand);
    loadSaved();
  });
})();

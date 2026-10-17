#!/bin/bash
echo "🚀 Aplicando ajustes para o modo desktop no topo esquerdo..."

cat << 'CSSEOF' > zixlima-topo-correcao.css
/* Ajustes gerais e para modo Desktop */
@media (min-width: 768px) {
  /* Container da marca no topo superior esquerdo */
  .header-brand, .top-logo-container, .brand-container, a[class*="logo"] {
    display: flex !important;
    align-items: center !important;
    gap: 15px !important;
  }

  /* Aumentar a Bandeira do Brasil no modo desktop */
  .top-logo-container img, .header-brand img, img[src*="bandeira"], img[src*="brasil"] {
    width: 65px !important;
    height: auto !important;
    max-height: 55px !important;
    object-fit: contain !important;
  }

  /* Aumentar o Nome ZixLima e aplicar relevo Verde e Amarelo no desktop */
  .top-logo-container .brand-title,
  .top-logo-container h1,
  .header-brand h1,
  .header-brand span,
  a[class*="logo"] span {
    font-size: 2.8rem !important;
    font-weight: 900 !important;
    letter-spacing: 1px !important;
    text-transform: uppercase !important;
    
    /* Gradiente Verde e Amarelo */
    background: linear-gradient(180deg, #FFE600 0%, #00D655 100%) !important;
    -webkit-background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    
    /* Efeito de Relevo 3D (Sombra) */
    filter: drop-shadow(2px 2px 0px #004D1A) 
            drop-shadow(3px 3px 3px rgba(0, 0, 0, 0.9)) 
            drop-shadow(0px 0px 10px rgba(255, 230, 0, 0.5)) !important;
  }
}
CSSEOF

python3 -c "
import os
if os.path.exists('index.html'):
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    if 'zixlima-topo-correcao.css' not in content:
        content = content.replace('</head>', '<link rel=\"stylesheet\" href=\"zixlima-topo-correcao.css\">\n</head>')
        with open('index.html', 'w', encoding='utf-8') as f:
            f.write(content)
        print('✅ index.html atualizado com sucesso.')
    else:
        print('ℹ️ CSS já vinculado no index.html.')
"

git add .
git commit -m "Ajuste de logotipo e bandeira no modo desktop com relevo verde e amarelo"
git push origin main
echo "🎉 Concluído com sucesso! Alterações enviadas para o GitHub."

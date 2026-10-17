#!/bin/bash
echo "🚀 Iniciando a aplicação automática no ZixLima..."

cat << 'CSSEOF' > zixlima-topo-correcao.css
.header-brand, .top-logo-container {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
}
.top-logo-container img.brasil-flag,
.header-brand .bandeira-br {
  width: 55px !important;
  height: auto !important;
  max-height: 45px !important;
  object-fit: contain !important;
}
.top-logo-container .brand-title,
.header-brand h1 {
  font-size: 2.2rem !important;
  font-weight: 900 !important;
  text-transform: uppercase !important;
  background: linear-gradient(180deg, #FFFFFF 0%, #00FF66 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8)) !important;
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
    print('✅ index.html atualizado.')
"

git add .
git commit -m "Ajuste de logotipo, bandeira e slogan no topo"
git push origin main
echo "🎉 Concluído com sucesso!"


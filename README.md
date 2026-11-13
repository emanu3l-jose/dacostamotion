# DacostaStudio · dacostamotion.com

Site do portfólio (PT/EN) e painel de conteúdo.

- `index.html`: o site inteiro (layout, animações, idiomas).
- `content/*.json`: o conteúdo (projetos, depoimentos, marcas, fotos e vídeo de abertura). É isso que o painel edita.
- `media/`: vídeos, fotos e logos. O que for enviado pelo painel vai para `media/uploads/`.
- `admin/`: o painel (Decap CMS), em `dacostamotion.com/admin`.

Não tem etapa de build: o Netlify publica a pasta como está.

## Configuração (uma vez só)

### 1. Ligar o Netlify a este repositório
1. No Netlify, abra o projeto e vá em **Project configuration → Build & deploy → Link repository**.
2. Escolha **GitHub** e o repositório `dacostamotion`.
3. Deixe o **Build command** vazio e coloque `.` em **Publish directory**. Depois clique em **Deploy**.

### 2. Login do painel com o GitHub
1. No GitHub, vá em **Settings → Developer settings → OAuth Apps → New OAuth App**.
   - Application name: `DacostaStudio painel`
   - Homepage URL: `https://dacostamotion.com`
   - Authorization callback URL: `https://api.netlify.com/auth/done`
2. Clique em **Register application**, copie o **Client ID** e gere um **Client secret**.
3. No Netlify, vá em **Project configuration → Access & security → OAuth → Install provider**, escolha **GitHub** e cole o Client ID e o Client secret.

### 3. Domínio
No Netlify, vá em **Domain management → Add a domain**, digite `dacostamotion.com` e copie os registros que ele mostrar para o DNS de onde o domínio foi comprado.

## Usar o painel
1. Abra `dacostamotion.com/admin` e clique em **Entrar com o GitHub**.
2. Escolha **Projetos**, **Depoimentos**, **Marcas**, **Fotos** ou **Vídeo de abertura**, edite e clique em **Publicar**.
3. Em 1 ou 2 minutos o site está atualizado.

Dicas:
- Vídeos em MP4 (H.264), de até uns 15 MB. Para o grid, uma prévia curta de 5 a 8 segundos sem som deixa o site mais rápido.
- Logos em PNG transparente ou SVG. Use o campo de altura para equilibrar o tamanho entre os logos.
- Fotos verticais (3:4).
- O site abre com `?painel=1` no fim do endereço para testar vídeos só no seu navegador, sem publicar.

## Publicação

O repositório é público para o Netlify (plano grátis) aceitar atualizações de mais de um autor. Nada secreto fica aqui: a chave do login do painel está guardada no Netlify.

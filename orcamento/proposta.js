/* Página da proposta: dacostamotion.com/o/<código> */
(() => {
const WHATS = "5588993654850", EMAIL = "dacostamotion@hotmail.com";
const app = document.getElementById("app");
const id = (location.pathname.match(/\/o\/([a-z0-9]{6})/) || [])[1];
const eu = new URLSearchParams(location.search).get("eu") === "1";
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MESES_L = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const dt = iso => { const d = new Date(iso); return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`; };
const dtL = iso => { const d = new Date(iso); return `${d.getDate()} de ${MESES_L[d.getMonth()]} de ${d.getFullYear()}`; };
const brl = cts => "R$ " + (cts / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pad = n => String(n).padStart(2, "0");
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;
const hora = () => new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
const diasAte = iso => Math.max(0, Math.ceil((Date.parse(iso) - Date.now()) / 864e5));
const whats = msg => `https://wa.me/${WHATS}?text=${encodeURIComponent(msg)}`;
const hdr = mid => `<div class="wrap hdr up"><div class="l"><a class="brand" href="/">DacostaStudio</a><span>Brasil&nbsp;&nbsp;<span class="dim">${hora()}</span></span></div><span class="dim mid">${esc(mid)}</span><span>PT</span></div>`;

function morto(tipo, data) {
  document.title = (tipo === "expirado" ? "Proposta expirada" : "Proposta não encontrada") + " · DacostaStudio";
  document.body.style.background = "#111";
  const [l1, l2, txt] = tipo === "expirado"
    ? ["Essa proposta", "já expirou", "Os links de proposta ficam no ar por um tempo limitado. Me chama que eu mando uma versão atualizada rapidinho."]
    : ["Proposta", "não encontrada", "Esse link não existe ou foi removido. Confere se o endereço está completo ou me chama que eu te mando de novo."];
  app.className = "dead";
  app.innerHTML = `
  <span class="arc" style="width:1088px;height:1088px;left:calc(50% - 1502px);top:-150px"></span><span class="arc" style="width:1088px;height:1088px;left:calc(50% + 414px);top:-150px"></span>
  <span class="arc" style="width:560px;height:560px;left:calc(50% - 280px);top:calc(50% - 300px)"></span><span class="arc" style="width:360px;height:360px;left:calc(50% - 180px);top:calc(50% - 200px)"></span>
  <span class="ln" style="top:180px"></span><span class="ln" style="bottom:160px"></span>
  <span class="mk" style="left:calc(50% - 483px);top:177px"></span><span class="mk" style="left:calc(50% + 477px);top:177px"></span>
  ${hdr("")}
  <div class="c">
    ${id ? `<span class="code"><span class="dot"></span>dacostamotion.com/o/${esc(id)}</span>` : ""}
    <h1 class="display">${l1}<br><span class="fade">${l2}</span></h1>
    <p class="t">${txt}</p>
    <div class="acts up"><a class="b1" href="${whats(`Oi Emanuel! Abri o link da proposta (dacostamotion.com/o/${id || ""}) e ${tipo === "expirado" ? "ele expirou" : "não encontrei"}. Pode me mandar de novo?`)}" target="_blank" rel="noopener">Falar no WhatsApp ↗</a><a class="b2" href="mailto:${EMAIL}">Mandar e-mail</a></div>
  </div>
  <div class="bar"><div class="wrap up"><span>© ${new Date().getFullYear()} DacostaStudio</span><span style="opacity:.6">${EMAIL}</span><a href="/trabalhos">Ver trabalhos ↗</a></div></div>`;
}

function etapas(p) {
  const aj = p.ajustes ? `${plural(p.ajustes, "rodada", "rodadas")} de ajuste ${p.ajustes === 1 ? "inclusa" : "inclusas"}.` : "Ajustes combinados com você.";
  return [
    ["Início", "Aprovação e materiais", "Você aprova o orçamento e me manda os materiais que faltarem."],
    ["Produção", "Criação", "Desenvolvo as cenas e animações seguindo o que combinamos."],
    ["Montagem", "Edição e ajustes", `Junto tudo e te mando pra revisar. ${aj}`],
    [p.prazo ? `Até ${plural(p.prazo, "dia útil", "dias úteis")}` : "Final", "Entrega", "Arquivos finais exportados e prontos pra usar."],
  ];
}

function render(p, trabalhos) {
  document.title = `Proposta para ${p.cliente} · DacostaStudio`;
  const expira = p.aprovadoEm ? null : p.expiraEm;
  const dias = expira ? diasAte(expira) : 0;
  const nums = [["Telas", p.telas], ["Animações", p.animacoes], ["Rodadas de ajuste", p.ajustes], ["Prazo", p.prazo, "dias úteis"]].filter(n => n[1] != null && n[1] !== "" && (n[0] !== "Prazo" || n[1] > 0));
  const entrada = p.entrada ?? 50;
  const parcelas = p.valor ? (entrada >= 100 || entrada <= 0
    ? [["Pagamento único", p.valor]]
    : [[`Na aprovação (${entrada}%)`, Math.round(p.valor * entrada / 100)], [`Na entrega final (${100 - entrada}%)`, p.valor - Math.round(p.valor * entrada / 100)]]) : [];
  const conds = [];
  if (p.ajustes != null) conds.push(["Alterações", `${plural(p.ajustes, "rodada", "rodadas")} de ajustes ${p.ajustes === 1 ? "inclusa" : "inclusas"}. Ajustes adicionais ou mudanças de escopo são orçados à parte.`]);
  if (p.prazo) conds.push(["Prazo de entrega", `Até ${plural(p.prazo, "dia útil", "dias úteis")} após a aprovação do orçamento e o recebimento de todos os materiais.`]);
  if (parcelas.length) conds.push(["Pagamento", parcelas.length === 1 ? `${brl(p.valor)} na aprovação.` : `${entrada}% (${brl(parcelas[0][1])}) na aprovação e ${100 - entrada}% (${brl(parcelas[1][1])}) na entrega final.`]);
  conds.push(["Validade", `${plural(p.validade || 7, "dia", "dias")}, até ${dtL(p.expiraEm)}.`]);
  if (p.observacoes) conds.push(["Observações", p.observacoes]);
  const [reais, cts] = p.valor ? (p.valor / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 }).split(",") : ["", ""];
  const msgAprova = `Oi Emanuel! Aprovei o orçamento "${p.titulo}" (dacostamotion.com/o/${p.id}).`;
  let n = 0; const sec = () => pad(++n);

  app.className = "";
  app.innerHTML = `
  <div class="ribbon"><div class="wrap up"><span class="label"><span class="dot"></span>Proposta privada · só quem tem o link consegue ver</span><span class="r">${p.aprovadoEm ? `Aprovada em ${dt(p.aprovadoEm)}` : `Válida até ${dt(expira)}${dias <= 3 ? ` · ${dias <= 1 ? "último dia" : `faltam ${dias} dias`}` : ""}`}</span></div></div>
  ${hdr(p.titulo ? `Orçamento · ${p.titulo}` : "Orçamento")}
  <main>
  <section class="wrap hero">
    <p class="label up" data-rv><span class="dia"></span>Proposta para ${esc(p.cliente)}</p>
    <h1 class="display casc"><span class="cz"><span style="--i:0">${esc(p.titulo)}</span></span>${p.subtitulo ? `<span class="cz fade"><span style="--i:1">${esc(p.subtitulo)}</span></span>` : ""}</h1>
    <div class="meta">
      <div data-rv style="--d:4"><span class="up dim">Cliente</span>${esc(p.cliente)}${p.contato ? ` · ${esc(p.contato)}` : ""}</div>
      <div data-rv style="--d:5"><span class="up dim">Enviada em</span>${dt(p.criadoEm)}</div>
      <div data-rv style="--d:6"><span class="up dim">Prazo de entrega</span>${p.prazo ? `Até ${plural(p.prazo, "dia útil", "dias úteis")}` : "A combinar"}</div>
      <div data-rv style="--d:7"><span class="up dim">Válida até</span>${dt(p.expiraEm)} (${plural(p.validade || 7, "dia", "dias")})</div>
    </div>
  </section>

  ${p.intro || p.escopo.length ? `<section class="wrap sec">
    <div class="sh" data-rv><p class="label up"><span class="sq"></span>Escopo</p><span class="up dim">${sec()}</span></div>
    <div class="two">
      <p class="intro" data-rv>${esc(p.intro)}</p>
      <ul class="did">${p.escopo.map((e, i) => `<li data-rv style="--d:${i}"><span>${pad(i + 1)}</span>${esc(e)}</li>`).join("")}</ul>
    </div>
  </section>` : ""}

  ${nums.length ? `<section class="wrap sec">
    <div class="sh" data-rv><p class="label up"><span class="sq"></span>Em números</p><span class="up dim">${sec()}</span></div>
    <div class="nums" style="--n:${nums.length}">${nums.map(([l, v, s], i) => `<div class="num" data-rv style="--d:${i}"><span class="up dim">${l}</span><span class="v"><b data-count="${v}" data-pad="1">${pad(v)}</b>${s ? `<small>${s}</small>` : ""}</span></div>`).join("")}</div>
  </section>` : ""}

  ${p.entregaveis.length ? `<section class="wrap sec">
    <div class="sh" data-rv><p class="label up"><span class="sq"></span>O que você recebe</p><span class="up dim">${sec()}</span></div>
    <div class="chips">${p.entregaveis.map((e, i) => `<span class="chip" data-rv style="--d:${i}">${esc(e)}</span>`).join("")}</div>
  </section>` : ""}

  ${p.mostrarEtapas ? `<section class="wrap sec">
    <div class="sh" data-rv><p class="label up"><span class="sq"></span>Como vai ser</p><span class="up dim">${sec()}</span></div>
    <div class="steps">${etapas(p).map(([q, t, d], i) => `<div class="step" data-rv style="--d:${i}"><span class="n"><span>${pad(i + 1)}</span><span>${q}</span></span><span class="t">${t}</span><span class="d">${d}</span></div>`).join("")}</div>
  </section>` : ""}

  ${p.valor ? `<section class="wrap sec">
    <div class="inv" data-rv="scale">
      <span class="arc" style="width:620px;height:620px;right:-200px;top:-220px"></span><span class="arc" style="width:380px;height:380px;right:-80px;top:-100px"></span>
      <div>
        <p class="label up"><span class="dia"></span>Investimento</p>
        <p class="price"><small>R$</small><b data-count="${Math.floor(p.valor / 100)}" style="font-weight:inherit">${reais}</b>${cts !== "00" ? `<span class="cts">,${cts}</span>` : ""}</p>
        ${p.notaValor ? `<p class="note">${esc(p.notaValor)}</p>` : ""}
        <div class="acts up" id="acts">${p.aprovadoEm
          ? `<span class="ok"><i></i>Aprovado em ${dt(p.aprovadoEm)}</span><a class="b2" href="${whats(`Oi Emanuel! Sobre o orçamento "${p.titulo}"...`)}" target="_blank" rel="noopener">Falar no WhatsApp ↗</a>`
          : `<button class="b1" id="aprovar" type="button"><span class="sq" style="background:var(--ink)"></span>Aprovar orçamento</button><a class="b2" href="${whats(`Oi Emanuel! Vi a proposta "${p.titulo}" e queria conversar.`)}" target="_blank" rel="noopener">Falar no WhatsApp ↗</a>`}</div>
      </div>
      <ul>${parcelas.map(([l, v]) => `<li><span>${l}</span><span>${brl(v)}</span></li>`).join("")}<li><span>Total</span><span>${brl(p.valor)}</span></li></ul>
    </div>
  </section>` : ""}

  <section class="wrap sec">
    <div class="sh" data-rv><p class="label up"><span class="sq"></span>Condições</p><span class="up dim">${sec()}</span></div>
    <ul class="conds">${conds.map(([l, t], i) => `<li data-rv style="--d:${i}"><span>${l}</span><p>${esc(t)}</p></li>`).join("")}</ul>
    <div class="who" data-rv><span class="pic"></span><div><div class="nm">Emanuel Costa</div><div class="rl">Motion designer · DacostaStudio</div></div></div>
  </section>

  ${trabalhos.length ? `<section class="wrap sec">
    <div class="sh" data-rv><p class="label up"><span class="sq"></span>Trabalhos parecidos</p><a class="up dim" href="/trabalhos">Ver todos ↗</a></div>
    <div class="works">${trabalhos.map((t, i) => `<a class="w" data-rv="scale" style="--d:${i}" href="/projeto-${t.id}"><div class="img" style="background-image:url('/${esc(t.capa)}')"></div><div class="cap up"><span>${esc(t.nome)}</span><span class="dim">${esc(t.tipo)}</span></div></a>`).join("")}</div>
  </section>` : ""}
  </main>
  <footer class="foot"><div class="wrap up"><span>© ${new Date().getFullYear()} DacostaStudio</span><a class="dim" href="mailto:${EMAIL}">${EMAIL}</a>${expira ? `<span class="exp"><span class="dot"></span>Link expira em ${dt(expira)}</span>` : ""}</div></footer>`;

  animar();
  const btn = document.getElementById("aprovar");
  if (btn) btn.addEventListener("click", async () => {
    if (!confirm(`Aprovar o orçamento de ${brl(p.valor)}?`)) return;
    const janela = window.open(whats(msgAprova), "_blank");
    try {
      const r = await fetch(`/api/o/${p.id}/aprovar`, { method: "POST" });
      const j = await r.json();
      if (j.ok) { p.aprovadoEm = j.aprovadoEm; render(p, trabalhos); }
    } catch (e) { if (!janela) location.href = whats(msgAprova); }
  });
}

// ---------- animações ----------
let jaAnimou = false;
function contar(el) {
  const fim = +el.dataset.count, comPad = el.dataset.pad, dur = 1600, t0 = performance.now();
  const fmt = n => comPad ? pad(n) : n.toLocaleString("pt-BR");
  const passo = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(2, -10 * k); el.textContent = fmt(Math.round(fim * (k >= 1 ? 1 : e))); if (k < 1) requestAnimationFrame(passo); };
  el.textContent = fmt(0); requestAnimationFrame(passo);
}
function animar() {
  const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const alvos = app.querySelectorAll("[data-rv], .casc");
  // depois de aprovar, a página é redesenhada: aí mostra tudo direto, sem animar de novo
  if (reduz || jaAnimou || !("IntersectionObserver" in window)) { alvos.forEach(el => el.classList.add("in")); return; }
  jaAnimou = true;
  app.classList.add("anim");
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in"); io.unobserve(e.target);
    e.target.querySelectorAll("[data-count]").forEach(contar);
  }), { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
  alvos.forEach(el => io.observe(el));
}

async function iniciar() {
  if (!id) return morto("nao");
  let r;
  try { r = await fetch(`/api/o/${id}${eu ? "?eu=1" : ""}`, { cache: "no-store" }); } catch (e) { return morto("nao"); }
  if (r.status === 410) return morto("expirado");
  if (!r.ok) return morto("nao");
  const p = await r.json();
  let trabalhos = [];
  if (p.trabalhos && p.trabalhos.length) {
    try {
      const lista = (await (await fetch("/content/projetos.json")).json()).projetos;
      trabalhos = p.trabalhos.map(n => lista[n - 1] && { id: n, nome: lista[n - 1].nome, capa: lista[n - 1].capa, tipo: (lista[n - 1].tipo && lista[n - 1].tipo.pt) || lista[n - 1].tipo || "" }).filter(Boolean);
    } catch (e) {}
  }
  render(p, trabalhos);
}
iniciar();
})();

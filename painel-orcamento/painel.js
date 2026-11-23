/* Painel privado de orçamentos: dacostamotion.com/painel-orcamento */
(() => {
const $ = s => document.querySelector(s);
const SITE = "dacostamotion.com";
const ENTREGAVEIS = ["Vídeo final em MP4", "Versão 16:9", "Versão 9:16", "Versão 1:1", "Logo animado", "MOV com fundo transparente", "Lottie", "GIF", "Legendas", "Projeto do After Effects"];
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const dt = iso => { const d = new Date(iso); return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`; };
const brl = cts => "R$ " + (cts / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const diasAte = iso => Math.ceil((Date.parse(iso) - Date.now()) / 864e5);
let senha = "";
try { senha = sessionStorage.getItem("orc-senha") || ""; } catch (e) {}
let editando = null, projetos = [], entregaveis = [], extras = [], trabalhos = [];

function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("on"), 2200); }

async function api(path, opt = {}) {
  const r = await fetch("/api/" + path, { ...opt, headers: { "content-type": "application/json", "x-senha": senha, ...(opt.headers || {}) } });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401) { sair(); throw new Error("senha"); }
  if (!r.ok) throw Object.assign(new Error(j.erro || "erro"), { status: r.status });
  return j;
}

// ---------- login ----------
async function entrar() {
  senha = $("#senha").value || senha;
  const err = $("#loginErro"); err.hidden = true;
  try {
    const r = await fetch("/api/orcamentos", { headers: { "x-senha": senha } });
    if (r.status === 503) { err.textContent = "A senha do painel ainda não foi configurada no Netlify (ORCAMENTO_SENHA)."; err.hidden = false; return; }
    if (!r.ok) { err.textContent = "Senha errada."; err.hidden = false; senha = ""; return; }
    try { sessionStorage.setItem("orc-senha", senha); } catch (e) {}
    $("#login").hidden = true; $("#painel").hidden = false;
    desenharLista(await r.json());
  } catch (e) { err.textContent = "Não consegui conectar. Tenta de novo."; err.hidden = false; }
}
function sair() { senha = ""; try { sessionStorage.removeItem("orc-senha"); } catch (e) {} $("#painel").hidden = true; $("#login").hidden = false; $("#senha").value = ""; }
$("#entrar").addEventListener("click", entrar);
$("#senha").addEventListener("keydown", e => { if (e.key === "Enter") entrar(); });
$("#sair").addEventListener("click", sair);

// ---------- formulário ----------
const F = $("#form");
const seg = nome => { const b = F.querySelector(`[data-seg="${nome}"] .on`); return b ? b.dataset.v : ""; };
const setSeg = (nome, v) => F.querySelectorAll(`[data-seg="${nome}"] button`).forEach(b => b.classList.toggle("on", b.dataset.v === String(v ?? "")));
F.querySelectorAll("[data-seg] button").forEach(b => b.addEventListener("click", () => { setSeg(b.parentElement.dataset.seg, b.dataset.v); preview(); }));

function chipsEntregaveis() {
  const todos = [...ENTREGAVEIS, ...extras.filter(e => !ENTREGAVEIS.includes(e))];
  $("#entregaveis").innerHTML = todos.map(e => `<button type="button" class="chip${entregaveis.includes(e) ? " on" : ""}" data-e="${esc(e)}">${esc(e)}</button>`).join("") + `<button type="button" class="chip add" id="maisEnt">+ Outro</button>`;
  $("#entregaveis").querySelectorAll("[data-e]").forEach(b => b.addEventListener("click", () => {
    const e = b.dataset.e; entregaveis = entregaveis.includes(e) ? entregaveis.filter(x => x !== e) : [...entregaveis, e]; chipsEntregaveis();
  }));
  $("#maisEnt").addEventListener("click", () => { $("#addEnt").classList.add("on"); $("#addEnt input").focus(); });
}
function addExtra() { const i = $("#addEnt input"), v = i.value.trim(); if (!v) return; extras.push(v); entregaveis.push(v); i.value = ""; $("#addEnt").classList.remove("on"); chipsEntregaveis(); }
$("#addEnt button").addEventListener("click", addExtra);
$("#addEnt input").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); addExtra(); } });

function chipsTrabalhos() {
  $("#trabalhos").innerHTML = projetos.map((p, i) => `<button type="button" class="chip${trabalhos.includes(i + 1) ? " on" : ""}" data-t="${i + 1}">${esc(p.nome)}</button>`).join("");
  $("#trabalhos").querySelectorAll("[data-t]").forEach(b => b.addEventListener("click", () => {
    const n = +b.dataset.t;
    if (trabalhos.includes(n)) trabalhos = trabalhos.filter(x => x !== n);
    else if (trabalhos.length < 3) trabalhos.push(n); else toast("No máximo 3 trabalhos");
    chipsTrabalhos();
  }));
}

const valorCts = s => { const t = String(s || "").replace(/[^\d,.]/g, ""); if (!t) return null; const n = Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t.replace(/\.(?=\d{3}(\D|$))/g, "")); return Number.isFinite(n) ? Math.round(n * 100) : null; };
const intOuNull = v => (v === "" || v == null ? null : Math.max(0, parseInt(v, 10) || 0));

function dados() {
  const v = n => F.elements[n].value.trim();
  return {
    cliente: v("cliente"), contato: v("contato"), titulo: v("titulo"), subtitulo: v("subtitulo"), intro: v("intro"),
    escopo: v("escopo").split("\n").map(s => s.replace(/^\s*([-*•]|\d+[.)])\s+/, "").trim()).filter(Boolean),
    telas: intOuNull(v("telas")), animacoes: intOuNull(v("animacoes")), prazo: intOuNull(v("prazo")),
    ajustes: seg("ajustes") === "" ? null : +seg("ajustes"),
    entregaveis, valor: valorCts(v("valor")), entrada: +seg("entrada"), notaValor: v("notaValor"), observacoes: v("observacoes"),
    trabalhos, validade: +seg("validade"), mostrarEtapas: F.elements.mostrarEtapas.checked,
  };
}

function preencher(p) {
  ["cliente", "contato", "titulo", "subtitulo", "intro", "notaValor", "observacoes"].forEach(n => F.elements[n].value = p[n] || "");
  F.elements.escopo.value = (p.escopo || []).join("\n");
  ["telas", "animacoes", "prazo"].forEach(n => F.elements[n].value = p[n] ?? "");
  F.elements.valor.value = p.valor ? (p.valor / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "";
  setSeg("ajustes", p.ajustes ?? (p.id ? "" : 2)); setSeg("entrada", p.entrada ?? 50);
  const val = p.validade || 7; if (![7, 15, 30].includes(val)) { const b = F.querySelector('[data-seg="validade"]'); if (!b.querySelector(`[data-v="${val}"]`)) b.insertAdjacentHTML("beforeend", `<button type="button" data-v="${val}">${val} dias</button>`); }
  setSeg("validade", val);
  F.elements.mostrarEtapas.checked = p.mostrarEtapas !== false;
  entregaveis = [...(p.entregaveis || [])]; extras = entregaveis.filter(e => !ENTREGAVEIS.includes(e));
  trabalhos = [...(p.trabalhos || [])];
  chipsEntregaveis(); chipsTrabalhos(); preview();
}

function modo(p) {
  editando = p && p.id ? p.id : null;
  $("#modo").textContent = editando ? `Editando · /o/${editando}` : "Nova proposta";
  $("#salvarTxt").textContent = editando ? "Salvar alterações" : "Gerar link da proposta";
  $("#numero").textContent = editando ? `/o/${editando}` : "";
  const vc = $("#verCliente"); vc.hidden = !editando; if (editando) vc.href = `/o/${editando}?eu=1`;
}

function preview() {
  const d = dados();
  $("#mCli").textContent = `◆ Proposta para ${d.cliente || "…"}`;
  $("#mTit").innerHTML = `${esc(d.titulo || "Título")}${d.subtitulo ? `<br><span>${esc(d.subtitulo)}</span>` : ""}`;
  $("#mNum").textContent = [d.telas != null && `${d.telas} telas`, d.animacoes != null && `${d.animacoes} animações`].filter(Boolean).join(" · ");
  $("#mPrazo").textContent = d.prazo ? `${d.prazo} dias úteis` : "";
  $("#mVal").textContent = d.valor ? brl(d.valor) : "";
}
F.addEventListener("input", preview);

function mostrarLink(p) {
  const url = `https://${SITE}/o/${p.id}`;
  $("#gen").hidden = false;
  $("#genUrl").innerHTML = `${SITE}/o/<b>${p.id}</b>`;
  const d = diasAte(p.expiraEm);
  $("#genExp").textContent = p.aprovadoEm ? "Aprovada" : d > 0 ? `Expira em ${d} ${d === 1 ? "dia" : "dias"}` : "Expirado";
  $("#genData").textContent = dt(p.expiraEm);
  $("#mandar").href = `https://wa.me/?text=${encodeURIComponent(`Oi${p.contato ? ", " + p.contato.split(" ")[0] : ""}! Segue a proposta: ${url}`)}`;
  $("#copiar").onclick = async () => { try { await navigator.clipboard.writeText(url); toast("Link copiado"); } catch (e) { prompt("Copia o link:", url); } };
}

$("#salvar").addEventListener("click", async () => {
  const d = dados(), err = $("#formErro"); err.hidden = true;
  if (!d.cliente || !d.titulo) { err.textContent = "Preenche pelo menos cliente e título."; err.hidden = false; return; }
  const b = $("#salvar"); b.disabled = true;
  try {
    const p = editando ? await api(`orcamentos/${editando}`, { method: "PUT", body: JSON.stringify(d) }) : await api("orcamentos", { method: "POST", body: JSON.stringify(d) });
    modo(p); mostrarLink(p); toast(editando ? "Proposta salva" : "Link gerado"); carregarLista();
  } catch (e) { if (e.message !== "senha") { err.textContent = "Não consegui salvar. Tenta de novo."; err.hidden = false; } }
  b.disabled = false;
});

$("#nova").addEventListener("click", () => { modo(null); preencher({}); $("#gen").hidden = true; window.scrollTo({ top: 0, behavior: "smooth" }); });

// ---------- lista ----------
function status(p) {
  if (p.aprovadoEm) return `<span class="st a">Aprovada</span>`;
  if (diasAte(p.expiraEm) <= 0) return `<span class="st e">Expirada</span>`;
  if (p.views) return `<span class="st v">Vista ${p.views}x</span>`;
  return `<span class="st n">Não aberta</span>`;
}
function sub(p) {
  const d = diasAte(p.expiraEm);
  const s = p.aprovadoEm ? `aprovada em ${dt(p.aprovadoEm)}` : d <= 0 ? `expirou em ${dt(p.expiraEm)}` : `expira em ${d} ${d === 1 ? "dia" : "dias"}`;
  return `/o/${p.id} · ${p.valor ? brl(p.valor) + " · " : ""}${s}`;
}
function desenharLista(ps) {
  $("#total").textContent = ps.length ? ps.length : "";
  $("#lista").innerHTML = ps.length ? ps.map(p => `<div class="row" data-id="${p.id}">
    <div class="l1"><span class="nm">${esc(p.cliente)} · ${esc(p.titulo)}</span>${status(p)}</div>
    <span class="sub">${sub(p)}</span>
    <div class="ac"><button type="button" data-a="editar">Editar</button><a href="/o/${p.id}?eu=1" target="_blank" rel="noopener">Abrir ↗</a><button type="button" data-a="duplicar">Duplicar</button>${p.aprovadoEm ? "" : `<button type="button" data-a="renovar">+7 dias</button>`}<button type="button" data-a="apagar">Apagar</button></div>
  </div>`).join("") : `<div class="vazio">Nenhuma proposta ainda.</div>`;
}
async function carregarLista() { try { desenharLista(await api("orcamentos")); } catch (e) {} }
$("#lista").addEventListener("click", async e => {
  const b = e.target.closest("[data-a]"); if (!b) return;
  const id = b.closest("[data-id]").dataset.id, a = b.dataset.a;
  try {
    if (a === "editar" || a === "duplicar") {
      const p = await api(`orcamentos/${id}`);
      if (a === "editar") { modo(p); preencher(p); mostrarLink(p); }
      else { modo(null); preencher({ ...p, id: undefined }); $("#gen").hidden = true; toast("Cópia pronta. Ajusta e gera um link novo."); }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (a === "renovar") { const p = await api(`orcamentos/${id}`, { method: "PUT", body: JSON.stringify({ renovar: 7 }) }); toast(`Vale até ${dt(p.expiraEm)}`); if (editando === id) mostrarLink(p); carregarLista(); }
    else if (a === "apagar") { if (!confirm("Apagar essa proposta? O link para de funcionar.")) return; await api(`orcamentos/${id}`, { method: "DELETE" }); if (editando === id) { modo(null); $("#gen").hidden = true; } toast("Apagada"); carregarLista(); }
  } catch (err) { if (err.message !== "senha") toast("Não deu certo. Tenta de novo."); }
});

// ---------- início ----------
fetch("/content/projetos.json").then(r => r.json()).then(j => { projetos = j.projetos || []; chipsTrabalhos(); }).catch(() => {});
modo(null); preencher({});
if (senha) entrar();
})();

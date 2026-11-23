// Regras dos orçamentos. Fica separado da função pra dar pra testar sem o Netlify.
import { randomInt, createHash, timingSafeEqual } from "node:crypto";

const LETRAS = "abcdefghjkmnpqrstuvwxyz23456789"; // sem 0/o, 1/l/i pra não confundir
const DIA = 24 * 60 * 60 * 1000;

const json = (dados, status = 200) =>
  new Response(JSON.stringify(dados), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

function novoId() { let s = ""; for (let i = 0; i < 6; i++) s += LETRAS[randomInt(LETRAS.length)]; return s; }

export const sha256 = v => createHash("sha256").update(String(v)).digest("hex");

// compara o hash da senha digitada com o hash guardado (a senha em si nunca fica no código)
function senhaOk(req, senhaHash) {
  if (!senhaHash || !/^[0-9a-f]{64}$/.test(senhaHash)) return false;
  return timingSafeEqual(Buffer.from(sha256(req.headers.get("x-senha") || ""), "hex"), Buffer.from(senhaHash, "hex"));
}

const txt = (v, max = 400) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const num = (v, min = 0, max = 9999) => { const n = Number(v); return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : null; };
const lista = (v, max = 30, tam = 300) => (Array.isArray(v) ? v.map(x => txt(x, tam)).filter(Boolean).slice(0, max) : []);

// só os campos que o painel manda; o resto é ignorado
function limpar(b = {}) {
  return {
    cliente: txt(b.cliente, 120),
    contato: txt(b.contato, 120),
    titulo: txt(b.titulo, 160),
    subtitulo: txt(b.subtitulo, 160),
    intro: txt(b.intro, 1500),
    escopo: lista(b.escopo),
    telas: num(b.telas), animacoes: num(b.animacoes), ajustes: num(b.ajustes, 0, 99), prazo: num(b.prazo, 0, 365),
    entregaveis: lista(b.entregaveis, 30, 80),
    mostrarEtapas: b.mostrarEtapas !== false,
    valor: num(b.valor, 0, 100000000), // em centavos
    entrada: num(b.entrada, 0, 100) ?? 50,
    notaValor: txt(b.notaValor, 300),
    observacoes: txt(b.observacoes, 1500),
    trabalhos: (Array.isArray(b.trabalhos) ? b.trabalhos : []).map(n => num(n, 1, 99)).filter(Boolean).slice(0, 3),
    validade: num(b.validade, 1, 90) ?? 7,
  };
}

const resumo = p => ({ id: p.id, cliente: p.cliente, titulo: p.titulo, valor: p.valor, criadoEm: p.criadoEm, expiraEm: p.expiraEm, views: p.views || 0, ultimaVista: p.ultimaVista || null, aprovadoEm: p.aprovadoEm || null });
const expirou = (p, agora) => Date.parse(p.expiraEm) <= agora;

// store: { get(key) -> objeto|null, set(key, obj), del(key), keys(prefix) -> [key] }
export async function tratar(req, params, store, senhaHash, agora = Date.now()) {
  const url = new URL(req.url);
  const partes = url.pathname.replace(/^\/api\//, "").split("/").filter(Boolean); // ["orcamentos", id?] ou ["o", id, acao?]
  const [rota, id, acao] = partes;
  const chave = i => "p/" + i;
  const valido = i => typeof i === "string" && /^[a-z0-9]{6}$/.test(i);

  // ---------- público: o cliente abre o link ----------
  if (rota === "o") {
    if (!valido(id)) return json({ erro: "nao_encontrada" }, 404);
    const p = await store.get(chave(id));
    if (!p) return json({ erro: "nao_encontrada" }, 404);
    if (expirou(p, agora) && !p.aprovadoEm) return json({ expirado: true, id, expiraEm: p.expiraEm }, 410);
    if (req.method === "POST" && acao === "aprovar") {
      if (!p.aprovadoEm) { p.aprovadoEm = new Date(agora).toISOString(); await store.set(chave(id), p); }
      return json({ ok: true, aprovadoEm: p.aprovadoEm });
    }
    if (req.method !== "GET" || acao) return json({ erro: "metodo" }, 405);
    if (url.searchParams.get("eu") !== "1") { p.views = (p.views || 0) + 1; p.ultimaVista = new Date(agora).toISOString(); await store.set(chave(id), p); }
    const { views, ultimaVista, ...publico } = p;
    return json(publico);
  }

  // ---------- painel: precisa da senha ----------
  if (rota !== "orcamentos") return json({ erro: "nao_encontrada" }, 404);
  if (!senhaHash) return json({ erro: "senha_nao_configurada" }, 503);
  if (!senhaOk(req, senhaHash)) return json({ erro: "senha" }, 401);

  if (!id) {
    if (req.method === "GET") {
      const ps = (await Promise.all((await store.keys("p/")).map(k => store.get(k)))).filter(Boolean);
      return json(ps.map(resumo).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)));
    }
    if (req.method === "POST") {
      const dados = limpar(await req.json().catch(() => ({})));
      if (!dados.cliente || !dados.titulo) return json({ erro: "faltam_campos" }, 400);
      let nid; do nid = novoId(); while (await store.get(chave(nid)));
      const p = { id: nid, ...dados, criadoEm: new Date(agora).toISOString(), expiraEm: new Date(agora + dados.validade * DIA).toISOString(), views: 0 };
      await store.set(chave(nid), p);
      return json(p, 201);
    }
    return json({ erro: "metodo" }, 405);
  }

  if (!valido(id)) return json({ erro: "nao_encontrada" }, 404);
  const p = await store.get(chave(id));
  if (!p) return json({ erro: "nao_encontrada" }, 404);
  if (req.method === "GET") return json(p);
  if (req.method === "DELETE") { await store.del(chave(id)); return json({ ok: true }); }
  if (req.method === "PUT") {
    const b = await req.json().catch(() => ({}));
    let novo;
    if (b.renovar) novo = { ...p, expiraEm: new Date(agora + (num(b.renovar, 1, 90) || 7) * DIA).toISOString() };
    else {
      const dados = limpar(b);
      if (!dados.cliente || !dados.titulo) return json({ erro: "faltam_campos" }, 400);
      // mudar a validade conta a partir de quando a proposta foi criada
      novo = { ...p, ...dados, expiraEm: new Date(Date.parse(p.criadoEm) + dados.validade * DIA).toISOString() };
    }
    await store.set(chave(id), novo);
    return json(novo);
  }
  return json({ erro: "metodo" }, 405);
}

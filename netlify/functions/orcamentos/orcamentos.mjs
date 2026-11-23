// API dos orçamentos (Netlify Function). As propostas ficam guardadas no Netlify Blobs.
// Senha do painel: aqui fica só o hash SHA-256 dela, nunca a senha.
// Pra trocar sem mexer no código, crie a variável ORCAMENTO_SENHA no Netlify (ela tem prioridade).
import { getStore } from "@netlify/blobs";
import { tratar, sha256 } from "./logica.mjs";

const SENHA_HASH = "a08f1d5f3bcc1ee5503feb2aa0645158e7b9f765ae392e4a74aa771cfe803331";

export default async (req) => {
  const blobs = getStore({ name: "orcamentos", consistency: "strong" });
  const store = {
    get: k => blobs.get(k, { type: "json" }),
    set: (k, v) => blobs.setJSON(k, v),
    del: k => blobs.delete(k),
    keys: async prefix => (await blobs.list({ prefix })).blobs.map(b => b.key),
  };
  const senha = Netlify.env.get("ORCAMENTO_SENHA");
  return tratar(req, {}, store, senha ? sha256(senha) : SENHA_HASH);
};

export const config = { path: ["/api/orcamentos", "/api/orcamentos/*", "/api/o/*"] };

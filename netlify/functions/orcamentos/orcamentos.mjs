// API dos orçamentos (Netlify Function). As propostas ficam guardadas no Netlify Blobs.
// A senha do painel vem da variável de ambiente ORCAMENTO_SENHA (configurada no Netlify).
import { getStore } from "@netlify/blobs";
import { tratar } from "./logica.mjs";

export default async (req) => {
  const blobs = getStore({ name: "orcamentos", consistency: "strong" });
  const store = {
    get: k => blobs.get(k, { type: "json" }),
    set: (k, v) => blobs.setJSON(k, v),
    del: k => blobs.delete(k),
    keys: async prefix => (await blobs.list({ prefix })).blobs.map(b => b.key),
  };
  return tratar(req, {}, store, Netlify.env.get("ORCAMENTO_SENHA"));
};

export const config = { path: ["/api/orcamentos", "/api/orcamentos/*", "/api/o/*"] };

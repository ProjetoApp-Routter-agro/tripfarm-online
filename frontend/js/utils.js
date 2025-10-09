// public/js/utils.js
export function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function nowISO() {
  return new Date().toISOString();
}

export function setSubmitting(btn, isSubmitting) {
  if (!btn) return;
  if (isSubmitting) {
    btn.dataset._label = btn.textContent;
    btn.textContent = "Enviando...";
    btn.disabled = true;
  } else {
    btn.textContent = btn.dataset._label || "Enviar";
    btn.disabled = false;
  }
}

export function validateRequired(fields) {
  // fields = [[valor, 'Nome do campo'], ...]
  const missing = fields.filter(
    ([v]) => v === null || v === undefined || String(v).trim() === ""
  );
  if (missing.length) {
    const nomes = missing.map(([, n]) => n).join(", ");
    return `Preencha: ${nomes}`;
  }
  return null;
}

/**
 * safeInsert: insere no supabase e retorna data ou lança erro
 * @param {string} table
 * @param {object} payload
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 */
export async function safeInsert(table, payload, supabase) {
  // payload deve ser um objeto (ou array de objetos)
  const rows = Array.isArray(payload) ? payload : [payload];
  const { data, error } = await supabase.from(table).insert(rows).select();
  if (error) throw error;
  return data;
}

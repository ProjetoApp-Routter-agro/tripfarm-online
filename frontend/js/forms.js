// public/js/forms.js
async function handleSubmit(e, tipo) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector("button[type=submit]");
  btn.disabled = true;

  try {
    // Coleta todos os campos do formulário
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Trata arquivo de áudio (se existir)
    if (formData.get("audio")) {
      const file = formData.get("audio");
      data.audio_responses = await fileToBase64(file);
    }

    // Monta o payload
    const payload = {
      tipo,
      ...data,
      created_at: new Date().toISOString(),
    };

    const res = await fetch("/api/salvar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Erro ao salvar no Supabase");
    alert("Resposta enviada com sucesso!");
    form.reset();
  } catch (err) {
    console.error(err);
    alert("Erro: " + err.message);
  } finally {
    btn.disabled = false;
  }
}

// Utilitário: converte arquivo para base64
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Bind nos formulários
function bindForms() {
  const f1 = document.getElementById("formVisitante");
  const f2 = document.getElementById("formTrad");
  const f3 = document.getElementById("formDigital");

  if (f1) f1.addEventListener("submit", (e) => handleSubmit(e, "visitantes"));
  if (f2)
    f2.addEventListener("submit", (e) =>
      handleSubmit(e, "produtores_tradicionais")
    );
  if (f3)
    f3.addEventListener("submit", (e) =>
      handleSubmit(e, "produtores_digitais")
    );
}

document.addEventListener("DOMContentLoaded", bindForms);

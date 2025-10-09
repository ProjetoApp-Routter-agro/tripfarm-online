// public/js/audioRecorder.js
// LIGA os botões .record-btn / .stop-btn / .play-btn dentro de cada .audio-section
// e grava por pergunta, guardando o base64 em window._audioResponses[formId][question]

(function () {
  // mapa: { formId: { '1': 'data:audio/..;base64,AAAA', '2': ... } }
  window._audioResponses = window._audioResponses || {};

  function findButtons(section) {
    return {
      record: section.querySelector(".record-btn"),
      stop: section.querySelector(".stop-btn"),
      play: section.querySelector(".play-btn"),
      status: section.querySelector(".audio-status"),
      audioEl: section.querySelector(".audio-playback"),
    };
  }

  async function toBase64(blob) {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result);
      reader.onerror = rej;
      reader.readAsDataURL(blob);
    });
  }

  document.querySelectorAll(".audio-section").forEach((section) => {
    const q = section.querySelector(".record-btn")?.dataset?.question;
    const { record, stop, play, status, audioEl } = findButtons(section);
    if (!record) return;

    let mediaStream = null;
    let recorder = null;
    let chunks = [];

    // Descobre o id do form pai (para agrupar audios por formulário)
    const formEl = section.closest("form");
    const formId = formEl?.id || "unknown_form";

    // garante objeto para esse form
    window._audioResponses[formId] = window._audioResponses[formId] || {};

    record?.addEventListener("click", async () => {
      try {
        // pede permissão e inicia gravação
        mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        recorder = new MediaRecorder(mediaStream);
        chunks = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size) chunks.push(e.data);
        };
        recorder.start();
        record.disabled = true;
        stop.disabled = false;
        play.disabled = true;
        if (status) status.textContent = "Gravando...";
      } catch (err) {
        console.error("Erro ao acessar microfone", err);
        alert(
          "Não foi possível acessar o microfone. Verifique permissões do navegador."
        );
      }
    });

    stop?.addEventListener("click", async () => {
      if (!recorder) return;
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        // limite opcional (ex: 4 MB)
        const maxBytes = 4 * 1024 * 1024;
        if (blob.size > maxBytes) {
          alert(
            "Áudio muito grande. Grave uma resposta mais curta (menos de 4MB)."
          );
          // limpa e libera stream
          chunks = [];
          mediaStream.getTracks().forEach((t) => t.stop());
          record.disabled = false;
          stop.disabled = true;
          if (status) status.textContent = "Pronto para gravar";
          return;
        }
        const base64 = await toBase64(blob);
        // guarda no mapa por formId e número da pergunta
        window._audioResponses[formId][String(q)] = base64;
        // atualiza player
        if (audioEl) {
          audioEl.src = base64;
          audioEl.style.display = "";
        }
        if (play) play.disabled = false;
        if (status) status.textContent = "Gravação salva";
        // libera hardware
        mediaStream.getTracks().forEach((t) => t.stop());
        record.disabled = false;
        stop.disabled = true;
      };
      recorder.stop();
    });

    play?.addEventListener("click", () => {
      if (audioEl && audioEl.src) {
        audioEl.play();
      } else {
        alert("Nenhuma gravação disponível para tocar.");
      }
    });

    // estado inicial
    if (stop) stop.disabled = true;
    if (play) play.disabled = true;
  });
})();

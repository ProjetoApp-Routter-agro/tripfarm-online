// Função para criar e exibir o modal
function showModal(id, messageHTML, closable = true) {
    const existingModal = document.getElementById(id);
    if (existingModal) {
        existingModal.remove();
    }

    const modalOverlay = document.createElement('div');
    modalOverlay.id = id;
    modalOverlay.className = 'modal-overlay';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.innerHTML = messageHTML;

    if (closable) {
        const closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        closeButton.innerHTML = '&times;'; // Símbolo de multiplicação (X)
        closeButton.onclick = () => hideModal(id);
        modalContent.prepend(closeButton);
    }

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // Força o reflow para garantir que a transição de opacidade funcione
    void modalOverlay.offsetWidth;

    // Adiciona a classe 'show' para iniciar a animação de fade-in
    modalOverlay.classList.add('show');
}

// Função para esconder o modal
function hideModal(id) {
    const modalOverlay = document.getElementById(id);
    if (modalOverlay) {
        // Inicia a animação de fade-out
        modalOverlay.classList.remove('show');

        // Remove o modal do DOM após a transição
        modalOverlay.addEventListener('transitionend', function handler() {
            if (!modalOverlay.classList.contains('show')) {
                modalOverlay.removeEventListener('transitionend', handler);
                modalOverlay.remove();
            }
        });
    }
}

// Conteúdo da primeira janela (Boas-vindas)
const welcomeMessage = `
    <h2>Você está concorrendo a uma experiência rural exclusiva!</h2>
    <p>Uma oportunidade única de viver um dia dentro da <strong>Fazenda do Engenho</strong>.</p>
    <p><strong>Atenção:</strong> para validar sua participação, é necessário responder todas as perguntas na seção Visitante.</p>
    <p>Assim que você concluir o formulário, nossa equipe entrará em contato com você em até 48 horas.</p>
`;

// Conteúdo da segunda janela (Confirmação)
const confirmationMessage = `
    <h2>Seu formulário foi enviado com sucesso!</h2>
    <p>Enquanto aguarda nosso contato, conheça mais sobre a Fazenda do Engenho em nosso Instagram:</p>
    <p>
        <a href="https://www.instagram.com/fazenda_hotel_engenho/" target="_blank">
            👉 Instagram da Fazenda do Engenho
        </a>
    </p>
`;

// Lógica para exibir o modal de boas-vindas ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se o formulário já foi enviado (pode ser um cookie ou localStorage, mas para simplicidade, vamos apenas mostrar)
    // Se o formulário não foi enviado, mostra o modal de boas-vindas
    showModal('welcome-modal', welcomeMessage, true);
});

// *******************************************************************
// INJEÇÃO DE LÓGICA DE EXIBIÇÃO DO MODAL DE CONFIRMAÇÃO
// *******************************************************************

// O código original do formulário está em index.html.
// Vamos tentar interceptar o evento de envio do formulário.

// Encontra o formulário principal
const form = document.querySelector('form');

if (form) {
    // Adiciona um listener para o evento de envio do formulário
    form.addEventListener('submit', (event) => {
        // A lógica de envio do formulário original deve ser mantida.
        // Se o formulário for enviado com sucesso (o que não podemos simular aqui),
        // o modal de confirmação deve ser exibido.

        // Como não podemos saber o resultado do envio do formulário no backend,
        // vamos adicionar um pequeno atraso para simular o processamento
        // e depois exibir o modal de confirmação.

        // **NOTA IMPORTANTE:** O desenvolvedor precisará garantir que esta função
        // `showModal('confirmation-modal', confirmationMessage, false);`
        // seja chamada *após* o sucesso do envio do formulário no código de submissão
        // do formulário existente.

        // Por enquanto, vamos apenas esconder o modal de boas-vindas se estiver aberto
        hideModal('welcome-modal');

        // Exemplo de como chamar o modal de confirmação após o sucesso do envio:
        // setTimeout(() => {
        //     showModal('confirmation-modal', confirmationMessage, false);
        // }, 1000); // Simula 1 segundo de processamento
    });
}

// Exporta as funções para que possam ser usadas no escopo global do index.html
window.showModal = showModal;
window.hideModal = hideModal;
window.confirmationMessage = confirmationMessage;
window.welcomeMessage = welcomeMessage;

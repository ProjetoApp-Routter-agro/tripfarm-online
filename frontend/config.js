// Configuração da API
const API_CONFIG = {
    // URL do backend - altere conforme necessário
    BASE_URL: 'http://localhost:3001', // Para desenvolvimento local
    // BASE_URL: 'https://seu-backend.herokuapp.com', // Para produção
    
    ENDPOINTS: {
        HEALTH: '/api/health',
        SALVAR: '/api/salvar'
    }
};

// Exportar configuração
window.API_CONFIG = API_CONFIG;


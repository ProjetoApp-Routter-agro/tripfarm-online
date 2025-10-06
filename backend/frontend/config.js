// Configuração da API - Detecta automaticamente o ambiente
const API_CONFIG = {
    // Em produção, usa a mesma origem (backend serve o frontend)
    // Em desenvolvimento local, usa localhost:3001
    BASE_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3001' 
        : window.location.origin,
    
    ENDPOINTS: {
        HEALTH: '/api/health',
        INFO: '/api/info',
        SALVAR: '/api/salvar'
    }
};

// Log para debug (remover em produção se necessário)
console.log('🔧 API Config:', {
    hostname: window.location.hostname,
    origin: window.location.origin,
    baseUrl: API_CONFIG.BASE_URL
});

// Exportar configuração
window.API_CONFIG = API_CONFIG;

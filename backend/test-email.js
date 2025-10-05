import { createTransport } from "nodemailer";
import dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config();

console.log('=================================================');
console.log('🧪 TESTE DE CONFIGURAÇÃO DE EMAIL - TRIPFARM');
console.log('=================================================\n');

// Verificar variáveis de ambiente
console.log('📋 Verificando variáveis de ambiente:');
console.log('   EMAIL_USER:', process.env.EMAIL_USER || '❌ NÃO CONFIGURADO');
console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Configurada (oculta)' : '❌ NÃO CONFIGURADA');
console.log('');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('❌ ERRO: Variáveis de ambiente não configuradas!');
  console.error('');
  console.error('Por favor, configure o arquivo .env com:');
  console.error('   EMAIL_USER=tripfarm.oficial@gmail.com');
  console.error('   EMAIL_PASS=sua_senha_de_app_aqui');
  console.error('');
  console.error('Para gerar uma senha de app:');
  console.error('   1. Acesse: https://myaccount.google.com/apppasswords');
  console.error('   2. Ative verificação em 2 etapas');
  console.error('   3. Gere uma senha de app para "TripFarm"');
  console.error('   4. Cole a senha no arquivo .env');
  process.exit(1);
}

// Criar transporter
console.log('🔧 Criando transporter do Nodemailer...');
const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

console.log('✅ Transporter criado com sucesso!\n');

// Verificar conexão
console.log('🔌 Testando conexão com servidor SMTP do Gmail...');
transporter.verify()
  .then(() => {
    console.log('✅ SUCESSO! Servidor de email está pronto para enviar mensagens!\n');
    console.log('=================================================');
    console.log('✨ Tudo configurado corretamente!');
    console.log('=================================================\n');
    console.log('Agora você pode:');
    console.log('   1. Iniciar o servidor: node server.js');
    console.log('   2. Testar o envio de formulário');
    console.log('');
  })
  .catch((error) => {
    console.error('❌ ERRO ao conectar com servidor de email!\n');
    console.error('Detalhes do erro:');
    console.error('   Código:', error.code);
    console.error('   Mensagem:', error.message);
    console.error('');
    
    // Diagnóstico baseado no erro
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      console.error('🔍 DIAGNÓSTICO:');
      console.error('   Este erro significa que a autenticação falhou.');
      console.error('');
      console.error('💡 SOLUÇÕES:');
      console.error('   1. Verifique se você está usando uma SENHA DE APP (não a senha normal)');
      console.error('   2. Gere uma nova senha de app em: https://myaccount.google.com/apppasswords');
      console.error('   3. Certifique-se de que a verificação em 2 etapas está ativada');
      console.error('   4. Cole a senha de 16 caracteres no arquivo .env (sem espaços)');
      console.error('   5. Reinicie este teste');
    } else if (error.code === 'ENOTFOUND') {
      console.error('🔍 DIAGNÓSTICO:');
      console.error('   Não foi possível encontrar o servidor SMTP do Gmail.');
      console.error('');
      console.error('💡 SOLUÇÕES:');
      console.error('   1. Verifique sua conexão com a internet');
      console.error('   2. Verifique se um firewall está bloqueando a conexão');
      console.error('   3. Tente desativar temporariamente antivírus/firewall');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.error('🔍 DIAGNÓSTICO:');
      console.error('   A conexão com o servidor SMTP foi recusada ou expirou.');
      console.error('');
      console.error('💡 SOLUÇÕES:');
      console.error('   1. Verifique se a porta 587 não está bloqueada');
      console.error('   2. Tente desativar firewall/antivírus temporariamente');
      console.error('   3. Verifique configurações de proxy (se houver)');
    } else {
      console.error('💡 SOLUÇÃO GERAL:');
      console.error('   1. Verifique o arquivo .env');
      console.error('   2. Confirme que EMAIL_USER e EMAIL_PASS estão corretos');
      console.error('   3. Tente gerar uma nova senha de app');
    }
    
    console.error('');
    console.error('=================================================');
    console.error('Stack trace completo:');
    console.error(error);
    console.error('=================================================');
    process.exit(1);
  });

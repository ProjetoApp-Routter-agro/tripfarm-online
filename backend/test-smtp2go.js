import { createTransport } from "nodemailer";
import dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config();

console.log('🧪 Testando configuração do SMTP2GO...\n');

// Verificar se as variáveis estão definidas
console.log('📋 Verificando variáveis de ambiente:');
console.log(`   SMTP2GO_USER: ${process.env.SMTP2GO_USER ? '✅ Definido' : '❌ NÃO DEFINIDO'}`);
console.log(`   SMTP2GO_PASS: ${process.env.SMTP2GO_PASS ? '✅ Definido' : '❌ NÃO DEFINIDO'}`);
console.log(`   EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Definido' : '❌ NÃO DEFINIDO'}`);
console.log('');

// Verificar se a API Key parece válida
if (process.env.SMTP2GO_PASS) {
  if (process.env.SMTP2GO_PASS.startsWith('api-')) {
    console.log('✅ API Key parece estar no formato correto (começa com "api-")');
  } else if (process.env.SMTP2GO_PASS === 'undefined' || process.env.SMTP2GO_PASS === 'api-FC823xxxxxxxxxx') {
    console.log('❌ ERRO: API Key não foi substituída! Use a API Key real do painel SMTP2GO.');
    console.log('   Acesse: https://app-us.smtp2go.com/sending/apikeys/');
    process.exit(1);
  } else {
    console.log('⚠️  AVISO: API Key não começa com "api-". Verifique se está correta.');
  }
  console.log(`   Tamanho da API Key: ${process.env.SMTP2GO_PASS.length} caracteres`);
} else {
  console.log('❌ ERRO: SMTP2GO_PASS não está definido no arquivo .env');
  process.exit(1);
}
console.log('');

// Criar transporter
console.log('🔧 Criando conexão com SMTP2GO...');
const transporter = createTransport({
  host: 'mail.smtp2go.com',
  port: 2525,
  auth: {
    user: process.env.SMTP2GO_USER,
    pass: process.env.SMTP2GO_PASS,
  },
  debug: true, // Ativa logs detalhados
});

// Testar conexão
console.log('🔌 Testando conexão...\n');
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ ERRO na conexão:');
    console.log('   Código:', error.code);
    console.log('   Mensagem:', error.message);
    console.log('');
    
    if (error.code === 'EAUTH') {
      console.log('💡 Dica: Erro de autenticação. Verifique:');
      console.log('   1. A API Key está completa e correta?');
      console.log('   2. Você copiou a API Key do painel SMTP2GO?');
      console.log('   3. Não há espaços extras antes ou depois da API Key?');
      console.log('');
      console.log('   Acesse: https://app-us.smtp2go.com/sending/apikeys/');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
      console.log('💡 Dica: Erro de conexão. Verifique:');
      console.log('   1. Você está conectado à internet?');
      console.log('   2. Seu firewall está bloqueando a porta 2525?');
    }
    
    process.exit(1);
  } else {
    console.log('✅ Conexão estabelecida com sucesso!');
    console.log('✅ Credenciais SMTP2GO estão corretas!');
    console.log('');
    console.log('🎉 Tudo pronto para enviar emails!');
    console.log('');
    console.log('📝 Próximo passo:');
    console.log('   1. Verifique o email remetente no SMTP2GO:');
    console.log(`      https://app-us.smtp2go.com/sending/verified_senders/`);
    console.log(`   2. Adicione: ${process.env.EMAIL_USER}`);
    console.log('   3. Confirme o email de verificação');
    console.log('   4. Teste o formulário!');
    console.log('');
    console.log('💡 Para testar o envio de email, execute:');
    console.log('   node test-email-completo.js');
  }
});


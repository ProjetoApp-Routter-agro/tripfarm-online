import express from "express";
import cors from "cors";
import multer from "multer";
import { createTransport } from "nodemailer";
import archiver from "archiver";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// ⚡ Carregar variáveis de ambiente
dotenv.config();

// Configuração para usar __dirname em módulos ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ⚡ Configuração do Multer para upload de áudio em memória
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB
});

// ⚡ Configuração do Nodemailer com SMTP2GO
// SMTP2GO funciona perfeitamente com Render (sem bloqueios)
// Plano gratuito: 1.000 emails/mês - https://www.smtp2go.com
const transporter = createTransport({
  host: 'mail.smtp2go.com',
  port: 2525, // Porta alternativa (não bloqueada pela Render)
  auth: {
    user: process.env.SMTP2GO_USER, // Configure na Render: Settings → Environment
    pass: process.env.SMTP2GO_PASS, // Configure na Render: Settings → Environment
  },
});

// Middlewares
const frontendPath = path.join(__dirname, 'frontend');
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ⚡ SERVIR ARQUIVOS ESTÁTICOS DO FRONTEND
// Isso permite que o backend sirva o frontend automaticamente
app.use(express.static(path.join(__dirname, 'frontend')));

// ⚡ Rota de healthcheck para verificar se o servidor está funcionando
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Servidor TripFarm funcionando!",
    timestamp: new Date().toISOString(),
    emailConfigured: !!process.env.SMTP2GO_USER,
    smtpHost: 'mail.smtp2go.com'
  });
});

// ⚡ Rota de informações da API
app.get("/api/info", (req, res) => {
  res.json({
    message: "API TripFarm Backend",
    version: "2.0.0",
    emailService: "SMTP2GO",
    endpoints: {
      health: "/api/health",
      info: "/api/info",
      salvar: "/api/salvar"
    }
  });
});

// ⚡ Função para criar arquivo ZIP com os dados do formulário
async function criarZipComDados(formData, audioBuffer, audioFilename) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    archive.on('data', (chunk) => {
      chunks.push(chunk);
    });

    archive.on('end', () => {
      const zipBuffer = Buffer.concat(chunks);
      resolve(zipBuffer);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    // Adicionar arquivo JSON
    const dadosJson = JSON.stringify(formData, null, 2);
    archive.append(dadosJson, { name: 'respostas.json' });

    // Adicionar arquivo TXT
    let dadosTxt = "=== RESPOSTAS DO FORMULÁRIO TRIPFARM ===\n\n";
    dadosTxt += `Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`;
    dadosTxt += `Tipo de Formulário: ${formData.tipo_formulario || 'Não informado'}\n\n`;
    
    Object.keys(formData).forEach(key => {
      if (key !== 'tipo_formulario') {
        dadosTxt += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${formData[key] || 'Não informado'}\n`;
      }
    });
    
    archive.append(dadosTxt, { name: 'respostas.txt' });

    // Adicionar áudio se existir
    if (audioBuffer && audioFilename) {
      archive.append(audioBuffer, { name: audioFilename });
    }

    archive.finalize();
  });
}

// ⚡ Função para enviar email com o arquivo ZIP anexado
async function enviarEmailComZip(zipBuffer, formData) {
  const nomeUsuario = formData.nome || 'Usuário';
  const tipoFormulario = formData.tipo_formulario || 'formulário';
  
  // ✅ CORREÇÃO DO BLANK SENDER: Formato correto com nome e email
  const senderEmail = process.env.EMAIL_USER || 'noreply@tripfarmoficial.com.br';
  
  const mailOptions = {
    from: `"TripFarm Pesquisas" <${senderEmail}>`, // ✅ Formato correto!
    to: 'tripfarm.oficial@gmail.com',
    replyTo: 'tripfarm.oficial@gmail.com',
    subject: `Nova resposta TripFarm - ${tipoFormulario} - ${nomeUsuario}`,
    html: `
      <h2>Nova resposta recebida no TripFarm</h2>
      <p><strong>Nome:</strong> ${formData.nome || 'Não informado'}</p>
      <p><strong>Cidade:</strong> ${formData.cidade || 'Não informado'}</p>
      <p><strong>Sexo:</strong> ${formData.sexo || 'Não informado'}</p>
      <p><strong>Ano de Nascimento:</strong> ${formData.ano_nascimento || 'Não informado'}</p>
      <p><strong>Tipo de Formulário:</strong> ${formData.tipo_formulario || 'Não informado'}</p>
      <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
      
      <p>Os dados completos estão no arquivo ZIP anexo.</p>
      
      <hr>
      <p><em>Email enviado automaticamente pelo sistema TripFarm</em></p>
    `,
    attachments: [
      {
        filename: `tripfarm_resposta_${Date.now()}.zip`,
        content: zipBuffer,
        contentType: 'application/zip'
      }
    ]
  };

  return transporter.sendMail(mailOptions);
}

// ⚡ Rota principal para salvar respostas
app.post("/api/salvar", upload.single("audio"), async (req, res) => {
  try {
    const formData = req.body;
    const audioFile = req.file;

    console.log('📝 Recebendo formulário:', {
      nome: formData.nome,
      cidade: formData.cidade,
      tipo: formData.tipo_formulario,
      temAudio: !!audioFile
    });

    // Validar campos obrigatórios
    if (!formData.nome || !formData.cidade || !formData.sexo || !formData.ano_nascimento) {
      return res.status(400).json({ 
        success: false, 
        error: "Campos obrigatórios: Nome, Cidade, Sexo e Ano de nascimento" 
      });
    }

    // Preparar dados para o ZIP
    const dadosCompletos = {
      ...formData,
      data_envio: new Date().toISOString(),
      tem_audio: !!audioFile
    };

    // Preparar informações do áudio
    let audioBuffer = null;
    let audioFilename = null;
    
    if (audioFile) {
      audioBuffer = audioFile.buffer;
      audioFilename = `audio_${Date.now()}.webm`;
      console.log(`🎤 Áudio recebido: ${(audioFile.size / 1024).toFixed(2)} KB`);
    }

    // Criar arquivo ZIP com os dados
    console.log('📦 Criando arquivo ZIP com os dados...');
    const zipBuffer = await criarZipComDados(dadosCompletos, audioBuffer, audioFilename);
    console.log(`✅ ZIP criado: ${(zipBuffer.length / 1024).toFixed(2)} KB`);

    // Enviar email com o ZIP anexado
    console.log('📧 Enviando email via SMTP2GO...');
    const info = await enviarEmailComZip(zipBuffer, dadosCompletos);
    console.log('✅ Email enviado com sucesso!', info.messageId);
    
    res.json({
      success: true,
      message: "Dados enviados com sucesso por email!",
      data: {
        nome: formData.nome,
        cidade: formData.cidade,
        sexo: formData.sexo,
        ano_nascimento: formData.ano_nascimento,
        tipo_formulario: formData.tipo_formulario,
        data_envio: dadosCompletos.data_envio
      }
    });

  } catch (err) {
    console.error("❌ Erro ao processar formulário:", err);
    console.error("Detalhes do erro:", {
      message: err.message,
      code: err.code,
      command: err.command
    });
    
    res.status(500).json({ 
      success: false, 
      error: "Erro ao enviar email. Verifique as configurações do SMTP2GO." 
    });
  }
});

// ⚡ ROTAS DIRETAS PARA QR CODES
// Redireciona para o formulário específico com parâmetro
app.get('/visitante', (req, res) => {
  res.redirect('/?form=visitante');
});

app.get('/produtor', (req, res) => {
  res.redirect('/?form=produtor-tradicional');
});

app.get('/produtor-tradicional', (req, res) => {
  res.redirect('/?form=produtor-tradicional');
});

app.get('/produtor-digital', (req, res) => {
  res.redirect('/?form=produtor-digital');
});

app.get('/produtor_digital', (req, res) => {
  res.redirect('/?form=produtor-digital');
});

// ⚡ ROTA CATCH-ALL: Servir o index.html para qualquer rota não-API
// Isso garante que o frontend funcione corretamente
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ⚡ Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor TripFarm rodando na porta ${PORT}`);
  console.log(`📧 SMTP configurado: ${process.env.SMTP2GO_USER ? 'SIM ✅' : 'NÃO ❌'}`);
  console.log(`📧 Email remetente: ${process.env.EMAIL_USER || 'noreply@tripfarmoficial.com.br'}`);
  console.log(`🌐 Frontend sendo servido de: ${path.join(__dirname, 'frontend')}`);
  console.log(`✅ Servidor pronto!`);
});

export default app;


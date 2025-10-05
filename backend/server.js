import express from "express";
import cors from "cors";
import multer from "multer";
import nodemailer from "nodemailer";
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

// ⚡ Configuração do Nodemailer para envio de emails
const transporter = nodemailer.createTransporter({
  service: 'gmail', // Ou outro provedor de email
  auth: {
    user: process.env.EMAIL_USER, // Email remetente
    pass: process.env.EMAIL_PASS, // Senha do app ou senha do email
  },
});

// Middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ⚡ Rota de healthcheck para verificar se o servidor está funcionando
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Servidor TripFarm funcionando!" });
});

// ⚡ Rota principal que retorna informações sobre a API
app.get("/", (req, res) => {
  res.json({
    message: "API TripFarm Backend",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      salvar: "/api/salvar"
    }
  });
});

// ⚡ Função para criar arquivo ZIP com os dados do formulário
async function criarZipComDados(formData, audioBuffer, audioFilename) {
  return new Promise((resolve, reject) => {
    // Criar um buffer para armazenar o ZIP
    const chunks = [];
    
    // Configurar o archiver
    const archive = archiver('zip', {
      zlib: { level: 9 } // Compressão máxima
    });

    // Capturar dados do ZIP em chunks
    archive.on('data', (chunk) => {
      chunks.push(chunk);
    });

    // Quando o ZIP estiver finalizado
    archive.on('end', () => {
      const zipBuffer = Buffer.concat(chunks);
      resolve(zipBuffer);
    });

    // Em caso de erro
    archive.on('error', (err) => {
      reject(err);
    });

    // ⚡ Adicionar arquivo JSON com os dados do formulário
    const dadosJson = JSON.stringify(formData, null, 2);
    archive.append(dadosJson, { name: 'respostas.json' });

    // ⚡ Adicionar arquivo TXT com os dados do formulário (formato legível)
    let dadosTxt = "=== RESPOSTAS DO FORMULÁRIO TRIPFARM ===\n\n";
    dadosTxt += `Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`;
    dadosTxt += `Tipo de Formulário: ${formData.tipo_formulario || 'Não informado'}\n\n`;
    
    Object.keys(formData).forEach(key => {
      if (key !== 'tipo_formulario') {
        dadosTxt += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${formData[key] || 'Não informado'}\n`;
      }
    });
    
    archive.append(dadosTxt, { name: 'respostas.txt' });

    // ⚡ Adicionar arquivo de áudio se existir
    if (audioBuffer && audioFilename) {
      archive.append(audioBuffer, { name: audioFilename });
    }

    // Finalizar o arquivo ZIP
    archive.finalize();
  });
}

// ⚡ Função para enviar email com o arquivo ZIP anexado
async function enviarEmailComZip(zipBuffer, formData) {
  const nomeUsuario = formData.nome || 'Usuário';
  const tipoFormulario = formData.tipo_formulario || 'formulário';
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'tripfarm.oficial@gmail.com',
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

// ⚡ Rota principal para salvar respostas (agora envia por email)
app.post("/api/salvar", upload.single("audio"), async (req, res) => {
  try {
    const formData = req.body;
    const audioFile = req.file;

    // ⚡ Validar campos obrigatórios
    if (!formData.nome || !formData.cidade || !formData.sexo || !formData.ano_nascimento) {
      return res.status(400).json({ 
        success: false, 
        error: "Campos obrigatórios: Nome, Cidade, Sexo e Ano de nascimento" 
      });
    }

    // ⚡ Preparar dados para o ZIP
    const dadosCompletos = {
      ...formData,
      data_envio: new Date().toISOString(),
      tem_audio: !!audioFile
    };

    // ⚡ Preparar informações do áudio
    let audioBuffer = null;
    let audioFilename = null;
    
    if (audioFile) {
      audioBuffer = audioFile.buffer;
      audioFilename = `audio_${Date.now()}.webm`;
    }

    // ⚡ Criar arquivo ZIP com os dados
    console.log('Criando arquivo ZIP com os dados...');
    const zipBuffer = await criarZipComDados(dadosCompletos, audioBuffer, audioFilename);

    // ⚡ Enviar email com o ZIP anexado
    console.log('Enviando email...');
    await enviarEmailComZip(zipBuffer, dadosCompletos);

    console.log('Email enviado com sucesso!');
    
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
    console.error("Erro ao processar formulário:", err);
    res.status(500).json({ 
      success: false, 
      error: "Erro interno do servidor. Tente novamente." 
    });
  }
});

// ⚡ Iniciar servidor (apenas se não estiver sendo importado)
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor TripFarm rodando na porta ${PORT}`);
    console.log(`📧 Email configurado: ${process.env.EMAIL_USER ? 'SIM' : 'NÃO'}`);
  });
}

// ⚡ Exportar para uso em outros módulos ou deploy
export default app;


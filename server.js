import app from './src/app.js';
import http from 'http';
import { pool } from './src/config/db.js';

// Carrega as variáveis de ambiente
import 'dotenv/config';

// Define a porta
const port = process.env.PORT || 3000;

// Cria o servidor HTTP
const server = http.createServer(app);

// Função para encerrar o servidor corretamente
const shutdown = async () => {
  console.log('\n🛑 Encerrando servidor...');
  
  try {
    // Fecha o pool de conexões do banco de dados
    if (pool) {
      await pool.end();
      console.log('✅ Pool de conexões do banco de dados fechado');
    }
    
    // Encerra o servidor
    server.close(() => {
      console.log('✅ Servidor encerrado com sucesso');
      process.exit(0);
    });
    
    // Força o encerramento após 5 segundos se necessário
    setTimeout(() => {
      console.warn('⚠️ Forçando encerramento...');
      process.exit(1);
    }, 5000);
    
  } catch (error) {
    console.error('❌ Erro durante o encerramento:', error);
    process.exit(1);
  }
};

// Manipula os sinais de encerramento
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Inicia o servidor
server.listen(port, () => {
  console.log(`\n🚀 Servidor rodando na porta ${port}`);
  console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Acesse: http://localhost:${port}`);
  console.log(`📊 Status: http://localhost:${port}/health`);
  console.log(`📚 Documentação: http://localhost:${port}/api-docs\n`);
  
  // Mensagem de boas-vindas
  console.log('🛑 Para encerrar o servidor, pressione Ctrl+C\n');
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Rejeição não tratada em:', promise, 'motivo:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Exceção não capturada:', error);
  // Não encerra o processo para evitar reinicializações em produção
  // process.exit(1);
});

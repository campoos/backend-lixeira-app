import { pool } from '../config/db.js';
import aiService from '../services/aiService.js';
import trashService from '../services/trashService.js';

/**
 * Controlador para análise de imagens
 */
class AnalysisController {
  /**
   * Processa uma imagem para análise
   */
  async analyzeImage(req, res) {
    // Verifica se há um arquivo na requisição
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhuma imagem fornecida'
      });
    }

    const connection = await pool.getConnection();
    
    try {
      // Inicia uma transação
      await connection.beginTransaction();
      
      // 1. Envia a imagem para a IA
      const { label, score } = await aiService.analyzeImage(req.file.buffer);
      
      // 2. Verifica se é orgânico
      const isOrganic = trashService.isOrganic(label);
      
      // 3. Determina a ação da lixeira
      const trashAction = trashService.determineTrashAction(isOrganic);
      
      // 4. Registra a análise no banco de dados
      const analysisId = await trashService.logAnalysis(
        connection,
        req.user?.id, // ID do usuário se autenticado
        label,
        score,
        isOrganic
      );
      
      // 5. Registra a ação da lixeira
      await trashService.logTrashAction(connection, analysisId, trashAction);
      
      // 6. Confirma a transação
      await connection.commit();
      
      // 7. Retorna a resposta
      res.json({
        success: true,
        object: label,
        confidence: score,
        canDiscard: isOrganic,
        trashAction,
        analysisId
      });
      
    } catch (error) {
      // Desfaz a transação em caso de erro
      await connection.rollback();
      
      console.error('Erro ao processar análise:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao processar a imagem',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
      
    } finally {
      // Libera a conexão de volta para o pool
      connection.release();
    }
  }

  /**
   * Obtém o histórico de análises
   */
  async getHistory(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const history = await trashService.getAnalysisHistory(pool, limit);
      
      res.json({
        success: true,
        count: history.length,
        data: history
      });
      
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar histórico de análises'
      });
    }
  }
}

export default new AnalysisController();

/**
 * Serviço com as regras de negócio da lixeira inteligente
 */
class TrashService {
  constructor() {
    // Lista de itens considerados orgânicos
    this.organicItems = [
    // --- Frutas (Português) ---
    'banana', 'maçã', 'uva', 'laranja', 'limão', 'pera', 'abacaxi',
    'manga', 'mamão', 'melancia', 'melão', 'kiwi', 'morango', 'pêssego',
    'coco', 'tangerina', 'ameixa', 'fruta', 'frutas', 'caju', 'acerola',
    'goiaba', 'maracujá', 'jabuticaba', 'pitaya', 'romã',

    // --- Frutas (Inglês) ---
    'apple', 'banana', 'grape', 'orange', 'lemon', 'lime', 'pear', 'pineapple',
    'mango', 'papaya', 'watermelon', 'melon', 'kiwi', 'strawberry', 'peach',
    'coconut', 'tangerine', 'plum', 'fruit', 'fruits', 'berry', 'berries',
    'citrus', 'citrus fruit',

    // --- Cascas de fruta ---
    'banana peel', 'orange peel', 'lemon peel', 'apple core', 'fruit peel',

    // --- Vegetais / Legumes (PT) ---
    'batata', 'cenoura', 'beterraba', 'pepino', 'abobrinha', 'berinjela', 
    'tomate', 'alface', 'couve', 'brocolis', 'brócolis', 'cebola', 'alho',
    'pimentão', 'milho', 'mandioca', 'chuchu', 'inhame', 'abóbora', 'ervilha',

    // --- Vegetais / Legumes (EN) ---
    'potato', 'carrot', 'beet', 'cucumber', 'zucchini', 'eggplant', 'tomato',
    'lettuce', 'cabbage', 'broccoli', 'onion', 'garlic', 'pepper', 'corn',
    'cassava', 'pumpkin', 'pea', 'vegetable', 'vegetables',

    // --- Restos de comida ---
    'food', 'food waste', 'leftovers', 'scraps', 'kitchen waste',
    'organic waste', 'compost', 'compostable', 'meal', 'snack', 'bread',
    'pão', 'arroz', 'feijão', 'massa', 'macarrão', 'carne', 'peixe',
    'frango', 'ovo', 'casca de ovo',

    // --- Itens naturais ---
    'folha', 'folhas', 'galho', 'terra', 'solo', 'plant', 'leaf', 'leaves',
    'branch', 'soil', 'flower', 'flor',

    // --- Categoria ampla ---
    'organic', 'orgânico', 'alimento', 'comida', 'food item', 'produce'
  ];

  }

  /**
   * Verifica se um item é orgânico com base no label retornado pela IA
   * @param {string} label - Label retornado pela IA
   * @returns {boolean} true se for orgânico, false caso contrário
   */
  isOrganic(label) {
    if (!label) return false;
    
    const lowerLabel = label.toLowerCase();
    return this.organicItems.some(item => lowerLabel.includes(item));
  }

  /**
   * Determina a ação da lixeira com base no tipo de lixo
   * @param {boolean} isOrganic - Se o item é orgânico
   * @returns {string} 'OPEN' para abrir a lixeira, 'DENY' para negar
   */
  determineTrashAction(isOrganic) {
    return isOrganic ? 'OPEN' : 'DENY';
  }

  /**
   * Registra a ação da lixeira no banco de dados
   * @param {Object} db - Objeto de conexão com o banco de dados
   * @param {number} analysisId - ID da análise
   * @param {string} action - Ação realizada ('OPEN' ou 'DENY')
   * @returns {Promise<Object>} Resultado da inserção
   */
  async logTrashAction(db, analysisId, action) {
    try {
      const [result] = await db.execute(
        'INSERT INTO trash_logs (analysis_id, action, timestamp) VALUES (?, ?, NOW())',
        [analysisId, action]
      );
      return result;
    } catch (error) {
      console.error('Erro ao registrar ação da lixeira:', error);
      throw new Error('Falha ao registrar ação da lixeira');
    }
  }

  /**
   * Registra a análise da IA no banco de dados
   * @param {Object} db - Objeto de conexão com o banco de dados
   * @param {number} userId - ID do usuário (opcional)
   * @param {string} label - Label retornado pela IA
   * @param {number} confidence - Nível de confiança da classificação
   * @param {boolean} isOrganic - Se o item é orgânico
   * @returns {Promise<number>} ID da análise inserida
   */
  async logAnalysis(db, userId, label, confidence, isOrganic) {
    try {
      const [result] = await db.execute(
        `INSERT INTO ai_analysis 
         (user_id, object_detected, confidence, is_organic, created_at) 
         VALUES (?, ?, ?, ?, NOW())`,
        [userId || null, label, confidence, isOrganic]
      );
      return result.insertId;
    } catch (error) {
      console.error('Erro ao registrar análise:', error);
      throw new Error('Falha ao registrar análise no banco de dados');
    }
  }

  /**
   * Obtém o histórico de análises
   * @param {Object} db - Objeto de conexão com o banco de dados
   * @param {number} limit - Limite de registros a serem retornados
   * @returns {Promise<Array>} Lista de análises
   */
  async getAnalysisHistory(db, limit = 10) {
    try {
      const safeLimit = Number.isFinite(limit) && limit > 0
        ? Math.min(Number(limit), 100)
        : 10;
      
      const [rows] = await db.execute(
        `SELECT a.*, t.action, t.timestamp as action_timestamp 
         FROM ai_analysis a
         LEFT JOIN trash_logs t ON a.id = t.analysis_id
         ORDER BY a.created_at DESC
         LIMIT ${safeLimit}`
      );
      return rows;
    } catch (error) {
      console.error('Erro ao buscar histórico de análises:', error);
      throw new Error('Falha ao buscar histórico de análises');
    }
  }
}

export default new TrashService();

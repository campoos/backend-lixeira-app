import { pool } from '../config/db.js';

/**
 * Controlador para interação com o dispositivo físico da lixeira
 */
class DeviceController {
  /**
   * Retorna o status atual do dispositivo
   */
  async getStatus(req, res) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM device_status ORDER BY updated_at DESC LIMIT 1'
      );
      
      // Se não houver status, retorna um padrão
      if (rows.length === 0) {
        return res.json({
          success: true,
          status: 'ONLINE',
          lastPing: new Date().toISOString(),
          batteryLevel: 100,
          firmwareVersion: '1.0.0'
        });
      }
      
      res.json({
        success: true,
        ...rows[0]
      });
      
    } catch (error) {
      console.error('Erro ao buscar status do dispositivo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar status do dispositivo'
      });
    }
  }

  /**
   * Endpoint para o dispositivo enviar um ping
   */
  async ping(req, res) {
    const { batteryLevel, firmwareVersion, status = 'ONLINE' } = req.body;
    
    try {
      // Atualiza o status do dispositivo
      await pool.execute(
        `INSERT INTO device_status 
         (status, battery_level, firmware_version, updated_at)
         VALUES (?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE
         status = VALUES(status),
         battery_level = VALUES(battery_level),
         firmware_version = VALUES(firmware_version),
         updated_at = NOW()`,
        [status, batteryLevel, firmwareVersion]
      );
      
      res.json({
        success: true,
        message: 'Ping recebido com sucesso',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Erro ao processar ping:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao processar ping do dispositivo'
      });
    }
  }

  /**
   * Obtém a última ação da lixeira
   */
  async getLastAction(req, res) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM trash_logs 
         ORDER BY timestamp DESC 
         LIMIT 1`
      );
      
      if (rows.length === 0) {
        return res.json({
          success: true,
          action: 'NONE',
          message: 'Nenhuma ação registrada'
        });
      }
      
      res.json({
        success: true,
        action: rows[0].action,
        timestamp: rows[0].timestamp,
        analysisId: rows[0].analysis_id
      });
      
    } catch (error) {
      console.error('Erro ao buscar última ação:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar última ação da lixeira'
      });
    }
  }
}

export default new DeviceController();

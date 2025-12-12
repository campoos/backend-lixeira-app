import express from 'express';
import deviceController from '../controllers/deviceController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dispositivo
 *   description: Endpoints para interação com o dispositivo físico da lixeira
 */

/**
 * @swagger
 * /api/device/status:
 *   get:
 *     summary: Obtém o status atual do dispositivo
 *     tags: [Dispositivo]
 *     responses:
 *       200:
 *         description: Status do dispositivo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 status:
 *                   type: string
 *                   enum: [ONLINE, OFFLINE, ERROR]
 *                   description: Status atual do dispositivo
 *                 lastPing:
 *                   type: string
 *                   format: date-time
 *                   description: Data e hora do último ping recebido
 *                 batteryLevel:
 *                   type: integer
 *                   minimum: 0
 *                   maximum: 100
 *                   description: Nível da bateria em porcentagem
 *                 firmwareVersion:
 *                   type: string
 *                   description: Versão do firmware do dispositivo
 */
router.get('/status', deviceController.getStatus);

/**
 * @swagger
 * /api/device/ping:
 *   post:
 *     summary: Endpoint para o dispositivo enviar um ping
 *     tags: [Dispositivo]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - batteryLevel
 *               - firmwareVersion
 *             properties:
 *               batteryLevel:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Nível atual da bateria em porcentagem
 *               firmwareVersion:
 *                 type: string
 *                 description: Versão do firmware do dispositivo
 *               status:
 *                 type: string
 *                 enum: [ONLINE, OFFLINE, ERROR]
 *                 default: ONLINE
 *                 description: Status atual do dispositivo
 *     responses:
 *       200:
 *         description: Ping recebido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.post('/ping', deviceController.ping);

/**
 * @swagger
 * /api/device/last-action:
 *   get:
 *     summary: Obtém a última ação registrada da lixeira
 *     tags: [Dispositivo]
 *     responses:
 *       200:
 *         description: Última ação da lixeira
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 action:
 *                   type: string
 *                   enum: [OPEN, DENY, NONE]
 *                   description: Última ação realizada pela lixeira
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: Data e hora da ação
 *                 analysisId:
 *                   type: integer
 *                   description: ID da análise associada à ação
 */
router.get('/last-action', deviceController.getLastAction);

export default router;

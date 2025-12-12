import express from 'express';
import { upload, handleUploadErrors } from '../middleware/upload.js';
import analysisController from '../controllers/analysisController.js';

const router = express.Router();

/**
 * @swagger
 * /api/analyze:
 *   post:
 *     summary: Analisa uma imagem para classificação de lixo
 *     tags: [Análise]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Imagem para análise (JPEG, JPG, PNG, até 5MB)
 *     responses:
 *       200:
 *         description: Análise concluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 object:
 *                   type: string
 *                   description: Objeto detectado na imagem
 *                 confidence:
 *                   type: number
 *                   format: float
 *                   description: Nível de confiança da classificação (0 a 1)
 *                 canDiscard:
 *                   type: boolean
 *                   description: Se o objeto pode ser descartado (é orgânico)
 *                 trashAction:
 *                   type: string
 *                   enum: [OPEN, DENY]
 *                   description: Ação que a lixeira deve realizar
 *                 analysisId:
 *                   type: integer
 *                   description: ID da análise no banco de dados
 *       400:
 *         description: Erro na requisição (imagem ausente ou inválida)
 *       500:
 *         description: Erro ao processar a imagem
 */
router.post(
  '/analyze', 
  upload.single('image'),
  handleUploadErrors,
  analysisController.analyzeImage
);

/**
 * @swagger
 * /api/history:
 *   get:
 *     summary: Obtém o histórico de análises
 *     tags: [Análise]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número máximo de registros a serem retornados
 *     responses:
 *       200:
 *         description: Lista de análises realizadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                   description: Número de análises retornadas
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Analysis'
 */
router.get('/history', analysisController.getHistory);

export default router;

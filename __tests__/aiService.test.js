import axios from 'axios';
import aiService from '../src/services/aiService.js';

// Mock do axios
jest.mock('axios');

// Mock do dotenv
// Mock do dotenv/config
jest.mock('dotenv/config', () => jest.fn(), { virtual: true });

// Mock do dotenv
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

describe('AIService', () => {
  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
    
    // Configura o ambiente para desenvolvimento para testar o fallback
    process.env.NODE_ENV = 'development';
    process.env.HUGGINGFACE_API_KEY = 'test-api-key';
  });

  describe('analyzeImage', () => {
    it('deve analisar uma imagem com sucesso', async () => {
      // Mock da resposta da API do HuggingFace
      axios.post.mockResolvedValueOnce({
        data: [
          { label: 'banana', score: 0.98 },
          { label: 'apple', score: 0.02 }
        ]
      });

      const mockImageBuffer = Buffer.from('test-image-data');
      const result = await aiService.analyzeImage(mockImageBuffer);

      expect(result).toEqual({
        label: 'banana',
        score: 0.98
      });

      expect(axios.post).toHaveBeenCalledWith(
        'https://api-inference.huggingface.co/models/google/vit-base-patch16-224',
        mockImageBuffer,
        {
          headers: {
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'image/jpeg'
          },
          timeout: 10000
        }
      );
    });

    it('deve usar dados mockados em caso de erro em ambiente de desenvolvimento', async () => {
      // Força um erro na chamada da API
      axios.post.mockRejectedValueOnce(new Error('API Error'));

      const mockImageBuffer = Buffer.from('test-image-data');
      const result = await aiService.analyzeImage(mockImageBuffer);

      // Verifica se retornou o mock de desenvolvimento
      expect(result).toEqual({
        label: 'banana',
        score: 0.98
      });
    });

    it('deve lançar erro em produção quando a chave da API não estiver configurada', async () => {
      // Configura para ambiente de produção
      process.env.NODE_ENV = 'production';
      delete process.env.HUGGINGFACE_API_KEY;

      await expect(aiService.analyzeImage(Buffer.from('test')))
        .rejects
        .toThrow('Chave da API do HuggingFace não configurada');
    });
  });
});

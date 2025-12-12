import trashService from '../src/services/trashService.js';

// Mock do pool do banco de dados
jest.mock('../src/config/db.js', () => ({
  pool: {
    execute: jest.fn()
  }
}));

describe('TrashService', () => {
  describe('isOrganic', () => {
    it('deve retornar true para itens orgânicos', () => {
      expect(trashService.isOrganic('banana')).toBe(true);
      expect(trashService.isOrganic('maçã')).toBe(true);
      expect(trashService.isOrganic('ORANGE')).toBe(true);
      expect(trashService.isOrganic('organic food')).toBe(true);
    });

    it('deve retornar false para itens não orgânicos', () => {
      expect(trashService.isOrganic('plástico')).toBe(false);
      expect(trashService.isOrganic('metal')).toBe(false);
      expect(trashService.isOrganic('vidro')).toBe(false);
    });
  });

  describe('determineTrashAction', () => {
    it('deve retornar OPEN para itens orgânicos', () => {
      expect(trashService.determineTrashAction(true)).toBe('OPEN');
    });

    it('deve retornar DENY para itens não orgânicos', () => {
      expect(trashService.determineTrashAction(false)).toBe('DENY');
    });
  });
});

import IStorage from '@core/shared/domain/storage.interface';
import MemoryStorage from './memory.storage';

describe('Memory Storage', () => {
    let storage: IStorage;

    beforeEach(() => {
        storage = new MemoryStorage();
    });

    test('Deve retornar erro quando não encontrar um arquivo', async () => {
        await expect(storage.get('fail')).rejects.toThrow(
            'File fail not found',
        );
    });

    test('Deve armazenar um arquivo', async () => {
        const file = Buffer.from('test storage');
        const mimeType = 'text/plain';
        const id1 = 'test1-file';
        const id2 = 'test2-file';

        await storage.put({
            id: id1,
            mimeType,
            file,
        });

        await storage.put({
            id: id2,
            mimeType,
            file,
        });

        expect(storage['files'].size).toBe(2);
    });

    test('Deve retornar um arquivo do storage', async () => {
        const file = Buffer.from('test storage');
        const id = 'test-file';
        const mimeType = 'text/plain';

        await storage.put({
            id,
            mimeType,
            file,
        });

        const fileFound = await storage.get(id);
        expect(fileFound).toEqual({
            file,
            mimeType,
        });
    });
});

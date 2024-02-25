import IStorage from '@core/shared/domain/storage.interface';
import GoogleCloudStorage from './google-cloud.storage';
import { Storage as GoogleCloudStorageSdk } from '@google-cloud/storage';
import Config from '../config';
import FileNotFoundError from '@core/shared/domain/errors/file-not-found.error';

describe.skip('Google Cloud Storage Integration tests', () => {
    let googleCloudStorage: IStorage;
    let googleCloudStorageSdk: GoogleCloudStorageSdk;

    beforeEach(() => {
        googleCloudStorageSdk = new GoogleCloudStorageSdk({
            credentials: Config.googleCredentials(),
        });
        googleCloudStorage = new GoogleCloudStorage(
            googleCloudStorageSdk,
            Config.bucketName(),
        );
    });

    test('Deve armazenar um arquivo na cloud', async () => {
        const file = Buffer.from('test storage');
        const mimeType = 'text/plain';
        const id = 'test-file.txt';

        await googleCloudStorage.put({
            id,
            mimeType,
            file,
        });

        const fileFound = await googleCloudStorage.get(id);

        expect(fileFound).toEqual({
            mimeType,
            file,
        });
    }, 15000);

    test('Deve lançar exception FileNotFoundError quando não encontrar o arquivo', async () => {
        const id = 'file-not-found';
        try {
            await googleCloudStorage.get(id);
        } catch (error) {
            expect(error).toBeInstanceOf(FileNotFoundError);
        }
    }, 15000);
});

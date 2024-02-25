import IStorage from '@core/shared/domain/storage.interface';
import GoogleCloudStorage from './google-cloud.storage';
import { Storage as GoogleCloudStorageSdk } from '@google-cloud/storage';
import Config from '../config';

describe.skip('Google Cloud Storage', () => {
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

    test('Deve armazenar um arquivo (mock)', async () => {
        const file = Buffer.from('test storage');
        const mimeType = 'text/plain';
        const id = 'test-file.txt';

        const saveMock = jest.fn().mockImplementation(undefined);
        const fileMock = jest.fn().mockImplementation(() => ({
            save: saveMock,
        }));
        jest.spyOn(googleCloudStorageSdk, 'bucket').mockImplementation(
            () =>
                ({
                    file: fileMock,
                }) as any,
        );

        await googleCloudStorage.put({
            id,
            mimeType,
            file,
        });

        expect(googleCloudStorageSdk.bucket).toBeCalledWith(
            Config.bucketName(),
        );
        expect(fileMock).toBeCalledWith('test-file.txt');
        expect(saveMock).toBeCalledWith(file, {
            metadata: {
                contentType: 'text/plain',
            },
        });
    });

    test('Deve pegar um arquivo da cloud (mock)', async () => {
        const getMetadataMock = jest.fn().mockResolvedValue(
            Promise.resolve([
                {
                    name: 'test-file.txt',
                    contentType: 'text/plain',
                },
            ]),
        );
        const downloadMock = jest
            .fn()
            .mockResolvedValue(Promise.resolve([Buffer.from('test storage')]));
        const fileMock = jest.fn().mockImplementation(() => ({
            download: downloadMock,
            getMetadata: getMetadataMock,
        }));
        jest.spyOn(googleCloudStorageSdk, 'bucket').mockImplementation(
            () =>
                ({
                    file: fileMock,
                }) as any,
        );

        const file = await googleCloudStorage.get('test-file.txt');

        expect(googleCloudStorageSdk.bucket).toBeCalledWith(
            Config.bucketName(),
        );
        expect(fileMock).toBeCalledWith('test-file.txt');
        expect(getMetadataMock).toHaveBeenCalled();
        expect(downloadMock).toHaveBeenCalled();
        expect(file).toEqual({
            file: Buffer.from('test storage'),
            mimeType: 'text/plain',
        });
    });
});

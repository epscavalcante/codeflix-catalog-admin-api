import FileNotFoundError from '@core/shared/domain/errors/file-not-found.error';
import IStorage from '@core/shared/domain/storage.interface';
import { Storage } from '@google-cloud/storage';
export default class GoogleCloudStorage implements IStorage {
    constructor(
        private storage: Storage,
        private bucketName: string,
    ) {}

    async get(
        id: string,
    ): Promise<{ file: Buffer; mimeType: string | undefined }> {
        const file = this.storage.bucket(this.bucketName).file(id);
        let content: Buffer;
        try {
            const downloadedFiles = await file.download();
            if (Number(downloadedFiles.length) === 0)
                throw new FileNotFoundError(id);
            content = downloadedFiles[0];
        } catch (error) {
            if (error.message.includes('No such object'))
                throw new FileNotFoundError(id);
            throw new Error(error);
        }

        const metadata = await file.getMetadata();

        return {
            file: content,
            mimeType: metadata[0].contentType,
        };
    }
    async put(props: {
        id: string;
        file: Buffer;
        mimeType?: string | undefined;
    }): Promise<void> {
        const bucket = this.storage.bucket(this.bucketName);
        const file = bucket.file(props.id);
        return file.save(props.file, {
            metadata: {
                contentType: props.mimeType,
            },
        });
    }
}

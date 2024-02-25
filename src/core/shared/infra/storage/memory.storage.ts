import FileNotFoundError from '@core/shared/domain/errors/file-not-found.error';
import IStorage from '@core/shared/domain/storage.interface';

export default class MemoryStorage implements IStorage {
    private files: Map<string, { file: Buffer; mimeType: string | undefined }> =
        new Map();

    async get(id: string) {
        const fileFound = this.files.get(id);
        if (!fileFound) throw new FileNotFoundError(id);
        return {
            file: fileFound.file,
            mimeType: fileFound.mimeType,
        };
    }

    async put(props: {
        id: string;
        file: Buffer;
        mimeType: string | undefined;
    }) {
        this.files.set(props.id, {
            file: props.file,
            mimeType: props.mimeType,
        });
    }
}

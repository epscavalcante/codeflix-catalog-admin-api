type StorageGetPropsType = string;
type StorageGetReturnType = {
    file: Buffer;
    mimeType: string | undefined;
};
type StoragePutReturnType = void;
type StoragePutPropsType = {
    id: string;
    file: Buffer;
    mimeType?: string;
};

export default interface IStorage {
    get(props: StorageGetPropsType): Promise<StorageGetReturnType>;
    put(props: StoragePutPropsType): Promise<StoragePutReturnType>;
}

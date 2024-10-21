import FileNotFoundError from '@core/shared/domain/errors/file-not-found.error';
import IStorage from '@core/shared/domain/storage.interface';
import { Client as MinioClient } from 'minio';

export default class MinioStorage implements IStorage {
    constructor(
        private storage: MinioClient,
        private bucketName: string,
    ) {}

    async get(
        id: string,
    ): Promise<{ file: Buffer; mimeType: string | undefined }> {
        const dataStream = await this.storage.getObject(this.bucketName, id);
        //let content: Buffer;
        try {
            dataStream.on('data', function (chunk) {
                console.log('data', { chunk });
            });
            dataStream.on('end', function () {
                console.log('End.');
            });
            dataStream.on('error', function (err) {
                console.log(err);
            });
            /*const downloadedFiles = await file();
            if (Number(downloadedFiles.length) === 0)
                throw new FileNotFoundError(id);
            content = downloadedFiles[0];
            */
        } catch (error) {
            if (error.message.includes('No such object'))
                throw new FileNotFoundError(id);
            throw new Error(error);
        }

        return {} as any;

        // const metadata = await file.getMetadata();

        /*
        return {
            file: content,
            mimeType: metadata[0].contentType,
        };
        */
    }

    async put(props: {
        id: string;
        file: Buffer;
        mimeType?: string | undefined;
    }): Promise<void> {
        // Destination bucket
        try {
            const bucket = this.bucketName;

            // Destination object name
            const destinationObject = props.id;

            console.log({ bucket, destinationObject });

            // Check if the bucket exists
            // If it doesn't, create it
            const exists = await this.storage.bucketExists(bucket);
            if (exists) {
                console.log('Bucket ' + bucket + ' exists.');
            } else {
                await this.storage.makeBucket(bucket, 'us-east-1');
                console.log('Bucket ' + bucket + ' created in "us-east-1".');
            }

            // Set the object metadata
            const metaData = {
                'Content-Type': props.mimeType,
                //'X-Amz-Meta-Testing': 1234,
                //example: 5678,
            };

            // Upload the file with fPutObject
            // If an object with the same name exists,
            // it is updated with new data
            await this.storage.putObject(
                bucket,
                destinationObject,
                props.file,
                undefined,
                metaData,
            );
            console.log(
                'File ' +
                    props.id +
                    ' uploaded as object ' +
                    destinationObject +
                    ' in bucket ' +
                    bucket,
            );
        } catch (error) {
            console.log({ error });
        }
    }
}

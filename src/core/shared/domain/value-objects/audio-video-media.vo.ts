import ValueObject from './value-object';

export enum AudioVideoMediaStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

export type AudioVideoMediaConstructorProps = {
    name: string;
    rawLocation: string; // 1 file mp4
    encodedLocation?: string | null; // varios mpd
    status: AudioVideoMediaStatus;
};

export default class AudioVideoMedia extends ValueObject {
    readonly name: string;
    readonly rawLocation: string;
    readonly encodedLocation?: string | null;
    readonly status: AudioVideoMediaStatus;

    constructor(props: AudioVideoMediaConstructorProps) {
        super();
        this.name = props.name;
        this.rawLocation = props.rawLocation;
        this.encodedLocation = props?.encodedLocation ?? null;
        this.status = props.status;
    }

    get url(): string {
        return `${this.rawLocation}/${this.name}`;
    }

    toJson() {
        return {
            name: this.name,
            url: this.url,
            status: this.status,
            rawLocation: this.rawLocation,
            encodedLocation: this.encodedLocation,
        };
    }
}

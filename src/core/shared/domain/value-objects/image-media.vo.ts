import ValueObject from './value-object';

type ImageMediaConstructorProps = {
    name: string;
    location: string;
};

export default class ImageMedia extends ValueObject {
    readonly name: string;
    readonly location: string;

    constructor(props: ImageMediaConstructorProps) {
        super();
        this.name = props.name;
        this.location = props.location;
    }

    get url(): string {
        return `${this.location}/${this.name}`;
    }

    toJson() {
        return {
            name: this.name,
            location: this.location,
            url: this.url,
        };
    }
}

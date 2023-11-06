import { v4 as Uuidv4, validate as ValidateUuid  } from "uuid";
import ValueObject from "./value-object";
import InvalidUuidException from "../errors/uuid-validation.error";

export default class Uuid extends ValueObject {
    readonly value: string;

    constructor(value?: string) {
        super();
        this.value = value || Uuidv4();
        this.validate();
    }

    private validate() {
        const isValid = ValidateUuid(this.value);

        if (!isValid)
            throw new InvalidUuidException();
    }

    toString() {
        return this.value;
    }
}
import InvalidEntityIdException from "../../exceptions/invalid-entity-id-exception";
import { v4 as uuid, validate } from "uuid";
import ValueObject from "./value-object";

export default class EntityId extends ValueObject<string> {
    constructor(readonly id?: string) {
        super(id || uuid());
        this.validate();
    }

    private validate() {
        const isValid = validate(this._value);

        if (!isValid)
            throw new InvalidEntityIdException();
    }
}
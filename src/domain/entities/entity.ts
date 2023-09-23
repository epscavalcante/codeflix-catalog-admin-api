import Uuid from "../value-objects/uuid.vo";
import ValueObject from "../value-objects/value-object";

export default abstract class Entity {
    // public readonly uuid: Uuid;

    // constructor(uuid?: Uuid) {
    //     this.uuid = uuid || new Uuid();
    // }

    abstract toJSON(): any;

    abstract get entityId(): ValueObject;

    // get id(): string {
    //     return this.uuid.value;
    //   }
}
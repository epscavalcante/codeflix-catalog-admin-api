import ValueObject from "../value-objects/value-object";

export default abstract class Entity {
    abstract toJSON(): any;
    abstract get entityId(): ValueObject;
}
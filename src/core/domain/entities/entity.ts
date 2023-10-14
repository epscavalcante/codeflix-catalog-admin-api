import Notification from "../validators/notiification";
import ValueObject from "../value-objects/value-object";

export default abstract class Entity {

    notification: Notification = new Notification();

    abstract toJSON(): any;

    abstract get entityId(): ValueObject;
}
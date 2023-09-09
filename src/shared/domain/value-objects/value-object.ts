import isEqual from 'lodash/isEqual';

export default abstract class ValueObject<TypeValue> {
    protected _value: TypeValue;

    constructor(value: TypeValue) {
        this._value = value;
    }

    get value(): TypeValue {
        return this._value;
    }

    public equals(vo: this): boolean {
        if(vo === null || vo === undefined) {
            return false;
        }

        if(vo.constructor.name !== this.constructor.name) {
            return false;
        }

        return isEqual(vo, this);
    }
}
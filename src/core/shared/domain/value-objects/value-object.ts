import isEqual from 'lodash/isEqual';

export default abstract class ValueObject {
    public equals(vo: this): boolean {
        if (vo === null || vo === undefined) {
            return false;
        }

        if (vo.constructor.name !== this.constructor.name) {
            return false;
        }

        return isEqual(vo, this);
    }
}

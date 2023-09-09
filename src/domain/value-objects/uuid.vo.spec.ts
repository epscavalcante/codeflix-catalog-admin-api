import { validate as validateUuid } from 'uuid';
import Uuid from "./uuid.vo";
import InvalidUuidException from '../exceptions/invalid-uuid.exception';

describe('Uuid VO Unit tests', () => {

    test('Deve lançar exceção de Uuid inválido', () => {
        const validateSpy = jest.spyOn(Uuid.prototype as any, 'validate');
        expect(() => new Uuid('fake id')).toThrow(new InvalidUuidException());
        expect(validateSpy).toHaveBeenCalled();
    });

    test('Deve criar uma Uuid recebendo um uuid', () => {
        const uuidExample = '5fcee0c6-5c6a-414e-931e-b6ffda5831b5';
        const uuid = new Uuid(uuidExample);
        const validateSpy = jest.spyOn(Uuid.prototype as any, 'validate');

        expect(uuid.value).toBe(uuidExample);
        expect(validateSpy).toHaveBeenCalled();
    });

    test('Deve criar uma Uuid', () => {
        const uuid = new Uuid();
        const validateSpy = jest.spyOn(Uuid.prototype as any, 'validate');

        expect(validateUuid(uuid.value)).toBeTruthy();
        expect(validateSpy).toHaveBeenCalled();
    });
});
import InvalidEntityIdException from "../../../exceptions/invalid-entity-id-exception";
import EntityId from "../entity-id.vo"
import { validate as validateUuid } from 'uuid';

describe('Tests EntityId', () => {

    test('Deve lançar exceção de ID Inválida', () => {
        const validateSpy = jest.spyOn(EntityId.prototype as any, 'validate');
        expect(() => new EntityId('fake id')).toThrow(new InvalidEntityIdException());
        expect(validateSpy).toHaveBeenCalled();
    });

    test('Deve criar uma EntityId recebendo um uuid', () => {
        const uuid = '5fcee0c6-5c6a-414e-931e-b6ffda5831b5';
        const entityId = new EntityId(uuid);
        const validateSpy = jest.spyOn(EntityId.prototype as any, 'validate');

        expect(entityId.value).toBe(uuid);
        expect(validateSpy).toHaveBeenCalled();
    });

    test('Deve criar uma EntityId', () => {
        const entityId = new EntityId();
        const validateSpy = jest.spyOn(EntityId.prototype as any, 'validate');

        expect(validateUuid(entityId.value)).toBeTruthy();
        expect(validateSpy).toHaveBeenCalled();
    });
});
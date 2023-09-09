import ValueObject from "../value-object";

class StubValueObject extends ValueObject {
    constructor(readonly value: string) {
        super();
    }
}

class StubValueObjectComplex extends ValueObject {
    constructor(readonly value: string, readonly otherValue: number) {
        super();
    }
}

describe('ValueObject Unit Test', () => {
    test('Deve ser igual - VO Simple', () => {
        const vo1 = new StubValueObject('test');
        const vo2 = new StubValueObject('test');
        expect(vo1.equals(vo2)).toBeTruthy();
    })

    test('Deve ser igual - VO Complex', () => {
        const vo1 = new StubValueObjectComplex('test', 1);
        const vo2 = new StubValueObjectComplex('test', 1);
        expect(vo1.equals(vo2)).toBeTruthy();
    })

    test('Deve ser diferente - VO Simple', () => {
        const vo1 = new StubValueObject('test');
        const vo2 = new StubValueObject('new test');
        expect(vo1.equals(vo2)).toBeFalsy();
    })

    test('Deve ser diferente - VO Complex', () => {
        const vo1 = new StubValueObjectComplex('test', 1);
        const vo2 = new StubValueObjectComplex('new test', 2);
        expect(vo1.equals(vo2)).toBeFalsy();
    })
    test('Deve definir um value do tipo string', () => {
        const valueObject = new StubValueObject('string value');

        expect(valueObject.value).toBe('string value');
        // expect(valueObject.value).toBeInstanceOf(String);
    });

    test('Deve definir um value do tipo Object', () => {
        const valueObject = new StubValueObject({key: 'value'});

        expect(valueObject.value).toStrictEqual({key: 'value'});
        // expect(valueObject.value).toBeInstanceOf(Object);
    });
});
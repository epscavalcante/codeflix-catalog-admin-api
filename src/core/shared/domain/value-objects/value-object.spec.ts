import ValueObject from './value-object';

class StubValueObject extends ValueObject {
    constructor(private readonly value: string) {
        super();
    }
}

class StubValueObjectComplex extends ValueObject {
    constructor(
        readonly val: string,
        readonly otherValue: number,
    ) {
        super();
    }
}

describe('ValueObject Unit Test', () => {
    describe('ValueObject simples', () => {
        test('Deve ser igual', () => {
            const vo1 = new StubValueObject('test');
            const vo2 = new StubValueObject('test');
            expect(vo1.equals(vo2)).toBeTruthy();
        });

        test('Deve ser diferente', () => {
            const vo1 = new StubValueObject('test');
            const vo2 = new StubValueObject('new test');
            expect(vo1.equals(vo2)).toBeFalsy();
        });
    });

    describe('ValueObject complexo', () => {
        test('Deve ser igual', () => {
            const vo1 = new StubValueObjectComplex('test', 1);
            const vo2 = new StubValueObjectComplex('test', 1);
            expect(vo1.equals(vo2)).toBeTruthy();
        });

        test('Deve ser diferente', () => {
            const vo1 = new StubValueObjectComplex('test', 1);
            const vo2 = new StubValueObjectComplex('new test', 2);
            expect(vo1.equals(vo2)).toBeFalsy();
        });
    });
});

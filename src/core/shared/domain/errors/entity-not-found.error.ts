import Entity from '@core/shared/domain/entity';

export default class EntityNotFoundError extends Error {
    constructor(
        param: any | any[],
        entityClass: new (...args: any[]) => Entity,
    ) {
        const ids = Array.isArray(param) ? param.join(', ') : param;
        super(`${entityClass.name} not found using ID: ${ids}`);
        this.name = 'EntityNotFoundError';
    }
}

export class CastMemberTypeError extends Error {
    constructor(invalidType: any) {
        super(`Invalid cast member type: ${invalidType}`);
        this.name = 'CastMemberTypeError';
    }
}

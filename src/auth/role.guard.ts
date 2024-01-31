import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export enum Role {
    MANAGE_CATALOG = 'manage-catalog',
    // add more
}

@Injectable()
export default class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        if (context.getType() !== 'http') return true;
        const request: Request = context.switchToHttp().getRequest();

        if (!('user' in request)) throw new UnauthorizedException();

        const payload = request['user'] as any;
        const realmRoles = payload?.realm_access?.roles || [];

        if (!realmRoles.includes(Role.MANAGE_CATALOG))
            throw new ForbiddenException();
        return true;
    }
}

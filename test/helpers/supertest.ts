import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../../src/auth/role.guard';
import { Test } from 'supertest';

//@ts-expect-error - this is a hack to extend the Test class
Test.prototype.authenticate = function (app: INestApplication, custom = true) {
    const jwtService = app.get(JwtService);
    const token = jwtService.sign(
        custom
            ? {
                  realm_access: {
                      roles: [Role.MANAGE_CATALOG],
                  },
              }
            : {},
        {},
    );
    return this.set('Authorization', `Bearer ${token}`);
};

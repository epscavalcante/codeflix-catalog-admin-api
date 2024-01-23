import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import AuthGuard from './auth.guard';
import AuthService from './auth.service';
import { ConfigService } from '@nestjs/config';
import RolesGuard from './role.guard';

@Global()
@Module({
    imports: [
        JwtModule.registerAsync({
            useFactory: (configService: ConfigService) => {
                return {
                    publicKey: configService.get('JWT_PUBLIC_KEY'),
                    privateKey: configService.get('JWT_PRIVATE_KEY'),
                    signOptions: {
                        algorithm: 'RS256',
                    },
                };
            },
            inject: [ConfigService],
            global: true,
        }),
    ],
    controllers: [
        // authController
    ],
    providers: [AuthGuard],
})
export class AuthModule {}

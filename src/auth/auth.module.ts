import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import AuthGuard from './auth.guard';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
    imports: [
        JwtModule.registerAsync({
            useFactory: (configService: ConfigService) => {
                return {
                    publicKey: Buffer.from(
                        configService.get('JWT_PUBLIC_KEY')! as string,
                        'base64',
                    ).toString('ascii'),
                    privateKey: configService.get('JWT_PRIVATE_KEY'), // usar apenas local
                    signOptions: {
                        algorithm: 'RS256',
                    },
                    verifyOptions: {
                        algorithms: ['RS256'],
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

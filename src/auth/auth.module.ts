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
                    publicKey: configService.get('JWT_PUBLIC_KEY'),
                    // privateKey: configService.get('JWT_PRIVATE_KEY'), // usar apenas local
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

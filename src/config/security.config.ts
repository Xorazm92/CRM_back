import { ConfigService } from '@nestjs/config';

export interface SecurityConfig {
  corsOrigins: string[];
  rateLimitTtl: number;
  rateLimitLimit: number;
  bcryptRounds: number;
  jwtSecret: string;
  accessTokenKey: string;
  refreshTokenKey: string;
  accessTokenTime: string;
  refreshTokenTime: string;
  healthCheckKey: string;
}

export const getSecurityConfig = (configService: ConfigService): SecurityConfig => ({
  corsOrigins: configService.get<string>('CORS_ORIGIN', 'http://localhost:5173').split(','),
  rateLimitTtl: parseInt(configService.get<string>('RATE_LIMIT_TTL', '60')),
  rateLimitLimit: parseInt(configService.get<string>('RATE_LIMIT_LIMIT', '100')),
  bcryptRounds: parseInt(configService.get<string>('BCRYPT_ROUNDS', '12')),
  jwtSecret: configService.get<string>('JWT_SECRET'),
  accessTokenKey: configService.get<string>('ACCESS_TOKEN_KEY'),
  refreshTokenKey: configService.get<string>('REFRESH_TOKEN_KEY'),
  accessTokenTime: configService.get<string>('ACCESS_TOKEN_TIME', '1h'),
  refreshTokenTime: configService.get<string>('REFRESH_TOKEN_TIME', '7d'),
  healthCheckKey: configService.get<string>('HEALTH_CHECK_KEY', 'default-health-key'),
});

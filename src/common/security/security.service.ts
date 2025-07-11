import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { SecurityConfig, getSecurityConfig } from '../../config/security.config';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);
  private readonly config: SecurityConfig;

  constructor(private configService: ConfigService) {
    this.config = getSecurityConfig(configService);
    this.validateConfiguration();
  }

  private validateConfiguration(): void {
    const requiredFields = ['jwtSecret', 'accessTokenKey', 'refreshTokenKey'];
    const missingFields = requiredFields.filter(field => !this.config[field]);
    
    if (missingFields.length > 0) {
      this.logger.error(`Missing required security configuration: ${missingFields.join(', ')}`);
      throw new Error(`Security configuration incomplete: ${missingFields.join(', ')}`);
    }
    
    this.logger.log('Security configuration validated successfully');
  }

  async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.config.bcryptRounds);
    } catch (error) {
      this.logger.error('Password hashing failed', error.stack);
      throw new Error('Password hashing failed');
    }
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      this.logger.error('Password comparison failed', error.stack);
      throw new Error('Password comparison failed');
    }
  }

  getSecurityConfig(): SecurityConfig {
    return { ...this.config };
  }

  isValidHealthCheckKey(key: string): boolean {
    return key === this.config.healthCheckKey;
  }
}

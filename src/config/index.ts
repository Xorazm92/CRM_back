import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common';

dotenv.config();

export type ConfigType = {
  API_PORT: number;
  NODE_ENV: string;
  DB_URL: string;
  ACCESS_TOKEN_KEY: string;
  ACCESS_TOKEN_TIME: string;
  REFRESH_TOKEN_KEY: string;
  REFRESH_TOKEN_TIME: string;
  REDIS_EX_TIME: number;
  // FILE_PATH: string;
};

const requiredVariables = [
  'API_PORT',
  'NODE_ENV',
  'DEV_DB_URL',
  'PROD_DB_URL',
  'ACCESS_TOKEN_KEY',
  'ACCESS_TOKEN_TIME',
  'REFRESH_TOKEN_KEY',
  'REFRESH_TOKEN_TIME',
  'REDIS_EX_TIME',
  // 'FILE_PATH',
];

const missingVariables = requiredVariables.filter((variable) => {
  const value = process.env[variable];
  return !value || value.trim() === '';
});

if (missingVariables.length > 0) {
  Logger.error(
    `Missing or empty required environment variables: ${missingVariables.join(', ')}`,
  );
  process.exit(1);
}

export const config: ConfigType = {
  API_PORT: parseInt(process.env.API_PORT, 10),
  NODE_ENV: process.env.NODE_ENV,
  DB_URL:
    process.env.NODE_ENV === 'dev'
      ? process.env.DEV_DB_URL
      : process.env.PROD_DB_URL,
  ACCESS_TOKEN_KEY: process.env.ACCESS_TOKEN_KEY,
  ACCESS_TOKEN_TIME: process.env.ACCESS_TOKEN_TIME,
  REFRESH_TOKEN_KEY: process.env.REFRESH_TOKEN_KEY,
  REFRESH_TOKEN_TIME: process.env.REFRESH_TOKEN_TIME,
  REDIS_EX_TIME: +process.env.REDIS_EX_TIME,
  // FILE_PATH: process.env.FILE_PATH,
};

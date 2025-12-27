import { registerAs } from '@nestjs/config';

export default registerAs('experiences', () => ({
  enabled: process.env.EXPERIENCES_MODULE_ENABLED === 'true',
  databaseStrategy:
    process.env.EXPERIENCES_DATABASE_STRATEGY ||
    process.env.DATABASE_STRATEGY ||
    'typeorm',
}));

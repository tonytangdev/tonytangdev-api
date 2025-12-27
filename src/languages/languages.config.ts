import { registerAs } from '@nestjs/config';

export default registerAs('languages', () => ({
  enabled: process.env.LANGUAGES_MODULE_ENABLED === 'true',
  databaseStrategy:
    process.env.LANGUAGES_DATABASE_STRATEGY ||
    process.env.DATABASE_STRATEGY ||
    'typeorm',
}));

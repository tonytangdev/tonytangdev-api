import { registerAs } from '@nestjs/config';

export default registerAs('refactorings', () => ({
  enabled: process.env.REFACTORINGS_MODULE_ENABLED === 'true',
  databaseStrategy:
    process.env.REFACTORINGS_DATABASE_STRATEGY ||
    process.env.DATABASE_STRATEGY ||
    'typeorm',
}));

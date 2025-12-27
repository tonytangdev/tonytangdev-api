import { registerAs } from '@nestjs/config';

export default registerAs('education', () => ({
  enabled: process.env.EDUCATION_MODULE_ENABLED === 'true',
  databaseStrategy:
    process.env.EDUCATION_DATABASE_STRATEGY ||
    process.env.DATABASE_STRATEGY ||
    'typeorm',
}));

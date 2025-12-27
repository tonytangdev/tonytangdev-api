import { registerAs } from '@nestjs/config';

export default registerAs('profile', () => ({
  enabled: process.env.PROFILE_MODULE_ENABLED === 'true',
  databaseStrategy:
    process.env.PROFILE_DATABASE_STRATEGY ||
    process.env.DATABASE_STRATEGY ||
    'typeorm',
}));

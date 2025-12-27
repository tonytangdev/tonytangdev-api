import { registerAs } from '@nestjs/config';

export default registerAs('skills', () => ({
  enabled: process.env.SKILLS_MODULE_ENABLED === 'true',
  databaseStrategy:
    process.env.SKILLS_DATABASE_STRATEGY ||
    process.env.DATABASE_STRATEGY ||
    'typeorm',
}));

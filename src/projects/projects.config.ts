import { registerAs } from '@nestjs/config';

export default registerAs('projects', () => ({
  enabled: process.env.PROJECTS_MODULE_ENABLED === 'true',
  databaseStrategy:
    process.env.PROJECTS_DATABASE_STRATEGY ||
    process.env.DATABASE_STRATEGY ||
    'typeorm',
}));

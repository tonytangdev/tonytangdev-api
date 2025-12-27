import { registerAs } from '@nestjs/config';

export default registerAs('skills', () => ({
  enabled: process.env.SKILLS_MODULE_ENABLED === 'true',
}));

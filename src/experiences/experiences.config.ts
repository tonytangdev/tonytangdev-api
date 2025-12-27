import { registerAs } from '@nestjs/config';

export default registerAs('experiences', () => ({
  enabled: process.env.EXPERIENCES_MODULE_ENABLED === 'true',
}));

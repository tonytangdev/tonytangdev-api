import { registerAs } from '@nestjs/config';

export default registerAs('profile', () => ({
  enabled: process.env.PROFILE_MODULE_ENABLED === 'true',
}));

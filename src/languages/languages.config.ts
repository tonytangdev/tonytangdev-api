import { registerAs } from '@nestjs/config';

export default registerAs('languages', () => ({
  enabled: process.env.LANGUAGES_MODULE_ENABLED === 'true',
}));

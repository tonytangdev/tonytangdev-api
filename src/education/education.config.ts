import { registerAs } from '@nestjs/config';

export default registerAs('education', () => ({
  enabled: process.env.EDUCATION_MODULE_ENABLED === 'true',
}));

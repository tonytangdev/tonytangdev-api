import { registerAs } from '@nestjs/config';

export default registerAs('refactorings', () => ({
  enabled: process.env.REFACTORINGS_MODULE_ENABLED === 'true',
}));

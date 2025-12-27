export interface DatabaseConfig {
  mongodbEnabled: boolean;
  postgresqlEnabled: boolean;
  globalStrategy: string;
  moduleStrategies: Record<string, string>;
  enabledModules: string[];
}

export class DatabaseConfigValidator {
  private static readonly VALID_STRATEGIES = [
    'typeorm',
    'mongoose',
    'inmemory',
  ];
  private static readonly MODULE_NAMES = [
    'skills',
    'experiences',
    'education',
    'projects',
    'profile',
    'languages',
    'refactorings',
  ];

  /**
   * Reads database config from env vars
   */
  static readConfig(): DatabaseConfig {
    const mongodbEnabled = process.env.MONGODB_ENABLED === 'true';
    const postgresqlEnabled = process.env.POSTGRESQL_ENABLED === 'true';

    // Default both to true for backwards compatibility
    const finalMongodbEnabled =
      process.env.MONGODB_ENABLED === undefined ? true : mongodbEnabled;
    const finalPostgresqlEnabled =
      process.env.POSTGRESQL_ENABLED === undefined ? true : postgresqlEnabled;

    const globalStrategy = process.env.DATABASE_STRATEGY || '';

    const moduleStrategies: Record<string, string> = {};
    const enabledModules: string[] = [];

    this.MODULE_NAMES.forEach((module) => {
      const envKey = `${module.toUpperCase()}_MODULE_ENABLED`;
      if (process.env[envKey] === 'true') {
        enabledModules.push(module);
        const strategyKey = `${module.toUpperCase()}_DATABASE_STRATEGY`;
        const strategy =
          process.env[strategyKey] || globalStrategy || 'typeorm'; // Match feature module default
        moduleStrategies[module] = strategy;
      }
    });

    return {
      mongodbEnabled: finalMongodbEnabled,
      postgresqlEnabled: finalPostgresqlEnabled,
      globalStrategy,
      moduleStrategies,
      enabledModules,
    };
  }

  /**
   * Validates database configuration
   * Throws descriptive errors if validation fails
   */
  static validate(config: DatabaseConfig): void {
    // Rule 1: At least one database must be enabled
    if (!config.mongodbEnabled && !config.postgresqlEnabled) {
      throw new Error(
        'DATABASE CONFIG ERROR: At least one database must be enabled.\n' +
          'Set MONGODB_ENABLED=true or POSTGRESQL_ENABLED=true (or both).',
      );
    }

    // Rule 2: Validate global DATABASE_STRATEGY if set
    if (config.globalStrategy) {
      if (!this.VALID_STRATEGIES.includes(config.globalStrategy)) {
        throw new Error(
          `DATABASE CONFIG ERROR: Invalid DATABASE_STRATEGY="${config.globalStrategy}".\n` +
            `Must be one of: ${this.VALID_STRATEGIES.join(', ')}`,
        );
      }

      const strategyDb = this.getRequiredDatabase(config.globalStrategy);
      if (strategyDb === 'mongodb' && !config.mongodbEnabled) {
        throw new Error(
          `DATABASE CONFIG ERROR: DATABASE_STRATEGY="${config.globalStrategy}" requires MongoDB.\n` +
            'Set MONGODB_ENABLED=true or change DATABASE_STRATEGY.',
        );
      }
      if (strategyDb === 'postgresql' && !config.postgresqlEnabled) {
        throw new Error(
          `DATABASE CONFIG ERROR: DATABASE_STRATEGY="${config.globalStrategy}" requires PostgreSQL.\n` +
            'Set POSTGRESQL_ENABLED=true or change DATABASE_STRATEGY.',
        );
      }
    }

    // Rule 3: Validate each enabled module's strategy
    for (const [module, strategy] of Object.entries(config.moduleStrategies)) {
      if (!this.VALID_STRATEGIES.includes(strategy)) {
        const envVar = `${module.toUpperCase()}_DATABASE_STRATEGY`;
        throw new Error(
          `DATABASE CONFIG ERROR: Invalid ${envVar}="${strategy}".\n` +
            `Must be one of: ${this.VALID_STRATEGIES.join(', ')}`,
        );
      }

      const requiredDb = this.getRequiredDatabase(strategy);
      if (requiredDb === 'mongodb' && !config.mongodbEnabled) {
        const envVar = `${module.toUpperCase()}_DATABASE_STRATEGY`;
        throw new Error(
          `DATABASE CONFIG ERROR: ${module} module uses strategy="${strategy}" but MongoDB is disabled.\n` +
            `Either:\n` +
            `  1. Set MONGODB_ENABLED=true, or\n` +
            `  2. Change ${envVar} to "typeorm" or "inmemory", or\n` +
            `  3. Disable ${module} module by setting ${module.toUpperCase()}_MODULE_ENABLED=false`,
        );
      }
      if (requiredDb === 'postgresql' && !config.postgresqlEnabled) {
        const envVar = `${module.toUpperCase()}_DATABASE_STRATEGY`;
        throw new Error(
          `DATABASE CONFIG ERROR: ${module} module uses strategy="${strategy}" but PostgreSQL is disabled.\n` +
            `Either:\n` +
            `  1. Set POSTGRESQL_ENABLED=true, or\n` +
            `  2. Change ${envVar} to "mongoose" or "inmemory", or\n` +
            `  3. Disable ${module} module by setting ${module.toUpperCase()}_MODULE_ENABLED=false`,
        );
      }
    }
  }

  /**
   * Returns which database a strategy requires, or null if none (inmemory)
   */
  private static getRequiredDatabase(
    strategy: string,
  ): 'mongodb' | 'postgresql' | null {
    if (strategy === 'mongoose') return 'mongodb';
    if (strategy === 'typeorm') return 'postgresql';
    return null; // inmemory
  }
}

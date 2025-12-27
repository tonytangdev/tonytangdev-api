import { DatabaseConfigValidator, DatabaseConfig } from './database.validator';

describe('DatabaseConfigValidator', () => {
  describe('validate', () => {
    it('should throw if both databases disabled', () => {
      const config: DatabaseConfig = {
        mongodbEnabled: false,
        postgresqlEnabled: false,
        globalStrategy: '',
        moduleStrategies: {},
        enabledModules: [],
      };

      expect(() => DatabaseConfigValidator.validate(config)).toThrow(
        'At least one database must be enabled',
      );
    });

    it('should pass if only MongoDB enabled', () => {
      const config: DatabaseConfig = {
        mongodbEnabled: true,
        postgresqlEnabled: false,
        globalStrategy: '',
        moduleStrategies: {},
        enabledModules: [],
      };

      expect(() => DatabaseConfigValidator.validate(config)).not.toThrow();
    });

    it('should pass if only PostgreSQL enabled', () => {
      const config: DatabaseConfig = {
        mongodbEnabled: false,
        postgresqlEnabled: true,
        globalStrategy: '',
        moduleStrategies: {},
        enabledModules: [],
      };

      expect(() => DatabaseConfigValidator.validate(config)).not.toThrow();
    });

    it('should pass if both databases enabled', () => {
      const config: DatabaseConfig = {
        mongodbEnabled: true,
        postgresqlEnabled: true,
        globalStrategy: '',
        moduleStrategies: {},
        enabledModules: [],
      };

      expect(() => DatabaseConfigValidator.validate(config)).not.toThrow();
    });

    it('should throw if DATABASE_STRATEGY is invalid', () => {
      const config: DatabaseConfig = {
        mongodbEnabled: true,
        postgresqlEnabled: true,
        globalStrategy: 'invalid',
        moduleStrategies: {},
        enabledModules: [],
      };

      expect(() => DatabaseConfigValidator.validate(config)).toThrow(
        'Invalid DATABASE_STRATEGY="invalid"',
      );
    });

    it('should throw if DATABASE_STRATEGY=mongoose but MongoDB disabled', () => {
      const config: DatabaseConfig = {
        mongodbEnabled: false,
        postgresqlEnabled: true,
        globalStrategy: 'mongoose',
        moduleStrategies: {},
        enabledModules: [],
      };

      expect(() => DatabaseConfigValidator.validate(config)).toThrow(
        'DATABASE_STRATEGY="mongoose" requires MongoDB',
      );
    });

    it('should throw if DATABASE_STRATEGY=typeorm but PostgreSQL disabled', () => {
      const config: DatabaseConfig = {
        mongodbEnabled: true,
        postgresqlEnabled: false,
        globalStrategy: 'typeorm',
        moduleStrategies: {},
        enabledModules: [],
      };

      expect(() => DatabaseConfigValidator.validate(config)).toThrow(
        'DATABASE_STRATEGY="typeorm" requires PostgreSQL',
      );
    });

    it('should pass if DATABASE_STRATEGY=inmemory with both databases disabled', () => {
      // This should fail per user requirement - at least one DB must be enabled
      const config: DatabaseConfig = {
        mongodbEnabled: false,
        postgresqlEnabled: false,
        globalStrategy: 'inmemory',
        moduleStrategies: {},
        enabledModules: [],
      };

      expect(() => DatabaseConfigValidator.validate(config)).toThrow(
        'At least one database must be enabled',
      );
    });

    it('should throw if module uses invalid strategy', () => {
      const config: DatabaseConfig = {
        mongodbEnabled: true,
        postgresqlEnabled: true,
        globalStrategy: '',
        moduleStrategies: { skills: 'invalid' },
        enabledModules: ['skills'],
      };

      expect(() => DatabaseConfigValidator.validate(config)).toThrow(
        'Invalid SKILLS_DATABASE_STRATEGY="invalid"',
      );
    });

    it('should throw if module uses mongoose but MongoDB disabled', () => {
      const config: DatabaseConfig = {
        mongodbEnabled: false,
        postgresqlEnabled: true,
        globalStrategy: '',
        moduleStrategies: { skills: 'mongoose' },
        enabledModules: ['skills'],
      };

      expect(() => DatabaseConfigValidator.validate(config)).toThrow(
        'skills module uses strategy="mongoose" but MongoDB is disabled',
      );
    });

    it('should throw if module uses typeorm but PostgreSQL disabled', () => {
      const config: DatabaseConfig = {
        mongodbEnabled: true,
        postgresqlEnabled: false,
        globalStrategy: '',
        moduleStrategies: { projects: 'typeorm' },
        enabledModules: ['projects'],
      };

      expect(() => DatabaseConfigValidator.validate(config)).toThrow(
        'projects module uses strategy="typeorm" but PostgreSQL is disabled',
      );
    });

    it('should pass if module uses inmemory with one database enabled', () => {
      const config: DatabaseConfig = {
        mongodbEnabled: true,
        postgresqlEnabled: false,
        globalStrategy: '',
        moduleStrategies: { skills: 'inmemory' },
        enabledModules: ['skills'],
      };

      expect(() => DatabaseConfigValidator.validate(config)).not.toThrow();
    });

    it('should pass with mixed module strategies on enabled databases', () => {
      const config: DatabaseConfig = {
        mongodbEnabled: true,
        postgresqlEnabled: true,
        globalStrategy: '',
        moduleStrategies: {
          skills: 'mongoose',
          projects: 'typeorm',
          experiences: 'inmemory',
        },
        enabledModules: ['skills', 'projects', 'experiences'],
      };

      expect(() => DatabaseConfigValidator.validate(config)).not.toThrow();
    });

    it('should provide helpful error message with 3 options for module mismatch', () => {
      const config: DatabaseConfig = {
        mongodbEnabled: false,
        postgresqlEnabled: true,
        globalStrategy: '',
        moduleStrategies: { education: 'mongoose' },
        enabledModules: ['education'],
      };

      expect(() => DatabaseConfigValidator.validate(config)).toThrow(
        'Either:\n  1. Set MONGODB_ENABLED=true',
      );
      expect(() => DatabaseConfigValidator.validate(config)).toThrow(
        '2. Change EDUCATION_DATABASE_STRATEGY',
      );
      expect(() => DatabaseConfigValidator.validate(config)).toThrow(
        '3. Disable education module',
      );
    });
  });

  describe('readConfig', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should default both databases to enabled if env vars not set', () => {
      delete process.env.MONGODB_ENABLED;
      delete process.env.POSTGRESQL_ENABLED;

      const config = DatabaseConfigValidator.readConfig();

      expect(config.mongodbEnabled).toBe(true);
      expect(config.postgresqlEnabled).toBe(true);
    });

    it('should read MONGODB_ENABLED=true', () => {
      process.env.MONGODB_ENABLED = 'true';
      process.env.POSTGRESQL_ENABLED = 'true';

      const config = DatabaseConfigValidator.readConfig();

      expect(config.mongodbEnabled).toBe(true);
    });

    it('should read MONGODB_ENABLED=false', () => {
      process.env.MONGODB_ENABLED = 'false';
      process.env.POSTGRESQL_ENABLED = 'true';

      const config = DatabaseConfigValidator.readConfig();

      expect(config.mongodbEnabled).toBe(false);
    });

    it('should read DATABASE_STRATEGY', () => {
      process.env.DATABASE_STRATEGY = 'mongoose';

      const config = DatabaseConfigValidator.readConfig();

      expect(config.globalStrategy).toBe('mongoose');
    });

    it('should read enabled modules and their strategies', () => {
      process.env.SKILLS_MODULE_ENABLED = 'true';
      process.env.SKILLS_DATABASE_STRATEGY = 'mongoose';
      process.env.PROJECTS_MODULE_ENABLED = 'true';
      process.env.PROJECTS_DATABASE_STRATEGY = 'typeorm';

      const config = DatabaseConfigValidator.readConfig();

      expect(config.enabledModules).toContain('skills');
      expect(config.enabledModules).toContain('projects');
      expect(config.moduleStrategies.skills).toBe('mongoose');
      expect(config.moduleStrategies.projects).toBe('typeorm');
    });

    it('should fall back to DATABASE_STRATEGY if module strategy not set', () => {
      process.env.SKILLS_MODULE_ENABLED = 'true';
      process.env.DATABASE_STRATEGY = 'mongoose';
      // No SKILLS_DATABASE_STRATEGY set

      const config = DatabaseConfigValidator.readConfig();

      expect(config.moduleStrategies.skills).toBe('mongoose');
    });

    it('should default to typeorm if no strategy set', () => {
      process.env.SKILLS_MODULE_ENABLED = 'true';
      // No DATABASE_STRATEGY or SKILLS_DATABASE_STRATEGY set

      const config = DatabaseConfigValidator.readConfig();

      expect(config.moduleStrategies.skills).toBe('typeorm');
    });
  });
});

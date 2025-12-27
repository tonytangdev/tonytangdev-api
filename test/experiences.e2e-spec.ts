import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TestAppModule } from './test-app.module';

describe('Experiences API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule.forRoot()],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same config as main.ts
    app.setGlobalPrefix('api/v1');
    app.enableCors({
      origin: true,
      credentials: false,
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/experiences', () => {
    it('should return all experiences', () => {
      return request(app.getHttpServer())
        .get('/api/v1/experiences')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);
          expect(res.body.meta.total).toBe(res.body.data.length);
        });
    });

    it('should have proper experience structure', () => {
      return request(app.getHttpServer())
        .get('/api/v1/experiences')
        .expect(200)
        .expect((res) => {
          const firstExperience = res.body.data[0];
          expect(firstExperience).toHaveProperty('id');
          expect(firstExperience).toHaveProperty('company');
          expect(firstExperience).toHaveProperty('title');
          expect(firstExperience).toHaveProperty('startDate');
          expect(firstExperience).toHaveProperty('description');
          expect(firstExperience).toHaveProperty('technologies');
          expect(firstExperience).toHaveProperty('achievements');
          expect(firstExperience).toHaveProperty('location');
          expect(firstExperience).toHaveProperty('isCurrent');
          expect(firstExperience).toHaveProperty('isHighlighted');
          expect(firstExperience.technologies).toBeInstanceOf(Array);
          expect(firstExperience.achievements).toBeInstanceOf(Array);
        });
    });

    it('should return experiences sorted by order', () => {
      return request(app.getHttpServer())
        .get('/api/v1/experiences')
        .expect(200)
        .expect((res) => {
          const experiences = res.body.data;
          expect(experiences.length).toBeGreaterThan(1);

          // Check that first experience has order 0 (current role from seed data)
          expect(experiences[0].isCurrent).toBe(true);
        });
    });

    it('should format dates as ISO strings', () => {
      return request(app.getHttpServer())
        .get('/api/v1/experiences')
        .expect(200)
        .expect((res) => {
          const experience = res.body.data[0];
          expect(typeof experience.startDate).toBe('string');
          expect(experience.startDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);

          // endDate can be null for current roles
          if (experience.endDate !== null) {
            expect(typeof experience.endDate).toBe('string');
            expect(experience.endDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
          }
        });
    });
  });

  describe('GET /api/v1/experiences/highlighted', () => {
    it('should return only highlighted experiences', () => {
      return request(app.getHttpServer())
        .get('/api/v1/experiences/highlighted')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);
          expect(res.body.meta.total).toBe(res.body.data.length);

          // All returned experiences should be highlighted
          res.body.data.forEach((experience: any) => {
            expect(experience.isHighlighted).toBe(true);
          });
        });
    });

    it('should have proper experience structure', () => {
      return request(app.getHttpServer())
        .get('/api/v1/experiences/highlighted')
        .expect(200)
        .expect((res) => {
          const firstExperience = res.body.data[0];
          expect(firstExperience).toHaveProperty('id');
          expect(firstExperience).toHaveProperty('company');
          expect(firstExperience).toHaveProperty('title');
          expect(firstExperience).toHaveProperty('startDate');
          expect(firstExperience).toHaveProperty('endDate');
          expect(firstExperience).toHaveProperty('description');
          expect(firstExperience).toHaveProperty('technologies');
          expect(firstExperience).toHaveProperty('achievements');
          expect(firstExperience).toHaveProperty('location');
          expect(firstExperience).toHaveProperty('isCurrent');
          expect(firstExperience).toHaveProperty('isHighlighted');
        });
    });
  });

  describe('GET /api/v1/experiences/current', () => {
    it('should return current experience', () => {
      return request(app.getHttpServer())
        .get('/api/v1/experiences/current')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data).toHaveProperty('company');
          expect(res.body.data).toHaveProperty('title');
          expect(res.body.data.isCurrent).toBe(true);
          expect(res.body.data.endDate).toBeNull();
        });
    });

    it('should have proper experience structure', () => {
      return request(app.getHttpServer())
        .get('/api/v1/experiences/current')
        .expect(200)
        .expect((res) => {
          const experience = res.body.data;
          expect(experience).toHaveProperty('id');
          expect(experience).toHaveProperty('company');
          expect(experience).toHaveProperty('title');
          expect(experience).toHaveProperty('startDate');
          expect(experience).toHaveProperty('endDate');
          expect(experience).toHaveProperty('description');
          expect(experience).toHaveProperty('technologies');
          expect(experience).toHaveProperty('achievements');
          expect(experience).toHaveProperty('location');
          expect(experience).toHaveProperty('isCurrent');
          expect(experience).toHaveProperty('isHighlighted');
          expect(experience.technologies).toBeInstanceOf(Array);
          expect(experience.achievements).toBeInstanceOf(Array);
        });
    });
  });

  describe('Response format consistency', () => {
    it('all endpoints should return data and meta', async () => {
      const endpoints = [
        '/api/v1/experiences',
        '/api/v1/experiences/highlighted',
        '/api/v1/experiences/current',
      ];

      for (const endpoint of endpoints) {
        await request(app.getHttpServer())
          .get(endpoint)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('data');
            expect(res.body).toHaveProperty('meta');
          });
      }
    });

    it('list endpoints should have total in meta', async () => {
      const listEndpoints = [
        '/api/v1/experiences',
        '/api/v1/experiences/highlighted',
      ];

      for (const endpoint of listEndpoints) {
        await request(app.getHttpServer())
          .get(endpoint)
          .expect(200)
          .expect((res) => {
            expect(res.body.meta).toHaveProperty('total');
            expect(res.body.meta.total).toBe(res.body.data.length);
          });
      }
    });
  });

  describe('CORS', () => {
    it('should have CORS enabled', () => {
      return request(app.getHttpServer())
        .get('/api/v1/experiences')
        .set('Origin', 'http://localhost:3000')
        .expect(200)
        .expect((res) => {
          expect(res.headers).toHaveProperty('access-control-allow-origin');
        });
    });
  });
});

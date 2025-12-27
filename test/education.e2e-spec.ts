import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TestAppModule } from './test-app.module';

describe('Education API (e2e)', () => {
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

  describe('GET /api/v1/education', () => {
    it('should return all education entries', () => {
      return request(app.getHttpServer())
        .get('/api/v1/education')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);
          expect(res.body.meta.total).toBe(res.body.data.length);
        });
    });

    it('should have proper education structure', () => {
      return request(app.getHttpServer())
        .get('/api/v1/education')
        .expect(200)
        .expect((res) => {
          const firstEducation = res.body.data[0];
          expect(firstEducation).toHaveProperty('id');
          expect(firstEducation).toHaveProperty('institution');
          expect(firstEducation).toHaveProperty('degreeType');
          expect(firstEducation).toHaveProperty('fieldOfStudy');
          expect(firstEducation).toHaveProperty('startDate');
          expect(firstEducation).toHaveProperty('endDate');
          expect(firstEducation).toHaveProperty('description');
          expect(firstEducation).toHaveProperty('achievements');
          expect(firstEducation).toHaveProperty('location');
          expect(firstEducation).toHaveProperty('status');
          expect(firstEducation).toHaveProperty('isHighlighted');
          expect(firstEducation.achievements).toBeInstanceOf(Array);
        });
    });

    it('should return education sorted by order', () => {
      return request(app.getHttpServer())
        .get('/api/v1/education')
        .expect(200)
        .expect((res) => {
          const educations = res.body.data;
          expect(educations.length).toBeGreaterThan(1);

          // Check that first education has order 0 (from seed data)
          expect(educations[0].institution).toBe('Stanford University');
        });
    });

    it('should format dates as ISO strings', () => {
      return request(app.getHttpServer())
        .get('/api/v1/education')
        .expect(200)
        .expect((res) => {
          const education = res.body.data[0];
          expect(typeof education.startDate).toBe('string');
          expect(education.startDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);

          // endDate can be null for in-progress education
          if (education.endDate !== null) {
            expect(typeof education.endDate).toBe('string');
            expect(education.endDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
          }
        });
    });
  });

  describe('GET /api/v1/education/highlighted', () => {
    it('should return only highlighted education', () => {
      return request(app.getHttpServer())
        .get('/api/v1/education/highlighted')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);
          expect(res.body.meta.total).toBe(res.body.data.length);

          // All returned education should be highlighted
          res.body.data.forEach((education: any) => {
            expect(education.isHighlighted).toBe(true);
          });
        });
    });

    it('should have proper education structure', () => {
      return request(app.getHttpServer())
        .get('/api/v1/education/highlighted')
        .expect(200)
        .expect((res) => {
          const firstEducation = res.body.data[0];
          expect(firstEducation).toHaveProperty('id');
          expect(firstEducation).toHaveProperty('institution');
          expect(firstEducation).toHaveProperty('degreeType');
          expect(firstEducation).toHaveProperty('fieldOfStudy');
          expect(firstEducation).toHaveProperty('startDate');
          expect(firstEducation).toHaveProperty('endDate');
          expect(firstEducation).toHaveProperty('description');
          expect(firstEducation).toHaveProperty('achievements');
          expect(firstEducation).toHaveProperty('location');
          expect(firstEducation).toHaveProperty('status');
          expect(firstEducation).toHaveProperty('isHighlighted');
        });
    });
  });

  describe('GET /api/v1/education/in-progress', () => {
    it('should return in-progress education', () => {
      return request(app.getHttpServer())
        .get('/api/v1/education/in-progress')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.data).toBeInstanceOf(Array);

          // All returned education should be in-progress
          res.body.data.forEach((education: any) => {
            expect(education.status).toBe('in_progress');
            expect(education.endDate).toBeNull();
          });
        });
    });

    it('should have proper education structure', () => {
      return request(app.getHttpServer())
        .get('/api/v1/education/in-progress')
        .expect(200)
        .expect((res) => {
          if (res.body.data.length > 0) {
            const education = res.body.data[0];
            expect(education).toHaveProperty('id');
            expect(education).toHaveProperty('institution');
            expect(education).toHaveProperty('degreeType');
            expect(education).toHaveProperty('fieldOfStudy');
            expect(education).toHaveProperty('startDate');
            expect(education).toHaveProperty('endDate');
            expect(education).toHaveProperty('description');
            expect(education).toHaveProperty('achievements');
            expect(education).toHaveProperty('location');
            expect(education).toHaveProperty('status');
            expect(education).toHaveProperty('isHighlighted');
            expect(education.achievements).toBeInstanceOf(Array);
          }
        });
    });
  });

  describe('Response format consistency', () => {
    it('all endpoints should return data and meta', async () => {
      const endpoints = [
        '/api/v1/education',
        '/api/v1/education/highlighted',
        '/api/v1/education/in-progress',
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
        '/api/v1/education',
        '/api/v1/education/highlighted',
        '/api/v1/education/in-progress',
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
        .get('/api/v1/education')
        .set('Origin', 'http://localhost:3000')
        .expect(200)
        .expect((res) => {
          expect(res.headers).toHaveProperty('access-control-allow-origin');
        });
    });
  });
});

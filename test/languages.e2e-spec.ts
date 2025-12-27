import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TestAppModule } from './test-app.module';

describe('Languages API (e2e)', () => {
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

  describe('GET /api/v1/languages', () => {
    it('should return all languages', () => {
      return request(app.getHttpServer())
        .get('/api/v1/languages')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);
          expect(res.body.meta.total).toBe(res.body.data.length);
        });
    });

    it('should have proper language structure', () => {
      return request(app.getHttpServer())
        .get('/api/v1/languages')
        .expect(200)
        .expect((res) => {
          const firstLanguage = res.body.data[0];
          expect(firstLanguage).toHaveProperty('id');
          expect(firstLanguage).toHaveProperty('name');
          expect(firstLanguage).toHaveProperty('proficiency');
          expect(firstLanguage).toHaveProperty('isNative');
          expect(firstLanguage).toHaveProperty('isHighlighted');
        });
    });

    it('should return languages sorted by order', () => {
      return request(app.getHttpServer())
        .get('/api/v1/languages')
        .expect(200)
        .expect((res) => {
          const languages = res.body.data;
          expect(languages.length).toBeGreaterThan(1);

          // Check that first language is English (native, order 0 from seed data)
          expect(languages[0].name).toBe('English');
          expect(languages[0].isNative).toBe(true);
        });
    });

    it('should include proficiency levels', () => {
      return request(app.getHttpServer())
        .get('/api/v1/languages')
        .expect(200)
        .expect((res) => {
          const language = res.body.data[0];
          expect(typeof language.proficiency).toBe('string');
          expect([
            'elementary',
            'limited_working',
            'professional_working',
            'full_professional',
            'native',
          ]).toContain(language.proficiency);
        });
    });
  });

  describe('GET /api/v1/languages/highlighted', () => {
    it('should return only highlighted languages', () => {
      return request(app.getHttpServer())
        .get('/api/v1/languages/highlighted')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);
          expect(res.body.meta.total).toBe(res.body.data.length);

          // All returned languages should be highlighted
          res.body.data.forEach((language: any) => {
            expect(language.isHighlighted).toBe(true);
          });
        });
    });

    it('should have proper language structure', () => {
      return request(app.getHttpServer())
        .get('/api/v1/languages/highlighted')
        .expect(200)
        .expect((res) => {
          const firstLanguage = res.body.data[0];
          expect(firstLanguage).toHaveProperty('id');
          expect(firstLanguage).toHaveProperty('name');
          expect(firstLanguage).toHaveProperty('proficiency');
          expect(firstLanguage).toHaveProperty('isNative');
          expect(firstLanguage).toHaveProperty('isHighlighted');
        });
    });
  });

  describe('GET /api/v1/languages/native', () => {
    it('should return only native languages', () => {
      return request(app.getHttpServer())
        .get('/api/v1/languages/native')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);
          expect(res.body.meta.total).toBe(res.body.data.length);

          // All returned languages should be native
          res.body.data.forEach((language: any) => {
            expect(language.isNative).toBe(true);
          });
        });
    });

    it('should have proper language structure', () => {
      return request(app.getHttpServer())
        .get('/api/v1/languages/native')
        .expect(200)
        .expect((res) => {
          const firstLanguage = res.body.data[0];
          expect(firstLanguage).toHaveProperty('id');
          expect(firstLanguage).toHaveProperty('name');
          expect(firstLanguage).toHaveProperty('proficiency');
          expect(firstLanguage).toHaveProperty('isNative');
          expect(firstLanguage).toHaveProperty('isHighlighted');
        });
    });
  });

  describe('Response format consistency', () => {
    it('all endpoints should return data and meta', async () => {
      const endpoints = [
        '/api/v1/languages',
        '/api/v1/languages/highlighted',
        '/api/v1/languages/native',
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
        '/api/v1/languages',
        '/api/v1/languages/highlighted',
        '/api/v1/languages/native',
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
        .get('/api/v1/languages')
        .set('Origin', 'http://localhost:3000')
        .expect(200)
        .expect((res) => {
          expect(res.headers).toHaveProperty('access-control-allow-origin');
        });
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Skills API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule.forRoot()],
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

  describe('GET /api/v1/skills', () => {
    it('should return all skills grouped by category', () => {
      return request(app.getHttpServer())
        .get('/api/v1/skills')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);
          expect(res.body.data[0]).toHaveProperty('id');
          expect(res.body.data[0]).toHaveProperty('name');
          expect(res.body.data[0]).toHaveProperty('slug');
          expect(res.body.data[0]).toHaveProperty('skills');
          expect(res.body.data[0].skills).toBeInstanceOf(Array);
          expect(res.body.meta.total).toBe(res.body.data.length);
        });
    });

    it('should have proper skill structure', () => {
      return request(app.getHttpServer())
        .get('/api/v1/skills')
        .expect(200)
        .expect((res) => {
          const firstSkill = res.body.data[0].skills[0];
          expect(firstSkill).toHaveProperty('id');
          expect(firstSkill).toHaveProperty('name');
          expect(firstSkill).toHaveProperty('proficiency');
          expect(firstSkill).toHaveProperty('isHighlighted');
          expect(['beginner', 'intermediate', 'advanced', 'expert']).toContain(
            firstSkill.proficiency,
          );
        });
    });
  });

  describe('GET /api/v1/skills/categories', () => {
    it('should return all categories', () => {
      return request(app.getHttpServer())
        .get('/api/v1/skills/categories')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });
  });

  describe('GET /api/v1/skills/categories/:slug', () => {
    it('should return skills for valid category', () => {
      return request(app.getHttpServer())
        .get('/api/v1/skills/categories/programming-languages')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data).toHaveProperty('name');
          expect(res.body.data).toHaveProperty('slug');
          expect(res.body.data).toHaveProperty('skills');
          expect(res.body.data.slug).toBe('programming-languages');
          expect(res.body.data.skills).toBeInstanceOf(Array);
          expect(res.body.meta.total).toBe(res.body.data.skills.length);
        });
    });

    it('should return 404 for non-existent category', () => {
      return request(app.getHttpServer())
        .get('/api/v1/skills/categories/non-existent')
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 404);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('non-existent');
        });
    });
  });

  describe('GET /api/v1/skills/highlighted', () => {
    it('should return only highlighted skills', () => {
      return request(app.getHttpServer())
        .get('/api/v1/skills/highlighted')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);
          expect(res.body.meta.total).toBe(res.body.data.length);

          // All returned skills should be highlighted
          res.body.data.forEach((skill: any) => {
            expect(skill.isHighlighted).toBe(true);
          });
        });
    });

    it('should have proper skill structure', () => {
      return request(app.getHttpServer())
        .get('/api/v1/skills/highlighted')
        .expect(200)
        .expect((res) => {
          const firstSkill = res.body.data[0];
          expect(firstSkill).toHaveProperty('id');
          expect(firstSkill).toHaveProperty('name');
          expect(firstSkill).toHaveProperty('proficiency');
          expect(firstSkill).toHaveProperty('yearsOfExperience');
          expect(firstSkill).toHaveProperty('isHighlighted');
        });
    });
  });

  describe('Response format consistency', () => {
    it('all endpoints should return data and meta', async () => {
      const endpoints = [
        '/api/v1/skills',
        '/api/v1/skills/categories',
        '/api/v1/skills/categories/programming-languages',
        '/api/v1/skills/highlighted',
      ];

      for (const endpoint of endpoints) {
        await request(app.getHttpServer())
          .get(endpoint)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('data');
            expect(res.body).toHaveProperty('meta');
            expect(res.body.meta).toHaveProperty('total');
          });
      }
    });
  });

  describe('CORS', () => {
    it('should have CORS enabled', () => {
      return request(app.getHttpServer())
        .get('/api/v1/skills')
        .set('Origin', 'http://localhost:3000')
        .expect(200)
        .expect((res) => {
          expect(res.headers).toHaveProperty('access-control-allow-origin');
        });
    });
  });
});

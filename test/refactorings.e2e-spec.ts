import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Refactorings API (e2e)', () => {
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

  describe('GET /api/v1/refactorings', () => {
    it('should return all refactoring showcases with pagination', () => {
      return request(app.getHttpServer())
        .get('/api/v1/refactorings')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);
          expect(res.body.meta).toHaveProperty('total');
          expect(res.body.meta).toHaveProperty('page');
          expect(res.body.meta).toHaveProperty('limit');
          expect(res.body.meta).toHaveProperty('totalPages');
        });
    });

    it('should have proper list structure (no nested steps)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/refactorings')
        .expect(200)
        .expect((res) => {
          const firstShowcase = res.body.data[0];
          expect(firstShowcase).toHaveProperty('id');
          expect(firstShowcase).toHaveProperty('title');
          expect(firstShowcase).toHaveProperty('description');
          expect(firstShowcase).toHaveProperty('technologies');
          expect(firstShowcase).toHaveProperty('difficulty');
          expect(firstShowcase).toHaveProperty('tags');
          expect(firstShowcase).toHaveProperty('isHighlighted');
          expect(firstShowcase).toHaveProperty('stepCount');
          expect(firstShowcase.technologies).toBeInstanceOf(Array);
          expect(firstShowcase.tags).toBeInstanceOf(Array);
          // Should NOT have steps in list view
          expect(firstShowcase).not.toHaveProperty('steps');
        });
    });

    it('should return showcases sorted by order', () => {
      return request(app.getHttpServer())
        .get('/api/v1/refactorings')
        .expect(200)
        .expect((res) => {
          const showcases = res.body.data;
          expect(showcases.length).toBeGreaterThan(0);
          expect(showcases[0].title).toBe('Extract Method Refactoring');
        });
    });

    it('should support pagination with page and limit', () => {
      return request(app.getHttpServer())
        .get('/api/v1/refactorings?page=1&limit=1')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBe(1);
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.limit).toBe(1);
          expect(res.body.meta.totalPages).toBeGreaterThanOrEqual(1);
        });
    });

    it('should filter by difficulty', () => {
      return request(app.getHttpServer())
        .get('/api/v1/refactorings?difficulty=beginner')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          res.body.data.forEach((showcase: any) => {
            expect(showcase.difficulty).toBe('beginner');
          });
        });
    });

    it('should filter by tag', () => {
      return request(app.getHttpServer())
        .get('/api/v1/refactorings?tag=clean-code')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          res.body.data.forEach((showcase: any) => {
            expect(showcase.tags).toContain('clean-code');
          });
        });
    });

    it('should filter by technology', () => {
      return request(app.getHttpServer())
        .get('/api/v1/refactorings?technology=typescript')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          res.body.data.forEach((showcase: any) => {
            const hasTech = showcase.technologies.some((t: string) =>
              t.toLowerCase().includes('typescript'),
            );
            expect(hasTech).toBe(true);
          });
        });
    });

    it('should support combined filters', () => {
      return request(app.getHttpServer())
        .get(
          '/api/v1/refactorings?difficulty=beginner&tag=clean-code&page=1&limit=5',
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.limit).toBe(5);
        });
    });

    it('should return empty array for non-existent filters', () => {
      return request(app.getHttpServer())
        .get('/api/v1/refactorings?tag=nonexistent-tag')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBe(0);
          expect(res.body.meta.total).toBe(0);
        });
    });
  });

  describe('GET /api/v1/refactorings/highlighted', () => {
    it('should return only highlighted showcases', () => {
      return request(app.getHttpServer())
        .get('/api/v1/refactorings/highlighted')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);
          res.body.data.forEach((showcase: any) => {
            expect(showcase.isHighlighted).toBe(true);
          });
        });
    });

    it('should have proper list structure', () => {
      return request(app.getHttpServer())
        .get('/api/v1/refactorings/highlighted')
        .expect(200)
        .expect((res) => {
          if (res.body.data.length > 0) {
            const showcase = res.body.data[0];
            expect(showcase).toHaveProperty('stepCount');
            expect(showcase).not.toHaveProperty('steps');
          }
        });
    });
  });

  describe('GET /api/v1/refactorings/:id', () => {
    it('should return showcase by valid ID with full nested structure', () => {
      return request(app.getHttpServer())
        .get('/api/v1/refactorings/1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.id).toBe('1');
          expect(res.body.data).toHaveProperty('title');
        });
    });

    it('should have full nested structure with steps and files', () => {
      return request(app.getHttpServer())
        .get('/api/v1/refactorings/1')
        .expect(200)
        .expect((res) => {
          const showcase = res.body.data;
          expect(showcase).toHaveProperty('id');
          expect(showcase).toHaveProperty('title');
          expect(showcase).toHaveProperty('description');
          expect(showcase).toHaveProperty('technologies');
          expect(showcase).toHaveProperty('difficulty');
          expect(showcase).toHaveProperty('tags');
          expect(showcase).toHaveProperty('isHighlighted');
          expect(showcase).toHaveProperty('steps');
          expect(showcase.steps).toBeInstanceOf(Array);
          expect(showcase.steps.length).toBeGreaterThan(0);
        });
    });

    it('should have proper step structure', () => {
      return request(app.getHttpServer())
        .get('/api/v1/refactorings/1')
        .expect(200)
        .expect((res) => {
          const firstStep = res.body.data.steps[0];
          expect(firstStep).toHaveProperty('id');
          expect(firstStep).toHaveProperty('title');
          expect(firstStep).toHaveProperty('description');
          expect(firstStep).toHaveProperty('explanation');
          expect(firstStep).toHaveProperty('order');
          expect(firstStep).toHaveProperty('files');
          expect(firstStep.files).toBeInstanceOf(Array);
        });
    });

    it('should have proper file structure', () => {
      return request(app.getHttpServer())
        .get('/api/v1/refactorings/1')
        .expect(200)
        .expect((res) => {
          const firstFile = res.body.data.steps[0].files[0];
          expect(firstFile).toHaveProperty('filename');
          expect(firstFile).toHaveProperty('language');
          expect(firstFile).toHaveProperty('content');
          expect(firstFile).toHaveProperty('order');
          expect(typeof firstFile.content).toBe('string');
          expect(firstFile.content.length).toBeGreaterThan(0);
        });
    });

    it('should have steps sorted by order', () => {
      return request(app.getHttpServer())
        .get('/api/v1/refactorings/1')
        .expect(200)
        .expect((res) => {
          const steps = res.body.data.steps;
          expect(steps.length).toBeGreaterThan(1);
          for (let i = 0; i < steps.length - 1; i++) {
            expect(steps[i].order).toBeLessThanOrEqual(steps[i + 1].order);
          }
        });
    });

    it('should return 404 for non-existent ID', () => {
      return request(app.getHttpServer())
        .get('/api/v1/refactorings/999')
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('not found');
        });
    });
  });

  describe('Response format consistency', () => {
    it('all endpoints should return data and meta', async () => {
      const endpoints = [
        '/api/v1/refactorings',
        '/api/v1/refactorings/highlighted',
        '/api/v1/refactorings/1',
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
        '/api/v1/refactorings',
        '/api/v1/refactorings/highlighted',
      ];

      for (const endpoint of listEndpoints) {
        await request(app.getHttpServer())
          .get(endpoint)
          .expect(200)
          .expect((res) => {
            expect(res.body.meta).toHaveProperty('total');
          });
      }
    });

    it('main list endpoint should have pagination metadata', () => {
      return request(app.getHttpServer())
        .get('/api/v1/refactorings')
        .expect(200)
        .expect((res) => {
          expect(res.body.meta).toHaveProperty('page');
          expect(res.body.meta).toHaveProperty('limit');
          expect(res.body.meta).toHaveProperty('totalPages');
        });
    });
  });

  describe('CORS', () => {
    it('should have CORS enabled', () => {
      return request(app.getHttpServer())
        .get('/api/v1/refactorings')
        .set('Origin', 'http://localhost:3000')
        .expect(200)
        .expect((res) => {
          expect(res.headers).toHaveProperty('access-control-allow-origin');
        });
    });
  });
});

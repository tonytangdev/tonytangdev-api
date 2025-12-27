import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Projects API (e2e)', () => {
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

  describe('GET /api/v1/projects', () => {
    it('should return all projects', () => {
      return request(app.getHttpServer())
        .get('/api/v1/projects')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);
          expect(res.body.meta.total).toBe(res.body.data.length);
        });
    });

    it('should have proper project structure', () => {
      return request(app.getHttpServer())
        .get('/api/v1/projects')
        .expect(200)
        .expect((res) => {
          const firstProject = res.body.data[0];
          expect(firstProject).toHaveProperty('id');
          expect(firstProject).toHaveProperty('name');
          expect(firstProject).toHaveProperty('description');
          expect(firstProject).toHaveProperty('startDate');
          expect(firstProject).toHaveProperty('endDate');
          expect(firstProject).toHaveProperty('technologies');
          expect(firstProject).toHaveProperty('repositoryLink');
          expect(firstProject).toHaveProperty('demoLink');
          expect(firstProject).toHaveProperty('websiteLink');
          expect(firstProject).toHaveProperty('achievements');
          expect(firstProject).toHaveProperty('isHighlighted');
          expect(firstProject.technologies).toBeInstanceOf(Array);
          expect(firstProject.achievements).toBeInstanceOf(Array);
        });
    });

    it('should return projects sorted by order', () => {
      return request(app.getHttpServer())
        .get('/api/v1/projects')
        .expect(200)
        .expect((res) => {
          const projects = res.body.data;
          expect(projects.length).toBeGreaterThan(1);

          // Check that first project has order 0
          expect(projects[0].name).toBe('Portfolio API');
        });
    });

    it('should format dates as ISO strings', () => {
      return request(app.getHttpServer())
        .get('/api/v1/projects')
        .expect(200)
        .expect((res) => {
          const project = res.body.data[0];
          expect(typeof project.startDate).toBe('string');
          expect(project.startDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);

          // endDate can be null for ongoing projects
          if (project.endDate !== null) {
            expect(typeof project.endDate).toBe('string');
            expect(project.endDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
          }
        });
    });
  });

  describe('GET /api/v1/projects/:id', () => {
    it('should return project by valid ID', () => {
      return request(app.getHttpServer())
        .get('/api/v1/projects/1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.id).toBe('1');
          expect(res.body.data).toHaveProperty('name');
        });
    });

    it('should have proper project structure', () => {
      return request(app.getHttpServer())
        .get('/api/v1/projects/1')
        .expect(200)
        .expect((res) => {
          const project = res.body.data;
          expect(project).toHaveProperty('id');
          expect(project).toHaveProperty('name');
          expect(project).toHaveProperty('description');
          expect(project).toHaveProperty('startDate');
          expect(project).toHaveProperty('endDate');
          expect(project).toHaveProperty('technologies');
          expect(project).toHaveProperty('repositoryLink');
          expect(project).toHaveProperty('demoLink');
          expect(project).toHaveProperty('websiteLink');
          expect(project).toHaveProperty('achievements');
          expect(project).toHaveProperty('isHighlighted');
          expect(project.technologies).toBeInstanceOf(Array);
          expect(project.achievements).toBeInstanceOf(Array);
        });
    });

    it('should return 404 for non-existent ID', () => {
      return request(app.getHttpServer())
        .get('/api/v1/projects/999')
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('not found');
        });
    });
  });

  describe('GET /api/v1/projects/technologies/:slug', () => {
    it('should return projects using TypeScript', () => {
      return request(app.getHttpServer())
        .get('/api/v1/projects/technologies/typescript')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);
          expect(res.body.meta.total).toBe(res.body.data.length);

          // All projects should include TypeScript
          res.body.data.forEach((project: any) => {
            const hasTech = project.technologies.some((t: string) =>
              t.toLowerCase().includes('typescript'),
            );
            expect(hasTech).toBe(true);
          });
        });
    });

    it('should handle slug normalization (Next.js -> next-js)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/projects/technologies/next-js')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBeGreaterThan(0);

          // Should find projects with "Next.js" technology
          res.body.data.forEach((project: any) => {
            const hasTech = project.technologies.some(
              (t: string) =>
                t.toLowerCase().replace(/[.\s]+/g, '-') === 'next-js',
            );
            expect(hasTech).toBe(true);
          });
        });
    });

    it('should return empty array for non-existent technology', () => {
      return request(app.getHttpServer())
        .get('/api/v1/projects/technologies/nonexistent-tech')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.data.length).toBe(0);
          expect(res.body.meta.total).toBe(0);
        });
    });

    it('should return projects sorted by order', () => {
      return request(app.getHttpServer())
        .get('/api/v1/projects/technologies/typescript')
        .expect(200)
        .expect((res) => {
          const projects = res.body.data;
          if (projects.length > 1) {
            // Verify first project is Portfolio API (order 0)
            expect(projects[0].name).toBe('Portfolio API');
          }
        });
    });

    it('should have proper project structure', () => {
      return request(app.getHttpServer())
        .get('/api/v1/projects/technologies/typescript')
        .expect(200)
        .expect((res) => {
          if (res.body.data.length > 0) {
            const project = res.body.data[0];
            expect(project).toHaveProperty('id');
            expect(project).toHaveProperty('name');
            expect(project).toHaveProperty('description');
            expect(project).toHaveProperty('technologies');
            expect(project).toHaveProperty('achievements');
          }
        });
    });
  });

  describe('Response format consistency', () => {
    it('all endpoints should return data and meta', async () => {
      const endpoints = [
        '/api/v1/projects',
        '/api/v1/projects/1',
        '/api/v1/projects/technologies/typescript',
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
        '/api/v1/projects',
        '/api/v1/projects/technologies/typescript',
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
        .get('/api/v1/projects')
        .set('Origin', 'http://localhost:3000')
        .expect(200)
        .expect((res) => {
          expect(res.headers).toHaveProperty('access-control-allow-origin');
        });
    });
  });
});

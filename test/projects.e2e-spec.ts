import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TestAppModule } from './test-app.module';

describe('Projects API (e2e)', () => {
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

  describe('POST /api/v1/projects', () => {
    const validApiKey = 'test-api-key';

    it('should create a new project with valid data', () => {
      const projectName = `E-commerce Platform ${Date.now()}`;
      return request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('x-api-key', validApiKey)
        .send({
          name: projectName,
          description: 'A full-featured e-commerce platform',
          startDate: '2024-01-15',
          technologies: ['TypeScript', 'React', 'Node.js'],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.name).toBe(projectName);
          expect(res.body.data.description).toBe(
            'A full-featured e-commerce platform',
          );
          expect(res.body.data.technologies).toContain('TypeScript');
          expect(res.body.data.startDate).toBeTruthy();
          expect(res.body.data.isHighlighted).toBe(false);
          expect(res.body.meta).toEqual({});
        });
    });

    it('should create project with all fields', () => {
      const projectName = `Portfolio Website ${Date.now()}`;
      return request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('x-api-key', validApiKey)
        .send({
          name: projectName,
          description: 'Personal portfolio with blog',
          startDate: '2023-06-01',
          endDate: '2023-12-31',
          technologies: ['Next.js', 'TypeScript'],
          repositoryLink: 'https://github.com/user/portfolio',
          demoLink: 'https://demo.portfolio.com',
          websiteLink: 'https://portfolio.com',
          achievements: ['Featured on Product Hunt', '1000+ visitors'],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.name).toBe(projectName);
          expect(res.body.data.endDate).toBeTruthy();
          expect(res.body.data.repositoryLink).toBe(
            'https://github.com/user/portfolio',
          );
          expect(res.body.data.achievements).toEqual([
            'Featured on Product Hunt',
            '1000+ visitors',
          ]);
        });
    });

    it('should reject request without API key', () => {
      return request(app.getHttpServer())
        .post('/api/v1/projects')
        .send({
          name: 'Test Project',
          description: 'A test project',
          startDate: '2024-01-01',
          technologies: ['JavaScript'],
        })
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 401);
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should reject request with invalid API key', () => {
      return request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('x-api-key', 'invalid-key')
        .send({
          name: 'Test Project',
          description: 'A test project',
          startDate: '2024-01-01',
          technologies: ['JavaScript'],
        })
        .expect(401);
    });

    it('should reject duplicate project name', async () => {
      const projectData = {
        name: 'Unique Project Name',
        description: 'A unique project',
        startDate: '2024-02-01',
        technologies: ['Vue.js'],
      };

      // Create first project
      await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('x-api-key', validApiKey)
        .send(projectData)
        .expect(201);

      // Try to create duplicate
      return request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('x-api-key', validApiKey)
        .send(projectData)
        .expect(409)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 409);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('already exists');
        });
    });

    it('should reject missing required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('x-api-key', validApiKey)
        .send({
          name: 'Incomplete Project',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 400);
        });
    });

    it('should reject invalid URL format for repositoryLink', () => {
      return request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('x-api-key', validApiKey)
        .send({
          name: 'Project with Invalid URL',
          description: 'Testing invalid URL',
          startDate: '2024-03-01',
          technologies: ['React'],
          repositoryLink: 'not-a-valid-url',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 400);
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should reject invalid URL format for demoLink', () => {
      return request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('x-api-key', validApiKey)
        .send({
          name: 'Project with Invalid Demo URL',
          description: 'Testing invalid demo URL',
          startDate: '2024-03-01',
          technologies: ['React'],
          demoLink: 'invalid-demo-url',
        })
        .expect(400);
    });

    it('should reject empty technologies array', () => {
      return request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('x-api-key', validApiKey)
        .send({
          name: 'Project without Technologies',
          description: 'Testing empty technologies',
          startDate: '2024-03-01',
          technologies: [],
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 400);
        });
    });

    it('should auto-increment order correctly', async () => {
      // Get current projects to determine max order
      const getAllRes = await request(app.getHttpServer())
        .get('/api/v1/projects')
        .expect(200);

      const maxOrder = Math.max(
        ...getAllRes.body.data.map((p: any) => p.order || 0),
      );

      // Create a new project
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('x-api-key', validApiKey)
        .send({
          name: 'Order Test Project',
          description: 'Testing order auto-increment',
          startDate: '2024-04-01',
          technologies: ['Python'],
        })
        .expect(201);

      // Verify the new project has order = maxOrder + 1
      expect(createRes.body.data).toHaveProperty('order');
      expect(createRes.body.data.order).toBe(maxOrder + 1);
    });

    it('should include created project in GET response', async () => {
      const projectData = {
        name: `Test Project ${Date.now()}`,
        description: 'A test project for verification',
        startDate: '2024-05-01',
        technologies: ['Rust', 'WebAssembly'],
      };

      // Create project
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('x-api-key', validApiKey)
        .send(projectData)
        .expect(201);

      const createdProjectId = createRes.body.data.id;

      // Verify it appears in GET /api/v1/projects
      const getRes = await request(app.getHttpServer())
        .get('/api/v1/projects')
        .expect(200);

      const foundProject = getRes.body.data.find(
        (proj: any) => proj.id === createdProjectId,
      );
      expect(foundProject).toBeDefined();
      expect(foundProject.name).toBe(projectData.name);
      expect(foundProject.technologies).toEqual(projectData.technologies);
    });

    it('should format dates as ISO strings in response', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('x-api-key', validApiKey)
        .send({
          name: 'Date Format Test Project',
          description: 'Testing date formatting',
          startDate: '2024-06-15',
          endDate: '2024-12-31',
          technologies: ['Go'],
        })
        .expect(201);

      const project = createRes.body.data;

      // Verify startDate is ISO string
      expect(typeof project.startDate).toBe('string');
      expect(project.startDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);

      // Verify endDate is ISO string
      expect(typeof project.endDate).toBe('string');
      expect(project.endDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should handle project with only required fields and default optional fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('x-api-key', validApiKey)
        .send({
          name: 'Minimal Project',
          description: 'A minimal project',
          startDate: '2024-07-01',
          technologies: ['Swift'],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.endDate).toBeNull();
          expect(res.body.data.repositoryLink).toBeNull();
          expect(res.body.data.demoLink).toBeNull();
          expect(res.body.data.websiteLink).toBeNull();
          expect(res.body.data.achievements).toEqual([]);
          expect(res.body.data.isHighlighted).toBe(false);
        });
    });
  });
});

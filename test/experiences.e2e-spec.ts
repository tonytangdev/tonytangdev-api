import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TestAppModule } from './test-app.module';

describe('Experiences API (e2e)', () => {
  let app: INestApplication;
  const validApiKey = 'test-api-key';

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

  describe('POST /api/v1/experiences', () => {
    it('should create experience with required fields and apply defaults', () => {
      const experienceName = `TestCompany ${Date.now()}`;
      return request(app.getHttpServer())
        .post('/api/v1/experiences')
        .set('x-api-key', validApiKey)
        .send({
          company: experienceName,
          title: 'Software Engineer',
          startDate: '2023-01-15',
          description: 'Building web applications',
          technologies: ['TypeScript', 'React'],
          location: 'San Francisco, CA',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.company).toBe(experienceName);
          expect(res.body.data.isCurrent).toBe(true);
          expect(res.body.data.isHighlighted).toBe(false);
          expect(res.body.data.achievements).toEqual([]);
          expect(res.body.meta).toEqual({});
        });
    });

    it('should create experience with all fields', () => {
      const experienceName = `TestCompany ${Date.now()}`;
      return request(app.getHttpServer())
        .post('/api/v1/experiences')
        .set('x-api-key', validApiKey)
        .send({
          company: experienceName,
          title: 'Senior Engineer',
          startDate: '2022-01-01',
          endDate: '2023-12-31',
          description: 'Led engineering team',
          technologies: ['Node.js', 'PostgreSQL'],
          achievements: ['Shipped v2', 'Reduced latency by 50%'],
          location: 'Remote',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.achievements).toHaveLength(2);
          expect(res.body.data.isCurrent).toBe(false);
        });
    });

    it('should reject request without API key', () => {
      return request(app.getHttpServer())
        .post('/api/v1/experiences')
        .send({
          company: 'TestCompany',
          title: 'Engineer',
          startDate: '2023-01-01',
          description: 'Test',
          technologies: ['TypeScript'],
          location: 'SF',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 401);
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should reject request with invalid API key', () => {
      return request(app.getHttpServer())
        .post('/api/v1/experiences')
        .set('x-api-key', 'invalid-key')
        .send({
          company: 'TestCompany',
          title: 'Engineer',
          startDate: '2023-01-01',
          description: 'Test',
          technologies: ['TypeScript'],
          location: 'SF',
        })
        .expect(401);
    });

    it('should reject duplicate company and title', async () => {
      const experienceData = {
        company: `DuplicateTest ${Date.now()}`,
        title: 'Engineer',
        startDate: '2023-01-01',
        description: 'Test experience',
        technologies: ['TypeScript'],
        location: 'SF',
      };

      await request(app.getHttpServer())
        .post('/api/v1/experiences')
        .set('x-api-key', validApiKey)
        .send(experienceData)
        .expect(201);

      return request(app.getHttpServer())
        .post('/api/v1/experiences')
        .set('x-api-key', validApiKey)
        .send(experienceData)
        .expect(409)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 409);
          expect(res.body.message).toContain('already exists');
        });
    });

    it('should reject missing required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/experiences')
        .set('x-api-key', validApiKey)
        .send({
          company: 'TestCompany',
          title: 'Engineer',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 400);
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should reject future start date', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      return request(app.getHttpServer())
        .post('/api/v1/experiences')
        .set('x-api-key', validApiKey)
        .send({
          company: 'TestCompany',
          title: 'Engineer',
          startDate: futureDate.toISOString().split('T')[0],
          description: 'Future job',
          technologies: ['TypeScript'],
          location: 'SF',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('future');
        });
    });

    it('should reject start date after end date', () => {
      return request(app.getHttpServer())
        .post('/api/v1/experiences')
        .set('x-api-key', validApiKey)
        .send({
          company: 'TestCompany',
          title: 'Engineer',
          startDate: '2024-06-30',
          endDate: '2024-01-15',
          description: 'Invalid dates',
          technologies: ['TypeScript'],
          location: 'SF',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('before');
        });
    });

    it('should auto-increment order correctly', async () => {
      const getAllRes = await request(app.getHttpServer())
        .get('/api/v1/experiences')
        .expect(200);

      const initialCount = getAllRes.body.data.length;

      const createRes = await request(app.getHttpServer())
        .post('/api/v1/experiences')
        .set('x-api-key', validApiKey)
        .send({
          company: `OrderTest ${Date.now()}`,
          title: 'Engineer',
          startDate: '2023-01-01',
          description: 'Test',
          technologies: ['TypeScript'],
          location: 'SF',
        })
        .expect(201);

      expect(createRes.body.data).toHaveProperty('id');

      const getRes = await request(app.getHttpServer())
        .get('/api/v1/experiences')
        .expect(200);

      expect(getRes.body.data.length).toBe(initialCount + 1);
    });

    it('should include created experience in GET response', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/experiences')
        .set('x-api-key', validApiKey)
        .send({
          company: `IncludeTest ${Date.now()}`,
          title: 'Engineer',
          startDate: '2023-01-01',
          description: 'Test',
          technologies: ['TypeScript'],
          location: 'SF',
        })
        .expect(201);

      const createdExperienceId = createRes.body.data.id;

      const getRes = await request(app.getHttpServer())
        .get('/api/v1/experiences')
        .expect(200);

      const foundExperience = getRes.body.data.find(
        (exp: any) => exp.id === createdExperienceId,
      );
      expect(foundExperience).toBeDefined();
      expect(foundExperience.company).toContain('IncludeTest');
    });

    it('should format dates as ISO strings in response', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/experiences')
        .set('x-api-key', validApiKey)
        .send({
          company: `DateTest ${Date.now()}`,
          title: 'Engineer',
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          description: 'Test',
          technologies: ['TypeScript'],
          location: 'SF',
        })
        .expect(201);

      const experience = createRes.body.data;
      expect(typeof experience.startDate).toBe('string');
      expect(experience.startDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(typeof experience.endDate).toBe('string');
      expect(experience.endDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('PUT /api/v1/experiences/:id', () => {
    let testExperienceId: string;

    beforeEach(async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/experiences')
        .set('x-api-key', validApiKey)
        .send({
          company: `UpdateTest ${Date.now()}`,
          title: 'Junior Engineer',
          startDate: '2023-01-01',
          description: 'Initial description',
          technologies: ['JavaScript'],
          location: 'Remote',
        });
      testExperienceId = createRes.body.data.id;
    });

    it('should update experience successfully', async () => {
      return request(app.getHttpServer())
        .put(`/api/v1/experiences/${testExperienceId}`)
        .set('x-api-key', validApiKey)
        .send({
          company: 'UpdateTest Updated',
          title: 'Senior Engineer',
          startDate: '2023-01-01',
          endDate: '2024-12-31',
          description: 'Updated description',
          technologies: ['TypeScript', 'React'],
          achievements: ['Promoted', 'Led project'],
          location: 'San Francisco, CA',
          isHighlighted: true,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(testExperienceId);
          expect(res.body.data.company).toBe('UpdateTest Updated');
          expect(res.body.data.title).toBe('Senior Engineer');
          expect(res.body.data.description).toBe('Updated description');
          expect(res.body.data.technologies).toEqual(['TypeScript', 'React']);
          expect(res.body.data.achievements).toEqual([
            'Promoted',
            'Led project',
          ]);
          expect(res.body.data.isHighlighted).toBe(true);
          expect(res.body.data.isCurrent).toBe(false);
        });
    });

    it('should compute isCurrent from endDate', async () => {
      const withEndDate = await request(app.getHttpServer())
        .put(`/api/v1/experiences/${testExperienceId}`)
        .set('x-api-key', validApiKey)
        .send({
          company: 'Test',
          title: 'Engineer',
          startDate: '2023-01-01',
          endDate: '2024-12-31',
          description: 'Test',
          technologies: ['TypeScript'],
          location: 'SF',
          isHighlighted: false,
        })
        .expect(200);

      expect(withEndDate.body.data.isCurrent).toBe(false);

      const createRes2 = await request(app.getHttpServer())
        .post('/api/v1/experiences')
        .set('x-api-key', validApiKey)
        .send({
          company: `UpdateTest2 ${Date.now()}`,
          title: 'Engineer',
          startDate: '2023-01-01',
          description: 'Test',
          technologies: ['TypeScript'],
          location: 'SF',
        });

      const withoutEndDate = await request(app.getHttpServer())
        .put(`/api/v1/experiences/${createRes2.body.data.id}`)
        .set('x-api-key', validApiKey)
        .send({
          company: 'Test2',
          title: 'Engineer',
          startDate: '2023-01-01',
          description: 'Updated',
          technologies: ['TypeScript'],
          location: 'SF',
          isHighlighted: false,
        })
        .expect(200);

      expect(withoutEndDate.body.data.isCurrent).toBe(true);
    });

    it('should return 404 for non-existent experience', () => {
      return request(app.getHttpServer())
        .put('/api/v1/experiences/non-existent-id')
        .set('x-api-key', validApiKey)
        .send({
          company: 'Test',
          title: 'Engineer',
          startDate: '2023-01-01',
          description: 'Test',
          technologies: ['TypeScript'],
          location: 'SF',
          isHighlighted: false,
        })
        .expect(404)
        .expect((res) => {
          expect(res.body.statusCode).toBe(404);
          expect(res.body.message).toContain('not found');
        });
    });

    it('should return 409 for duplicate company and title', async () => {
      const uniqueName = `DuplicateUpdate ${Date.now()}`;

      await request(app.getHttpServer())
        .post('/api/v1/experiences')
        .set('x-api-key', validApiKey)
        .send({
          company: uniqueName,
          title: 'Staff Engineer',
          startDate: '2023-01-01',
          description: 'Existing experience',
          technologies: ['Go'],
          location: 'NYC',
        });

      return request(app.getHttpServer())
        .put(`/api/v1/experiences/${testExperienceId}`)
        .set('x-api-key', validApiKey)
        .send({
          company: uniqueName,
          title: 'Staff Engineer',
          startDate: '2023-01-01',
          description: 'Trying to update',
          technologies: ['TypeScript'],
          location: 'SF',
          isHighlighted: false,
        })
        .expect(409)
        .expect((res) => {
          expect(res.body.statusCode).toBe(409);
          expect(res.body.message).toContain('already exists');
        });
    });

    it('should allow updating with same company and title (own record)', async () => {
      const getRes = await request(app.getHttpServer())
        .get('/api/v1/experiences')
        .expect(200);

      const experience = getRes.body.data.find(
        (exp: any) => exp.id === testExperienceId,
      );

      return request(app.getHttpServer())
        .put(`/api/v1/experiences/${testExperienceId}`)
        .set('x-api-key', validApiKey)
        .send({
          company: experience.company,
          title: experience.title,
          startDate: '2023-01-01',
          description: 'Updated description only',
          technologies: ['TypeScript'],
          location: 'SF',
          isHighlighted: false,
        })
        .expect(200);
    });

    it('should reject request without API key', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/experiences/${testExperienceId}`)
        .send({
          company: 'Test',
          title: 'Engineer',
          startDate: '2023-01-01',
          description: 'Test',
          technologies: ['TypeScript'],
          location: 'SF',
          isHighlighted: false,
        })
        .expect(401);
    });

    it('should reject future start date', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const createRes = await request(app.getHttpServer())
        .post('/api/v1/experiences')
        .set('x-api-key', validApiKey)
        .send({
          company: `FutureDateTest ${Date.now()}`,
          title: 'Engineer',
          startDate: '2023-01-01',
          description: 'Test',
          technologies: ['TypeScript'],
          location: 'SF',
        });

      return request(app.getHttpServer())
        .put(`/api/v1/experiences/${createRes.body.data.id}`)
        .set('x-api-key', validApiKey)
        .send({
          company: `FutureDateUpdated ${Date.now()}`,
          title: 'Engineer',
          startDate: futureDate.toISOString().split('T')[0],
          description: 'Future job',
          technologies: ['TypeScript'],
          location: 'SF',
          isHighlighted: false,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('future');
        });
    });

    it('should reject start date after end date', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/experiences')
        .set('x-api-key', validApiKey)
        .send({
          company: `InvalidDateTest ${Date.now()}`,
          title: 'Engineer',
          startDate: '2023-01-01',
          description: 'Test',
          technologies: ['TypeScript'],
          location: 'SF',
        });

      return request(app.getHttpServer())
        .put(`/api/v1/experiences/${createRes.body.data.id}`)
        .set('x-api-key', validApiKey)
        .send({
          company: `InvalidDateUpdated ${Date.now()}`,
          title: 'Engineer',
          startDate: '2024-06-30',
          endDate: '2024-01-15',
          description: 'Invalid dates',
          technologies: ['TypeScript'],
          location: 'SF',
          isHighlighted: false,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('before');
        });
    });

    it('should reject missing required fields', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/experiences/${testExperienceId}`)
        .set('x-api-key', validApiKey)
        .send({
          company: 'Test',
          title: 'Engineer',
        })
        .expect(400);
    });
  });

  describe('DELETE /api/v1/experiences/:id', () => {
    it('should delete experience with valid API key', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/experiences')
        .set('x-api-key', validApiKey)
        .send({
          company: `DeleteTest ${Date.now()}`,
          title: 'Engineer',
          startDate: '2024-01-15',
          description: 'To be deleted',
          technologies: ['TypeScript'],
          location: 'SF',
        })
        .expect(201);

      const experienceId = createRes.body.data.id;

      return request(app.getHttpServer())
        .delete(`/api/v1/experiences/${experienceId}`)
        .set('x-api-key', validApiKey)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeNull();
          expect(res.body.meta).toEqual({});
        });
    });

    it('should return 401 without API key', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/experiences/some-id')
        .expect(401);
    });

    it('should return 401 with invalid API key', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/experiences/some-id')
        .set('x-api-key', 'invalid-key')
        .expect(401);
    });

    it('should return 404 for non-existent experience', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/experiences/non-existent-id')
        .set('x-api-key', validApiKey)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toContain('not found');
        });
    });

    it('should actually delete the experience', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/experiences')
        .set('x-api-key', validApiKey)
        .send({
          company: `ActualDeleteTest ${Date.now()}`,
          title: 'Engineer',
          startDate: '2024-01-15',
          description: 'To be deleted',
          technologies: ['TypeScript'],
          location: 'SF',
        })
        .expect(201);

      const experienceId = createRes.body.data.id;

      await request(app.getHttpServer())
        .delete(`/api/v1/experiences/${experienceId}`)
        .set('x-api-key', validApiKey)
        .expect(200);

      return request(app.getHttpServer())
        .delete(`/api/v1/experiences/${experienceId}`)
        .set('x-api-key', validApiKey)
        .expect(404);
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

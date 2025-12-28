import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TestAppModule } from './test-app.module';

describe('Education API (e2e)', () => {
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

  describe('POST /api/v1/education', () => {
    it('should create education with required fields and apply defaults', () => {
      const educationName = `MIT ${Date.now()}`;
      return request(app.getHttpServer())
        .post('/api/v1/education')
        .set('x-api-key', validApiKey)
        .send({
          institution: educationName,
          degreeType: 'master',
          fieldOfStudy: 'Computer Science',
          startDate: '2020-01-15',
          endDate: '2022-06-30',
          description: 'Master of Science in Computer Science',
          location: 'Cambridge, MA',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.institution).toBe(educationName);
          expect(res.body.data.degreeType).toBe('master');
          expect(res.body.data.fieldOfStudy).toBe('Computer Science');
          expect(res.body.data.status).toBe('completed');
          expect(res.body.data.isHighlighted).toBe(false);
          expect(res.body.data.achievements).toEqual([]);
          expect(res.body.meta).toEqual({});
        });
    });

    it('should create education with all fields', () => {
      const educationName = `Stanford ${Date.now()}`;
      return request(app.getHttpServer())
        .post('/api/v1/education')
        .set('x-api-key', validApiKey)
        .send({
          institution: educationName,
          degreeType: 'bachelor',
          fieldOfStudy: 'Electrical Engineering',
          startDate: '2018-09-01',
          endDate: '2022-06-15',
          description: 'Bachelor of Science in Electrical Engineering',
          location: 'Stanford, CA',
          status: 'completed',
          achievements: ['Summa Cum Laude', 'Research Assistant'],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.institution).toBe(educationName);
          expect(res.body.data.achievements).toEqual([
            'Summa Cum Laude',
            'Research Assistant',
          ]);
          expect(res.body.data.status).toBe('completed');
        });
    });

    it('should create IN_PROGRESS education with null endDate', () => {
      const educationName = `Current University ${Date.now()}`;
      return request(app.getHttpServer())
        .post('/api/v1/education')
        .set('x-api-key', validApiKey)
        .send({
          institution: educationName,
          degreeType: 'bachelor',
          fieldOfStudy: 'Computer Science',
          startDate: '2022-01-01',
          description: 'Currently pursuing',
          location: 'Campus',
          status: 'in_progress',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.status).toBe('in_progress');
          expect(res.body.data.endDate).toBeNull();
        });
    });

    it('should reject request without API key', () => {
      return request(app.getHttpServer())
        .post('/api/v1/education')
        .send({
          institution: 'Test University',
          degreeType: 'bachelor',
          fieldOfStudy: 'Test Field',
          startDate: '2020-01-01',
          endDate: '2024-06-01',
          description: 'Test',
          location: 'Test Location',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 401);
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should reject request with invalid API key', () => {
      return request(app.getHttpServer())
        .post('/api/v1/education')
        .set('x-api-key', 'invalid-key')
        .send({
          institution: 'Test University',
          degreeType: 'bachelor',
          fieldOfStudy: 'Test Field',
          startDate: '2020-01-01',
          endDate: '2024-06-01',
          description: 'Test',
          location: 'Test Location',
        })
        .expect(401);
    });

    it('should reject duplicate education (same institution, degree, field)', async () => {
      const educationData = {
        institution: 'Unique University',
        degreeType: 'master',
        fieldOfStudy: 'Unique Field',
        startDate: '2020-01-01',
        endDate: '2022-06-01',
        description: 'Unique education',
        location: 'Test Location',
      };

      // Create first education
      await request(app.getHttpServer())
        .post('/api/v1/education')
        .set('x-api-key', validApiKey)
        .send(educationData)
        .expect(201);

      // Try to create duplicate
      return request(app.getHttpServer())
        .post('/api/v1/education')
        .set('x-api-key', validApiKey)
        .send(educationData)
        .expect(409)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 409);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('already exists');
        });
    });

    it('should reject missing required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/education')
        .set('x-api-key', validApiKey)
        .send({
          institution: 'Incomplete University',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 400);
        });
    });

    it('should reject future startDate', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      return request(app.getHttpServer())
        .post('/api/v1/education')
        .set('x-api-key', validApiKey)
        .send({
          institution: 'Future University',
          degreeType: 'bachelor',
          fieldOfStudy: 'Time Travel',
          startDate: futureDate.toISOString().split('T')[0],
          description: 'Future education',
          location: 'Future',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 400);
          expect(res.body.message).toContain('future');
        });
    });

    it('should reject startDate >= endDate', () => {
      return request(app.getHttpServer())
        .post('/api/v1/education')
        .set('x-api-key', validApiKey)
        .send({
          institution: 'Invalid Dates University',
          degreeType: 'master',
          fieldOfStudy: 'Mathematics',
          startDate: '2022-12-31',
          endDate: '2022-06-01',
          description: 'Invalid date range',
          location: 'Test',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 400);
          expect(res.body.message).toContain('before');
        });
    });

    it('should reject IN_PROGRESS with endDate', () => {
      return request(app.getHttpServer())
        .post('/api/v1/education')
        .set('x-api-key', validApiKey)
        .send({
          institution: 'Ongoing University',
          degreeType: 'certificate',
          fieldOfStudy: 'Data Science',
          startDate: '2023-01-01',
          endDate: '2024-12-31',
          description: 'Ongoing certificate',
          location: 'Online',
          status: 'in_progress',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 400);
          expect(res.body.message).toContain('null');
        });
    });

    it('should reject COMPLETED without endDate', () => {
      return request(app.getHttpServer())
        .post('/api/v1/education')
        .set('x-api-key', validApiKey)
        .send({
          institution: 'Incomplete University',
          degreeType: 'bachelor',
          fieldOfStudy: 'Biology',
          startDate: '2018-01-01',
          description: 'Completed but no end date',
          location: 'Test',
          status: 'completed',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 400);
          expect(res.body.message).toContain('end date');
        });
    });

    it('should auto-increment order correctly', async () => {
      // Get current educations to determine max order
      const getAllRes = await request(app.getHttpServer())
        .get('/api/v1/education')
        .expect(200);

      const initialCount = getAllRes.body.data.length;

      // Create a new education
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/education')
        .set('x-api-key', validApiKey)
        .send({
          institution: 'Order Test University',
          degreeType: 'diploma',
          fieldOfStudy: 'Testing',
          startDate: '2021-01-01',
          endDate: '2021-12-31',
          description: 'Testing order auto-increment',
          location: 'Test',
        })
        .expect(201);

      expect(createRes.body.data).toHaveProperty('id');

      // Verify it appears in GET response
      const getRes = await request(app.getHttpServer())
        .get('/api/v1/education')
        .expect(200);

      expect(getRes.body.data.length).toBe(initialCount + 1);
    });

    it('should include created education in GET response', async () => {
      const educationData = {
        institution: `Test Institution ${Date.now()}`,
        degreeType: 'bootcamp',
        fieldOfStudy: 'Full Stack Development',
        startDate: '2023-01-01',
        endDate: '2023-06-30',
        description: 'Full stack bootcamp',
        location: 'Online',
      };

      // Create education
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/education')
        .set('x-api-key', validApiKey)
        .send(educationData)
        .expect(201);

      const createdEducationId = createRes.body.data.id;

      // Verify it appears in GET /api/v1/education
      const getRes = await request(app.getHttpServer())
        .get('/api/v1/education')
        .expect(200);

      const foundEducation = getRes.body.data.find(
        (edu: any) => edu.id === createdEducationId,
      );
      expect(foundEducation).toBeDefined();
      expect(foundEducation.institution).toBe(educationData.institution);
      expect(foundEducation.fieldOfStudy).toBe(educationData.fieldOfStudy);
    });

    it('should format dates as ISO strings in response', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/education')
        .set('x-api-key', validApiKey)
        .send({
          institution: 'Date Format Test University',
          degreeType: 'master',
          fieldOfStudy: 'Software Engineering',
          startDate: '2020-06-15',
          endDate: '2022-12-31',
          description: 'Testing date formatting',
          location: 'Test',
        })
        .expect(201);

      const education = createRes.body.data;

      // Verify startDate is ISO string
      expect(typeof education.startDate).toBe('string');
      expect(education.startDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);

      // Verify endDate is ISO string
      expect(typeof education.endDate).toBe('string');
      expect(education.endDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should handle education with only required fields and default optional fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/education')
        .set('x-api-key', validApiKey)
        .send({
          institution: 'Minimal University',
          degreeType: 'bachelor',
          fieldOfStudy: 'Art',
          startDate: '2019-01-01',
          endDate: '2023-06-01',
          description: 'Minimal education',
          location: 'Test',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.achievements).toEqual([]);
          expect(res.body.data.isHighlighted).toBe(false);
          expect(res.body.data.status).toBe('completed');
        });
    });
  });

  describe('PUT /api/v1/education/:id', () => {
    let createdEducationId: string;
    let originalInstitution: string;

    beforeEach(async () => {
      // Create education for update tests with unique institution name
      originalInstitution = `Update Test University ${Date.now()}`;
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/education')
        .set('x-api-key', validApiKey)
        .send({
          institution: originalInstitution,
          degreeType: 'master',
          fieldOfStudy: 'Computer Science',
          startDate: '2020-01-01',
          endDate: '2022-06-01',
          description: 'Original description',
          location: 'Test Location',
        })
        .expect(201);

      createdEducationId = createRes.body.data.id;
    });

    it('should update education with valid data', async () => {
      const updateData = {
        institution: originalInstitution,
        degreeType: 'master',
        fieldOfStudy: 'Computer Science',
        startDate: '2020-01-01',
        endDate: '2022-06-01',
        description: 'Updated description',
        location: 'New Location',
        status: 'completed',
        isHighlighted: true,
      };

      const updateRes = await request(app.getHttpServer())
        .put(`/api/v1/education/${createdEducationId}`)
        .set('x-api-key', validApiKey)
        .send(updateData)
        .expect(200);

      expect(updateRes.body.data).toHaveProperty('id', createdEducationId);
      expect(updateRes.body.data).toHaveProperty(
        'description',
        'Updated description',
      );
      expect(updateRes.body.data).toHaveProperty('location', 'New Location');
      expect(updateRes.body.data).toHaveProperty('isHighlighted', true);
    });

    it('should preserve order field when updating', async () => {
      // Get original order
      const getRes = await request(app.getHttpServer())
        .get('/api/v1/education')
        .expect(200);

      const originalEducation = getRes.body.data.find(
        (edu: any) => edu.id === createdEducationId,
      );
      const originalOrder = originalEducation.order;

      // Update education
      await request(app.getHttpServer())
        .put(`/api/v1/education/${createdEducationId}`)
        .set('x-api-key', validApiKey)
        .send({
          institution: originalInstitution,
          degreeType: 'master',
          fieldOfStudy: 'Computer Science',
          startDate: '2020-01-01',
          endDate: '2022-06-01',
          description: 'Updated',
          location: 'Test',
          status: 'completed',
          isHighlighted: false,
        })
        .expect(200);

      // Verify order preserved
      const getRes2 = await request(app.getHttpServer())
        .get('/api/v1/education')
        .expect(200);

      const updatedEducation = getRes2.body.data.find(
        (edu: any) => edu.id === createdEducationId,
      );
      expect(updatedEducation.order).toBe(originalOrder);
    });

    it('should return 404 when updating non-existent education', () => {
      return request(app.getHttpServer())
        .put('/api/v1/education/nonexistent-id')
        .set('x-api-key', validApiKey)
        .send({
          institution: 'Test',
          degreeType: 'bachelor',
          fieldOfStudy: 'Test',
          startDate: '2020-01-01',
          endDate: '2022-06-01',
          description: 'Test',
          location: 'Test',
          status: 'completed',
          isHighlighted: false,
        })
        .expect(404);
    });

    it('should return 409 on duplicate composite key', async () => {
      // Create another education
      await request(app.getHttpServer())
        .post('/api/v1/education')
        .set('x-api-key', validApiKey)
        .send({
          institution: 'Duplicate Test University',
          degreeType: 'bachelor',
          fieldOfStudy: 'Physics',
          startDate: '2018-01-01',
          endDate: '2022-06-01',
          description: 'Another education',
          location: 'Test',
        })
        .expect(201);

      // Try to update to same composite key
      return request(app.getHttpServer())
        .put(`/api/v1/education/${createdEducationId}`)
        .set('x-api-key', validApiKey)
        .send({
          institution: 'Duplicate Test University',
          degreeType: 'bachelor',
          fieldOfStudy: 'Physics',
          startDate: '2020-01-01',
          endDate: '2022-06-01',
          description: 'Duplicate',
          location: 'Test',
          status: 'completed',
          isHighlighted: false,
        })
        .expect(409);
    });

    it('should allow idempotent updates with same composite key', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/education/${createdEducationId}`)
        .set('x-api-key', validApiKey)
        .send({
          institution: originalInstitution,
          degreeType: 'master',
          fieldOfStudy: 'Computer Science',
          startDate: '2020-01-01',
          endDate: '2022-06-01',
          description: 'Same composite key',
          location: 'Test',
          status: 'completed',
          isHighlighted: false,
        })
        .expect(200);
    });

    it('should return 401 without API key', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/education/${createdEducationId}`)
        .send({
          institution: 'Test',
          degreeType: 'bachelor',
          fieldOfStudy: 'Test',
          startDate: '2020-01-01',
          endDate: '2022-06-01',
          description: 'Test',
          location: 'Test',
          status: 'completed',
          isHighlighted: false,
        })
        .expect(401);
    });

    it('should return 401 with invalid API key', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/education/${createdEducationId}`)
        .set('x-api-key', 'invalid-key')
        .send({
          institution: 'Test',
          degreeType: 'bachelor',
          fieldOfStudy: 'Test',
          startDate: '2020-01-01',
          endDate: '2022-06-01',
          description: 'Test',
          location: 'Test',
          status: 'completed',
          isHighlighted: false,
        })
        .expect(401);
    });

    it('should validate status and endDate consistency for IN_PROGRESS', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/education/${createdEducationId}`)
        .set('x-api-key', validApiKey)
        .send({
          institution: originalInstitution,
          degreeType: 'master',
          fieldOfStudy: 'Computer Science',
          startDate: '2023-01-01',
          endDate: '2024-12-31',
          description: 'Test',
          location: 'Test',
          status: 'in_progress',
          isHighlighted: false,
        })
        .expect(400);
    });

    it('should validate status and endDate consistency for COMPLETED', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/education/${createdEducationId}`)
        .set('x-api-key', validApiKey)
        .send({
          institution: originalInstitution,
          degreeType: 'master',
          fieldOfStudy: 'Computer Science',
          startDate: '2020-01-01',
          description: 'Test',
          location: 'Test',
          status: 'completed',
          isHighlighted: false,
        })
        .expect(400);
    });

    it('should update achievements field', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/education/${createdEducationId}`)
        .set('x-api-key', validApiKey)
        .send({
          institution: originalInstitution,
          degreeType: 'master',
          fieldOfStudy: 'Computer Science',
          startDate: '2020-01-01',
          endDate: '2022-06-01',
          description: 'Test',
          location: 'Test',
          status: 'completed',
          achievements: ['New Achievement', 'Another One'],
          isHighlighted: false,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.achievements).toEqual([
            'New Achievement',
            'Another One',
          ]);
        });
    });

    it('should update to IN_PROGRESS with null endDate', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/education/${createdEducationId}`)
        .set('x-api-key', validApiKey)
        .send({
          institution: originalInstitution,
          degreeType: 'master',
          fieldOfStudy: 'Computer Science',
          startDate: '2023-01-01',
          description: 'Now in progress',
          location: 'Test',
          status: 'in_progress',
          isHighlighted: false,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.status).toBe('in_progress');
          expect(res.body.data.endDate).toBeNull();
        });
    });

    it('should include updated education in GET response', async () => {
      await request(app.getHttpServer())
        .put(`/api/v1/education/${createdEducationId}`)
        .set('x-api-key', validApiKey)
        .send({
          institution: originalInstitution,
          degreeType: 'master',
          fieldOfStudy: 'Computer Science',
          startDate: '2020-01-01',
          endDate: '2022-06-01',
          description: 'Verified in GET',
          location: 'Test',
          status: 'completed',
          isHighlighted: true,
        })
        .expect(200);

      const getRes = await request(app.getHttpServer())
        .get('/api/v1/education')
        .expect(200);

      const found = getRes.body.data.find(
        (edu: any) => edu.id === createdEducationId,
      );
      expect(found).toBeDefined();
      expect(found.description).toBe('Verified in GET');
      expect(found.isHighlighted).toBe(true);
    });
  });

  describe('DELETE /api/v1/education/:id', () => {
    const validApiKey = 'test-api-key';
    let educationIdToDelete: string;

    beforeEach(async () => {
      // Create an education to delete
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/education')
        .set('x-api-key', validApiKey)
        .send({
          institution: `Test Delete University ${Date.now()}`,
          degreeType: 'bachelor',
          fieldOfStudy: 'Testing',
          startDate: '2020-01-01',
          endDate: '2024-06-01',
          description: 'An education to be deleted',
          location: 'Test City',
        });
      educationIdToDelete = createRes.body.data.id;
    });

    it('should delete education successfully with valid API key', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/education/${educationIdToDelete}`)
        .set('x-api-key', validApiKey)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data', null);
          expect(res.body).toHaveProperty('meta');
        });
    });

    it('should reject delete without API key', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/education/${educationIdToDelete}`)
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 401);
          expect(res.body.message).toContain('Invalid API key');
        });
    });

    it('should reject delete with invalid API key', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/education/${educationIdToDelete}`)
        .set('x-api-key', 'wrong-key')
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid API key');
        });
    });

    it('should return 404 for non-existent education', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/education/non-existent-id')
        .set('x-api-key', validApiKey)
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 404);
          expect(res.body.message).toContain('not found');
        });
    });

    it('should actually remove the education from database', async () => {
      // Delete the education
      await request(app.getHttpServer())
        .delete(`/api/v1/education/${educationIdToDelete}`)
        .set('x-api-key', validApiKey)
        .expect(200);

      // Verify it's gone by trying to delete again
      return request(app.getHttpServer())
        .delete(`/api/v1/education/${educationIdToDelete}`)
        .set('x-api-key', validApiKey)
        .expect(404);
    });
  });
});

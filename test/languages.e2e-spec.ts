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

  describe('POST /api/v1/languages', () => {
    const validApiKey = 'test-api-key';

    it('should create a new language with valid data', () => {
      return request(app.getHttpServer())
        .post('/api/v1/languages')
        .set('x-api-key', validApiKey)
        .send({
          name: 'German',
          proficiency: 'professional_working',
          isNative: false,
          isHighlighted: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.name).toBe('German');
          expect(res.body.data.proficiency).toBe('professional_working');
          expect(res.body.data.isNative).toBe(false);
          expect(res.body.data.isHighlighted).toBe(true);
          expect(res.body.meta).toEqual({});
        });
    });

    it('should create a native language', () => {
      return request(app.getHttpServer())
        .post('/api/v1/languages')
        .set('x-api-key', validApiKey)
        .send({
          name: 'Japanese',
          proficiency: 'native',
          isNative: true,
          isHighlighted: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.name).toBe('Japanese');
          expect(res.body.data.isNative).toBe(true);
          expect(res.body.data.proficiency).toBe('native');
        });
    });

    it('should reject request without API key', () => {
      return request(app.getHttpServer())
        .post('/api/v1/languages')
        .send({
          name: 'Italian',
          proficiency: 'elementary',
          isNative: false,
          isHighlighted: false,
        })
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 401);
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should reject request with invalid API key', () => {
      return request(app.getHttpServer())
        .post('/api/v1/languages')
        .set('x-api-key', 'invalid-key')
        .send({
          name: 'Portuguese',
          proficiency: 'limited_working',
          isNative: false,
          isHighlighted: false,
        })
        .expect(401);
    });

    it('should reject duplicate language name', async () => {
      const languageData = {
        name: 'Chinese',
        proficiency: 'elementary',
        isNative: false,
        isHighlighted: false,
      };

      // Create first language
      await request(app.getHttpServer())
        .post('/api/v1/languages')
        .set('x-api-key', validApiKey)
        .send(languageData)
        .expect(201);

      // Try to create duplicate
      return request(app.getHttpServer())
        .post('/api/v1/languages')
        .set('x-api-key', validApiKey)
        .send(languageData)
        .expect(409)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 409);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('already exists');
        });
    });

    it('should reject invalid proficiency level', () => {
      return request(app.getHttpServer())
        .post('/api/v1/languages')
        .set('x-api-key', validApiKey)
        .send({
          name: 'Korean',
          proficiency: 'invalid-level',
          isNative: false,
          isHighlighted: false,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 400);
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should reject missing required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/languages')
        .set('x-api-key', validApiKey)
        .send({
          name: 'Arabic',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 400);
        });
    });

    it('should include created language in GET response', async () => {
      const languageData = {
        name: 'Swedish',
        proficiency: 'limited_working',
        isNative: false,
        isHighlighted: true,
      };

      // Create language
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/languages')
        .set('x-api-key', validApiKey)
        .send(languageData)
        .expect(201);

      const createdLanguageId = createRes.body.data.id;

      // Verify it appears in GET /api/v1/languages
      const getRes = await request(app.getHttpServer())
        .get('/api/v1/languages')
        .expect(200);

      const foundLanguage = getRes.body.data.find(
        (lang: any) => lang.id === createdLanguageId,
      );
      expect(foundLanguage).toBeDefined();
      expect(foundLanguage.name).toBe('Swedish');
    });

    it('should accept all valid proficiency levels', async () => {
      const proficiencyLevels = [
        'elementary',
        'limited_working',
        'professional_working',
        'full_professional',
        'native',
      ];

      for (const proficiency of proficiencyLevels) {
        await request(app.getHttpServer())
          .post('/api/v1/languages')
          .set('x-api-key', validApiKey)
          .send({
            name: `Language-${proficiency}`,
            proficiency,
            isNative: proficiency === 'native',
            isHighlighted: false,
          })
          .expect(201)
          .expect((res) => {
            expect(res.body.data.proficiency).toBe(proficiency);
          });
      }
    });
  });

  describe('DELETE /api/v1/languages/:id', () => {
    const validApiKey = 'test-api-key';
    let languageIdToDelete: string;

    beforeEach(async () => {
      // Create a language to delete
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/languages')
        .set('x-api-key', validApiKey)
        .send({
          name: `Test Delete Language ${Date.now()}`,
          proficiency: 'elementary',
          isNative: false,
          isHighlighted: false,
        });
      languageIdToDelete = createRes.body.data.id;
    });

    it('should delete language successfully with valid API key', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/languages/${languageIdToDelete}`)
        .set('x-api-key', validApiKey)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data', null);
          expect(res.body).toHaveProperty('meta');
        });
    });

    it('should reject delete without API key', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/languages/${languageIdToDelete}`)
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 401);
          expect(res.body.message).toContain('Invalid API key');
        });
    });

    it('should reject delete with invalid API key', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/languages/${languageIdToDelete}`)
        .set('x-api-key', 'wrong-key')
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid API key');
        });
    });

    it('should return 404 for non-existent language', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/languages/550e8400-e29b-41d4-a716-446655440000')
        .set('x-api-key', validApiKey)
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 404);
          expect(res.body.message).toContain('not found');
        });
    });

    it('should actually remove the language from database', async () => {
      // Delete the language
      await request(app.getHttpServer())
        .delete(`/api/v1/languages/${languageIdToDelete}`)
        .set('x-api-key', validApiKey)
        .expect(200);

      // Verify it's gone by trying to delete again
      return request(app.getHttpServer())
        .delete(`/api/v1/languages/${languageIdToDelete}`)
        .set('x-api-key', validApiKey)
        .expect(404);
    });
  });
});

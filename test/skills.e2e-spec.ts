import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TestAppModule } from './test-app.module';

describe('Skills API (e2e)', () => {
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

  describe('POST /api/v1/skills', () => {
    const validApiKey = 'test-api-key';
    let existingCategoryId: string;

    beforeAll(async () => {
      // Get an existing category ID for tests
      const categoriesRes = await request(app.getHttpServer())
        .get('/api/v1/skills/categories')
        .expect(200);
      existingCategoryId = categoriesRes.body.data[0].id;
    });

    it('should create a new skill with valid data', () => {
      return request(app.getHttpServer())
        .post('/api/v1/skills')
        .set('x-api-key', validApiKey)
        .send({
          name: 'Rust',
          categoryId: existingCategoryId,
          proficiency: 'intermediate',
          yearsOfExperience: 2,
          isHighlighted: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.name).toBe('Rust');
          expect(res.body.data.proficiency).toBe('intermediate');
          expect(res.body.data.isHighlighted).toBe(true);
        });
    });

    it('should reject request without API key', () => {
      return request(app.getHttpServer())
        .post('/api/v1/skills')
        .send({
          name: 'Kotlin',
          categoryId: existingCategoryId,
          proficiency: 'beginner',
          isHighlighted: false,
        })
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 401);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('Invalid API key');
        });
    });

    it('should reject request with invalid API key', () => {
      return request(app.getHttpServer())
        .post('/api/v1/skills')
        .set('x-api-key', 'wrong-key')
        .send({
          name: 'Swift',
          categoryId: existingCategoryId,
          proficiency: 'beginner',
          isHighlighted: false,
        })
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 401);
          expect(res.body.message).toContain('Invalid API key');
        });
    });

    it('should reject duplicate skill name', async () => {
      const skillData = {
        name: 'C++',
        categoryId: existingCategoryId,
        proficiency: 'advanced',
        isHighlighted: false,
      };

      // Create first skill
      await request(app.getHttpServer())
        .post('/api/v1/skills')
        .set('x-api-key', validApiKey)
        .send(skillData)
        .expect(201);

      // Try to create duplicate
      return request(app.getHttpServer())
        .post('/api/v1/skills')
        .set('x-api-key', validApiKey)
        .send(skillData)
        .expect(409)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 409);
          expect(res.body.message).toContain('already exists');
        });
    });

    it('should reject invalid categoryId', () => {
      return request(app.getHttpServer())
        .post('/api/v1/skills')
        .set('x-api-key', validApiKey)
        .send({
          name: 'Scala',
          categoryId: '550e8400-e29b-41d4-a716-446655440000',
          proficiency: 'beginner',
          isHighlighted: false,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 400);
          expect(res.body.message).toContain('not found');
        });
    });

    it('should reject invalid proficiency level', () => {
      return request(app.getHttpServer())
        .post('/api/v1/skills')
        .set('x-api-key', validApiKey)
        .send({
          name: 'Elixir',
          categoryId: existingCategoryId,
          proficiency: 'invalid-level',
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
        .post('/api/v1/skills')
        .set('x-api-key', validApiKey)
        .send({
          name: 'Haskell',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 400);
        });
    });

    it('should accept skill without yearsOfExperience', () => {
      return request(app.getHttpServer())
        .post('/api/v1/skills')
        .set('x-api-key', validApiKey)
        .send({
          name: 'Dart',
          categoryId: existingCategoryId,
          proficiency: 'beginner',
          isHighlighted: false,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.name).toBe('Dart');
        });
    });
  });

  describe('POST /api/v1/skills/categories', () => {
    const validApiKey = 'test-api-key';

    it('should create a new category with valid data', () => {
      return request(app.getHttpServer())
        .post('/api/v1/skills/categories')
        .set('x-api-key', validApiKey)
        .send({
          name: 'Cloud Platforms',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data).toHaveProperty('name');
          expect(res.body.data).toHaveProperty('slug');
          expect(res.body.data).toHaveProperty('skills');
          expect(res.body.data.name).toBe('Cloud Platforms');
          expect(res.body.data.slug).toBe('cloud-platforms');
          expect(res.body.data.skills).toEqual([]);
        });
    });

    it('should auto-generate slug from name', () => {
      return request(app.getHttpServer())
        .post('/api/v1/skills/categories')
        .set('x-api-key', validApiKey)
        .send({
          name: 'DevOps & CI/CD',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.slug).toBe('devops--cicd');
        });
    });

    it('should reject request without API key', () => {
      return request(app.getHttpServer())
        .post('/api/v1/skills/categories')
        .send({
          name: 'Mobile Development',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 401);
          expect(res.body.message).toContain('Invalid API key');
        });
    });

    it('should reject request with invalid API key', () => {
      return request(app.getHttpServer())
        .post('/api/v1/skills/categories')
        .set('x-api-key', 'wrong-key')
        .send({
          name: 'Testing Frameworks',
        })
        .expect(401);
    });

    it('should reject duplicate category name', async () => {
      const categoryData = { name: 'Security Tools' };

      // Create first category
      await request(app.getHttpServer())
        .post('/api/v1/skills/categories')
        .set('x-api-key', validApiKey)
        .send(categoryData)
        .expect(201);

      // Try to create duplicate
      return request(app.getHttpServer())
        .post('/api/v1/skills/categories')
        .set('x-api-key', validApiKey)
        .send(categoryData)
        .expect(409)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 409);
          expect(res.body.message).toContain('already exists');
        });
    });

    it('should reject missing required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/skills/categories')
        .set('x-api-key', validApiKey)
        .send({})
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 400);
        });
    });

    it('should reject empty name', () => {
      return request(app.getHttpServer())
        .post('/api/v1/skills/categories')
        .set('x-api-key', validApiKey)
        .send({
          name: '',
        })
        .expect(400);
    });
  });

  describe('PUT /api/v1/skills/:id', () => {
    const validApiKey = 'test-api-key';
    let existingCategoryId: string;
    let skillId: string;

    beforeAll(async () => {
      // Get existing category ID
      const categoriesRes = await request(app.getHttpServer()).get(
        '/api/v1/skills',
      );
      existingCategoryId = categoriesRes.body.data[0].id;

      // Create a skill to update
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/skills')
        .set('x-api-key', validApiKey)
        .send({
          name: 'Test Update Skill',
          categoryId: existingCategoryId,
          proficiency: 'beginner',
          yearsOfExperience: 1,
          isHighlighted: false,
        });
      skillId = createRes.body.data.id;
    });

    it('should update skill with valid data', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/skills/${skillId}`)
        .set('x-api-key', validApiKey)
        .send({
          name: 'Updated Skill Name',
          categoryId: existingCategoryId,
          proficiency: 'advanced',
          yearsOfExperience: 3,
          isHighlighted: true,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data.name).toBe('Updated Skill Name');
          expect(res.body.data.proficiency).toBe('advanced');
          expect(res.body.data.yearsOfExperience).toBe(3);
          expect(res.body.data.isHighlighted).toBe(true);
        });
    });

    it('should reject update without API key', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/skills/${skillId}`)
        .send({
          name: 'Another Name',
          categoryId: existingCategoryId,
          proficiency: 'intermediate',
          isHighlighted: false,
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid API key');
        });
    });

    it('should reject update with invalid API key', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/skills/${skillId}`)
        .set('x-api-key', 'wrong-key')
        .send({
          name: 'Another Name',
          categoryId: existingCategoryId,
          proficiency: 'intermediate',
          isHighlighted: false,
        })
        .expect(401);
    });

    it('should return 404 for non-existent skill', () => {
      return request(app.getHttpServer())
        .put('/api/v1/skills/550e8400-e29b-41d4-a716-446655440000')
        .set('x-api-key', validApiKey)
        .send({
          name: 'Non Existent',
          categoryId: existingCategoryId,
          proficiency: 'beginner',
          isHighlighted: false,
        })
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toContain('not found');
        });
    });

    it('should reject duplicate name (different from current)', async () => {
      // Create another skill
      await request(app.getHttpServer())
        .post('/api/v1/skills')
        .set('x-api-key', validApiKey)
        .send({
          name: 'Unique Skill Name',
          categoryId: existingCategoryId,
          proficiency: 'beginner',
          isHighlighted: false,
        });

      // Try to update first skill with second skill's name
      return request(app.getHttpServer())
        .put(`/api/v1/skills/${skillId}`)
        .set('x-api-key', validApiKey)
        .send({
          name: 'Unique Skill Name',
          categoryId: existingCategoryId,
          proficiency: 'advanced',
          isHighlighted: false,
        })
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain('already exists');
        });
    });

    it('should allow keeping same name (idempotent update)', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/skills/${skillId}`)
        .set('x-api-key', validApiKey)
        .send({
          name: 'Updated Skill Name',
          categoryId: existingCategoryId,
          proficiency: 'expert',
          isHighlighted: false,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.proficiency).toBe('expert');
        });
    });

    it('should reject invalid categoryId', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/skills/${skillId}`)
        .set('x-api-key', validApiKey)
        .send({
          name: 'Updated Name',
          categoryId: '550e8400-e29b-41d4-a716-446655440000',
          proficiency: 'beginner',
          isHighlighted: false,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('not found');
        });
    });

    it('should reject invalid proficiency level', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/skills/${skillId}`)
        .set('x-api-key', validApiKey)
        .send({
          name: 'Updated Name',
          categoryId: existingCategoryId,
          proficiency: 'invalid-level',
          isHighlighted: false,
        })
        .expect(400);
    });
  });

  describe('PUT /api/v1/skills/categories/:id', () => {
    const validApiKey = 'test-api-key';
    let categoryId: string;

    beforeAll(async () => {
      // Create a category to update
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/skills/categories')
        .set('x-api-key', validApiKey)
        .send({
          name: 'Test Update Category',
        });
      categoryId = createRes.body.data.id;
    });

    it('should update category with valid data', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/skills/categories/${categoryId}`)
        .set('x-api-key', validApiKey)
        .send({
          name: 'Updated Category Name',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body.data.name).toBe('Updated Category Name');
          expect(res.body.data.slug).toBe('updated-category-name');
        });
    });

    it('should auto-regenerate slug from new name', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/skills/categories/${categoryId}`)
        .set('x-api-key', validApiKey)
        .send({
          name: 'New Category Name',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.slug).toBe('new-category-name');
        });
    });

    it('should reject update without API key', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/skills/categories/${categoryId}`)
        .send({
          name: 'Another Name',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid API key');
        });
    });

    it('should reject update with invalid API key', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/skills/categories/${categoryId}`)
        .set('x-api-key', 'wrong-key')
        .send({
          name: 'Another Name',
        })
        .expect(401);
    });

    it('should return 404 for non-existent category', () => {
      return request(app.getHttpServer())
        .put('/api/v1/skills/categories/550e8400-e29b-41d4-a716-446655440000')
        .set('x-api-key', validApiKey)
        .send({
          name: 'Non Existent',
        })
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toContain('not found');
        });
    });

    it('should reject duplicate name (different from current)', async () => {
      // Create another category
      await request(app.getHttpServer())
        .post('/api/v1/skills/categories')
        .set('x-api-key', validApiKey)
        .send({
          name: 'Unique Category Name',
        });

      // Try to update first category with second category's name
      return request(app.getHttpServer())
        .put(`/api/v1/skills/categories/${categoryId}`)
        .set('x-api-key', validApiKey)
        .send({
          name: 'Unique Category Name',
        })
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain('already exists');
        });
    });

    it('should allow keeping same name (idempotent update)', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/skills/categories/${categoryId}`)
        .set('x-api-key', validApiKey)
        .send({
          name: 'New Category Name',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.name).toBe('New Category Name');
        });
    });

    it('should reject missing required fields', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/skills/categories/${categoryId}`)
        .set('x-api-key', validApiKey)
        .send({})
        .expect(400);
    });

    it('should reject empty name', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/skills/categories/${categoryId}`)
        .set('x-api-key', validApiKey)
        .send({
          name: '',
        })
        .expect(400);
    });
  });

  describe('DELETE /api/v1/skills/:id', () => {
    const validApiKey = 'test-api-key';
    let existingCategoryId: string;
    let skillIdToDelete: string;

    beforeEach(async () => {
      // Get existing category ID
      const categoriesRes = await request(app.getHttpServer()).get(
        '/api/v1/skills',
      );
      existingCategoryId = categoriesRes.body.data[0].id;

      // Create a skill to delete
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/skills')
        .set('x-api-key', validApiKey)
        .send({
          name: `Test Delete Skill ${Date.now()}`,
          categoryId: existingCategoryId,
          proficiency: 'beginner',
          isHighlighted: false,
        });
      skillIdToDelete = createRes.body.data.id;
    });

    it('should delete skill successfully with valid API key', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/skills/${skillIdToDelete}`)
        .set('x-api-key', validApiKey)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data', null);
          expect(res.body).toHaveProperty('meta');
        });
    });

    it('should reject delete without API key', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/skills/${skillIdToDelete}`)
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 401);
          expect(res.body.message).toContain('Invalid API key');
        });
    });

    it('should reject delete with invalid API key', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/skills/${skillIdToDelete}`)
        .set('x-api-key', 'wrong-key')
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid API key');
        });
    });

    it('should return 404 for non-existent skill', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/skills/550e8400-e29b-41d4-a716-446655440000')
        .set('x-api-key', validApiKey)
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 404);
          expect(res.body.message).toContain('not found');
        });
    });

    it('should actually remove the skill from database', async () => {
      // Delete the skill
      await request(app.getHttpServer())
        .delete(`/api/v1/skills/${skillIdToDelete}`)
        .set('x-api-key', validApiKey)
        .expect(200);

      // Verify it's gone by trying to delete again
      return request(app.getHttpServer())
        .delete(`/api/v1/skills/${skillIdToDelete}`)
        .set('x-api-key', validApiKey)
        .expect(404);
    });
  });

  describe('DELETE /api/v1/skills/categories/:id', () => {
    const validApiKey = 'test-api-key';
    let categoryIdToDelete: string;

    beforeEach(async () => {
      // Create a category to delete
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/skills/categories')
        .set('x-api-key', validApiKey)
        .send({
          name: `Test Delete Category ${Date.now()}`,
        });
      categoryIdToDelete = createRes.body.data.id;
    });

    it('should delete category successfully when no skills exist', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/skills/categories/${categoryIdToDelete}`)
        .set('x-api-key', validApiKey)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data', null);
          expect(res.body).toHaveProperty('meta');
        });
    });

    it('should reject delete without API key', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/skills/categories/${categoryIdToDelete}`)
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 401);
          expect(res.body.message).toContain('Invalid API key');
        });
    });

    it('should reject delete with invalid API key', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/skills/categories/${categoryIdToDelete}`)
        .set('x-api-key', 'wrong-key')
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid API key');
        });
    });

    it('should return 404 for non-existent category', () => {
      return request(app.getHttpServer())
        .delete(
          '/api/v1/skills/categories/550e8400-e29b-41d4-a716-446655440000',
        )
        .set('x-api-key', validApiKey)
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 404);
          expect(res.body.message).toContain('not found');
        });
    });

    it('should reject deletion when category has skills', async () => {
      // Create a skill in this category
      await request(app.getHttpServer())
        .post('/api/v1/skills')
        .set('x-api-key', validApiKey)
        .send({
          name: `Skill in Category ${Date.now()}`,
          categoryId: categoryIdToDelete,
          proficiency: 'beginner',
          isHighlighted: false,
        });

      // Try to delete category
      return request(app.getHttpServer())
        .delete(`/api/v1/skills/categories/${categoryIdToDelete}`)
        .set('x-api-key', validApiKey)
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 400);
          expect(res.body.message).toContain('Cannot delete category');
          expect(res.body.message).toContain('skill(s)');
        });
    });

    it('should actually remove the category from database', async () => {
      // Delete the category
      await request(app.getHttpServer())
        .delete(`/api/v1/skills/categories/${categoryIdToDelete}`)
        .set('x-api-key', validApiKey)
        .expect(200);

      // Verify it's gone by trying to delete again
      return request(app.getHttpServer())
        .delete(`/api/v1/skills/categories/${categoryIdToDelete}`)
        .set('x-api-key', validApiKey)
        .expect(404);
    });

    it('should allow deletion after all skills are removed', async () => {
      // Create a skill in this category
      const skillRes = await request(app.getHttpServer())
        .post('/api/v1/skills')
        .set('x-api-key', validApiKey)
        .send({
          name: `Temp Skill ${Date.now()}`,
          categoryId: categoryIdToDelete,
          proficiency: 'beginner',
          isHighlighted: false,
        });

      // Verify category deletion is blocked
      await request(app.getHttpServer())
        .delete(`/api/v1/skills/categories/${categoryIdToDelete}`)
        .set('x-api-key', validApiKey)
        .expect(400);

      // Delete the skill
      await request(app.getHttpServer())
        .delete(`/api/v1/skills/${skillRes.body.data.id}`)
        .set('x-api-key', validApiKey)
        .expect(200);

      // Now category deletion should succeed
      return request(app.getHttpServer())
        .delete(`/api/v1/skills/categories/${categoryIdToDelete}`)
        .set('x-api-key', validApiKey)
        .expect(200);
    });
  });
});

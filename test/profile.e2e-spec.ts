import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TestAppModule } from './test-app.module';

describe('Profile API (e2e)', () => {
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

  describe('GET /api/v1/profile', () => {
    it('should return profile', () => {
      return request(app.getHttpServer())
        .get('/api/v1/profile')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(typeof res.body.data).toBe('object');
          expect(res.body.data).not.toBeInstanceOf(Array);
        });
    });

    it('should have proper profile structure', () => {
      return request(app.getHttpServer())
        .get('/api/v1/profile')
        .expect(200)
        .expect((res) => {
          const profile = res.body.data;
          expect(profile).toHaveProperty('id');
          expect(profile).toHaveProperty('fullName');
          expect(profile).toHaveProperty('title');
          expect(profile).toHaveProperty('bio');
          expect(profile).toHaveProperty('email');
          expect(profile).toHaveProperty('phone');
          expect(profile).toHaveProperty('location');
          expect(profile).toHaveProperty('timezone');
          expect(profile).toHaveProperty('availability');
          expect(profile).toHaveProperty('yearsOfExperience');
          expect(profile).toHaveProperty('profilePictureUrl');
          expect(profile).toHaveProperty('resumeUrl');
          expect(profile).toHaveProperty('socialLinks');
        });
    });

    it('should have correct data types', () => {
      return request(app.getHttpServer())
        .get('/api/v1/profile')
        .expect(200)
        .expect((res) => {
          const profile = res.body.data;
          expect(typeof profile.id).toBe('string');
          expect(typeof profile.fullName).toBe('string');
          expect(typeof profile.title).toBe('string');
          expect(typeof profile.bio).toBe('string');
          expect(typeof profile.email).toBe('string');
          expect(typeof profile.location).toBe('string');
          expect(typeof profile.timezone).toBe('string');
          expect(typeof profile.availability).toBe('string');
          expect(typeof profile.yearsOfExperience).toBe('number');
          expect(profile.socialLinks).toBeInstanceOf(Array);
        });
    });

    it('should have valid email format', () => {
      return request(app.getHttpServer())
        .get('/api/v1/profile')
        .expect(200)
        .expect((res) => {
          const profile = res.body.data;
          expect(profile.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        });
    });

    it('should have valid availability status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/profile')
        .expect(200)
        .expect((res) => {
          const profile = res.body.data;
          expect(['available', 'open_to_offers', 'not_available']).toContain(
            profile.availability,
          );
        });
    });

    it('should have social links with proper structure', () => {
      return request(app.getHttpServer())
        .get('/api/v1/profile')
        .expect(200)
        .expect((res) => {
          const profile = res.body.data;
          expect(profile.socialLinks.length).toBeGreaterThan(0);

          const firstLink = profile.socialLinks[0];
          expect(firstLink).toHaveProperty('platform');
          expect(firstLink).toHaveProperty('url');
          expect(firstLink).toHaveProperty('username');
          expect(typeof firstLink.platform).toBe('string');
          expect(typeof firstLink.url).toBe('string');
          expect(typeof firstLink.username).toBe('string');
        });
    });

    it('should have valid social platform types', () => {
      return request(app.getHttpServer())
        .get('/api/v1/profile')
        .expect(200)
        .expect((res) => {
          const profile = res.body.data;
          const validPlatforms = [
            'github',
            'linkedin',
            'twitter',
            'stackoverflow',
            'medium',
            'dev_to',
            'personal_website',
            'youtube',
          ];

          profile.socialLinks.forEach((link: any) => {
            expect(validPlatforms).toContain(link.platform);
          });
        });
    });

    it('nullable fields should be null or string', () => {
      return request(app.getHttpServer())
        .get('/api/v1/profile')
        .expect(200)
        .expect((res) => {
          const profile = res.body.data;
          expect(
            profile.phone === null || typeof profile.phone === 'string',
          ).toBe(true);
          expect(
            profile.profilePictureUrl === null ||
              typeof profile.profilePictureUrl === 'string',
          ).toBe(true);
          expect(
            profile.resumeUrl === null || typeof profile.resumeUrl === 'string',
          ).toBe(true);
        });
    });
  });

  describe('POST /api/v1/profile', () => {
    const validApiKey = 'test-api-key';

    const validProfileData = {
      fullName: 'Jane Doe',
      title: 'Full Stack Engineer',
      bio: 'Expert developer with passion for clean code',
      email: 'jane@example.com',
      location: 'New York, NY',
      timezone: 'America/New_York',
      availability: 'available',
      yearsOfExperience: 5,
      socialLinks: [
        {
          platform: 'github',
          url: 'https://github.com/janedoe',
          username: 'janedoe',
        },
      ],
    };

    it('should reject request without API key', () => {
      return request(app.getHttpServer())
        .post('/api/v1/profile')
        .send(validProfileData)
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 401);
          expect(res.body.message).toContain('Invalid API key');
        });
    });

    it('should reject request with invalid API key', () => {
      return request(app.getHttpServer())
        .post('/api/v1/profile')
        .set('x-api-key', 'wrong-key')
        .send(validProfileData)
        .expect(401)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 401);
          expect(res.body.message).toContain('Invalid API key');
        });
    });

    it('should reject profile creation when profile already exists', () => {
      return request(app.getHttpServer())
        .post('/api/v1/profile')
        .set('x-api-key', validApiKey)
        .send(validProfileData)
        .expect(409)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 409);
          expect(res.body.message).toContain('Profile already exists');
        });
    });

    it('should reject invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/profile')
        .set('x-api-key', validApiKey)
        .send({
          ...validProfileData,
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should reject invalid timezone', () => {
      return request(app.getHttpServer())
        .post('/api/v1/profile')
        .set('x-api-key', validApiKey)
        .send({
          ...validProfileData,
          timezone: 'Invalid/Timezone',
        })
        .expect(400);
    });

    it('should reject invalid availability status', () => {
      return request(app.getHttpServer())
        .post('/api/v1/profile')
        .set('x-api-key', validApiKey)
        .send({
          ...validProfileData,
          availability: 'invalid-status',
        })
        .expect(400);
    });

    it('should reject invalid social platform', () => {
      return request(app.getHttpServer())
        .post('/api/v1/profile')
        .set('x-api-key', validApiKey)
        .send({
          ...validProfileData,
          socialLinks: [
            {
              platform: 'invalid-platform',
              url: 'https://example.com',
              username: 'user',
            },
          ],
        })
        .expect(400);
    });

    it('should reject invalid URL in social link', () => {
      return request(app.getHttpServer())
        .post('/api/v1/profile')
        .set('x-api-key', validApiKey)
        .send({
          ...validProfileData,
          socialLinks: [
            {
              platform: 'github',
              url: 'not-a-url',
              username: 'user',
            },
          ],
        })
        .expect(400);
    });

    it('should reject invalid profilePictureUrl', () => {
      return request(app.getHttpServer())
        .post('/api/v1/profile')
        .set('x-api-key', validApiKey)
        .send({
          ...validProfileData,
          profilePictureUrl: 'not-a-url',
        })
        .expect(400);
    });

    it('should reject invalid resumeUrl', () => {
      return request(app.getHttpServer())
        .post('/api/v1/profile')
        .set('x-api-key', validApiKey)
        .send({
          ...validProfileData,
          resumeUrl: 'not-a-url',
        })
        .expect(400);
    });

    it('should reject missing required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/profile')
        .set('x-api-key', validApiKey)
        .send({
          fullName: 'John Doe',
        })
        .expect(400);
    });

    it('should reject yearsOfExperience below 0', () => {
      return request(app.getHttpServer())
        .post('/api/v1/profile')
        .set('x-api-key', validApiKey)
        .send({
          ...validProfileData,
          yearsOfExperience: -1,
        })
        .expect(400);
    });

    it('should reject yearsOfExperience above 100', () => {
      return request(app.getHttpServer())
        .post('/api/v1/profile')
        .set('x-api-key', validApiKey)
        .send({
          ...validProfileData,
          yearsOfExperience: 101,
        })
        .expect(400);
    });
  });

  describe('PATCH /api/v1/profile', () => {
    const validApiKey = 'test-api-key';

    it('should update single field', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/profile')
        .set('x-api-key', validApiKey)
        .send({ fullName: 'Updated Name' })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.fullName).toBe('Updated Name');
        });
    });

    it('should update multiple fields', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/profile')
        .set('x-api-key', validApiKey)
        .send({
          fullName: 'New Name',
          title: 'New Title',
          yearsOfExperience: 10,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.fullName).toBe('New Name');
          expect(res.body.data.title).toBe('New Title');
          expect(res.body.data.yearsOfExperience).toBe(10);
        });
    });

    it('should update availability status', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/profile')
        .set('x-api-key', validApiKey)
        .send({ availability: 'open_to_offers' })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.availability).toBe('open_to_offers');
        });
    });

    it('should update social links (replace array)', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/profile')
        .set('x-api-key', validApiKey)
        .send({
          socialLinks: [
            {
              platform: 'twitter',
              url: 'https://twitter.com/newuser',
              username: 'newuser',
            },
          ],
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.socialLinks).toHaveLength(1);
          expect(res.body.data.socialLinks[0].platform).toBe('twitter');
        });
    });

    it('should update nullable field to null', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/profile')
        .set('x-api-key', validApiKey)
        .send({ phone: null })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.phone).toBeNull();
        });
    });

    it('should reject request without API key', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/profile')
        .send({ fullName: 'Test' })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid API key');
        });
    });

    it('should reject invalid email', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/profile')
        .set('x-api-key', validApiKey)
        .send({ email: 'invalid-email' })
        .expect(400);
    });

    it('should reject invalid timezone', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/profile')
        .set('x-api-key', validApiKey)
        .send({ timezone: 'Invalid/Timezone' })
        .expect(400);
    });

    it('should reject invalid availability', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/profile')
        .set('x-api-key', validApiKey)
        .send({ availability: 'invalid-status' })
        .expect(400);
    });

    it('should reject yearsOfExperience below 0', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/profile')
        .set('x-api-key', validApiKey)
        .send({ yearsOfExperience: -1 })
        .expect(400);
    });

    it('should reject yearsOfExperience above 100', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/profile')
        .set('x-api-key', validApiKey)
        .send({ yearsOfExperience: 101 })
        .expect(400);
    });

    it('should reject invalid URL fields', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/profile')
        .set('x-api-key', validApiKey)
        .send({ profilePictureUrl: 'not-a-url' })
        .expect(400);
    });

    it('should handle empty body (no updates)', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/profile')
        .set('x-api-key', validApiKey)
        .send({})
        .expect(200);
    });

    it('should return proper response format', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/profile')
        .set('x-api-key', validApiKey)
        .send({ fullName: 'Test' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.meta).toEqual({});
        });
    });
  });

  describe('Response format consistency', () => {
    it('should return data and meta', () => {
      return request(app.getHttpServer())
        .get('/api/v1/profile')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.meta).toEqual({});
        });
    });
  });

  describe('CORS', () => {
    it('should have CORS enabled', () => {
      return request(app.getHttpServer())
        .get('/api/v1/profile')
        .set('Origin', 'http://localhost:3000')
        .expect(200)
        .expect((res) => {
          expect(res.headers).toHaveProperty('access-control-allow-origin');
        });
    });
  });

  describe('Markdown Bio Support', () => {
    const validApiKey = 'test-api-key';

    describe('GET /api/v1/profile - bioHtml field', () => {
      it('should return both bio and bioHtml fields', () => {
        return request(app.getHttpServer())
          .get('/api/v1/profile')
          .expect(200)
          .expect((res) => {
            const profile = res.body.data;
            expect(profile).toHaveProperty('bio');
            expect(profile).toHaveProperty('bioHtml');
            expect(typeof profile.bio).toBe('string');
            expect(typeof profile.bioHtml).toBe('string');
          });
      });

      it('bioHtml should contain HTML markup', () => {
        return request(app.getHttpServer())
          .get('/api/v1/profile')
          .expect(200)
          .expect((res) => {
            const profile = res.body.data;
            expect(profile.bioHtml).toMatch(/<[a-z][\s\S]*>/i);
          });
      });
    });

    describe('PATCH /api/v1/profile - markdown rendering', () => {
      it('should render basic markdown (headings)', () => {
        return request(app.getHttpServer())
          .patch('/api/v1/profile')
          .set('x-api-key', validApiKey)
          .send({ bio: '# Heading 1\n## Heading 2' })
          .expect(200)
          .expect((res) => {
            const profile = res.body.data;
            expect(profile.bio).toContain('# Heading 1');
            expect(profile.bioHtml).toContain('<h1>');
            expect(profile.bioHtml).toContain('<h2>');
            expect(profile.bioHtml).toContain('Heading 1');
            expect(profile.bioHtml).toContain('Heading 2');
          });
      });

      it('should render bold and italic', () => {
        return request(app.getHttpServer())
          .patch('/api/v1/profile')
          .set('x-api-key', validApiKey)
          .send({ bio: 'This is **bold** and *italic* text' })
          .expect(200)
          .expect((res) => {
            const profile = res.body.data;
            expect(profile.bioHtml).toContain('<strong>bold</strong>');
            expect(profile.bioHtml).toContain('<em>italic</em>');
          });
      });

      it('should render links', () => {
        return request(app.getHttpServer())
          .patch('/api/v1/profile')
          .set('x-api-key', validApiKey)
          .send({ bio: '[Google](https://google.com)' })
          .expect(200)
          .expect((res) => {
            const profile = res.body.data;
            expect(profile.bioHtml).toContain('<a href="https://google.com">');
            expect(profile.bioHtml).toContain('Google');
          });
      });

      it('should render lists', () => {
        return request(app.getHttpServer())
          .patch('/api/v1/profile')
          .set('x-api-key', validApiKey)
          .send({ bio: '- Item 1\n- Item 2\n- Item 3' })
          .expect(200)
          .expect((res) => {
            const profile = res.body.data;
            expect(profile.bioHtml).toContain('<ul>');
            expect(profile.bioHtml).toContain('<li>');
            expect(profile.bioHtml).toContain('Item 1');
            expect(profile.bioHtml).toContain('Item 2');
          });
      });

      it('should render code blocks', () => {
        return request(app.getHttpServer())
          .patch('/api/v1/profile')
          .set('x-api-key', validApiKey)
          .send({ bio: '```javascript\nconst x = 42;\n```' })
          .expect(200)
          .expect((res) => {
            const profile = res.body.data;
            expect(profile.bioHtml).toContain('<pre>');
            expect(profile.bioHtml).toContain('<code');
            expect(profile.bioHtml).toContain('const x = 42;');
          });
      });

      it('should render GFM tables', () => {
        return request(app.getHttpServer())
          .patch('/api/v1/profile')
          .set('x-api-key', validApiKey)
          .send({ bio: '| Col1 | Col2 |\n|------|------|\n| A | B |' })
          .expect(200)
          .expect((res) => {
            const profile = res.body.data;
            expect(profile.bioHtml).toContain('<table>');
            expect(profile.bioHtml).toContain('<th>');
            expect(profile.bioHtml).toContain('<td>');
            expect(profile.bioHtml).toContain('Col1');
          });
      });

      it('should render GFM task lists', () => {
        return request(app.getHttpServer())
          .patch('/api/v1/profile')
          .set('x-api-key', validApiKey)
          .send({ bio: '- [x] Completed\n- [ ] Incomplete' })
          .expect(200)
          .expect((res) => {
            const profile = res.body.data;
            expect(profile.bioHtml).toContain('<input');
            expect(profile.bioHtml).toContain('type="checkbox"');
            expect(profile.bioHtml).toContain('checked');
          });
      });
    });

    describe('XSS prevention', () => {
      it('should sanitize script tags', () => {
        return request(app.getHttpServer())
          .patch('/api/v1/profile')
          .set('x-api-key', validApiKey)
          .send({ bio: '<script>alert("XSS")</script>Safe text' })
          .expect(200)
          .expect((res) => {
            const profile = res.body.data;
            expect(profile.bioHtml).not.toContain('<script>');
            expect(profile.bioHtml).not.toContain('alert');
            expect(profile.bioHtml).toContain('Safe text');
          });
      });

      it('should sanitize event handlers', () => {
        return request(app.getHttpServer())
          .patch('/api/v1/profile')
          .set('x-api-key', validApiKey)
          .send({ bio: '<img src="x" onerror="alert(1)" />' })
          .expect(200)
          .expect((res) => {
            const profile = res.body.data;
            expect(profile.bioHtml).not.toContain('onerror');
            expect(profile.bioHtml).not.toContain('alert');
          });
      });

      it('should preserve safe HTML elements', () => {
        return request(app.getHttpServer())
          .patch('/api/v1/profile')
          .set('x-api-key', validApiKey)
          .send({ bio: '<strong>Bold</strong> <em>Italic</em>' })
          .expect(200)
          .expect((res) => {
            const profile = res.body.data;
            expect(profile.bioHtml).toContain('<strong>Bold</strong>');
            expect(profile.bioHtml).toContain('<em>Italic</em>');
          });
      });
    });

    describe('bio field validation', () => {
      it('should enforce 10k character limit', () => {
        const longBio = 'a'.repeat(10001);
        return request(app.getHttpServer())
          .patch('/api/v1/profile')
          .set('x-api-key', validApiKey)
          .send({ bio: longBio })
          .expect(400);
      });

      it('should accept bio at exactly 10k characters', () => {
        const maxBio = 'a'.repeat(10000);
        return request(app.getHttpServer())
          .patch('/api/v1/profile')
          .set('x-api-key', validApiKey)
          .send({ bio: maxBio })
          .expect(200);
      });
    });

    describe('bioHtml regeneration', () => {
      it('should regenerate bioHtml when bio is updated', () => {
        return request(app.getHttpServer())
          .patch('/api/v1/profile')
          .set('x-api-key', validApiKey)
          .send({ bio: '# New Heading' })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.bioHtml).toContain('<h1>New Heading</h1>');
          });
      });

      it('should not modify bioHtml when bio is not updated', () => {
        return request(app.getHttpServer())
          .patch('/api/v1/profile')
          .set('x-api-key', validApiKey)
          .send({ fullName: 'Different Name' })
          .expect(200)
          .expect((res) => {
            expect(res.body.data).toHaveProperty('bioHtml');
            expect(res.body.data.bioHtml.length).toBeGreaterThan(0);
          });
      });
    });
  });
});

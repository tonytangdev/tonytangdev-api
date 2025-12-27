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
});

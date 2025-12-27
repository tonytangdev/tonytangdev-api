---
"tonytangdev-api": minor
---

# API Documentation with Swagger and Scalar UI

Added comprehensive OpenAPI documentation with Scalar UI interface for all API endpoints.

- Installed @nestjs/swagger, swagger-ui-express, @scalar/api-reference
- Configured OpenAPI spec with title, description, version
- Added Scalar UI at /api/docs for modern API documentation interface
- Decorated all controllers with @ApiTags, @ApiOperation, @ApiResponse
- Decorated all DTOs with @ApiProperty and @ApiPropertyOptional
- Documented all endpoints across 7 feature modules (skills, experiences, education, projects, profile, languages, refactorings)
- Documented query parameters for pagination and filtering (refactorings)
- Documented path parameters for dynamic routes
- Prepared Bearer auth scheme for future authentication

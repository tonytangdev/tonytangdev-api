---
'tonytangdev-api': minor
---

# Add Languages Resource

Add new Languages resource to CV API with endpoints for listing spoken languages with proficiency levels.

## Features

- `GET /api/v1/languages` - Get all languages sorted by order
- `GET /api/v1/languages/highlighted` - Get highlighted languages
- `GET /api/v1/languages/native` - Get native languages

## Language Properties

- Language name (e.g., English, French, Spanish)
- Proficiency level (elementary, limited_working, professional_working, full_professional, native)
- Native language flag
- Highlighted flag for featured languages
- Sorting order

---
"tonytangdev-api": patch
---

# Add POST route for education

Added POST endpoint for education module with validation and tests.

Features:
- Create education records with institution, degree type, field of study, dates, description, and location
- Validation: unique composite key (institution + degreeType + fieldOfStudy), date constraints, status-endDate consistency
- Auto-increment order
- Default values: status=COMPLETED, isHighlighted=false, achievements=[]
- Comprehensive unit and e2e tests

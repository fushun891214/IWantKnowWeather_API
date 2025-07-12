# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IWantKnowWeather is an Express.js and MongoDB-based weather API proxy server that acts as a secure gateway between clients and third-party weather APIs. The architecture implements dual API key authentication - clients must authenticate with this server, and this server authenticates with external weather APIs.

## Development Commands

```bash
# Development
npm run dev          # Start development server with nodemon
npm start           # Start production server
npm test            # Run Jest tests
npm run lint        # Run ESLint code checking
npm run lint:fix    # Auto-fix ESLint issues

# Environment setup
cp .env.example .env # Copy environment template

# Health check
curl http://localhost:3000/health
```

## Architecture Overview

### Layered Architecture Pattern
The codebase follows a strict layered architecture with clear separation of concerns:

- **config/** - Centralized configuration management with validation
- **routes/** - HTTP route definitions and middleware binding
- **middlewares/** - Request interceptors (auth, logging, rate limiting)
- **controllers/** - HTTP request/response handling and data transformation
- **services/** - Core business logic and third-party API integration
- **models/** - MongoDB schemas and database operations
- **utils/** - Reusable utility functions

### Key Architectural Components

**Configuration System (`src/config/`)**
- All configurations are centralized and validated on startup
- Environment-based configuration switching (dev/test/prod)
- `validateAllConfig()` runs comprehensive validation before server start

**API Gateway Pattern**
- `services/apiClient/` handles all third-party API communications
- `services/auth/` manages client API key lifecycle
- Dual authentication: incoming client keys + outgoing third-party API keys

**Data Models**
- `ApiKey.js` - Client API key management with permissions and rate limiting
- `ApiRequest.js` - Comprehensive request logging with analytics capabilities

### Critical Environment Variables

Required for operation:
- `MONGODB_URI` - Database connection
- `WEATHER_API_KEY` - Third-party weather API authentication
- `JWT_SECRET` - JWT token signing
- `API_KEY_SECRET` - API key encryption

## Development Guidelines

### Configuration Management
- All new configurations must be added to the appropriate config file
- Environment variables should have fallback values where appropriate
- Run `validateAllConfig()` for any configuration changes

### Database Schema Changes
- Models include built-in validation, indexing, and helper methods
- Use mongoose middleware for computed fields and business logic
- Consider performance implications of new indexes

### API Integration
- Third-party API configurations go in `config/CWAApis.js`
- HTTP client logic belongs in `services/apiClient/`
- Always implement retry logic and error handling for external calls

### Security Considerations
- API keys are hashed using bcrypt before storage
- Rate limiting configurations are per-client and customizable
- All requests are logged for audit and analytics purposes

### Testing Strategy
- Use `MONGODB_TEST_URI` for test database isolation
- Supertest is available for HTTP endpoint testing
- Mock external API calls in tests
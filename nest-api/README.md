# UpscaleBD Assesment

### Prerequisites

- Docker & Docker Compose

### Run the Application

```bash
docker-compose up --build
```

This will:

- Start PostgreSQL database
- Run Python ETL to load sample data
- Launch NestJS API server

### Verify Setup

- **API Health**: http://localhost:3000/health
- **Swagger Documentation**: http://localhost:3000/api/docs#/

## 📖 API Documentation

**Swagger UI**: http://localhost:3000/api/docs#/

The Swagger interface provides complete API documentation.

### Available Endpoints

- `GET /api/health` - API health check
- `GET /api/users/:id/activities` - Get user's activities grouped by course
- `GET /api/courses/:id/stats` - Get course statistics
- `GET /api/lessons/popular` - Get top 3 most popular lessons

## Potential Improvements

With more time, the following improvements could be made:

- **Filtering & Pagination**: Add support to endpoints handling large datasets for better performance and user experience.

- **Caching `/lessons/popular`**: Since this endpoint uses aggregation over many records and rarely changes, caching the response for 1–5 minutes (e.g., using Redis) would improve speed and reduce database load.

---

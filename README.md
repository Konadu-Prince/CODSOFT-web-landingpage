# Quiz App

## Setup

1. Copy env file:
```
cp .env.example .env
```
2. Install deps:
```
npm install
```
3. Run:
```
npm start
```

## Endpoints
- Auth: POST /api/auth/register, POST /api/auth/login
- Quizzes: GET /api/quizzes, GET /api/quizzes/:id, POST/PUT/DELETE (with Bearer token)
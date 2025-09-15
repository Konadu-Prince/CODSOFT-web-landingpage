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
- Quizzes:
  - GET /api/quizzes?q=term&page=1&limit=10
  - GET /api/quizzes/:id
  - POST /api/quizzes (Bearer token)
  - PUT /api/quizzes/:id (Bearer token, creator only)
  - DELETE /api/quizzes/:id (Bearer token, creator only)
  - POST /api/quizzes/:id/submit
  - GET /api/quizzes/:id/results

### Request validation

- Auth register: { username (3-32), email?, password (>=6) }
- Auth login: { username, password }
- Create quiz: { title, questions: [{ question, options[>=2], correctAnswer }] }
- Submit answers: { answers: [{ selected }] } – order should match quiz questions

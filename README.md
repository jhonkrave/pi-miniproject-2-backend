## HappyFlix API (Sprint 1)

REST API for user management (Sprint 1): signup, login/logout, password reset, profile read/update, and account deletion.


### Environment variables
Create a `.env` file based on the following keys:

```
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=<very-long-random-secret>
APP_URL=http://localhost:5173
```

### Run locally
```
npm install
npm run dev
```

### Endpoints (base: /api/auth)
- POST `/signup` → 201, body: { firstName, lastName, age, email, password }
- POST `/login` → 200, sets HttpOnly cookie, body: { email, password }
- POST `/logout` → 200, clears cookie
- POST `/password/forgot` → 202
- GET `/password/verify?token=...` → 200 { valid: boolean }
- POST `/password/reset` → 200
- GET `/users/me` → 200 { id, firstName, lastName, age, email, createdAt }
- PUT `/users/me` → 200 updated object
- DELETE `/users/me` → 204 clears cookie
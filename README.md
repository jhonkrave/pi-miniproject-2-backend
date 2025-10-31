## HappyFlix API (Sprint 1 & 2)

REST API for user management (Sprint 1) and movie catalog, playback and favorites (Sprint 2).


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

### Endpoints (base: /api/movie)

Catalog (TMDB):
- GET `/movies` → list popular by default. Query params:
  - `q` for search by text
  - `genreId` for filter by genre id
  - `page` page number
  - `language` (optional override)
- GET `/movies/genres` → TMDB genre list
- GET `/movies/:id` → movie details by TMDB id
- GET `/catalog/genres` → alias of `/movies/genres`
- GET `/catalog/popular` → popular movies (paginated)
- GET `/catalog/search?q=...` → search by text
- GET `/catalog/genre/:genreId` → discover by genre
- GET `/catalog/:id` → movie details

Playback (Pexels):
- GET `/watch/:id` (auth required) → resolves TMDB movie title and returns a Pexels video candidate { movie, video, provider }

Favorites (MongoDB):
- GET `/favorites` (auth required) → returns array of TMDB movie details favorited by user
- POST `/favorite` (auth required) → body: { movieId } stores userId + movieId
- DELETE `/favorite` (auth required) → body: { movieId } removes favorite
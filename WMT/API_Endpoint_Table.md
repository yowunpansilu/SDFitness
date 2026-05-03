# API Endpoint Table

| Endpoint | Method | Description | Authentication |
|---|---|---|---|
| `/api/auth/login` | POST | Authenticate user and return JWT | Public |
| `/api/auth/google` | POST | Authenticate user via Google OAuth | Public |
| `/api/auth/register` | POST | Register a new user | Public |
| `/api/users/profile` | GET | Get current user's profile | Bearer Token |
| `/api/equipment` | GET | Get all equipment inventory | Admin Token |
| `/api/equipment` | POST | Add new equipment | Admin Token |
| `/api/equipment/:id` | PUT | Update equipment status | Admin Token |
| `/api/meals/log` | POST | Log a new meal | Bearer Token |
| `/api/recommendations` | GET | Get ML-based food/workout recommendations | Bearer Token |
| `/api/groceries` | GET | Get scraped grocery items | Bearer Token |

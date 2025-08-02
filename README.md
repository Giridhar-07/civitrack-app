# CiviTrack Backend API

This is the backend API for the CiviTrack application, a civic issue tracking platform that allows citizens to report and track local issues such as potholes, broken street lights, etc.

## Technologies Used

- Node.js
- Express.js
- TypeScript
- Sequelize ORM
- PostgreSQL (Neon)
- JWT Authentication
- Multer for file uploads

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database (or Neon PostgreSQL account)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=5000
NODE_ENV=development
API_URL=http://localhost:5000

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Database Configuration
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_SSL=true

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

4. Build the TypeScript code:

```bash
npm run build
```

5. Start the development server:

```bash
npm run dev
```

### Database Seeding

To seed the database with sample data for testing:

```bash
npm run seed
```

This will create sample users, issues, and status logs.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change user password

### Issues

- `GET /api/issues` - Get all issues (with pagination and filtering)
- `GET /api/issues/nearby` - Get issues near a location
- `GET /api/issues/:id` - Get a single issue by ID
- `POST /api/issues` - Create a new issue
- `PUT /api/issues/:id` - Update an issue
- `DELETE /api/issues/:id` - Delete an issue
- `POST /api/issues/:id/flag` - Flag an issue
- `GET /api/issues/user/me` - Get current user's issues
- `GET /api/issues/admin/statistics` - Get issue statistics (admin only)

### Health Check

- `GET /api/health` - Check API health

## File Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── scripts/        # Utility scripts
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── index.ts        # Entry point
└── server.ts       # Express server setup
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

The API returns standardized error responses with appropriate HTTP status codes:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Error details"
}
```

## License

This project is licensed under the ISC License.
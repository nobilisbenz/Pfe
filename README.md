# Node.js Express MySQL API

This is a RESTful CRUD API built with Node.js, Express, and MySQL. The application has been migrated from Sequelize ORM to use direct MySQL queries.

## Prerequisites

- Node.js (v12 or higher)
- MySQL server

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
NODE_ENV=development

# Database configuration
DB_HOST=localhost
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=school_management
```

### 4. Initialize the database

Run the database initialization script to create the necessary tables:

```bash
npm run init-db
```

This script will:
- Create the database if it doesn't exist
- Create the required tables based on the schema defined in `config/init-db.sql`

### 5. Start the server

```bash
npm start
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Admin Management

- `POST /api/v1/admins/register` - Register a new admin
- `POST /api/v1/admins/login` - Login as admin
- `GET /api/v1/admins` - Get all admins (requires authentication)
- `GET /api/v1/admins/profile` - Get admin profile (requires authentication)
- `PUT /api/v1/admins` - Update admin (requires authentication)
- `DELETE /api/v1/admins/:id` - Delete admin (requires authentication)

## Migration from Sequelize

This API has been migrated from using Sequelize ORM to direct MySQL queries. The main changes include:

1. Removed Sequelize dependencies
2. Implemented a MySQL connection pool with promisified queries
3. Refactored models to use direct SQL queries
4. Added a database initialization script

## Project Structure

```
├── app/
│   └── app.js           # Express application setup
├── config/
│   ├── dbConfig.js      # Database configuration
│   ├── dbConnect.js     # Database connection setup
│   └── init-db.sql      # SQL schema initialization
├── controller/
│   └── staff/
│       └── adminCtrl.js # Admin controller
├── middlewares/         # Authentication and error handling
├── model/
│   └── staff/
│       └── admin.js     # Admin model with MySQL queries
├── routes/
│   └── staff/
│       └── adminRouter.js # Admin routes
├── scripts/
│   └── init-database.js # Database initialization script
├── utils/               # Utility functions
└── server.js           # Server entry point
```

## License

ISC
# Fitness App

## Deployment Instructions
To deploy the Fitness App, follow these steps:
1. Clone the repository:
   ```bash
   git clone https://github.com/manubansal100-design/fitness_app.git
   ```
2. Navigate into the project directory:
   ```bash
   cd fitness_app
   ```
3. Build and deploy using Docker:
   ```bash
   docker-compose up --build
   ```

## Setup Guide
1. Ensure you have the latest version of Docker and Docker Compose installed.
2. Configure your environment variables as described below.
3. Run the deployment steps mentioned above.

## Local Development with Docker-Compose
To run the application locally, you can use Docker Compose:
1. Ensure Docker is running.
2. From the project root, run:
   ```bash
   docker-compose up
   ```
3. Access the application at `http://localhost:3000`.

## Environment Variables Configuration
Create a `.env` file in the root directory with the following configuration:
```env
DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key
NODE_ENV=development
```
Make sure to replace placeholder values with your actual configurations.

## API Endpoints Documentation
- **GET /api/v1/health**
  - Returns the health status of the application.
- **POST /api/v1/users**
  - Create a new user.
  - **Body:** `{ "username": "string", "password": "string" }`
- **GET /api/v1/users/{id}**
  - Retrieve user information by ID.

### Example Usage
- **Get Health Status:**
   ```bash
   curl -X GET http://localhost:3000/api/v1/health
   ```
- **Create User:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/users -d '{ "username": "john_doe", "password": "12345" }'
   ```

# NodeDB - Optimized Version

This is an optimized version of the NodeDB application with several improvements for security, performance, and maintainability.

## Key Optimizations

### 1. Security Improvements
- **SQL Injection Prevention**: All database queries now use parameterized statements to prevent SQL injection attacks
- **Input Validation**: Added validation for search parameters to prevent unauthorized database access
- **Environment Variables**: Sensitive configuration moved to environment variables
- **JWT Secret Management**: JWT secret now configurable via environment variables
- **Password Security**: Passwords are now securely hashed using bcrypt instead of plain text storage
- **Registration System**: Added secure user registration with password validation
- **Rate Limiting**: Added rate limiting to prevent brute force attacks on login and registration endpoints
- **CSRF Protection**: Added CSRF protection for all forms to prevent cross-site request forgery attacks

### 2. Performance Enhancements
- **Connection Pooling**: Replaced single database connection with connection pooling for better performance under load
- **Reduced Redundant Operations**: Removed duplicate JWT verification in route handlers
- **Better Error Handling**: Improved error handling with proper logging and user feedback
- **Database Indexing**: Added indexes on frequently searched columns to improve query performance
- **Migration System**: Implemented a proper database migration system for schema changes
- **API Caching**: Added caching for frequently accessed API endpoints to reduce database load
- **Query Monitoring**: Added database query monitoring and optimization utilities to track performance

### 3. Code Structure & Maintainability
- **Modular Architecture**: Improved code organization and separation of concerns
- **Consistent Error Handling**: Standardized error handling across all routes with centralized error handling middleware
- **Code Documentation**: Added comments to explain complex operations
- **Helper Functions**: Enhanced Handlebars helpers with error handling
- **Refactored Array Processing**: Removed duplicated array processing logic and moved it to shared utility functions
- **Input Validation Middleware**: Added reusable validation middleware for common validation patterns
- **Improved Form Validation Feedback**: Added field-specific error messages and visual feedback for form validation

### 5. Additional Improvements
- **HTTPS Support**: Added secure cookie support for production environments
- **Better Input Validation**: Enhanced form validation with clearer error messages
- **Resource Cleanup**: Proper resource management with connection pooling
- **Database Indexing**: Added indexes on frequently searched columns to improve query performance
- **Mobile Responsive Design**: Improved responsive design for better mobile user experience
- **Loading Indicators**: Added loading indicators for long-running operations to improve user experience

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example` (if provided)
4. Set up your MySQL database
5. Run the application:
   ```
   npm start
   ```

## Security Fixes

### Password Migration Issue

If you're experiencing login issues after the security updates, it's because existing passwords were stored in plain text but the system now expects hashed passwords. Here's how to fix it:

1. **Automatic Migration on Login**: 
   - Users can still log in with their old plain text passwords
   - On successful login, the system will automatically hash and update their password
   - This is seamless for existing users

2. **Bulk Password Migration**:
   - Run the bulk password migration script to hash all existing passwords at once:
   ```bash
   npm run migrate-all-passwords
   ```
   - This will scan all users and hash any plain text passwords

3. **Manual User Creation**:
   - For new users, use the secure user creation script:
   ```bash
   npm run create-user username password
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server configuration
PORT=3003
NODE_ENV=development

# Database configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database

# JWT configuration
JWT_SECRET=your_jwt_secret_here_change_this_for_production

# Session configuration
SESSION_SECRET=your_session_secret_here_change_this_for_production
```

## Database Migrations

This project includes a migration system to manage database schema changes:

1. Create a new migration:
   ```bash
   npm run create-migration migration-name
   ```

2. Edit the generated migration file in the `migrations` directory

3. Run pending migrations:
   ```bash
   npm run run-migrations
   ```

## Query Monitoring

The application includes database query monitoring to help identify performance issues:

- View query statistics at `/monitoring/query-stats` (requires authentication)
- Slow query detection with configurable thresholds
- Performance tracking for all database operations

## Request Logging

The application includes request logging for monitoring and debugging:

- View request logs at `/monitoring/request-logs` (requires authentication)
- Real-time request tracking with response times and status codes
- Request statistics and endpoint usage analysis

## Health Checks

The application includes health check endpoints for monitoring:

- View application health at `/health` (no authentication required)
- Database connectivity status
- Recent request analysis
- Uptime monitoring

## Security Notes

1. In production, always use a strong JWT secret
2. Use environment variables for all sensitive configuration
3. Enable HTTPS and secure cookies in production
4. Regularly update dependencies to address security vulnerabilities
5. Passwords are now securely hashed using bcrypt (previous plain text passwords can be migrated using `npm run migrate-passwords`)
6. New users are automatically created with properly hashed passwords

## Performance Notes

1. Connection pooling is configured with a limit of 10 connections
2. Queries are optimized with proper indexing recommendations
3. Error handling is designed to fail gracefully without exposing sensitive information

## Testing

This project includes unit tests for critical business logic:

1. Run all tests:
   ```bash
   npm test
   ```

2. Run tests in watch mode:
   ```bash
   npm run test:watch
   ```

Currently tested components:
- Password hashing and comparison utilities
- Array processing utilities
- API endpoints (integration tests with mocked dependencies)

## Documentation

- [API Documentation](API_DOCUMENTATION.md) - Complete API endpoints documentation
- Code is documented with JSDoc comments for better maintainability

## License

This project is licensed under the MIT License.
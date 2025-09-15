# IP Address Tracking Implementation

## Overview

This implementation adds IP address tracking to your Node.js application, allowing you to monitor and log client connections. This is especially useful when your application is deployed and accessed by remote clients.

## Features Implemented

### 1. IP Address Capture
- Captures client IP addresses using multiple headers for accuracy
- Handles different proxy configurations (X-Forwarded-For, X-Real-IP)
- Falls back to direct connection IP when headers are not available

### 2. Database Logging
- Creates an `ip_logs` table to store connection information
- Logs IP address, user agent, action, and timestamp for each request
- Non-blocking database inserts to avoid performance impact

### 3. Request Tracking
- Logs all HTTP requests with method and URL
- Excludes static assets (CSS, JS, favicon) from logging
- Tracks both successful and failed login attempts

### 4. Visualization
- Provides a web interface to view IP logs
- Displays IP address, user agent, action, and timestamp
- Limits display to 100 most recent entries

## Key Components

### 1. IP Capture Middleware
- Located in `app.js`
- Captures IP from multiple sources for accuracy
- Stores IP in request object for use in other middleware

### 2. IP Logging Middleware
- Located in `app.js`
- Inserts log entries into database
- Non-blocking to avoid performance impact

### 3. IP Logs Route
- Located in `routes/ip-logs.js`
- Provides authenticated access to IP logs
- Renders logs in a user-friendly format

### 4. IP Logs Template
- Located in `views/ip-logs.handlebars`
- Displays logs in a responsive table format

### 5. Database Table Creation
- Route at `/create-ip-logs-table` creates the necessary table
- Table includes IP address, user agent, timestamp, and action

## How It Works

### IP Address Detection
The system tries multiple methods to detect the client's IP address:
1. `X-Forwarded-For` header (for reverse proxy setups)
2. `X-Real-IP` header (for Nginx and other proxies)
3. Direct connection IP address
4. Socket IP address (fallback)

### Data Storage
Connection information is stored in the `ip_logs` table with:
- `id`: Auto-incrementing primary key
- `ip_address`: Client's IP address (up to 45 characters for IPv6)
- `user_agent`: Browser/user agent string
- `timestamp`: When the request was made
- `action`: HTTP method and URL

### Accessing Logs
1. Visit `/create-ip-logs-table` to create the database table
2. Access logs through the web interface at `/logs/ip-logs`
3. Logs are displayed in a paginated table (limited to 100 entries)

## Privacy Considerations

### Data Retention
- Logs are stored indefinitely unless manually cleaned
- Consider implementing automatic log rotation

### Sensitive Information
- Only stores IP addresses, not personal information
- User agent strings may contain identifying information
- No credentials or sensitive data are logged

## Deployment Notes

### Behind Proxies
When deploying behind a reverse proxy (Nginx, Apache, CDN):
- Ensure proxy headers are properly configured
- The application will correctly detect client IPs

### Database Performance
- Logging is non-blocking to avoid performance impact
- Consider indexing the `ip_address` column for large datasets
- For high-traffic applications, consider log aggregation systems

## Usage Instructions

1. Start your application
2. Visit `http://localhost:3003/create-ip-logs-table` to create the logs table
3. Access logs at `http://localhost:3003/logs/ip-logs` (requires authentication)
4. View console output for real-time IP tracking

## Limitations

1. When running locally, all connections will show as localhost (127.0.0.1)
2. IPv6 addresses are supported but may require additional formatting
3. Proxy configurations may affect IP detection accuracy
4. User agent strings can be spoofed or modified
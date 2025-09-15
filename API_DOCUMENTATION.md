# API Documentation

## Authentication

### POST /login
Authenticate a user with username and password.

**Request:**
```
POST /login
Content-Type: application/x-www-form-urlencoded

username=testuser&password=testpass
```

**Response:**
- 302 Redirect to `/index` on success
- 200 with login form and error messages on failure

### GET /login
Display the login form.

**Request:**
```
GET /login
```

**Response:**
- 200 with login form HTML

## Profile Management

### GET /index
Display the main dashboard with recent profiles.

**Request:**
```
GET /index
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
- 200 with dashboard HTML
- 302 to `/login` if not authenticated

### GET /add/profile
Display the form to add a new profile.

**Request:**
```
GET /add/profile
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
- 200 with add profile form HTML
- 302 to `/login` if not authenticated

### POST /add/profile
Create a new profile.

**Request:**
```
POST /add/profile
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/x-www-form-urlencoded

nume_client=John Doe&tip_auto=BMW 320&nr_inmatriculare=B123ABC&serie_caroserie=ABC123&serie_motor=XYZ789&nr_tel=0721123456
```

**Response:**
- 302 Redirect to `/index` on success
- 200 with form and errors on validation failure
- 302 to `/login` if not authenticated

### GET /index/view/:id
View details of a specific profile and associated jobs.

**Request:**
```
GET /index/view/123
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
- 200 with profile details and jobs HTML
- 302 to `/login` if not authenticated

### GET /edit/profile/:id
Display the form to edit a profile.

**Request:**
```
GET /edit/profile/123
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
- 200 with edit profile form HTML
- 302 to `/login` if not authenticated

### POST /edit/profile/:id
Update an existing profile.

**Request:**
```
POST /edit/profile/123
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/x-www-form-urlencoded

nume_client=John Smith&tip_auto=BMW 320&nr_inmatriculare=B123ABC&serie_caroserie=ABC123&serie_motor=XYZ789&nr_tel=0721123456
```

**Response:**
- 302 Redirect to `/index` on success
- 200 with form and errors on validation failure
- 302 to `/login` if not authenticated

### GET /remove/profile/:id
Display the form to confirm profile removal.

**Request:**
```
GET /remove/profile/123
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
- 200 with remove confirmation HTML
- 302 to `/login` if not authenticated

### POST /remove/profile/:id
Remove (soft delete) a profile.

**Request:**
```
POST /remove/profile/123
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
- 302 Redirect to `/index` on success
- 302 to `/login` if not authenticated

## Job Management

### GET /add/jobs/:profile_id
Display the form to add a new job for a profile.

**Request:**
```
GET /add/jobs/123
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
- 200 with add job form HTML
- 302 to `/login` if not authenticated

### POST /add/jobs/:profile_id
Create a new job for a profile.

**Request:**
```
POST /add/jobs/123
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/x-www-form-urlencoded

// Various job fields including arrays for parts and operations
```

**Response:**
- 302 Redirect to `/index/view/:profile_id` on success
- 200 with form and errors on validation failure
- 302 to `/login` if not authenticated

### GET /index/viewjobs/:job_id
View details of a specific job.

**Request:**
```
GET /index/viewjobs/456?profile=123
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
- 200 with job details HTML
- 302 to `/login` if not authenticated

### GET /edit/jobs/:job_id
Display the form to edit a job.

**Request:**
```
GET /edit/jobs/456?profile=123
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
- 200 with edit job form HTML
- 302 to `/login` if not authenticated

### POST /edit/jobs/:job_id
Update an existing job.

**Request:**
```
POST /edit/jobs/456?profile=123
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/x-www-form-urlencoded

// Various job fields including arrays for parts and operations
```

**Response:**
- 302 Redirect to `/index/view/:profile_id` on success
- 200 with form and errors on validation failure
- 302 to `/login` if not authenticated

### GET /remove/jobs/:job_id
Display the form to confirm job removal.

**Request:**
```
GET /remove/jobs/456?profile=123
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
- 200 with remove confirmation HTML
- 302 to `/login` if not authenticated

### POST /remove/jobs/:job_id
Remove (soft delete) a job.

**Request:**
```
POST /remove/jobs/456?profile=123
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
- 302 Redirect to `/index/view/:profile_id` on success
- 302 to `/login` if not authenticated

## Reports

### GET /index/raport/:job_id
Generate an HTML report for a job.

**Request:**
```
GET /index/raport/456?profile=123
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
- 200 with report HTML
- 302 to `/login` if not authenticated

### GET /index/raport-pdf/:job_id
Generate a PDF report for a job.

**Request:**
```
GET /index/raport-pdf/456?profile=123
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
- 200 with PDF report
- 500 with error message on failure
- 302 to `/login` if not authenticated

## Search

### POST /index
Search for profiles.

**Request:**
```
POST /index
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/x-www-form-urlencoded

searchQuery=John&searchParam=nume_client
```

**Response:**
- 200 with search results HTML
- 302 to `/login` if not authenticated

## API Endpoints

### GET /index/getdb
Get profile data as JSON (for API use).

**Request:**
```
GET /index/getdb
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
- 200 with JSON array of profiles
- 500 with error message on database failure
- 302 to `/login` if not authenticated

### GET /monitoring/query-stats
Get database query statistics.

**Request:**
```
GET /monitoring/query-stats
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
- 200 with JSON array of query statistics
- 302 to `/login` if not authenticated

## Database Management

### GET /create-tables
Create all database tables.

**Request:**
```
GET /create-tables
```

**Response:**
- 200 with success message HTML

### GET /migrate-database
Run database migrations.

**Request:**
```
GET /migrate-database
```

**Response:**
- 200 with success message HTML
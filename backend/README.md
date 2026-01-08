# Job Portal Backend API

Node.js + Express backend for the Job Portal application.

## Tech Stack
- Express.js
- Supabase (Database + Auth)
- Wasabi S3 (File Storage)
- Node-cron (Task Scheduler)

## Setup

### Install Dependencies
```bash
npm install
```

### Environment Variables
Create a `.env` file:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

WASABI_ACCESS_KEY=your_wasabi_key
WASABI_SECRET_KEY=your_wasabi_secret
WASABI_BUCKET=resumes
WASABI_REGION=us-east-1
WASABI_ENDPOINT=https://s3.wasabisys.com

PORT=3001
```

### Run Server
```bash
npm start
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Authentication
```
POST /api/auth/register    - Register user
POST /api/auth/login       - Login user
GET  /api/auth/profile     - Get profile (authenticated)
```

### Jobs
```
GET    /api/jobs/active    - Get active jobs (authenticated)
GET    /api/jobs/all       - Get all jobs (admin)
GET    /api/jobs/:id       - Get job by ID (authenticated)
POST   /api/jobs           - Create job (admin)
PUT    /api/jobs/:id       - Update job (admin)
PUT    /api/jobs/:id/end   - End application (admin)
DELETE /api/jobs/:id       - Delete job (admin)
```

### Applications
```
POST /api/applications/apply              - Submit application (authenticated, multipart/form-data)
GET  /api/applications/my-applications    - Get user applications (authenticated)
GET  /api/applications/all                - Get all applications (admin, with filters)
PUT  /api/applications/:id/status         - Update status (admin)
GET  /api/applications/top-candidates     - Get top candidates (admin)
```

## Project Structure
```
backend/
├── controllers/          # Business logic
│   ├── authController.js
│   ├── jobController.js
│   └── applicationController.js
├── middleware/          # Auth & validation
│   └── auth.js
├── routes/              # API routes
│   ├── auth.js
│   ├── jobs.js
│   └── applications.js
├── services/            # External services
│   ├── email.js         # Supabase email
│   ├── wasabi.js        # S3 storage
│   ├── ats.js          # ATS scoring
│   └── scheduler.js     # Cron jobs
├── utils/               # Utilities
│   └── supabase.js      # Supabase client
├── server.js            # Entry point
├── package.json
└── .env
```

## Features

### Automated Job Expiry
- Runs daily at midnight
- Checks for expired jobs
- Evaluates applications
- Sends email notifications

### ATS Scoring
- Automatic calculation on application
- Based on skill matching
- Score range: 0-100

### Email Notifications
- Shortlisted candidates (top 30%)
- Rejected candidates (bottom 70%)
- Sent via Supabase Auth Admin API

### File Upload
- Resume upload to Wasabi S3
- PDF only, max 5MB
- Public URL storage

## Development

### Start with Watch Mode
```bash
npm run dev
```

### Testing Endpoints
```bash
# Health check
curl http://localhost:3001/api/health

# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

## Deployment

### Railway
1. Push to GitHub
2. Connect Railway to repository
3. Set environment variables
4. Deploy

### Render
1. Create new Web Service
2. Connect repository
3. Set environment variables
4. Deploy

### AWS
1. Create EC2 instance
2. Install Node.js
3. Clone repository
4. Set environment variables
5. Use PM2 for process management

## Security Considerations
- JWT authentication on all protected routes
- Role-based access control
- File type and size validation
- RLS enabled on database
- Environment variables for secrets
- CORS configuration

## Monitoring
- Console logs for debugging
- Error logging for failures
- Scheduler execution logs
- Email delivery logs

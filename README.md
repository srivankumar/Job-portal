# Job Portal - Full-Stack Application

A comprehensive job portal system built with React, Node.js, Express, and Supabase. Features include role-based authentication, job management, application tracking, ATS scoring, and automated email notifications.

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Lucide React (icons)

### Backend
- Node.js
- Express
- Supabase (Database + Auth + Email)
- Wasabi S3 (Resume Storage)
- Node-cron (Job Scheduler)

## Features

### Authentication
- User registration and login
- Admin login with role-based access
- JWT-based authentication
- Protected routes

### User Features
- View active job listings
- Apply for jobs with resume upload (PDF only)
- Track application status
- View ATS scores
- Auto-filled application forms

### Admin Features
- Create, edit, and delete jobs
- Set application deadlines
- Manually end applications
- View all applications with filters
- Download candidate resumes
- View top candidates by ATS score
- Dashboard with statistics

### Automation
- Automatic job expiry on deadline
- ATS score calculation
- Automated email notifications (shortlisted/rejected)
- Daily scheduler for expired jobs

## Project Structure

```
project/
├── backend/
│   ├── controllers/          # Business logic
│   ├── middleware/           # Auth & validation
│   ├── routes/              # API routes
│   ├── services/            # External services (email, storage, scheduler)
│   ├── utils/               # Utilities (Supabase client)
│   ├── server.js            # Entry point
│   └── package.json
│
├── src/
│   ├── components/          # React components
│   ├── context/             # Auth context
│   ├── pages/               # Page components
│   ├── services/            # API service
│   ├── App.tsx              # Main app with routing
│   └── main.tsx
│
└── README.md
```

## Setup Instructions

### 1. Supabase Setup

The database schema is already created via migrations. The following tables are available:
- `users` - User accounts with roles
- `jobs` - Job listings
- `applications` - Job applications

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

WASABI_ACCESS_KEY=your_wasabi_access_key
WASABI_SECRET_KEY=your_wasabi_secret_key
WASABI_BUCKET=resumes
WASABI_REGION=us-east-1
WASABI_ENDPOINT=https://s3.wasabisys.com

PORT=3001
```

Start the backend server:

```bash
npm start
```

The API will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
npm install
```

The frontend will connect to the backend API at `http://localhost:3001`

Start the development server:

```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Jobs (User)
- `GET /api/jobs/active` - Get active jobs
- `GET /api/jobs/:id` - Get job details

### Jobs (Admin)
- `GET /api/jobs/all` - Get all jobs
- `POST /api/jobs` - Create job
- `PUT /api/jobs/:id` - Update job
- `PUT /api/jobs/:id/end` - End application
- `DELETE /api/jobs/:id` - Delete job

### Applications
- `POST /api/applications/apply` - Submit application
- `GET /api/applications/my-applications` - Get user applications
- `GET /api/applications/all` - Get all applications (admin)
- `PUT /api/applications/:id/status` - Update status (admin)
- `GET /api/applications/top-candidates` - Get top candidates (admin)

## User Roles

### Regular User
- View active jobs
- Apply for jobs
- Track applications
- View ATS scores

### Admin
- All user permissions
- Create/edit/delete jobs
- View all applications
- Filter candidates
- End applications manually
- Access to top candidates

## Email Notifications

Emails are sent automatically when:
1. Admin manually ends an application
2. Application deadline is reached (daily cron job)

Email types:
- **Shortlisted**: Top 30% of candidates by ATS score
- **Rejected**: Remaining 70% of candidates

## Job Expiry Logic

Jobs expire when:
1. Current date > application_deadline
2. Admin clicks "End Application" button

When a job expires:
- Applications are evaluated
- Top 30% marked as "shortlisted"
- Remaining 70% marked as "rejected"
- Emails sent to all applicants
- Job marked as inactive

## ATS Scoring

ATS (Applicant Tracking System) scores are calculated based on:
- Skill matching from job requirements
- Random bonus points for variation
- Score range: 0-100

## Security

- Row Level Security (RLS) enabled on all tables
- JWT-based authentication
- Role-based access control
- Protected API routes
- Secure file uploads (PDF only, 5MB max)

## Creating an Admin Account

To create an admin account, register normally and then update the role in Supabase:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

Or register directly with the API by adding `role: 'admin'` to the registration payload.

## Troubleshooting

### Backend Issues
- Ensure all environment variables are set correctly
- Check Supabase credentials
- Verify Wasabi bucket exists and credentials are correct

### Frontend Issues
- Ensure backend is running on port 3001
- Check browser console for errors
- Verify API endpoints are accessible

### Database Issues
- Check RLS policies are enabled
- Verify user has correct role
- Check Supabase logs

## Production Deployment

### Backend
1. Set environment variables in your hosting platform
2. Update CORS settings if needed
3. Deploy to services like Railway, Render, or AWS

### Frontend
1. Update API_URL in `src/services/api.ts` to production backend URL
2. Build: `npm run build`
3. Deploy to Vercel, Netlify, or any static hosting

## License

This project is built as a demonstration of a full-stack job portal system.

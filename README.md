# EthioHandy Backend API

Complete Node.js backend for the EthioHandy marketplace platform.

## Features

- ✅ Phone number authentication with OTP (mock for MVP)
- ✅ JWT-based authentication
- ✅ Role-based access control (Customer, Handyman, Admin)
- ✅ Handyman self-registration
- ✅ Location-based handyman search with geo queries
- ✅ Job management system (create, accept, update status, complete)
- ✅ Ratings and trust system
- ✅ Payment and commission tracking
- ✅ Admin dashboard endpoints

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB connection string:
```
MONGODB_URI=mongodb://localhost:27017/ethio-handy
JWT_SECRET=your-super-secret-jwt-key
```

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Run the server:
```bash
# Development
npm run dev

# Production
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone number
- `POST /api/auth/verify-otp` - Verify OTP and login
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Handymen
- `POST /api/handymen/register` - Register as handyman (protected)
- `GET /api/handymen/profile/me` - Get own handyman profile (protected)
- `PUT /api/handymen/profile/me` - Update handyman profile (protected)
- `GET /api/handymen/search` - Search nearby handymen (public)
- `GET /api/handymen/:id` - Get handyman by ID (public)

### Jobs
- `POST /api/jobs` - Create job request (customer)
- `GET /api/jobs/customer/my-jobs` - Get customer's jobs
- `GET /api/jobs/handyman/my-jobs` - Get handyman's jobs
- `GET /api/jobs/:jobId` - Get job by ID
- `PUT /api/jobs/:jobId/accept` - Accept job (handyman)
- `PUT /api/jobs/:jobId/reject` - Reject job (handyman)
- `PUT /api/jobs/:jobId/status` - Update job status (handyman)
- `PUT /api/jobs/:jobId/cancel` - Cancel job (customer)

### Ratings
- `POST /api/ratings/job/:jobId` - Create rating (customer)
- `GET /api/ratings/handyman/:handymanId` - Get handyman ratings (public)

### Admin
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/handymen` - Get all handymen
- `GET /api/admin/jobs` - Get all jobs
- `PUT /api/admin/users/:userId/block` - Block/unblock user
- `PUT /api/admin/handymen/:handymanId/verify` - Verify/unverify handyman

## Database Models

- **User**: Base user model with phone authentication
- **Handyman**: Extended profile for handymen with skills, pricing, location
- **Job**: Service requests from customers to handymen
- **Rating**: Customer ratings for completed jobs
- **Payment**: Payment and commission tracking

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT expiration time (default: 7d)
- `COMMISSION_RATE` - Platform commission percentage (default: 10)

## Notes

- OTP is mocked for MVP (returns OTP in response in development)
- In production, integrate with SMS service (Twilio, etc.)
- File uploads for profile photos not yet implemented
- Payment processing is manual (cash/mobile money) for MVP


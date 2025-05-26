# Appointment System Backend

A comprehensive appointment management system backend built with Node.js, Express, and MongoDB.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [User Management](#user-management)
  - [Student Management](#student-management)
  - [Document Requests](#document-requests)
  - [Appointments & Bookings](#appointments--bookings)
  - [Contact Form](#contact-form)
  - [File Attachments](#file-attachments)

## Features

- User Authentication (JWT)
- Password Reset with OTP Verification
- Document Request Management
- Appointment Scheduling
- File Upload System
- Contact Form Management
- Student Information Management
- Admin Dashboard Support
- Holiday Management
- Email Notifications

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Gmail account for email notifications

## Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd appointment-system-backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables (see [Environment Variables](#environment-variables) section)

4. Start the server:

```bash
npm start
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GMAIL_USER=your_gmail_address
GMAIL_PASS=your_gmail_app_password
EMAIL_USER=your_email_for_sending_notifications
NODE_ENV=development
```

## API Documentation

### Authentication

#### Sign Up

```http
POST /api/signup
Content-Type: application/json

{
    "name": "User Name",
    "email": "user@example.com",
    "password": "Password@123",
    "confirmPassword": "Password@123"
}
```

#### Sign In

```http
POST /api/signin
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "Password@123"
}
```

#### Password Reset Flow

1. Request OTP:

```http
POST /api/forgot-password/request-otp
Content-Type: application/json

{
    "email": "user@example.com"
}
```

2. Verify OTP:

```http
POST /api/forgot-password/verify-otp
Content-Type: application/json

{
    "email": "user@example.com",
    "otp": "123456"
}
```

3. Reset Password:

```http
POST /api/forgot-password/reset-password
Content-Type: application/json

{
    "email": "user@example.com",
    "newPassword": "NewPassword@123"
}
```

### User Management

#### Get All Users (Protected)

```http
GET /api/signup
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get User by ID (Protected)

```http
GET /api/signup/:userId
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Update User (Protected)

```http
PUT /api/signup/:userId
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
    "name": "Updated Name",
    "email": "updated.email@example.com"
}
```

### Student Management

#### Create Student

```http
POST /api/students
Content-Type: application/json

{
    "surname": "Doe",
    "firstName": "John",
    "middleName": "M",
    "lastSchoolYearAttended": "2022-2023",
    "courseOrStrand": "Science",
    "presentAddress": "123 Main St",
    "contactNumber": "09123456789",
    "emailAddress": "john.doe@example.com"
}
```

#### Get All Students

```http
GET /api/students
```

#### Get Student by ID

```http
GET /api/students/:studentId
```

### Document Requests

#### Create Document Request

```http
POST /api/document-requests/docs
Content-Type: application/json

{
    "studentId": "student_id",
    "selectedDocuments": ["Certificate of Enrollment"],
    "purpose": "Job Application",
    "dateOfRequest": "2024-03-20"
}
```

#### Get All Document Requests

```http
GET /api/document-requests/docs
```

#### Get Document Request with Student Details

```http
GET /api/document-requests/docs/with-student/:requestId
```

### Appointments & Bookings

#### Create Schedule

```http
POST /api/schedules
Content-Type: application/json

{
    "slots": 40,
    "date": "2024-03-20",
    "startTime": "8:00 AM",
    "endTime": "4:00 PM"
}
```

#### Create Booking

```http
POST /api/bookings
Content-Type: application/json

{
    "studentId": "student_id",
    "scheduleId": "schedule_id"
}
```

#### Get All Bookings

```http
GET /api/bookings
```

### Contact Form

#### Submit Contact Form

```http
POST /api/contact
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Inquiry",
    "message": "Message content"
}
```

### File Attachments

#### Upload Files

```http
POST /api/attachment/upload
Content-Type: multipart/form-data

files: [file1, file2, ...]
```

Supported file types:

- Images
- PDF documents
- Maximum file size: 5MB
- Maximum files per upload: 10

## Security Features

- Password Hashing
- JWT Authentication
- OTP Verification
- Rate Limiting
- Input Validation
- File Upload Restrictions
- Protected Routes

## Error Handling

The API returns standard HTTP status codes:

- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error responses include:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development mode only)"
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

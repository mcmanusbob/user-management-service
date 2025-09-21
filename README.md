# User Management Service

A comprehensive user management microservice built with Node.js, Express, and MongoDB for a learning platform.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Student, Instructor, Admin)
  - Refresh token mechanism
  - Password reset functionality
  - Email verification

- **User Profile Management**
  - Detailed user profiles with skills, experience, education
  - Profile completeness tracking
  - Social links and interests
  - Learning goals management

- **User Preferences**
  - Learning preferences (style, pace, content types)
  - Notification preferences (email, push, in-app)
  - Privacy settings
  - Accessibility settings
  - Interface customization

- **Security Features**
  - Rate limiting
  - Input validation and sanitization
  - Helmet.js security headers
  - Account lockout protection
  - Secure password hashing

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Validation**: Joi
- **Logging**: Winston
- **Testing**: Jest, Supertest
- **Security**: Helmet, bcryptjs, express-rate-limit

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd user-management-service
# Gym Management System with AI Diet Plan Generator

A comprehensive full-stack gym management system featuring AI-powered personalized diet plan generation. Built with Node.js, Express, MongoDB, and React.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4%2B-green)](https://www.mongodb.com/)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This Gym Management System is designed to streamline gym operations while providing members with AI-powered personalized nutrition guidance. The system consists of three main applications:

- **Frontend**: Member-facing interface for profile management, workout tracking, and AI diet plan generation
- **Admin Panel**: Administrative interface for gym owners and staff to manage operations
- **Backend API**: Centralized Node.js/Express server serving both applications

### Key Highlight

The **AI Diet Plan Generator** creates personalized meal plans based on:
- User's fitness goals (weight loss, muscle gain, endurance)
- Dietary preferences and restrictions (vegetarian, vegan, allergies)
- **Budget constraints** - generates affordable meal plans
- Activity level and metabolic requirements
- Macro and calorie targets

---

## Features

### 👥 For Gym Members (Frontend)
- ✅ User registration and authentication
- ✅ Profile management with health metrics
- ✅ **AI-powered diet plan generation** with budget awareness
- ✅ Workout tracking and progress monitoring
- ✅ Class booking system
- ✅ QR code-based check-in/check-out
- ✅ Membership management
- ✅ Payment history and invoices
- ✅ Weekly meal plans with cooking instructions
- ✅ Automated shopping lists

### 🔧 For Gym Administrators (Admin Panel)
- ✅ Comprehensive dashboard with analytics
- ✅ Member management (CRUD operations)
- ✅ Membership plan creation and management
- ✅ Payment processing and tracking
- ✅ Trainer management
- ✅ Class scheduling and capacity management
- ✅ Equipment inventory and maintenance tracking
- ✅ Attendance reports and analytics
- ✅ Revenue tracking and financial reports
- ✅ Data visualization with charts and graphs

### 🚀 Backend Features
- ✅ RESTful API architecture
- ✅ JWT-based authentication
- ✅ Role-based access control (Member, Trainer, Admin)
- ✅ AI integration (OpenAI/Anthropic/Google Gemini)
- ✅ Payment gateway integration (Stripe/Razorpay)
- ✅ Email notifications
- ✅ File upload to cloud storage
- ✅ Automated calculations (TDEE, BMI, macros)

---

## 🛠️ Tech Stack

### Frontend & Admin
- **Framework**: React.js 18+
- **State Management**: React Context API / Redux
- **Styling**: Tailwind CSS / Bootstrap
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Charts**: Chart.js / Recharts
- **UI Components**: Material-UI / Ant Design

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **File Upload**: Multer
- **Email**: Nodemailer

### AI & External Services
- **AI APIs**: OpenAI GPT-4 / Anthropic Claude / Google Gemini
- **Payment**: Stripe / Razorpay / PayPal
- **Cloud Storage**: AWS S3 / Cloudinary
- **QR Codes**: qrcode library

### Development Tools
- **Package Manager**: npm / yarn
- **Environment Variables**: dotenv
- **Testing**: Jest, Supertest
- **Code Quality**: ESLint, Prettier
- **Version Control**: Git

---

## 📁 Project Structure

```
gym-management-system/
├── frontend/                    # Member-facing React application
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API service calls
│   │   ├── context/            # React Context
│   │   ├── hooks/              # Custom hooks
│   │   ├── utils/              # Helper functions
│   │   └── styles/             # CSS/SCSS files
│   ├── .env
│   ├── package.json
│   └── README.md
│
├── admin/                       # Admin panel React application
│   ├── public/
│   ├── src/
│   │   ├── components/         # Admin UI components
│   │   ├── pages/              # Admin pages
│   │   │   ├── Dashboard/
│   │   │   ├── Members/
│   │   │   ├── Payments/
│   │   │   ├── Analytics/
│   │   │   └── ...
│   │   ├── services/           # API service calls
│   │   ├── context/            # Admin context
│   │   └── utils/              # Helper functions
│   ├── .env
│   ├── package.json
│   └── README.md
│
├── backend/                     # Node.js/Express API server
│   ├── config/                 # Configuration files
│   ├── controllers/            # Route controllers
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # API routes
│   ├── middleware/             # Custom middleware
│   ├── services/               # Business logic
│   │   ├── aiService.js       # AI diet plan generation
│   │   ├── paymentService.js  # Payment processing
│   │   └── emailService.js    # Email notifications
│   ├── utils/                  # Helper functions
│   ├── tests/                  # Unit & integration tests
│   ├── .env
│   ├── server.js               # Entry point
│   ├── package.json
│   └── README.md
│
├── .gitignore
├── docker-compose.yml           # Optional Docker setup
├── LICENSE
└── README.md                    # This file
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **npm** or **yarn** package manager
- **Git** for version control

### Required API Keys
- **AI Service**: OpenAI API key OR Anthropic API key OR Google AI API key
- **Payment Gateway**: Stripe/Razorpay account and API keys
- **Email Service**: SMTP credentials (Gmail, SendGrid, etc.)
- **Cloud Storage** (optional): AWS S3 or Cloudinary credentials

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/gym-management-system.git
cd gym-management-system
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Install Admin Panel Dependencies

```bash
cd ../admin
npm install
```

---

## ⚙️ Configuration

### Backend Configuration

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/gym_management
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gym_management

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# AI API Keys (Choose one or multiple)
OPENAI_API_KEY=sk-your-openai-api-key
# ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key
# GOOGLE_AI_API_KEY=your-google-ai-api-key

# Payment Gateway (Choose one)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
# OR
# RAZORPAY_KEY_ID=your_razorpay_key_id
# RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# File Storage (AWS S3)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET_NAME=your_bucket_name
AWS_REGION=us-east-1

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

### Frontend Configuration

Create a `.env` file in the `frontend/` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### Admin Configuration

Create a `.env` file in the `admin/` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🎮 Running the Application

### Development Mode

You'll need **three terminal windows** to run all applications:

#### Terminal 1 - Backend Server

```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

#### Terminal 2 - Frontend (Member Interface)

```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

#### Terminal 3 - Admin Panel

```bash
cd admin
npm start
# Admin panel runs on http://localhost:3001
```

### Production Mode

```bash
# Build frontend
cd frontend
npm run build

# Build admin
cd ../admin
npm run build

# Start backend server
cd ../backend
npm start
```

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

### Member Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/members` | Get all members (Admin) |
| GET | `/api/members/:id` | Get member details |
| POST | `/api/members` | Create new member |
| PUT | `/api/members/:id` | Update member |
| DELETE | `/api/members/:id` | Delete member (Admin) |

### Diet Plan Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/diet-plans/generate` | Generate AI diet plan |
| GET | `/api/diet-plans/member/:memberId` | Get member's diet plans |
| GET | `/api/diet-plans/:id` | Get specific diet plan |
| PUT | `/api/diet-plans/:id` | Update diet plan |
| DELETE | `/api/diet-plans/:id` | Delete diet plan |

### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments` | Process payment |
| GET | `/api/payments/member/:memberId` | Get payment history |
| GET | `/api/payments/:id` | Get payment details |

### Additional Endpoints

- **Memberships**: `/api/memberships`
- **Workouts**: `/api/workouts`
- **Classes**: `/api/classes`
- **Attendance**: `/api/attendance`
- **Equipment**: `/api/equipment`
- **Analytics**: `/api/analytics`

> For detailed API documentation with request/response examples, see [API_DOCS.md](./API_DOCS.md)

---

## 🗄️ Database Schema

### Key Collections

#### Users Collection
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  role: String (member/trainer/admin),
  firstName: String,
  lastName: String,
  phoneNumber: String,
  isActive: Boolean
}
```

#### Members Collection
```javascript
{
  userId: ObjectId (ref: Users),
  membershipId: ObjectId (ref: Memberships),
  height: Number,
  currentWeight: Number,
  targetWeight: Number,
  fitnessGoals: [String],
  dietaryPreferences: [String],
  allergies: [String],
  activityLevel: String
}
```

#### DietPlans Collection
```javascript
{
  memberId: ObjectId (ref: Members),
  budget: Number,
  targetCalories: Number,
  macroSplit: { protein, carbs, fats },
  meals: [{
    mealType: String,
    items: [String],
    calories: Number,
    macros: Object,
    estimatedCost: Number,
    instructions: [String]
  }],
  weeklySchedule: [Object],
  shoppingList: [String]
}
```

> For complete schema details, see [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)  
> For security implementation details, see [SECURITY.md](./SECURITY.md)  
> For API documentation, see [API_DOCS.md](./API_DOCS.md)  
> For testing strategy, see [TESTING.md](./TESTING.md)  
> For deployment guide, see [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🌐 Deployment

### Backend Deployment (Heroku Example)

```bash
cd backend

# Login to Heroku
heroku login

# Create app
heroku create gym-api

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set OPENAI_API_KEY=your_openai_key

# Deploy
git push heroku main
```

### Frontend Deployment (Vercel Example)

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# REACT_APP_API_URL=https://gym-api.herokuapp.com/api
```

### Admin Deployment (Netlify Example)

```bash
cd admin

# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Set environment variables in Netlify dashboard
# REACT_APP_API_URL=https://gym-api.herokuapp.com/api
```

### Recommended Deployment Setup

- **Backend**: Heroku, AWS EC2, DigitalOcean, or Render
- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Admin**: Vercel, Netlify (separate subdomain)
- **Database**: MongoDB Atlas (cloud-hosted)
- **File Storage**: AWS S3 or Cloudinary

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test                 # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
```

### Frontend Tests

```bash
cd frontend
npm test
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
# Ensure MongoDB is running
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

**Port Already in Use**
```bash
# Find and kill process using port 5000
lsof -ti:5000 | xargs kill -9
```

**CORS Issues**
- Ensure `CLIENT_URL` and `ADMIN_URL` are correctly set in backend `.env`
- Check CORS configuration in `backend/server.js`

**AI API Errors**
- Verify API keys are valid and have sufficient credits
- Check API rate limits
- Ensure proper error handling in `backend/services/aiService.js`

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- OpenAI for GPT API
- MongoDB team for excellent database
- React team for the amazing framework
- All contributors who help improve this project

---

## 📞 Support

For support, email support@yourgymsystem.com or open an issue in the GitHub repository.

---

## 🗺️ Roadmap

- [ ] Mobile application (React Native)
- [ ] AI-powered workout plan generation
- [ ] Integration with fitness wearables
- [ ] Video streaming for online classes
- [ ] Nutrition tracking with barcode scanning
- [ ] Social features and member community
- [ ] Multi-language support
- [ ] Advanced analytics with ML insights

---

## 📊 Screenshots

### Member Dashboard
![Member Dashboard](./screenshots/member-dashboard.png)

### AI Diet Plan Generator
![Diet Plan Generator](./screenshots/diet-plan-generator.png)

### Admin Panel
![Admin Panel](./screenshots/admin-panel.png)

---

**Made with ❤️ for fitness enthusiasts and gym owners**
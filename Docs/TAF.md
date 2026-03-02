Page 1 of 4
IT2021 AIML Project – 2026 Jan
Topic Approval Form
1. Project ID: AI-01-G08
2. Project Title: Gym Management System with AI Diet Plan Generator
3. Campus: Malabe Campus
4. WD/WE: WD
5. Group Information
Stream: Artificial Intelligence
Registration
Number
Student Name Phone Number Signature
01 IT24102008 Withana W.Y.P 0764056285
02 IT24101252 Matharaarachchi D.C.M 0779662291
03 IT24103530 Ilham M.M 0705546555
04 IT24100732 Kodituwakku S.D 0766115583
05 IT24100697 Kamsha S 0740862223
06 IT24103087 Anojaa S 0762547043
6. Client Information / Project Justification
A. Project with a Client: Yes
Client Name/ Organization: SD Fitness Center
Contact Person & Designation: MR. Shehan Dhananjaya
Email: sdfitness@gmail.com
7. A brief description of the problem.
8. Main Features of the Proposed System.
List software features. Software features should be functional and meaningful parts of the system,
not just simple UI pages. Where possible, they should connect to or use the AI/ML feature.
The Problem: Traditional gym nutrition guidance is inaccessible and expensive for most gym members.
Personal nutritionists charge 1500-2500 ruppees per session, making personalized diet plans unaffordable for
average gym goers. Generic, one-size-fits-all meal plans ignore individual fitness goals, budget constraints,
dietary restrictions, and metabolic differences. This creates a critical gap where members struggle to achieve
their fitness goals because they lack affordable, personalized nutrition guidance is the key factor that
determines 70% of fitness success.
The AI/ML Solution: Our application uses AI models (OpenAI GPT-4/Google Gemini/Anthropic Claude) to
generate budget-aware, personalized diet plans instantly. The system analyzes user biometrics (height, weight,
activity level), fitness goals, dietary preferences, allergies, and most importantly budget constraints to create
affordable 7-day meal plans with detailed recipes, macro breakdowns, and auto generated shopping lists. This
democratizes nutrition guidance by providing nutritionist level personalization at zero cost to members,
differentiates gyms from competitors, and addresses the industry's biggest gap: making evidence-based
nutrition accessible to everyone, not just wealthy clients. The innovation lies in AI-powered meal planning that
maintains nutritional adequacy while strictly respecting financial limitations something no other fitness
platform does effectively.
Page 2 of 4
IT2021 AIML Project – 2026 Jan
Topic Approval Form
Registration
Number
Name of Feature/s Brief description of feature(s) in point form
01 IT24102008 Backend API & Auth with AI
Integration
• Centralized Node.js/Express server with MongoDB
for data handling
• JWT-based authentication and role-based access
(member, trainer, admin)
• AI service layer that interfaces with OpenAI/Gemini
API for diet generation
• Stores user health metrics, preferences, and AI-
generated plans in database
02 IT24101252 Member Frontend with AI Diet
Interface
• React.js app for user registration, profile
management, workout tracking
• AI Diet Plan Generator UI: input preferences (goals,
budget, allergies, activity)
• Display personalized plans with meals, macros, costs,
shopping lists
• QR code check-in/out, class booking, and payment
history
03 IT24103530 Admin Panel with AI
Monitoring
• React.js admin interface for member CRUD,
membership plans, trainer management
• Analytics dashboard with charts for revenue,
attendance, member retention
• AI oversight: view all generated diet plans, analyze
adherence trends
• Monitor AI performance metrics (generation time,
API costs, user satisfaction)
04 IT24100732 Payment & AI Notification
System
• Stripe/Razorpay integration for secure payment
processing
• Email notifications (Nodemailer) for memberships,
payments, renewals
• AI-triggered notifications: new diet plan ready,
weekly plan reminders
Page 3 of 4
IT2021 AIML Project – 2026 Jan
Topic Approval Form
• Budget tracking: alert users when meal costs exceed
specified limits
05 IT24100697 Equipment, Class & AI Activity
Tracking
• Equipment inventory with maintenance scheduling
and status tracking
• Class scheduling system with capacity management
and bookings
• Activity level monitoring: track classes attended,
workout frequency
• Feed activity data to AI for dynamic TDEE
adjustments in diet plans
06 IT24103087 Analytics, AI Optimization &
Security
• Backend services for TDEE/BMI/BMR calculations
using validated formulas
• Progress monitoring: weight tracking, goal progress
visualization
• AI performance optimization: response caching,
fallback API handling
• Security: data encryption, secure AI API key
management, health data privacy
• Feedback from users and admin management
Page 4 of 4
IT2021 AIML Project – 2026 Jan
Topic Approval Form
9. AI/ML Feature of the Proposed System.
Feature Name: AI-Powered Personalized Diet Plan Generator
Registration
Number (Same
order as above)
Expected individual contribution to the AI/ML feature.
IT24102008
Design and implement AI service architecture: API integration (OpenAI/Gemini),
prompt engineering for diet generation, request/response handling, error
management, plan storage in MongoDB, ML model selection criteria
IT24101252
Develop AI diet plan UI: user input forms (goals, preferences, budget), real-time AI
generation feedback, display formatted plans with macros/costs, shopping list
generation, plan history, A/B testing for user experience
IT24103530
Build AI monitoring dashboard: track generation metrics, analyze plan quality,
pattern recognition in user preferences, AI cost analysis, recommendation
algorithm improvements, admin override capabilities
IT24100732
Implement budget constraints in AI prompts: cost estimation algorithms, price
database integration, budget optimization logic, notification triggers, payment-AI
linkage, financial analytics
IT24100697
Enhance AI with activity data: TDEE calculation algorithms, activity multiplier
factors, class attendance impact on calorie needs, equipment usage patterns,
dynamic plan adjustments. AI-Based Activity Classification (Classification drives
calorie and macro adjustments). Equipment-Type Impact Analysis (Equipment-Type
Impact Analysis).
IT24103087
AI optimization & ethics: response caching strategies, fallback API implementation,
rate limiting, data preprocessing for AI, bias detection in recommendations, health
data security, GDPR compliance, performance tuning
10. Approval by the Evaluator
Name: Dr Kapila Dissanayake.
Date: 2026.02.06
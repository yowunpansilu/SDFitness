# SDFitness — Gym Management System & FitGenius AI

> **Status:** Production-ready | MERN Stack + Python ML + Google Gemini 2.0 Flash

SDFitness is a comprehensive gym management platform featuring **FitGenius AI**—a personalized, budget-aware diet plan generator that uses a custom ML model to suggest meal plans based on real-world supermarket prices (Cargills/Keells).

---

## 🏗️ Architecture

SDFitness follows a modern 4-tier microservices architecture:

1.  **Frontend (Vite + React)**: Member-facing dashboard for profile, workout tracking, and diet generation.
2.  **Admin Panel (Vite + React)**: Full administrative suite for managing members, staff, payments, and AI data.
3.  **Backend (Node.js + Express)**: Central API gateway managing business logic, payments, and serving as the bridge to Gemini.
4.  **ML-Service (Python + Flask)**: High-performance inference engine for caloric calculations and food ranking based on live market prices.

---

## 🚀 Quick Start (Preferred: Docker)

Ensure you have **Docker** and **Docker Compose** installed.

### 1. Setup Environment
Create a `.env` file in the root directory (use `.env.example` as a template). You MUST provide a `MONGO_URI` (Atlas recommended) and a `GEMINI_API_KEY`.

```bash
# Clone the repository
git clone <repo-url>
cd SDFitness

# Configure Environment
cp .env.example .env
# Edit .env with your keys
```

### 2. Run with Docker Compose
```bash
docker-compose up --build
```

### 3. Access Services
| Service | URL | Port |
| :--- | :--- | :--- |
| **Frontend** | [http://localhost:5173](http://localhost:5173) | 5173 |
| **Admin Panel** | [http://localhost:3001](http://localhost:3001) | 3001 |
| **Backend API** | [http://localhost:5005](http://localhost:5005) | 5005 |
| **ML-Service** | [http://localhost:5001](http://localhost:5001) | 5001 |
| **Mongo Express** | [http://localhost:8081](http://localhost:8081) | 8081 |

---

## 📁 Project Structure

```
SDFitness/
├── frontend/                # Member React App (Vite)
├── admin-pannel/            # Admin React App (Vite)
├── backend/                 # Node.js Express API
├── ml-service/              # Python Flask ML Application
├── scripts/                 # Migration & setup scripts
├── docker-compose.yml       # Full stack containerization
└── .env                     # Global configuration
```

---

## 🧠 FitGenius AI Pipeline

The diet plan generation follows a unique "Strict Logic → Creative Polish" pipeline:

1.  **Price Crawling**: `ml-service` fetches live prices from MongoDB Atlas (scraped from Sri Lankan supermarkets).
2.  **Fuzzy Matching**: Raw product names are mapped to canonical food items using a sophisticated fuzzy matching bridge.
3.  **ML Recommendation (Python)**: A GBM model ranks food combinations targeting the user's specific macros and budget constraint (~20ms).
4.  **Gemini Enrichment (Node.js)**: Google Gemini 2.0 Flash takes the ML selections and generates appetizing recipes and descriptions.

---

## 🛠️ Tech Stack

**Backend**: Node.js, Express, MongoDB (Atlas), Mongoose
**ML**: Python 3.11, Flask, Scikit-learn, Pandas, TheFuzz
**Frontend**: React (Vite), Tailwind CSS, Framer Motion
**AI**: Google Gemini 2.0 Flash API
**Deployment**: Docker, Docker Compose

---

## 🧪 Testing

```bash
# Test the ML Service
cd ml-service
python -m pytest

# Test the Backend
cd backend
npm test
```

---

## 📝 License
Licensed under the MIT License.

*Made with ❤️ for Fitness Enthusiasts*

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
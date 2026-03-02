# ML Service: Team Work Distribution

The `ml-service` has been divided into 5 balanced roles. This distribution ensures that complex files like [train.py](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/model/train.py) (which has 4 distinct steps) and [recommender.py](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/model/recommender.py) (inference vs. planning logic) are shared fairly.

| Member | Role | Primary Files / Components | Focus |
| :--- | :--- | :--- | :--- |
| **Member 1** | **Data Scientist** | [train.py](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/model/train.py) (Steps 1 & 2) | Synthetic user generation and the scoring logic that teaches the model preferences. |
| **Member 2** | **MLOps Engineer** | [train.py](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/model/train.py) (Steps 3 & 4), [Dockerfile](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/Dockerfile), [requirements.txt](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/requirements.txt) | Model training, performance metrics, visualization, and containerization. |
| **Member 3** | **Nutrition Logic** | [recommender.py](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/model/recommender.py) (Inference core) | TDEE/Macro calculations and model-driven food scoring logic. |
| **Member 4** | **Optimization Architect** | [recommender.py](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/model/recommender.py) (Planning engine) | 7-day meal plan generation, variety rotation, and budget optimization. |
| **Member 5** | **Integration & Ethics** | [app.py](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/app.py), [bias_analysis.py](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/notebooks/bias_analysis.py) | Flask API endpoints and the bias detection suite (Gender/Age fairness). |

## Breakdown of Contribution

### 1. ML Training Pipeline ([train.py](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/model/train.py))
Divided between **Member 1** and **Member 2**:
- **Member 1** builds the data foundation (User & Pair generation).
- **Member 2** handles the "Machine" (Model training, metrics, and saving the [.pkl](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/model/diet_model.pkl)).

### 2. Live Recommendation Engine ([recommender.py](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/model/recommender.py))
Divided between **Member 3** and **Member 4**:
- **Member 3** handles the inputs (Scoring foods and Macro math).
- **Member 4** handles the output (The actual 7-day schedule heuristics and shopping lists).

### 3. Service & Quality ([app.py](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/app.py) & [bias_analysis.py](file:///Users/yowunpansilu/Documents/GitHub/SDFitness/ml-service/notebooks/bias_analysis.py))
Managed by **Member 5**:
- Handling the API interface for the Node.js backend.
- Verifying the model doesn't over-rely on gender or age markers (Bias Analysis).

### 4. Infrastructure
Managed by **Member 2**:
- Ensures the Python environment is reproducible via Docker.

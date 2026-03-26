# SDFitness Platform - Architecture Diagrams

## System Architecture

```mermaid
graph TD
    %% Client Layer
    subgraph Client Layer
        Web[React Frontend SPA]
        Mobile[Mobile Browser]
    end

    %% API Gateway / Routing
    subgraph API Routing
        Nginx[Reverse Proxy / Nginx]
    end

    %% Backend Services
    subgraph Backend Microservices
        NodeAPI[Node.js / Express API Server]
        Auth[Authentication Service]
        Billing[Stripe Billing Service]
    end

    %% ML Service
    subgraph AI/ML Engine
        Flask[Python Flask Service]
        Scraper[Keells Price Scraper]
        Model[(Gradient Boosting Model .pkl)]
    end

    %% Data Layer
    subgraph Data Persistence
        MongoDB[(MongoDB Atlas)]
    end

    %% Connections
    Web -->|HTTPS/REST| Nginx
    Mobile -->|HTTPS/REST| Nginx
    
    Nginx -->|Route /api| NodeAPI
    Nginx -->|Route /ml| Flask
    
    NodeAPI -->|JWT Validate| Auth
    NodeAPI -->|Payments| Billing
    NodeAPI -->|CRUD Operations| MongoDB
    
    NodeAPI -->|Internal HTTP Request| Flask
    
    Flask -->|Fetch Prices| Scraper
    Flask -->|Inference| Model
```

## Data Flow Diagram (Diet Generation)

```mermaid
sequenceDiagram
    participant User as React Frontend
    participant API as Node.js Backend
    participant DB as MongoDB
    participant ML as Python ML Service

    User->>API: POST /api/diet-plans/generate (Preferences, Goals)
    activate API
    
    API->>DB: Fetch User Physics (Height, Weight, Age)
    DB-->>API: User Data
    
    API->>ML: POST /recommend (User Data + Preferences)
    activate ML
    
    ML->>ML: Calculate TDEE & Macros
    ML->>ML: Scrape Live Prices (if expired)
    ML->>ML: Model Inference (Score Foods)
    ML->>ML: Build 7-Day Heuristic Plan
    
    ML-->>API: JSON Diet Plan Payload
    deactivate ML
    
    API->>DB: Save Generated Diet Plan
    API-->>User: 200 OK (Diet Plan Display)
    deactivate API
```

## Use Case Diagram (Core)

```mermaid
usecaseDiagram
    actor Member
    actor Admin
    actor Trainer

    %% Member Cases
    Member --> (Manage Profile & Health Metrics)
    Member --> (Generate AI Diet Plan)
    Member --> (Book Classes)
    Member --> (View Grocery List)

    %% Trainer Cases
    Trainer --> (Manage Availability)
    Trainer --> (View Assigned Classes)
    Trainer --> (Message Members)

    %% Admin Cases
    Admin --> (Manage Equipment Inventory)
    Admin --> (View Gym Analytics)
    Admin --> (Manage Subscriptions)
```

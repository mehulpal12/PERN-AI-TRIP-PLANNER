# AI Trip Planner

An AI-powered trip planning platform built with a scalable microservices architecture. The application enables users to create and manage trips, generate personalized AI travel itineraries, and experience fast responses through caching and background job processing.

## Live Demo

**Application:** http://13.61.193.96/dashboard

---

## Features

### Authentication & Security

* JWT Authentication
* Email Verification
* Password Reset
* Protected Routes
* Role-Based Access Control

### Trip Management

* Create, Update, Delete Trips
* Manage Trip Details
* Store AI-Generated Itineraries
* Regenerate Itineraries

### AI Features

* AI-Powered Travel Itinerary Generation
* Personalized Recommendations
* Asynchronous Processing with BullMQ

### Performance & Scalability

* Redis Caching
* Background Job Processing
* Microservices Architecture
* Dockerized Services

---

## Architecture

```text
Frontend (Next.js)
        │
        ▼
API Gateway
        │
 ┌──────┼──────┬──────┐
 ▼      ▼      ▼
User   Trip    AI
Service Service Service
                │
                ▼
             BullMQ
                │
                ▼
              Redis

User Service ───┐
Trip Service ───┼──► PostgreSQL
AI Service ─────┘
```

---

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Zustand

### Backend

* Node.js
* Express.js
* TypeScript
* REST APIs

### Database & Caching

* PostgreSQL
* Prisma ORM
* Redis

### Background Processing

* BullMQ

### DevOps & Deployment

* Docker
* Docker Compose
* Nginx
* AWS EC2
* GitHub Actions (CI/CD)

---

## Microservices

### API Gateway

* Request Routing
* Authentication Middleware
* Service Communication

### User Service

* User Authentication
* Email Verification
* Password Reset
* Profile Management

### Trip Service

* Trip CRUD Operations
* Trip Members
* Itinerary Storage

### AI Service

* AI Itinerary Generation
* Queue Management
* Cache Management

### Worker Service

* BullMQ Job Processing
* AI Request Execution
* Background Task Handling

---

## Deployment

The application is deployed on AWS EC2 using Docker and Docker Compose.

### Infrastructure

* AWS EC2
* Docker Containers
* Nginx Reverse Proxy
* PostgreSQL
* Redis
* BullMQ Workers

### CI/CD

GitHub Actions automates:

* Build Validation
* Docker Image Builds
* Automated Deployment to AWS EC2

---

## Key Highlights

* Designed a production-style microservices architecture.
* Implemented Redis caching for improved performance.
* Integrated BullMQ for scalable background job processing.
* Containerized all services using Docker.
* Deployed and managed infrastructure on AWS EC2.
* Built a complete AI-powered travel planning workflow.

---

## Future Improvements

* HTTPS & Custom Domain
* Monitoring & Logging
* Analytics Dashboard
* Real-Time Notifications
* Multi-Provider AI Support

---

## Author

**Mehul Pal**

GitHub: https://github.com/your-github-username

LinkedIn: https://www.linkedin.com/in/mehul-pal-3ab6891b2/


<div align="center">

# WearIt

### AI-powered fashion shopping, personalized discovery, and virtual try-on.

<p align="center">
  <img src="./frontend/assets/image (2).png" alt="WearIt Logo" width="180" />
</p>

<p>
  <a href="YOUR_LIVE_DEMO_URL">Live Demo</a>
  ·
  <a href="https://github.com/imInderjeetGil/WearIt/issues">Report Bug</a>
  ·
  <a href="https://github.com/imInderjeetGil/WearIt/issues">Request Feature</a>
</p>

<p>
  <img src="https://img.shields.io/github/stars/imInderjeetGil/WearIt?style=for-the-badge" alt="GitHub Stars" />
  <img src="https://img.shields.io/github/forks/imInderjeetGil/WearIt?style=for-the-badge" alt="GitHub Forks" />
  <img src="https://img.shields.io/github/issues/imInderjeetGil/WearIt?style=for-the-badge" alt="GitHub Issues" />
  <img src="https://img.shields.io/github/license/imInderjeetGil/WearIt?style=for-the-badge" alt="License" />
</p>

</div>

---

## Overview

**WearIt** is a full-stack fashion e-commerce platform focused on creating a more personalized and interactive online shopping experience.

It combines a modern React storefront with a FastAPI backend, secure authentication, product discovery, cart and wishlist management, payments, recommendations, cloud image storage, and AI-powered virtual try-on functionality.

> Discover your style. Visualize your look. Wear it with confidence.

---

## Preview

<!-- Replace these placeholders with your actual screenshots or GIFs. -->

<div align="center">

### Homepage

![WearIt Homepage](YOUR_HOMEPAGE_SCREENSHOT_URL)

### Product Discovery

![WearIt Product Discovery](YOUR_PRODUCT_LISTING_SCREENSHOT_URL)

### Virtual Try-On

![WearIt Virtual Try-On](YOUR_VIRTUAL_TRY_ON_SCREENSHOT_URL)

</div>

---

## Features

- Modern and responsive fashion storefront
- Product browsing with categories and filters
- Product details with sizing and reviews
- User authentication and profile management
- JWT-based authorization
- Shopping cart and wishlist
- Order management
- Razorpay payment integration
- AI-powered virtual try-on
- Personalized product recommendations
- Product and user image uploads
- Amazon S3 image storage
- Database migrations with Alembic
- Dockerized local and production environments
- Nginx reverse proxy configuration
- Application health and readiness checks
- Configurable Gemini and Hugging Face AI providers

---

## Tech Stack

### Frontend

| Technology | Usage |
| --- | --- |
| React | User interface |
| Vite | Frontend tooling |
| Tailwind CSS | Styling |
| React Router | Client-side routing |
| Zustand | State management |
| Axios | API communication |
| Framer Motion | Animations |
| Embla Carousel | Carousels |
| Headless UI | Accessible UI components |

### Backend

| Technology | Usage |
| --- | --- |
| FastAPI | REST API |
| Python | Backend language |
| SQLAlchemy | ORM |
| PostgreSQL | Database |
| Alembic | Database migrations |
| Pydantic | Data validation |
| JWT | Authentication |
| Uvicorn | ASGI server |

### Services and Infrastructure

| Technology | Usage |
| --- | --- |
| Docker | Containerization |
| Docker Compose | Local orchestration |
| Nginx | Reverse proxy and static serving |
| Amazon S3 | Image storage |
| Razorpay | Payment processing |
| Google Gemini | AI features |
| Hugging Face | AI model provider |
| Amazon ECR | Container image registry |
| AWS EC2 | Production hosting |

---

## Architecture

```text
                              ┌───────────────┐
                              │    Browser    │
                              └───────┬───────┘
                                      │
                                      ▼
                         ┌────────────────────────┐
                         │  React + Nginx Frontend │
                         │   Static Files + Proxy  │
                         └────────────┬───────────┘
                                      │
                              /api/v1 requests
                                      │
                                      ▼
                         ┌────────────────────────┐
                         │    FastAPI Backend     │
                         │                        │
                         │ Auth, Products, Cart,  │
                         │ Orders, Payments, AI   │
                         └───────┬────────┬───────┘
                                 │        │
                                 ▼        ▼
                         ┌───────────┐  ┌──────────────┐
                         │ PostgreSQL│  │ External APIs│
                         │ Database  │  │ S3, Razorpay │
                         └───────────┘  │ Gemini, HF   │
                                        └──────────────┘
```

---

## Project Structure

```text
WearIt/
├── backend/
│   ├── api/                  # API routes and controllers
│   ├── core/                 # Configuration and security
│   ├── db/                   # Database setup and sessions
│   ├── models/               # SQLAlchemy database models
│   ├── schemas/              # Pydantic schemas
│   ├── services/             # Business logic and integrations
│   ├── alembic/              # Database migrations
│   ├── main.py               # FastAPI application entry point
│   ├── requirements.in       # Direct dependencies
│   └── requirements.txt      # Pinned dependencies
│
├── frontend/
│   ├── public/               # Public assets
│   ├── src/                  # React application source
│   ├── assets/               # Frontend assets
│   ├── package.json          # Frontend dependencies and scripts
│   └── vite.config.ts        # Vite configuration
│
├── docker-compose.yml        # Development environment
├── docker-compose.prod.yml   # Production environment
├── nginx.conf                # Nginx configuration
├── .env.example              # Environment variable template
└── run-dev.ps1               # Development helper script
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Git
- Python 3.11 or higher
- Node.js 20 or higher
- npm
- Docker and Docker Compose

### Clone the repository

```bash
git clone https://github.com/imInderjeetGil/WearIt.git
cd WearIt
```

### Configure environment variables

```bash
cp .env.example .env
```

For Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Update `.env` with your local configuration.

> Never commit your real `.env` file, API keys, database passwords, or production credentials.

---

## Run with Docker

Start the complete development environment:

```bash
docker compose up --build
```

Stop the containers:

```bash
docker compose down
```

Stop the containers and remove local database data:

```bash
docker compose down -v
```

> Use `docker compose down -v` carefully because it removes the PostgreSQL volume.

---

## Run Without Docker

### Backend

```bash
cd backend

python -m venv .venv
```

Activate the virtual environment.

#### macOS/Linux

```bash
source .venv/bin/activate
```

#### Windows PowerShell

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the development server:

```bash
uvicorn main:app --reload
```

The API will be available at:

```text
http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Useful commands:

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

---

## Environment Variables

Copy `.env.example` to `.env` and configure the required values.

| Variable | Description |
| --- | --- |
| `DB_USER` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_NAME` | PostgreSQL database name |
| `DATABASE_URL` | Database connection URL |
| `ENV` | Application environment |
| `SECRET_KEY` | JWT signing secret |
| `CORS_ORIGINS` | Allowed frontend origins |
| `RAZORPAY_KEY_ID` | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key |
| `AWS_REGION` | AWS region |
| `AWS_BUCKET_NAME` | S3 bucket name |
| `GEMINI_API_KEY` | Gemini API key |
| `TRYON_PROVIDER` | Virtual try-on provider |
| `HUGGINGFACEHUB_API_TOKEN` | Hugging Face token |

---

## API Health Checks

The backend exposes the following endpoints:

```http
GET /health
GET /health/ready
GET /
```

| Endpoint | Purpose |
| --- | --- |
| `/health` | Checks whether the API is running |
| `/health/ready` | Checks API and database readiness |
| `/` | Returns a basic backend status |

During local development, FastAPI documentation is available at:

```text
http://localhost:8000/docs
```

---

## Production Deployment

Production deployment uses Docker images hosted on Amazon ECR.

Configure the following variables in the production `.env` file:

```env
ECR_REGISTRY=your-account.dkr.ecr.your-region.amazonaws.com
IMAGE_TAG=v1.0.0
```

Start the production environment:

```bash
docker compose -f docker-compose.prod.yml up -d
```

Run database migrations:

```bash
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

Production recommendations:

- Use immutable image tags instead of `latest`
- Keep secrets outside the repository
- Enable HTTPS through Nginx
- Run migrations during deployment
- Use an AWS IAM role for EC2-based S3 access
- Configure proper CORS origins
- Disable development-only API documentation

---

## Development Workflow

1. Create a new branch from `main`.

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes.
3. Run frontend linting and build checks.
4. Test the backend API.
5. Verify Docker startup.
6. Commit your changes.

```bash
git add .
git commit -m "feat: add your feature"
```

7. Push your branch.

```bash
git push origin feature/your-feature-name
```

8. Open a pull request.

---

## Contributing

Contributions are welcome and appreciated.

Before opening a pull request:

- Keep changes focused and relevant
- Follow the existing project structure
- Avoid committing secrets
- Add tests where applicable
- Update documentation when needed
- Include screenshots for UI-related changes
- Use clear and descriptive commit messages

Please read the contribution guidelines before submitting a pull request.

> Detailed contribution guidelines will be added in `CONTRIBUTING.md`.

---

## Roadmap

- [ ] Improve product recommendation engine
- [ ] Add automated test coverage
- [ ] Add CI/CD workflow
- [ ] Add admin dashboard
- [ ] Add advanced product filters
- [ ] Improve virtual try-on accuracy
- [ ] Add order tracking
- [ ] Add notification system
- [ ] Add mobile application
- [ ] Add detailed contributor documentation

---

## Security

If you discover a security vulnerability, please do not open a public issue.

Instead, contact the maintainer privately:

```text
YOUR_SECURITY_EMAIL@example.com
```

Please include:

- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested mitigation, if available

---

## License

This project currently does not include a license.

If you intend to make WearIt open source, add an appropriate license file such as:

- MIT
- Apache-2.0
- GNU GPLv3

Until a license is added, all rights are reserved by the copyright holder.

---

## Maintainer

<div align="center">

### Inderjeet Gil

<a href="https://github.com/imInderjeetGil">
  <img src="https://img.shields.io/badge/GitHub-imInderjeetGil-181717?style=for-the-badge&logo=github" alt="GitHub" />
</a>

</div>

---

<div align="center">

If you find this project useful, consider giving it a ⭐

Built with ❤️ for a smarter and more confident shopping experience.

</div>

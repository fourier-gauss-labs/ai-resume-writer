# LaTeX Service Container

This directory contains the LaTeX document generation service that runs as a containerized microservice on Google Cloud Run.

## Directory Structure

```
latex-service/
├── Dockerfile                 # Container build configuration
├── docker-compose.yml         # Local development setup
├── requirements.txt           # Python dependencies
├── .dockerignore              # Files to exclude from build context
├── README.md                  # This file
├── src/                       # Application source code
│   ├── app.py                 # Main Flask application
│   ├── latex_compiler.py      # LaTeX compilation logic
│   ├── template_manager.py    # Template loading and processing
│   └── utils/
│       ├── validation.py      # Input validation
│       └── error_handling.py  # Error handling utilities
├── templates/                 # LaTeX template files
│   └── ats-friendly-single-column/
│       ├── template.tex
│       ├── metadata.json
│       └── styles/
├── scripts/                   # Build and deployment scripts
│   ├── build.sh              # Docker image build script
│   ├── deploy.sh             # Cloud Run deployment script
│   └── test-local.sh         # Local testing script
└── tests/                    # Unit and integration tests
    ├── test_app.py
    ├── test_compiler.py
    └── fixtures/
        └── sample_data.json
```

## Development Workflow

1. **Local Development**: Use docker-compose for local testing
2. **Build**: Use `scripts/build.sh` to build Docker image
3. **Deploy**: Use `scripts/deploy.sh` to deploy to Cloud Run
4. **Testing**: Use `scripts/test-local.sh` for local endpoint testing

## Environment Variables

- `PORT`: Server port (default: 8080)
- `GOOGLE_CLOUD_PROJECT`: GCP project ID
- `LATEX_TEMPLATES_BUCKET`: Firebase Storage bucket for templates
- `LOG_LEVEL`: Logging level (DEBUG, INFO, WARNING, ERROR)

## Getting Started

```bash
# Build the Docker image
cd latex-service
./scripts/build.sh

# Run locally with docker-compose
docker-compose up

# Test the service
./scripts/test-local.sh
```

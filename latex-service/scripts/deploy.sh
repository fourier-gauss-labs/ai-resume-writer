#!/bin/bash

# Deployment script for LaTeX service to Google Cloud Run
set -e

# Configuration
SERVICE_NAME="latex-resume-service"
IMAGE_NAME="ai-resume-latex-service"
TAG=${1:-latest}
REGION=${REGION:-us-central1}
PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-ai-resume-writer-46403}
DOCKER_REPO=${DOCKER_REPO:-iambillmccann}

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI is not installed"
    exit 1
fi

echo "Deploying LaTeX service to Cloud Run..."
echo "Service: ${SERVICE_NAME}"
echo "Region: ${REGION}"
echo "Project: ${PROJECT_ID}"
echo "Image: ${DOCKER_REPO}/${IMAGE_NAME}:${TAG}"

# Deploy to Cloud Run
gcloud run deploy ${SERVICE_NAME} \
    --image=${DOCKER_REPO}/${IMAGE_NAME}:${TAG} \
    --platform=managed \
    --region=${REGION} \
    --project=${PROJECT_ID} \
    --allow-unauthenticated \
    --memory=2Gi \
    --cpu=1 \
    --timeout=300 \
    --concurrency=10 \
    --max-instances=10 \
    --set-env-vars="GOOGLE_CLOUD_PROJECT=${PROJECT_ID}" \
    --port=8080

echo "Deployment completed successfully!"

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
    --region=${REGION} \
    --project=${PROJECT_ID} \
    --format='value(status.url)')

echo "Service URL: ${SERVICE_URL}"
echo ""
echo "Test the service:"
echo "curl ${SERVICE_URL}/health"

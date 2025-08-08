#!/bin/bash

# Build script for LaTeX service Docker image
set -e

# Configuration
IMAGE_NAME="ai-resume-latex-service"
TAG=${1:-latest}
DOCKER_REPO=${DOCKER_REPO:-your-dockerhub-username}

echo "Building LaTeX service Docker image..."
echo "Image: ${DOCKER_REPO}/${IMAGE_NAME}:${TAG}"

# Build the Docker image
docker build -t ${DOCKER_REPO}/${IMAGE_NAME}:${TAG} .

# Tag as latest if not already
if [ "$TAG" != "latest" ]; then
    docker tag ${DOCKER_REPO}/${IMAGE_NAME}:${TAG} ${DOCKER_REPO}/${IMAGE_NAME}:latest
fi

echo "Build completed successfully!"
echo "Image: ${DOCKER_REPO}/${IMAGE_NAME}:${TAG}"

# Optional: Push to Docker Hub (uncomment when ready)
echo ""
echo "To push to Docker Hub, run:"
echo "docker push ${DOCKER_REPO}/${IMAGE_NAME}:${TAG}"
echo "docker push ${DOCKER_REPO}/${IMAGE_NAME}:latest"

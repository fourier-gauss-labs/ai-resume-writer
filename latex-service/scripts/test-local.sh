#!/bin/bash

# Local testing script for LaTeX service
set -e

# Configuration
BASE_URL="http://localhost:8080"

echo "Testing LaTeX service locally..."

# Test health endpoint
echo "Testing health endpoint..."
curl -f "${BASE_URL}/health" || {
    echo "Error: Health check failed. Is the service running?"
    echo "Start the service with: docker-compose up"
    exit 1
}

echo "✅ Health check passed"

# Test templates endpoint
echo ""
echo "Testing templates endpoint..."
curl -f "${BASE_URL}/templates" | jq . || {
    echo "Error: Templates endpoint failed"
    exit 1
}

echo "✅ Templates endpoint working"

# Test compile endpoint with sample data
echo ""
echo "Testing compile endpoint..."

# Sample JSON data for testing
SAMPLE_DATA='{
  "templateId": "ats-friendly-single-column",
  "content": {
    "personalInfo": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "(555) 123-4567",
      "location": "San Francisco, CA"
    },
    "summary": "Experienced software engineer with 5+ years in full-stack development",
    "experience": [
      {
        "title": "Senior Software Engineer",
        "company": "Tech Corp",
        "duration": "2021 - Present",
        "bullets": [
          "Led development of microservices architecture",
          "Improved system performance by 40%"
        ]
      }
    ],
    "education": [
      {
        "degree": "B.S. Computer Science",
        "school": "University of California",
        "year": "2019"
      }
    ],
    "skills": ["Python", "JavaScript", "React", "Node.js", "Docker"],
    "certifications": []
  }
}'

curl -X POST "${BASE_URL}/compile" \
     -H "Content-Type: application/json" \
     -d "${SAMPLE_DATA}" \
     -o /tmp/test-resume.json || {
    echo "Error: Compile endpoint failed"
    exit 1
}

# Check if PDF was generated
if [ -f /tmp/test-resume.json ] && grep -q "pdfBase64" /tmp/test-resume.json; then
    echo "✅ Compile endpoint working - PDF generated"
else
    echo "❌ Compile endpoint failed - No PDF generated"
    exit 1
fi

echo ""
echo "🎉 All tests passed! LaTeX service is working correctly."

# Cleanup
rm -f /tmp/test-resume.json

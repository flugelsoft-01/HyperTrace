#!/usr/bin/env bash
set -e

# Google Cloud Run Free Tier Automated Deployment Script

SERVICE_NAME="hyperledger-supplychain"
REGION="us-central1"

echo "========================================================="
echo "☁️  Deploying Hyperledger Fabric Supply Chain App to GCP Cloud Run"
echo "========================================================="

if ! command -v gcloud &> /dev/null; then
    echo "⚠️  gcloud CLI is not installed on your system."
    echo "To deploy for FREE to Google Cloud Run:"
    echo "1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
    echo "2. Run: gcloud auth login"
    echo "3. Run: gcloud config set project YOUR_PROJECT_ID"
    echo "4. Execute this script: ./scripts/deploy-cloudrun.sh"
    exit 0
fi

echo "1️⃣  Building and pushing container image via Google Cloud Build..."
gcloud builds submit --tag "gcr.io/$(gcloud config get-value project)/$SERVICE_NAME:latest" .

echo "2️⃣  Deploying service to GCP Cloud Run (Free Tier Eligible)..."
gcloud run deploy "$SERVICE_NAME" \
  --image "gcr.io/$(gcloud config get-value project)/$SERVICE_NAME:latest" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 2

SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --platform managed --region "$REGION" --format 'value(status.url)')

echo "========================================================="
echo "🎉 DEPLOYMENT SUCCESSFUL!"
echo "🌐 Public Web Application URL: $SERVICE_URL"
echo "📡 REST API Health Endpoint: $SERVICE_URL/api/health"
echo "========================================================="

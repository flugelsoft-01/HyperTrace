#!/usr/bin/env bash
set -e

echo "========================================================"
echo "📦 Hyperledger Fabric Supply Chain Environment Setup"
echo "========================================================"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "1️⃣  Installing and building Smart Contract (Chaincode)..."
cd "$ROOT_DIR/chaincode"
npm install --no-audit --no-fund
npm run build
echo "✅ Chaincode build complete."

echo "2️⃣  Installing and building REST API Gateway..."
cd "$ROOT_DIR/api-gateway"
npm install --no-audit --no-fund
npm run build
echo "✅ API Gateway build complete."

echo "3️⃣  Installing and building React UI Dashboard..."
cd "$ROOT_DIR/frontend"
npm install --no-audit --no-fund
npm run build
echo "✅ React Frontend build complete."

echo "========================================================"
echo "🎉 Hyperledger Fabric Supply Chain Application Ready!"
echo "To start API Gateway & Web UI Server:"
echo "   cd api-gateway && npm start"
echo "To run IoT Sensor Simulation:"
echo "   python3 scripts/simulate_iot.py"
echo "========================================================"

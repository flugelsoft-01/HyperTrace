# Hyperledger Fabric Supply Chain & Logistics Tracking Application

An enterprise-grade **Supply Chain and Cold-Chain Logistics Tracking System** powered by **Hyperledger Fabric v2.5**, features smart contract chaincode (TypeScript), a Node.js REST API Client Gateway, a modern Dark Glassmorphism React UI Dashboard, and an automated IoT simulation suite.

---

## Features & Specification Coverage

- **Asset Lifecycle Management**:
  - `Shipment` Asset: `ID`, `Origin`, `Destination`, `CurrentLocation`, `Timestamp`, `Status` (`Created`, `InTransit`, `Delivered`, `Compromised`), `TemperatureData` array, and `LocationHistory`.
- **Smart Contract Operations (Chaincode)**:
  - `InitLedger`: Seed sample multi-party supply chain shipments.
  - `CreateShipment`: Register new assets on the ledger.
  - `UpdateLocation`: Record transit checkpoints and auto-detect delivery completion.
  - `LogIoTTelemetry`: Log IoT sensor temperature readings and **auto-compromise asset status if safe storage thresholds are breached** (> 8°C or < -20°C).
  - `TransferCustody`: Update asset carrier and/or owner organization.
  - `QueryShipmentHistory`: Retrieve full chronological provenance trail (`txId`, block height, timestamp, state diffs).
- **REST API Client Gateway**: Express.js server mapping HTTP requests to Hyperledger Fabric SDK transactions.
- **React Frontend Dashboard**: Dark Glassmorphism UI with real-time SVG cold-chain temperature charts, provenance timeline, and asset control forms.
- **Python IoT Simulator (`scripts/simulate_iot.py`)**: Automated script simulating IoT sensor feeds, location updates, temperature alarm spikes, and ledger verification.
- **Free Cloud Run Deployment**: Dockerfile and `deploy-cloudrun.sh` configured for Google Cloud Run Free Tier.

---

## Quick Start (Local Setup)

### 1. Build All Components
```bash
chmod +x scripts/setup.sh scripts/deploy-cloudrun.sh scripts/simulate_iot.py
./scripts/setup.sh
```

### 2. Start the Application Gateway & Frontend UI
```bash
cd api-gateway
npm start
```
The application will launch on `http://localhost:3001`!

### 3. Run the Automated IoT Telemetry & Provenance Simulation
In a separate terminal tab:
```bash
python3 scripts/simulate_iot.py
```

---

## Deployment to Google Cloud Run (Free Tier)

```bash
./scripts/deploy-cloudrun.sh
```

---

## API Gateway Endpoints

| HTTP Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Network & Peer status |
| `POST` | `/api/seed` | Seed initial ledger shipments |
| `GET` | `/api/shipments` | Get all shipments in world state |
| `GET` | `/api/shipments/:id` | Get single shipment details |
| `GET` | `/api/shipments/:id/history` | Get full provenance history trail |
| `POST` | `/api/shipments` | Create new shipment asset |
| `POST` | `/api/shipments/:id/location` | Update location checkpoint |
| `POST` | `/api/shipments/:id/telemetry` | Log IoT temperature reading |
| `POST` | `/api/shipments/:id/custody` | Transfer carrier/owner custody |

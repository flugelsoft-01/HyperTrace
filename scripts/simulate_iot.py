#!/usr/bin/env python3
"""
Hyperledger Fabric Supply Chain — Automated IoT Telemetry & Provenance Simulator
"""

import time
import json
import random
import urllib.request
import urllib.parse
import sys

API_BASE_URL = "http://localhost:3001/api"

def make_request(url, method="GET", data=None):
    headers = {"Content-Type": "application/json"}
    req_data = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            return json.loads(res_body)
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        print(f"❌ HTTP Error {e.code}: {err_body}")
        return json.loads(err_body)
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return None

def main():
    print("======================================================================")
    print("🛰️  Hyperledger Fabric IoT Sensor & Provenance Simulation Suite")
    print("======================================================================")

    # 1. Health check
    print("\n1️⃣  Checking Hyperledger Fabric REST API Gateway status...")
    health = make_request(f"{API_BASE_URL}/health")
    if not health or not health.get("status"):
        print("❌ Gateway is offline! Please start the API Gateway server first (npm run start in api-gateway).")
        sys.exit(1)
    print(f"✅ Fabric Gateway status: {health['status']} | Network: {health['network']} | Channel: {health['channel']}")

    # 2. Seed initial ledger
    print("\n2️⃣  Seeding Fabric World State ledger with initial shipments...")
    seed_res = make_request(f"{API_BASE_URL}/seed", method="POST")
    print(f"✅ {seed_res.get('message')}")

    # 3. Create a new cold-chain vaccine shipment
    shipment_id = f"SHIP-VAX-{random.randint(2000, 9999)}"
    print(f"\n3️⃣  Executing 'CreateShipment' transaction on Hyperledger Fabric: {shipment_id}...")
    create_payload = {
        "id": shipment_id,
        "origin": "BioNTech Facility, Marburg, Germany",
        "destination": "Changi General Hospital, Singapore",
        "owner": "PharmaSupply Global",
        "carrier": "Lufthansa Cargo ColdChain",
        "minTempThreshold": -25.0,
        "maxTempThreshold": 8.0
    }
    create_res = make_request(f"{API_BASE_URL}/shipments", method="POST", data=create_payload)
    print(f"✅ Created asset {shipment_id}. Initial status: {create_res['data']['status']}")

    # 4. Log Normal IoT Temperature Readings
    print("\n4️⃣  Logging normal cold-chain IoT temperature readings...")
    for temp in [4.1, 3.8, 4.5, 5.0]:
        t_payload = {
            "temperature": temp,
            "sensorId": "IOT-SENSOR-MARBURG-01"
        }
        res = make_request(f"{API_BASE_URL}/shipments/{shipment_id}/telemetry", method="POST", data=t_payload)
        print(f"   [IoT Reading]: {temp}°C | Status: {res['data']['status']}")
        time.sleep(0.5)

    # 5. Update Transit Location Checkpoint
    print("\n5️⃣  Updating location checkpoint to Transit Hub (Frankfurt Airport)...")
    loc_payload = {
        "newLocation": "Frankfurt Airport Pharma Hub Gate B22",
        "updatedBy": "Lufthansa Cargo Ground Team"
    }
    loc_res = make_request(f"{API_BASE_URL}/shipments/{shipment_id}/location", method="POST", data=loc_payload)
    print(f"✅ Updated location: {loc_res['data']['currentLocation']} | Status: {loc_res['data']['status']}")

    # 6. Inject Temperature Spike (> Max Threshold 8.0°C) to test Smart Contract Auto-Compromise logic
    print("\n6️⃣  🚨 SIMULATING IOT SENSOR ALARM: Temperature Spike to 18.5°C (Exceeds Max Threshold 8°C)...")
    spike_payload = {
        "temperature": 18.5,
        "sensorId": "IOT-SENSOR-CARGO-HOLD-ALARM"
    }
    spike_res = make_request(f"{API_BASE_URL}/shipments/{shipment_id}/telemetry", method="POST", data=spike_payload)
    print(f"🚨 SMART CONTRACT ACTION TRIGGERED! Ledger Asset Status: {spike_res['data']['status']}")
    if spike_res['data']['status'] == "Compromised":
        print("✅ SUCCESS: Smart contract automatically flagged shipment as 'COMPROMISED' due to temperature breach!")

    # 7. Transfer Custody to Emergency Cold Storage Auditor
    print("\n7️⃣  Executing 'TransferCustody' transaction on Fabric...")
    custody_payload = {
        "newCarrier": "Swissport Cold Chain Rescue Team",
        "newOwner": "Pharma Quality Assurance Dept"
    }
    custody_res = make_request(f"{API_BASE_URL}/shipments/{shipment_id}/custody", method="POST", data=custody_payload)
    print(f"✅ Custody transferred. New Carrier: {custody_res['data']['carrier']} | New Owner: {custody_res['data']['owner']}")

    # 8. Query Full Immutable Provenance Trail
    print(f"\n8️⃣  Querying full Fabric ledger provenance trail for asset {shipment_id}...")
    history_res = make_request(f"{API_BASE_URL}/shipments/{shipment_id}/history")
    history_records = history_res.get("data", [])
    print(f"✅ Retrieved {len(history_records)} block history records for {shipment_id}:")
    for idx, rec in enumerate(history_records, 1):
        print(f"   [{idx}] Block #{rec['blockNumber']} | TxID: {rec['txId'][:20]}... | Status: {rec['value']['status']} | Location: {rec['value']['currentLocation']}")

    print("\n======================================================================")
    print("🎉 Hyperledger Fabric Simulation Completed Successfully!")
    print("======================================================================")

if __name__ == "__main__":
    main()

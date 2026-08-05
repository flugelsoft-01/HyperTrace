#!/usr/bin/env python3
"""
HyperTrace — Multi-Sensor IoT Telemetry & Provenance Simulation Suite
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
    print("🛰️  HyperTrace Multi-Sensor IoT Telemetry & Provenance Simulation Suite")
    print("======================================================================")

    print("\n1️⃣  Checking HyperTrace REST API Gateway status...")
    health = make_request(f"{API_BASE_URL}/health")
    if not health or not health.get("status"):
        print("❌ Gateway is offline! Please start the API Gateway server first.")
        sys.exit(1)
    print(f"✅ Gateway status: {health['status']} | System: {health['system']} | Channel: {health['channel']}")

    print("\n2️⃣  Seeding Fabric World State ledger with initial shipments...")
    seed_res = make_request(f"{API_BASE_URL}/seed", method="POST")
    print(f"✅ {seed_res.get('message')}")

    shipment_id = f"SHIP-VAX-{random.randint(2000, 9999)}"
    print(f"\n3️⃣  Executing 'CreateShipment' transaction on Fabric: {shipment_id}...")
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

    print("\n4️⃣  Logging Multi-Sensor IoT Telemetry (Temp, Humidity, G-Force, Light, GPS)...")
    for temp, hum, shock, lux, lat, long in [
        (4.1, 45.0, 0.2, 2.0, 52.5200, 13.4050),
        (3.8, 46.2, 0.4, 3.0, 50.0379, 8.5622),
        (4.5, 48.0, 0.5, 2.5, 25.2532, 55.3657),
        (5.0, 50.1, 0.6, 3.5, 1.3644, 103.9915)
    ]:
        t_payload = {
            "temperature": temp,
            "humidity": hum,
            "shockGForce": shock,
            "lightExposureLux": lux,
            "latitude": lat,
            "longitude": long,
            "sensorId": "IOT-MULTI-SENSOR-HUB"
        }
        res = make_request(f"{API_BASE_URL}/shipments/{shipment_id}/telemetry", method="POST", data=t_payload)
        print(f"   [Multi-Sensor]: {temp}°C | {hum}% RH | {shock}G | {lux} Lux | Status: {res['data']['status']}")
        time.sleep(0.4)

    print("\n5️⃣  Updating location checkpoint to Transit Hub...")
    loc_payload = {
        "newLocation": "Dubai Cargo Mega Terminal",
        "latitude": 25.2532,
        "longitude": 55.3657,
        "updatedBy": "Emirates SkyCargo"
    }
    loc_res = make_request(f"{API_BASE_URL}/shipments/{shipment_id}/location", method="POST", data=loc_payload)
    print(f"✅ Updated location: {loc_res['data']['currentLocation']} | Status: {loc_res['data']['status']}")

    print("\n6️⃣  🚨 SIMULATING IOT SENSOR ALARM: Container Heat Spike (18.5°C) & Container Seal Light Breach (120 Lux)...")
    spike_payload = {
        "temperature": 18.5,
        "humidity": 82.0,
        "shockGForce": 5.2,
        "lightExposureLux": 120.0,
        "latitude": 25.2532,
        "longitude": 55.3657,
        "sensorId": "IOT-SENSOR-CARGO-HOLD-ALARM"
    }
    spike_res = make_request(f"{API_BASE_URL}/shipments/{shipment_id}/telemetry", method="POST", data=spike_payload)
    print(f"🚨 SMART CONTRACT ACTION TRIGGERED! Ledger Asset Status: {spike_res['data']['status']}")

    print("\n7️⃣  Executing 'TransferCustody' transaction on Fabric...")
    custody_payload = {
        "newCarrier": "Swissport Cold Chain Rescue Team",
        "newOwner": "Pharma Quality Assurance Dept"
    }
    custody_res = make_request(f"{API_BASE_URL}/shipments/{shipment_id}/custody", method="POST", data=custody_payload)
    print(f"✅ Custody transferred. New Carrier: {custody_res['data']['carrier']} | New Owner: {custody_res['data']['owner']}")

    print(f"\n8️⃣  Fetching Cryptographic Certificate of Provenance for asset {shipment_id}...")
    cert_res = make_request(f"{API_BASE_URL}/shipments/{shipment_id}/certificate")
    print(f"✅ Certificate Issued: {cert_res.get('certificateId')} | Endorsements: {cert_res.get('mspEndorsements')}")

    print("\n======================================================================")
    print("🎉 HyperTrace Simulation Suite Completed Successfully!")
    print("======================================================================")

if __name__ == "__main__":
    main()

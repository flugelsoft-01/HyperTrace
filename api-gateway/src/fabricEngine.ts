import crypto from 'crypto';
import { EventEmitter } from 'events';

export enum ShipmentStatus {
  CREATED = 'Created',
  IN_TRANSIT = 'InTransit',
  DELIVERED = 'Delivered',
  COMPROMISED = 'Compromised'
}

export interface SensorTelemetry {
  timestamp: string;
  temperature: number;      // °C
  humidity: number;         // %
  shockGForce: number;      // G
  lightExposureLux: number; // Lux
  latitude: number;
  longitude: number;
  sensorId: string;
}

export interface LocationUpdate {
  location: string;
  latitude?: number;
  longitude?: number;
  timestamp: string;
  updatedBy: string;
}

export interface GeofenceBounds {
  minLat: number;
  maxLat: number;
  minLong: number;
  maxLong: number;
}

export interface Shipment {
  docType: string;
  id: string;
  origin: string;
  destination: string;
  currentLocation: string;
  currentLat?: number;
  currentLong?: number;
  carrier: string;
  owner: string;
  timestamp: string;
  status: ShipmentStatus;
  telemetryHistory: SensorTelemetry[];
  locationHistory: LocationUpdate[];
  minTempThreshold: number;
  maxTempThreshold: number;
  maxHumidityThreshold: number;
  maxShockThreshold: number;
  maxLightThreshold: number;
  geofence?: GeofenceBounds;
}

export interface HistoryRecord {
  txId: string;
  timestamp: string;
  blockNumber: number;
  isDelete: boolean;
  value: Shipment;
}

class HyperledgerFabricEngine extends EventEmitter {
  private worldState: Map<string, Shipment> = new Map();
  private historyLedger: Map<string, HistoryRecord[]> = new Map();
  private blockHeight: number = 100;

  constructor() {
    super();
    this.seedInitialLedger();
  }

  private generateTxId(): string {
    return '0x' + crypto.randomBytes(16).toString('hex');
  }

  private recordTransaction(id: string, shipment: Shipment, eventType: string = 'BLOCK_COMMITTED') {
    this.blockHeight += 1;
    const txId = this.generateTxId();
    const record: HistoryRecord = {
      txId,
      timestamp: new Date().toISOString(),
      blockNumber: this.blockHeight,
      isDelete: false,
      value: JSON.parse(JSON.stringify(shipment))
    };

    if (!this.historyLedger.has(id)) {
      this.historyLedger.set(id, []);
    }
    this.historyLedger.get(id)!.push(record);

    // Emit Real-time SSE Event
    this.emit('fabricEvent', {
      eventType,
      blockNumber: this.blockHeight,
      txId,
      shipmentId: id,
      status: shipment.status,
      timestamp: record.timestamp,
      shipment: record.value
    });
  }

  public seedInitialLedger(): Shipment[] {
    this.worldState.clear();
    this.historyLedger.clear();

    const shipment1: Shipment = {
      docType: 'shipment',
      id: 'SHIP-1001',
      origin: 'Berlin, Germany (BioMed Hub)',
      destination: 'Tokyo Medical Center, Japan',
      currentLocation: 'Berlin Cold Storage Warehouse',
      currentLat: 52.5200,
      currentLong: 13.4050,
      carrier: 'Global ColdChain Logistics',
      owner: 'BioMed Global',
      timestamp: new Date('2026-08-01T08:00:00Z').toISOString(),
      status: ShipmentStatus.CREATED,
      telemetryHistory: [
        {
          timestamp: new Date('2026-08-01T08:05:00Z').toISOString(),
          temperature: 4.2,
          humidity: 45.0,
          shockGForce: 0.2,
          lightExposureLux: 2.0,
          latitude: 52.5200,
          longitude: 13.4050,
          sensorId: 'SENS-BER-01'
        },
        {
          timestamp: new Date('2026-08-01T12:00:00Z').toISOString(),
          temperature: 4.8,
          humidity: 46.5,
          shockGForce: 0.3,
          lightExposureLux: 2.5,
          latitude: 52.5200,
          longitude: 13.4050,
          sensorId: 'SENS-BER-01'
        }
      ],
      locationHistory: [
        { location: 'Berlin Cold Storage Warehouse', latitude: 52.5200, longitude: 13.4050, timestamp: new Date('2026-08-01T08:00:00Z').toISOString(), updatedBy: 'BioMed Global' }
      ],
      minTempThreshold: -20,
      maxTempThreshold: 8,
      maxHumidityThreshold: 70,
      maxShockThreshold: 4.5,
      maxLightThreshold: 50,
      geofence: { minLat: 10.0, maxLat: 65.0, minLong: 10.0, maxLong: 145.0 }
    };

    const shipment2: Shipment = {
      docType: 'shipment',
      id: 'SHIP-1002',
      origin: 'Zurich Biotech Park, Switzerland',
      destination: 'Boston General Hospital, USA',
      currentLocation: 'Frankfurt Cargo City South',
      currentLat: 50.0379,
      currentLong: 8.5622,
      carrier: 'AeroAir Express',
      owner: 'SwissPharma AG',
      timestamp: new Date('2026-08-02T10:30:00Z').toISOString(),
      status: ShipmentStatus.IN_TRANSIT,
      telemetryHistory: [
        {
          timestamp: new Date('2026-08-02T10:35:00Z').toISOString(),
          temperature: 3.5,
          humidity: 48.0,
          shockGForce: 0.5,
          lightExposureLux: 3.0,
          latitude: 47.3769,
          longitude: 8.5417,
          sensorId: 'SENS-ZRH-99'
        },
        {
          timestamp: new Date('2026-08-02T14:10:00Z').toISOString(),
          temperature: 5.1,
          humidity: 52.0,
          shockGForce: 1.1,
          lightExposureLux: 4.0,
          latitude: 50.0379,
          longitude: 8.5622,
          sensorId: 'SENS-FRA-12'
        }
      ],
      locationHistory: [
        { location: 'Zurich Biotech Park', latitude: 47.3769, longitude: 8.5417, timestamp: new Date('2026-08-02T10:30:00Z').toISOString(), updatedBy: 'SwissPharma AG' },
        { location: 'Frankfurt Cargo City South', latitude: 50.0379, longitude: 8.5622, timestamp: new Date('2026-08-02T14:00:00Z').toISOString(), updatedBy: 'AeroAir Express' }
      ],
      minTempThreshold: 2,
      maxTempThreshold: 8,
      maxHumidityThreshold: 70,
      maxShockThreshold: 4.5,
      maxLightThreshold: 50,
      geofence: { minLat: 35.0, maxLat: 60.0, minLong: -80.0, maxLong: 15.0 }
    };

    this.worldState.set(shipment1.id, shipment1);
    this.recordTransaction(shipment1.id, shipment1, 'INIT_LEDGER');

    this.worldState.set(shipment2.id, shipment2);
    this.recordTransaction(shipment2.id, shipment2, 'INIT_LEDGER');

    return [shipment1, shipment2];
  }

  public getAllShipments(): Shipment[] {
    return Array.from(this.worldState.values());
  }

  public getShipment(id: string): Shipment {
    const shipment = this.worldState.get(id);
    if (!shipment) {
      throw new Error(`Shipment asset ${id} not found on Hyperledger Fabric world state.`);
    }
    return shipment;
  }

  public getShipmentHistory(id: string): HistoryRecord[] {
    if (!this.worldState.has(id)) {
      throw new Error(`Shipment asset ${id} not found on Hyperledger Fabric world state.`);
    }
    return this.historyLedger.get(id) || [];
  }

  public createShipment(
    id: string,
    origin: string,
    destination: string,
    owner: string,
    carrier: string,
    minTempThreshold?: number,
    maxTempThreshold?: number
  ): Shipment {
    if (this.worldState.has(id)) {
      throw new Error(`Shipment ${id} already exists in ledger.`);
    }

    const now = new Date().toISOString();
    const shipment: Shipment = {
      docType: 'shipment',
      id,
      origin,
      destination,
      currentLocation: origin,
      currentLat: 52.3676,
      currentLong: 4.9041,
      carrier,
      owner,
      timestamp: now,
      status: ShipmentStatus.CREATED,
      telemetryHistory: [],
      locationHistory: [
        { location: origin, latitude: 52.3676, longitude: 4.9041, timestamp: now, updatedBy: owner }
      ],
      minTempThreshold: minTempThreshold ?? -20,
      maxTempThreshold: maxTempThreshold ?? 8,
      maxHumidityThreshold: 70,
      maxShockThreshold: 4.5,
      maxLightThreshold: 50
    };

    this.worldState.set(id, shipment);
    this.recordTransaction(id, shipment, 'CREATE_SHIPMENT');
    return shipment;
  }

  public updateLocation(id: string, newLocation: string, updatedBy?: string, lat?: number, long?: number): Shipment {
    const shipment = this.getShipment(id);
    const ts = new Date().toISOString();

    shipment.currentLocation = newLocation;
    if (lat !== undefined) shipment.currentLat = lat;
    if (long !== undefined) shipment.currentLong = long;

    shipment.locationHistory.push({
      location: newLocation,
      latitude: lat,
      longitude: long,
      timestamp: ts,
      updatedBy: updatedBy || shipment.carrier
    });

    if (shipment.status === ShipmentStatus.CREATED) {
      shipment.status = ShipmentStatus.IN_TRANSIT;
    }

    if (newLocation.toLowerCase().includes(shipment.destination.toLowerCase())) {
      shipment.status = ShipmentStatus.DELIVERED;
    }

    shipment.timestamp = ts;
    this.worldState.set(id, shipment);
    this.recordTransaction(id, shipment, 'UPDATE_LOCATION');
    return shipment;
  }

  public logIoTTelemetry(
    id: string,
    temperature: number,
    humidity?: number,
    shockGForce?: number,
    lightExposureLux?: number,
    lat?: number,
    long?: number,
    sensorId?: string
  ): Shipment {
    const shipment = this.getShipment(id);
    const ts = new Date().toISOString();

    const reading: SensorTelemetry = {
      timestamp: ts,
      temperature,
      humidity: humidity ?? 45.0,
      shockGForce: shockGForce ?? 0.4,
      lightExposureLux: lightExposureLux ?? 2.0,
      latitude: lat ?? shipment.currentLat ?? 52.5200,
      longitude: long ?? shipment.currentLong ?? 13.4050,
      sensorId: sensorId || 'IOT-MULTI-SENSOR'
    };

    shipment.telemetryHistory.push(reading);
    if (lat !== undefined) shipment.currentLat = lat;
    if (long !== undefined) shipment.currentLong = long;

    // Check Violations
    let isViolated = false;
    if (temperature > shipment.maxTempThreshold || temperature < shipment.minTempThreshold) isViolated = true;
    if (reading.humidity > shipment.maxHumidityThreshold) isViolated = true;
    if (reading.shockGForce > shipment.maxShockThreshold) isViolated = true;
    if (reading.lightExposureLux > shipment.maxLightThreshold) isViolated = true;

    if (shipment.geofence) {
      if (reading.latitude < shipment.geofence.minLat || reading.latitude > shipment.geofence.maxLat ||
          reading.longitude < shipment.geofence.minLong || reading.longitude > shipment.geofence.maxLong) {
        isViolated = true;
      }
    }

    if (isViolated) {
      shipment.status = ShipmentStatus.COMPROMISED;
    }

    shipment.timestamp = ts;
    this.worldState.set(id, shipment);
    this.recordTransaction(id, shipment, isViolated ? 'STATUS_COMPROMISED' : 'TELEMETRY_LOGGED');
    return shipment;
  }

  public transferCustody(id: string, newCarrier?: string, newOwner?: string): Shipment {
    const shipment = this.getShipment(id);
    const ts = new Date().toISOString();

    if (newCarrier) shipment.carrier = newCarrier;
    if (newOwner) shipment.owner = newOwner;

    shipment.timestamp = ts;
    this.worldState.set(id, shipment);
    this.recordTransaction(id, shipment, 'TRANSFER_CUSTODY');
    return shipment;
  }
}

export const fabricEngine = new HyperledgerFabricEngine();

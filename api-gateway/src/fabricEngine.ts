import crypto from 'crypto';

export enum ShipmentStatus {
  CREATED = 'Created',
  IN_TRANSIT = 'InTransit',
  DELIVERED = 'Delivered',
  COMPROMISED = 'Compromised'
}

export interface TemperatureReading {
  timestamp: string;
  temperature: number;
  sensorId: string;
}

export interface LocationUpdate {
  location: string;
  timestamp: string;
  updatedBy: string;
}

export interface Shipment {
  docType: string;
  id: string;
  origin: string;
  destination: string;
  currentLocation: string;
  carrier: string;
  owner: string;
  timestamp: string;
  status: ShipmentStatus;
  temperatureData: TemperatureReading[];
  locationHistory: LocationUpdate[];
  minTempThreshold: number;
  maxTempThreshold: number;
}

export interface HistoryRecord {
  txId: string;
  timestamp: string;
  blockNumber: number;
  isDelete: boolean;
  value: Shipment;
}

class HyperledgerFabricEngine {
  private worldState: Map<string, Shipment> = new Map();
  private historyLedger: Map<string, HistoryRecord[]> = new Map();
  private blockHeight: number = 100;

  constructor() {
    this.seedInitialLedger();
  }

  private generateTxId(): string {
    return '0x' + crypto.randomBytes(16).toString('hex');
  }

  private recordTransaction(id: string, shipment: Shipment) {
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
  }

  public seedInitialLedger(): Shipment[] {
    this.worldState.clear();
    this.historyLedger.clear();

    const shipment1: Shipment = {
      docType: 'shipment',
      id: 'SHIP-1001',
      origin: 'Berlin, Germany (Pharma Hub)',
      destination: 'Tokyo Medical Center, Japan',
      currentLocation: 'Berlin Cold Storage Warehouse',
      carrier: 'Global ColdChain Logistics',
      owner: 'BioMed Global',
      timestamp: new Date('2026-08-01T08:00:00Z').toISOString(),
      status: ShipmentStatus.CREATED,
      temperatureData: [
        { timestamp: new Date('2026-08-01T08:05:00Z').toISOString(), temperature: 4.2, sensorId: 'SENS-BER-01' },
        { timestamp: new Date('2026-08-01T12:00:00Z').toISOString(), temperature: 4.8, sensorId: 'SENS-BER-01' }
      ],
      locationHistory: [
        { location: 'Berlin Cold Storage Warehouse', timestamp: new Date('2026-08-01T08:00:00Z').toISOString(), updatedBy: 'BioMed Global' }
      ],
      minTempThreshold: -20,
      maxTempThreshold: 8
    };

    const shipment2: Shipment = {
      docType: 'shipment',
      id: 'SHIP-1002',
      origin: 'Zurich Biotech Park, Switzerland',
      destination: 'Boston General Hospital, USA',
      currentLocation: 'Frankfurt Cargo City South',
      carrier: 'AeroAir Express',
      owner: 'SwissPharma AG',
      timestamp: new Date('2026-08-02T10:30:00Z').toISOString(),
      status: ShipmentStatus.IN_TRANSIT,
      temperatureData: [
        { timestamp: new Date('2026-08-02T10:35:00Z').toISOString(), temperature: 3.5, sensorId: 'SENS-ZRH-99' },
        { timestamp: new Date('2026-08-02T14:10:00Z').toISOString(), temperature: 5.1, sensorId: 'SENS-FRA-12' }
      ],
      locationHistory: [
        { location: 'Zurich Biotech Park', timestamp: new Date('2026-08-02T10:30:00Z').toISOString(), updatedBy: 'SwissPharma AG' },
        { location: 'Frankfurt Cargo City South', timestamp: new Date('2026-08-02T14:00:00Z').toISOString(), updatedBy: 'AeroAir Express' }
      ],
      minTempThreshold: 2,
      maxTempThreshold: 8
    };

    this.worldState.set(shipment1.id, shipment1);
    this.recordTransaction(shipment1.id, shipment1);

    this.worldState.set(shipment2.id, shipment2);
    this.recordTransaction(shipment2.id, shipment2);

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
      carrier,
      owner,
      timestamp: now,
      status: ShipmentStatus.CREATED,
      temperatureData: [],
      locationHistory: [
        { location: origin, timestamp: now, updatedBy: owner }
      ],
      minTempThreshold: minTempThreshold ?? -20,
      maxTempThreshold: maxTempThreshold ?? 8
    };

    this.worldState.set(id, shipment);
    this.recordTransaction(id, shipment);
    return shipment;
  }

  public updateLocation(id: string, newLocation: string, updatedBy?: string): Shipment {
    const shipment = this.getShipment(id);
    const ts = new Date().toISOString();

    shipment.currentLocation = newLocation;
    shipment.locationHistory.push({
      location: newLocation,
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
    this.recordTransaction(id, shipment);
    return shipment;
  }

  public logIoTTelemetry(id: string, temperature: number, sensorId?: string): Shipment {
    const shipment = this.getShipment(id);
    const ts = new Date().toISOString();

    shipment.temperatureData.push({
      timestamp: ts,
      temperature,
      sensorId: sensorId || 'IOT-TELEMETRY-SENSOR'
    });

    // Check breach condition
    if (temperature > shipment.maxTempThreshold || temperature < shipment.minTempThreshold) {
      shipment.status = ShipmentStatus.COMPROMISED;
    }

    shipment.timestamp = ts;
    this.worldState.set(id, shipment);
    this.recordTransaction(id, shipment);
    return shipment;
  }

  public transferCustody(id: string, newCarrier?: string, newOwner?: string): Shipment {
    const shipment = this.getShipment(id);
    const ts = new Date().toISOString();

    if (newCarrier) {
      shipment.carrier = newCarrier;
    }
    if (newOwner) {
      shipment.owner = newOwner;
    }

    shipment.timestamp = ts;
    this.worldState.set(id, shipment);
    this.recordTransaction(id, shipment);
    return shipment;
  }
}

export const fabricEngine = new HyperledgerFabricEngine();

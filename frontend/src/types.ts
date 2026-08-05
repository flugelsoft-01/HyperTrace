export enum ShipmentStatus {
  CREATED = 'Created',
  IN_TRANSIT = 'InTransit',
  DELIVERED = 'Delivered',
  COMPROMISED = 'Compromised'
}

export interface SensorTelemetry {
  timestamp: string;
  temperature: number;      // °C
  humidity: number;         // % RH
  shockGForce: number;      // G force acceleration
  lightExposureLux: number; // Lux (seal breach detection)
  latitude: number;         // GPS Lat
  longitude: number;        // GPS Long
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

export interface CertificateData {
  certificateId: string;
  issuedAt: string;
  issuer: string;
  mspEndorsements: string[];
  signature: string;
  shipment: Shipment;
  historyCount: number;
}

export type MSPRole = 'Org1MSP' | 'Org2MSP' | 'CustomsMSP' | 'AuditorMSP';

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

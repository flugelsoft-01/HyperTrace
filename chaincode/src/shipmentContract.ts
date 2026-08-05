import { Contract, Context, Info, Returns, Transaction } from 'fabric-contract-api';
import { Shipment, ShipmentStatus, SensorTelemetry, LocationUpdate, HistoryRecord, GeofenceBounds } from './shipment';

@Info({ title: 'ShipmentContract', description: 'HyperTrace Smart Contract for Supply Chain Asset Management' })
export class ShipmentContract extends Contract {

  constructor() {
    super('ShipmentContract');
  }

  @Transaction()
  public async InitLedger(ctx: Context): Promise<void> {
    const initialShipments: Shipment[] = [
      {
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
      },
      {
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
            humidity: 48.2,
            shockGForce: 0.5,
            lightExposureLux: 5.0,
            latitude: 47.3769,
            longitude: 8.5417,
            sensorId: 'SENS-ZRH-99'
          },
          {
            timestamp: new Date('2026-08-02T14:10:00Z').toISOString(),
            temperature: 5.1,
            humidity: 52.0,
            shockGForce: 1.2,
            lightExposureLux: 8.0,
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
      }
    ];

    for (const shipment of initialShipments) {
      await ctx.stub.putState(shipment.id, Buffer.from(JSON.stringify(shipment)));
    }
  }

  @Transaction()
  public async CreateShipment(
    ctx: Context,
    id: string,
    origin: string,
    destination: string,
    owner: string,
    carrier: string,
    minTempStr: string,
    maxTempStr: string
  ): Promise<string> {
    const exists = await this.ShipmentExists(ctx, id);
    if (exists) {
      throw new Error(`Shipment with ID ${id} already exists`);
    }

    const minTempThreshold = parseFloat(minTempStr) || -20;
    const maxTempThreshold = parseFloat(maxTempStr) || 8;
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
      telemetryHistory: [],
      locationHistory: [
        { location: origin, timestamp: now, updatedBy: owner }
      ],
      minTempThreshold,
      maxTempThreshold,
      maxHumidityThreshold: 70,
      maxShockThreshold: 4.5,
      maxLightThreshold: 50
    };

    await ctx.stub.putState(id, Buffer.from(JSON.stringify(shipment)));
    return JSON.stringify(shipment);
  }

  @Transaction()
  public async UpdateLocation(
    ctx: Context,
    id: string,
    newLocation: string,
    timestamp: string,
    updatedBy: string,
    latStr?: string,
    longStr?: string
  ): Promise<string> {
    const shipmentBytes = await ctx.stub.getState(id);
    if (!shipmentBytes || shipmentBytes.length === 0) {
      throw new Error(`Shipment ${id} does not exist`);
    }

    const shipment: Shipment = JSON.parse(shipmentBytes.toString());
    const ts = timestamp || new Date().toISOString();
    const lat = latStr ? parseFloat(latStr) : shipment.currentLat;
    const long = longStr ? parseFloat(longStr) : shipment.currentLong;

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

    await ctx.stub.putState(id, Buffer.from(JSON.stringify(shipment)));
    return JSON.stringify(shipment);
  }

  @Transaction()
  public async LogIoTTelemetry(
    ctx: Context,
    id: string,
    temperatureStr: string,
    humidityStr: string,
    shockStr: string,
    lightStr: string,
    latStr: string,
    longStr: string,
    sensorId: string,
    timestamp: string
  ): Promise<string> {
    const shipmentBytes = await ctx.stub.getState(id);
    if (!shipmentBytes || shipmentBytes.length === 0) {
      throw new Error(`Shipment ${id} does not exist`);
    }

    const shipment: Shipment = JSON.parse(shipmentBytes.toString());
    const temp = parseFloat(temperatureStr);
    const humidity = humidityStr ? parseFloat(humidityStr) : 45.0;
    const shockG = shockStr ? parseFloat(shockStr) : 0.5;
    const lightLux = lightStr ? parseFloat(lightStr) : 5.0;
    const lat = latStr ? parseFloat(latStr) : (shipment.currentLat || 0);
    const long = longStr ? parseFloat(longStr) : (shipment.currentLong || 0);
    const ts = timestamp || new Date().toISOString();

    const reading: SensorTelemetry = {
      timestamp: ts,
      temperature: temp,
      humidity,
      shockGForce: shockG,
      lightExposureLux: lightLux,
      latitude: lat,
      longitude: long,
      sensorId: sensorId || 'IOT-MULTI-SENSOR'
    };

    shipment.telemetryHistory.push(reading);
    shipment.currentLat = lat;
    shipment.currentLong = long;

    // Check Multi-Sensor Violations
    let isViolated = false;
    if (temp > shipment.maxTempThreshold || temp < shipment.minTempThreshold) isViolated = true;
    if (humidity > shipment.maxHumidityThreshold) isViolated = true;
    if (shockG > shipment.maxShockThreshold) isViolated = true;
    if (lightLux > shipment.maxLightThreshold) isViolated = true;

    // Geofence Corridor Check
    if (shipment.geofence) {
      if (lat < shipment.geofence.minLat || lat > shipment.geofence.maxLat ||
          long < shipment.geofence.minLong || long > shipment.geofence.maxLong) {
        isViolated = true;
      }
    }

    if (isViolated) {
      shipment.status = ShipmentStatus.COMPROMISED;
    }

    await ctx.stub.putState(id, Buffer.from(JSON.stringify(shipment)));
    return JSON.stringify(shipment);
  }

  @Transaction()
  public async TransferCustody(
    ctx: Context,
    id: string,
    newCarrier: string,
    newOwner?: string
  ): Promise<string> {
    const shipmentBytes = await ctx.stub.getState(id);
    if (!shipmentBytes || shipmentBytes.length === 0) {
      throw new Error(`Shipment ${id} does not exist`);
    }

    const shipment: Shipment = JSON.parse(shipmentBytes.toString());

    if (newCarrier) shipment.carrier = newCarrier;
    if (newOwner) shipment.owner = newOwner;

    shipment.timestamp = new Date().toISOString();

    await ctx.stub.putState(id, Buffer.from(JSON.stringify(shipment)));
    return JSON.stringify(shipment);
  }

  @Transaction(false)
  @Returns('string')
  public async QueryShipment(ctx: Context, id: string): Promise<string> {
    const shipmentBytes = await ctx.stub.getState(id);
    if (!shipmentBytes || shipmentBytes.length === 0) {
      throw new Error(`Shipment ${id} does not exist`);
    }
    return shipmentBytes.toString();
  }

  @Transaction(false)
  @Returns('string')
  public async QueryShipmentHistory(ctx: Context, id: string): Promise<string> {
    const iterator = await ctx.stub.getHistoryForKey(id);
    const results: HistoryRecord[] = [];

    let result = await iterator.next();
    while (!result.done) {
      const historyItem = result.value;
      let record: Shipment = {} as Shipment;
      if (!historyItem.isDelete && historyItem.value.length > 0) {
        try {
          record = JSON.parse(Buffer.from(historyItem.value).toString('utf8'));
        } catch (err) {
          record = Buffer.from(historyItem.value).toString('utf8') as unknown as Shipment;
        }
      }
      results.push({
        txId: historyItem.txId,
        timestamp: new Date(historyItem.timestamp.seconds.low * 1000).toISOString(),
        blockNumber: 100 + results.length + 1,
        isDelete: historyItem.isDelete,
        value: record
      });
      result = await iterator.next();
    }
    await iterator.close();
    return JSON.stringify(results);
  }

  @Transaction(false)
  @Returns('string')
  public async GetAllShipments(ctx: Context): Promise<string> {
    const iterator = await ctx.stub.getStateByRange('', '');
    const allResults: Shipment[] = [];
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
      try {
        const record = JSON.parse(strValue);
        allResults.push(record);
      } catch (err) {
        // skip non-json
      }
      result = await iterator.next();
    }
    await iterator.close();
    return JSON.stringify(allResults);
  }

  @Transaction(false)
  @Returns('boolean')
  public async ShipmentExists(ctx: Context, id: string): Promise<boolean> {
    const shipmentBytes = await ctx.stub.getState(id);
    return !!shipmentBytes && shipmentBytes.length > 0;
  }
}

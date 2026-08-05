import { Contract, Context, Info, Returns, Transaction } from 'fabric-contract-api';
import { Shipment, ShipmentStatus, TemperatureReading, LocationUpdate, HistoryRecord } from './shipment';

@Info({ title: 'ShipmentContract', description: 'Smart Contract for Supply Chain Asset Management' })
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
        origin: 'Berlin, Germany (Pharma Hub)',
        destination: 'Tokyo Medical Center, Japan',
        currentLocation: 'Berlin Cold Storage Warehouse',
        carrier: 'Global ColdChain Logistics',
        owner: 'BioMed Global',
        timestamp: new Date('2026-08-01T08:00:00Z').toISOString(),
        status: ShipmentStatus.CREATED,
        temperatureData: [
          { timestamp: new Date('2026-08-01T08:05:00Z').toISOString(), temperature: 4.2, sensorId: 'SENS-BER-01' }
        ],
        locationHistory: [
          { location: 'Berlin Cold Storage Warehouse', timestamp: new Date('2026-08-01T08:00:00Z').toISOString(), updatedBy: 'BioMed Global' }
        ],
        minTempThreshold: -20,
        maxTempThreshold: 8
      },
      {
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
      temperatureData: [],
      locationHistory: [
        { location: origin, timestamp: now, updatedBy: owner }
      ],
      minTempThreshold,
      maxTempThreshold
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
    updatedBy: string
  ): Promise<string> {
    const shipmentBytes = await ctx.stub.getState(id);
    if (!shipmentBytes || shipmentBytes.length === 0) {
      throw new Error(`Shipment ${id} does not exist`);
    }

    const shipment: Shipment = JSON.parse(shipmentBytes.toString());
    const ts = timestamp || new Date().toISOString();

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

    await ctx.stub.putState(id, Buffer.from(JSON.stringify(shipment)));
    return JSON.stringify(shipment);
  }

  @Transaction()
  public async LogIoTTelemetry(
    ctx: Context,
    id: string,
    temperatureStr: string,
    sensorId: string,
    timestamp: string
  ): Promise<string> {
    const shipmentBytes = await ctx.stub.getState(id);
    if (!shipmentBytes || shipmentBytes.length === 0) {
      throw new Error(`Shipment ${id} does not exist`);
    }

    const shipment: Shipment = JSON.parse(shipmentBytes.toString());
    const temperature = parseFloat(temperatureStr);
    const ts = timestamp || new Date().toISOString();

    const reading: TemperatureReading = {
      timestamp: ts,
      temperature,
      sensorId: sensorId || 'IOT-GENERIC-1'
    };

    shipment.temperatureData.push(reading);

    // Auto-flag Compromised if thresholds breached
    if (temperature > shipment.maxTempThreshold || temperature < shipment.minTempThreshold) {
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

    if (newCarrier) {
      shipment.carrier = newCarrier;
    }
    if (newOwner) {
      shipment.owner = newOwner;
    }

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

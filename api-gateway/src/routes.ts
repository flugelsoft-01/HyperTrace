import { Router, Request, Response } from 'express';
import { fabricEngine } from './fabricEngine';

export const router = Router();

// Health Check
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    system: 'HyperTrace Enterprise Fabric Gateway',
    channel: 'mychannel',
    network: 'Hyperledger Fabric Test Network',
    peers: ['peer0.org1.example.com:7051', 'peer0.org2.example.com:9051'],
    orderer: 'orderer.example.com:7050',
    worldStateDB: 'CouchDB',
    timestamp: new Date().toISOString()
  });
});

// SSE Event Stream for Real-time Push Updates
router.get('/events/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'HyperTrace SSE Event Stream Connected' })}\n\n`);

  const onFabricEvent = (eventData: any) => {
    res.write(`data: ${JSON.stringify(eventData)}\n\n`);
  };

  fabricEngine.on('fabricEvent', onFabricEvent);

  req.on('close', () => {
    fabricEngine.removeListener('fabricEvent', onFabricEvent);
  });
});

// Seed Initial Ledger
router.post('/seed', (req: Request, res: Response) => {
  try {
    const seeded = fabricEngine.seedInitialLedger();
    res.json({ success: true, message: 'Ledger seeded successfully', count: seeded.length, data: seeded });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/shipments - Query all shipments
router.get('/shipments', (req: Request, res: Response) => {
  try {
    const shipments = fabricEngine.getAllShipments();
    res.json({ success: true, data: shipments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/shipments/:id - Query single shipment by ID
router.get('/shipments/:id', (req: Request, res: Response) => {
  try {
    const shipment = fabricEngine.getShipment(req.params.id);
    res.json({ success: true, data: shipment });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
});

// GET /api/shipments/:id/history - Query full provenance trail
router.get('/shipments/:id/history', (req: Request, res: Response) => {
  try {
    const history = fabricEngine.getShipmentHistory(req.params.id);
    res.json({ success: true, id: req.params.id, count: history.length, data: history });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
});

// GET /api/shipments/:id/certificate - Printable Cryptographic Certificate Metadata
router.get('/shipments/:id/certificate', (req: Request, res: Response) => {
  try {
    const shipment = fabricEngine.getShipment(req.params.id);
    const history = fabricEngine.getShipmentHistory(req.params.id);
    
    res.json({
      success: true,
      certificateId: `CERT-HYPERTRACE-${shipment.id}`,
      issuedAt: new Date().toISOString(),
      issuer: 'Hyperledger Fabric Orderer (orderer.example.com)',
      mspEndorsements: ['Org1MSP (BioMed Global)', 'Org2MSP (Global Logistics)'],
      signature: '0x' + Buffer.from(shipment.id + shipment.timestamp).toString('hex'),
      shipment,
      historyCount: history.length
    });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
});

// POST /api/shipments - Create new shipment
router.post('/shipments', (req: Request, res: Response) => {
  try {
    const { id, origin, destination, owner, carrier, minTempThreshold, maxTempThreshold } = req.body;
    if (!id || !origin || !destination || !owner || !carrier) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: id, origin, destination, owner, carrier'
      });
    }

    const newShipment = fabricEngine.createShipment(
      id,
      origin,
      destination,
      owner,
      carrier,
      minTempThreshold ? parseFloat(minTempThreshold) : undefined,
      maxTempThreshold ? parseFloat(maxTempThreshold) : undefined
    );
    res.status(201).json({ success: true, message: 'Shipment created on ledger', data: newShipment });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/shipments/:id/location - Update Location
router.post('/shipments/:id/location', (req: Request, res: Response) => {
  try {
    const { newLocation, updatedBy, latitude, longitude } = req.body;
    if (!newLocation) {
      return res.status(400).json({ success: false, error: 'Missing parameter: newLocation' });
    }

    const updated = fabricEngine.updateLocation(
      req.params.id,
      newLocation,
      updatedBy,
      latitude ? parseFloat(latitude) : undefined,
      longitude ? parseFloat(longitude) : undefined
    );
    res.json({ success: true, message: 'Transit checkpoint updated', data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/shipments/:id/telemetry - Log IoT Telemetry
router.post('/shipments/:id/telemetry', (req: Request, res: Response) => {
  try {
    const { temperature, humidity, shockGForce, lightExposureLux, latitude, longitude, sensorId } = req.body;
    if (temperature === undefined || temperature === null) {
      return res.status(400).json({ success: false, error: 'Missing parameter: temperature' });
    }

    const updated = fabricEngine.logIoTTelemetry(
      req.params.id,
      parseFloat(temperature),
      humidity ? parseFloat(humidity) : undefined,
      shockGForce ? parseFloat(shockGForce) : undefined,
      lightExposureLux ? parseFloat(lightExposureLux) : undefined,
      latitude ? parseFloat(latitude) : undefined,
      longitude ? parseFloat(longitude) : undefined,
      sensorId
    );
    res.json({
      success: true,
      message: `Multi-Sensor IoT telemetry recorded. Status: ${updated.status}`,
      isCompromised: updated.status === 'Compromised',
      data: updated
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/shipments/:id/custody - Transfer Custody
router.post('/shipments/:id/custody', (req: Request, res: Response) => {
  try {
    const { newCarrier, newOwner } = req.body;
    if (!newCarrier && !newOwner) {
      return res.status(400).json({ success: false, error: 'Provide at least newCarrier or newOwner' });
    }

    const updated = fabricEngine.transferCustody(req.params.id, newCarrier, newOwner);
    res.json({ success: true, message: 'Custody transferred', data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

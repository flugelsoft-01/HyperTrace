import { Router, Request, Response } from 'express';
import { fabricEngine } from './fabricEngine';

export const router = Router();

// Health Check
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    channel: 'mychannel',
    network: 'Hyperledger Fabric Test Network',
    peers: ['peer0.org1.example.com:7051', 'peer0.org2.example.com:9051'],
    orderer: 'orderer.example.com:7050',
    worldStateDB: 'CouchDB',
    timestamp: new Date().toISOString()
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
    const { newLocation, updatedBy } = req.body;
    if (!newLocation) {
      return res.status(400).json({ success: false, error: 'Missing parameter: newLocation' });
    }

    const updated = fabricEngine.updateLocation(req.params.id, newLocation, updatedBy);
    res.json({ success: true, message: 'Transit checkpoint updated', data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/shipments/:id/telemetry - Log IoT Telemetry (Temperature)
router.post('/shipments/:id/telemetry', (req: Request, res: Response) => {
  try {
    const { temperature, sensorId } = req.body;
    if (temperature === undefined || temperature === null) {
      return res.status(400).json({ success: false, error: 'Missing parameter: temperature' });
    }

    const tempVal = parseFloat(temperature);
    const updated = fabricEngine.logIoTTelemetry(req.params.id, tempVal, sensorId);
    res.json({
      success: true,
      message: `IoT telemetry recorded. Status: ${updated.status}`,
      isCompromised: updated.status === 'Compromised',
      data: updated
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/shipments/:id/custody - Transfer Custody / Owner
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

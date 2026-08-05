import express from 'express';
import cors from 'cors';
import path from 'path';
import { router as apiRoutes } from './routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Static frontend serving if built
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Hyperledger Fabric Supply Chain API</title></head>
          <body style="font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px;">
            <h1>Hyperledger Fabric API Gateway Running</h1>
            <p>API Endpoint: <code>/api/shipments</code></p>
            <p>Frontend UI is running on Vite Dev Server (port 5173) or run <code>npm run build</code> in frontend directory.</p>
          </body>
        </html>
      `);
    }
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 HyperTrace REST API Gateway running on port ${PORT}`);
  console.log(`🔗 Channel: mychannel | Org: Org1MSP (peer0.org1.example.com)`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📦 Shipments API: http://localhost:${PORT}/api/shipments`);
  console.log(`=======================================================`);
});

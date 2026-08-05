import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { router as apiRoutes } from './routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Candidate paths for built frontend static files
const candidatePaths = [
  path.join(__dirname, '../../frontend/dist'),
  path.join(__dirname, '../frontend/dist'),
  path.join(__dirname, './frontend/dist'),
  path.join(process.cwd(), 'frontend/dist'),
  path.join(process.cwd(), '../frontend/dist')
];

let frontendDistPath = candidatePaths.find(p => fs.existsSync(path.join(p, 'index.html'))) || candidatePaths[0];

console.log(`📁 Static Frontend Directory: ${frontendDistPath} (Exists: ${fs.existsSync(frontendDistPath)})`);

app.use(express.static(frontendDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(frontendDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>HyperTrace — REST API & Service Gateway</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; background: #090d16; color: #f8fafc; padding: 40px; }
            .card { background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.1); padding: 30px; border-radius: 16px; max-width: 600px; }
            code { background: rgba(59,130,246,0.2); color: #60a5fa; padding: 4px 8px; border-radius: 6px; }
            a { color: #38bdf8; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1 style="color: #38bdf8; margin-top:0;">HyperTrace REST API Gateway Active</h1>
            <p>The backend Hyperledger Fabric Smart Contract engine is online!</p>
            <p><strong>API Endpoint:</strong> <a href="/api/shipments"><code>/api/shipments</code></a></p>
            <p><strong>Health Check:</strong> <a href="/api/health"><code>/api/health</code></a></p>
            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;" />
            <p style="font-size: 0.9rem; color: #94a3b8;">
              💡 <em>Frontend UI Notice:</em> Running locally on Vite Dev Server (<a href="http://localhost:5174">http://localhost:5174</a>) or execute <code>./scripts/setup.sh</code> to build production static files into <code>frontend/dist</code>.
            </p>
          </div>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 HyperTrace REST API Gateway running on port ${PORT}`);
  console.log(`🔗 Channel: mychannel | Org: Org1MSP (peer0.org1.example.com)`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📦 Shipments API: http://localhost:${PORT}/api/shipments`);
  console.log(`=======================================================`);
});

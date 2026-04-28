import { createSharedApp } from '../app';
import express from 'express';

export const config = {
  api: {
    bodyParser: false,
  },
};

let app;
try {
  app = createSharedApp();
} catch (error) {
  console.error('Server Startup Error:', error);
  app = express();
  app.all('*', (req: any, res: any) => {
    res.status(500).json({ error: 'Server failed to start', details: error instanceof Error ? error.message : String(error) });
  });
}

export default app;

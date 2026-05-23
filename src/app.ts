import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { setRoutes } from './routes/index';
import { config } from './config/index';
import { initSchema } from './services/db';
import { startPriceCollector } from './services/priceCollector';

const app = express();
const PORT = config.port || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS — public data API, allow all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'OPTIONS'],
}));

setRoutes(app);

app.listen(PORT, async () => {
  console.log(`tanq. API running on port ${PORT} [${config.env}]`);
  console.log(`Data provider: ${process.env.FUEL_DATA_PROVIDER || 'dgeg'}`);
  await initSchema();
  startPriceCollector();
});

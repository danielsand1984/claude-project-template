import express from 'express';
import { createHealthRouter } from './routes/health.js';
import { errorHandler } from './middleware/errorHandler.js';
import { correlationId } from './middleware/correlationId.js';

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json({ limit: '5mb' }));
app.use(correlationId);

app.use('/healthz', createHealthRouter());

app.use(errorHandler);

app.listen(port, () => {
  console.log(JSON.stringify({ level: 'info', msg: 'api listening', port }));
});

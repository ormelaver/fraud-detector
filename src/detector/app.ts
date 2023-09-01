import express from 'express';
import { json } from 'body-parser';

import { detectFraud } from './routes/detect';
import { createProducerMiddleware } from './middleware/createProducer';
const app = express();
app.set('trust proxy', true);

app.use(json());
app.use(createProducerMiddleware);
app.use(detectFraud);
app.all('*', async (req, res) => {
  throw new Error('route not found');
});

export { app };

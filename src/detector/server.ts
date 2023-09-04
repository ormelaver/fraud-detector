import 'dotenv/config';
import mongoose from 'mongoose';

import { app } from './app';
import { initConsumers } from './consumers/initConsumers';
import { RedisClient } from './services/redisClient';

const PORT = process.env.PORT;

const cleanup = () => {
  const redisClient = RedisClient.getInstance();
  redisClient.shutdown();
  console.log('Disconnected from Redis');
};

const start = async () => {
  try {
    await initConsumers();
    console.log('initialized consumers');

    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI must be defined');
    }

    await mongoose.connect(process.env.MONGO_URI); //auth (after the last slash) is a DB created automatically by mongo
    console.log('connected to MongoDB');

    app.listen(3000, () => {
      console.log('server listening on port ' + PORT);
    });
  } catch (error: any) {
    throw error;
  }
};

// process.on('exit', cleanup);
process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

process.on('exit', (code) => {
  console.log(`Exiting with code: ${code}`);
  cleanup();
});
start();

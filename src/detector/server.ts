import 'dotenv/config';

import { app } from './app';
import { initConsumers } from './consumers/initConsumers';
import { RedisClient } from './services/redisClient';
import {
  DatabaseConnectionFactory,
  DatabaseType,
} from './shared/databaseConnectionFactory';

const PORT = process.env.PORT;

const cleanup = async () => {
  const redisClient = RedisClient.getInstance();
  await redisClient.shutdown();
  console.log('Disconnected from Redis');
};

const start = async () => {
  try {
    await initConsumers();
    console.log('initialized consumers');

    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI must be defined');
    }

    await DatabaseConnectionFactory.createConnection(DatabaseType.MONGO);
    // await mongoose.connect(process.env.MONGO_URI);
    // console.log('connected to MongoDB');

    app.listen(PORT, () => {
      console.log('server listening on port ' + PORT);
    });
  } catch (error: any) {
    throw error;
  }
};

process.on('SIGINT', async () => {
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await cleanup();
  process.exit(0);
});

process.on('beforeExit', async (code) => {
  console.log(`About to exit with code: ${code}`);
  await cleanup();
});

// process.on('exit', (code) =>
//   console.log(`Exiting with code: ${code}`);
//   cleanup();
// });
start();

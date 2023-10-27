import mongoose from 'mongoose';
import { RedisClient } from '../services/redisClient';
import { DatabaseConnection } from '../types/kafka';
// export abstract class DatabaseConnection {
//   abstract connect(): void;
//   abstract shutdown?(): void;
//   //   query(query: any): Promise<any>;
// }

export enum DatabaseType {
  REDIS = 'redis',
  MONGO = 'mongo',
}

export class DatabaseConnectionFactory {
  static async createConnection(
    type: DatabaseType
  ): Promise<DatabaseConnection | void> {
    try {
      switch (type) {
        case DatabaseType.REDIS:
          const redis = RedisClient.getInstance();
          await redis.connect();
          return redis;
        case DatabaseType.MONGO:
          if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI must be defined');
          }
          await mongoose.connect(process.env.MONGO_URI);
          console.log('connected to MongoDB');
          return;
        default:
          throw new Error('Unknown database type');
      }
    } catch (error) {
      throw error;
    }
  }
}

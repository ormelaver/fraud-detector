import { createClient } from 'redis';
import { DatabaseConnection } from '../types/kafka';
// TODO: add error handler to reconnect if connection is lost
// Use connection pool?

// create an enum for possible keys

export class RedisClient extends DatabaseConnection {
  private static instance: RedisClient;
  private _client: any;
  private isConnected = false;
  private reconnectAttempts = 2;

  private constructor() {
    super();
    this._client = createClient();

    this._client.on('connect', () => {
      this.isConnected = true;
    });
    this._client.on('end', () => {
      this.isConnected = false;
    });
    this._client.on('error', (error: any) => {
      this.isConnected = false;
      console.log('Redis Client Error', error);
      console.log(`Reconnection attempts: ${this.reconnectAttempts}`);
      if (this.reconnectAttempts > 0) {
        this.reconnectAttempts--;
        this.connect();
      } else {
        console.log('Could not reconnect');
      }
    });
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public async incrementCounter(key: string) {
    try {
      await this._client.incr(key); //creates the key if it doesn't exist
      console.log(`key ${key} incremented`);
    } catch (error) {
      throw error;
    }
  }
  public async setExpiration(key: string, ttlSeconds: number) {
    const reply = await this._client.expire(key, ttlSeconds);
    console.log(`New expiration set for ${key}: ${reply}`);
  }

  public async getValue(key: string) {
    const value = await this._client.get(key);
    return value;
  }

  public async setValue(key: string, value: any, ttlSeconds?: number) {
    await this._client.set(key, value);
    if (ttlSeconds) {
      this.setExpiration(key, ttlSeconds);
    }
    console.log(`key ${key} set with value ${value}`);
  }

  public async addListElement(key: string, element: any, ttlSeconds?: number) {
    try {
      const transactionString = JSON.stringify(element);

      const reply = await this._client.lPush(key, transactionString);
      if (ttlSeconds) {
        await this.setExpiration(key, ttlSeconds);
      }
      return reply;
    } catch (error) {
      throw error;
    }
  }

  public async getList(key: any, fromIndex: number, toIndex: number) {
    const list = await this._client.lRange(key, fromIndex, toIndex);
    return list;
  }

  public async connect() {
    if (!this.isConnected) {
      await this._client.connect();
    }
  }

  //disconnect/close?
  public shutdown() {
    console.log('Shutting down Redis connection');
    this._client.quit();
  }

  get client() {
    return this._client;
  }
}

import { BaseProcessor } from '../shared/baseProcessor';
import { RedisClient } from '../services/redisClient';
import { Card } from '../models/card';
const AVERAGE_TRANSACTION_MULTIPLIER = 5;

class AverageTransactionProcessor extends BaseProcessor {
  private redisClient = RedisClient.getInstance();
  public async process(transaction: any) {
    try {
      await this.redisClient.connect();
      const cardId = this.extractValue(transaction, 'cid');
      const currentAmount = this.extractValue(transaction, 'amount');
      let average = await this.redisClient.getValue(
        `card:${cardId}:averageTransaction`
      );

      if (!average) {
        console.log('Cache miss - retrieving from Mongo');
        average = await this.getAverageFromMongo(cardId);
      }

      //in case this is a new card and this processor checks in Mongo before the MongoCardProcessor inserts the new card. getAverageFromMongo will return null and there is no point in checking the average because this is the first transaction.
      if (average) {
        const isAmountExceeded = this.isAmountExceeded(average, currentAmount);
        if (isAmountExceeded) {
          const alert = {
            transaction,
            alertType: 'AVG_TRANSACTION_MULTIPLIER_EXCEEDED',
          };
          await this.sendToAlertTopic(alert);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  private isAmountExceeded(average: number, currentAmount: number) {
    const isExceeded = average * AVERAGE_TRANSACTION_MULTIPLIER < currentAmount;
    return isExceeded;
  }

  private async getAverageFromMongo(cardId: any) {
    try {
      const card = await Card.findOne(
        { cid: cardId },
        { _id: 0, averageTransaction: 1 }
      );
      return card!.averageTransaction;
    } catch (error) {
      throw error;
    }
  }
  private extractValue(transaction: any, property: string) {
    const value = transaction.message.value;
    return JSON.parse(value)[property];
  }
}

export const averageTransactionProcessor = new AverageTransactionProcessor();

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
        average = this.getAverageFromMongo(cardId);
      }

      if (average * AVERAGE_TRANSACTION_MULTIPLIER < currentAmount) {
        this.sendToAlertTopic(
          transaction,
          'AVG_TRANSACTION_MULTIPLIER_EXCEEDED'
        );
      }
    } catch (error) {
      throw error;
    }
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

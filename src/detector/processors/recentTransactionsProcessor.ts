import { RedisClient } from '../services/redisClient';
import { BaseProcessor } from '../shared/baseProcessor';
import {
  DatabaseConnectionFactory,
  DatabaseType,
} from '../shared/databaseConnectionFactory';

const MAX_TRANSACTIONS_PER_INTERVAL = 2;
const RECENT_TRANSACTIONS_INTERVAL_SECONDS = 120;

//add an interface to ensure there's a process() and send sendAlert() functions
// create a class for each rule and assign their consumers to the same group to ensure a message is processed only once. Make them work in parallel with async calls
// cache relevant DB data
// apply the lightweight rules first
export class RecentTransactionsProcessor extends BaseProcessor {
  // private redis = RedisClient.getInstance();

  public async process(transaction: any) {
    const redisClient = (await DatabaseConnectionFactory.createConnection(
      DatabaseType.REDIS
    )) as RedisClient;
    // await this.redis.connect();
    const cid = this.extractCid(transaction);
    await this.checkRecentTransactions(cid, redisClient);
    await this.addTransactionToCache(cid, transaction, redisClient);
    console.log(`Finished processing: ${JSON.stringify(transaction)}`);
  }

  private async checkRecentTransactions(cid: number, redisClient: RedisClient) {
    try {
      const recentTransactionsNumber = await redisClient.getValue(
        `card:${cid}:counter`
      );

      if (
        parseInt(recentTransactionsNumber) + 1 >
        MAX_TRANSACTIONS_PER_INTERVAL
      ) {
        console.log(`Transaction for user ${cid} is FLAGGED`);
        const recentTransactions = await redisClient.getList(
          `card:${cid}:transactions`,
          0,
          -1
        );
        let values: any = [];
        recentTransactions.forEach((transaction: any) => {
          let strValue = JSON.parse(transaction).message.value;
          values.push(JSON.parse(strValue));
        });
        const alert = {
          transaction: values,
          alertType: 'MAX_TRANSACTIONS_PER_INTERVAL_EXCEEDED',
        };
        await this.sendToAlertTopic(alert);
      } else {
        console.log(`Transaction for card ${cid} is VALID`);
      }
    } catch (error) {
      throw error;
    }
  }

  private async addTransactionToCache(
    cid: number,
    transaction: any,
    redisClient: RedisClient
  ) {
    await redisClient.incrementCounter(`card:${cid}:counter`);
    await redisClient.setExpiration(
      `card:${cid}:counter`,
      RECENT_TRANSACTIONS_INTERVAL_SECONDS
    );
    const reply = await redisClient.addListElement(
      `card:${cid}:transactions`,
      transaction,
      RECENT_TRANSACTIONS_INTERVAL_SECONDS
    );
    console.log(`Transaction added: ${reply}`);
  }

  private extractCid(transaction: any) {
    const value = transaction.message.value;
    return JSON.parse(value).cid;
  }
}

export const recentTransactionsProcessor = new RecentTransactionsProcessor();

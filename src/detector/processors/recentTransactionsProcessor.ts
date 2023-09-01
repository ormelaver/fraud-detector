import { RedisClient } from '../services/redis';
import { BaseProcessor } from '../shared/baseProcessor';
const MAX_TRANSACTIONS_PER_INTERVAL = 2;
const RECENT_TRANSACTIONS_INTERVAL_SECONDS = 120;

//add an interface to ensure there's a process() and send sendAlert() functions
// create a class for each rule and assign their consumers to the same group to ensure a message is processed only once. Make them work in parallel with async calls
// cache relevant DB data
// apply the lightweight rules first
class RecentTransactionsProcessor extends BaseProcessor {
  private redis = RedisClient.getInstance();

  // constructor() {
  //   super();
  //   // this.redis = RedisClient.getInstance();
  // }

  public async process(transaction: any) {
    await this.redis.connect();
    const cid = this.extractCid(transaction);
    await this.checkRecentTransactions(cid);
    await this.addTransactionToCache(cid, transaction);
    console.log(`Finished processing: ${JSON.stringify(transaction)}`);
  }

  private async checkRecentTransactions(cid: number) {
    const recentTransactionsNumber = await this.redis.getValue(
      `user:${cid}:counter`
    );

    if (
      parseInt(recentTransactionsNumber) + 1 >
      MAX_TRANSACTIONS_PER_INTERVAL
    ) {
      console.log(`Transaction for user ${cid} is FLAGGED`);
      const recentTransactions = await this.redis.getList(
        `user:${cid}:transactions`,
        0,
        -1
      );
      console.log(
        'recent tAS ' +
          JSON.stringify(JSON.parse(recentTransactions[0]).message.value)
      );
      let values: any = [];
      recentTransactions.forEach((transaction: any) => {
        let strValue = JSON.parse(transaction).message.value;
        values.push(JSON.parse(strValue));
      });
      this.sendToAlertTopic(values, 'MAX_TRANSACTIONS_PER_INTERVAL_EXCEEDED');
      //TODO: publish to 'flagged' queue (only current TA or all of them?)
    } else {
      console.log(`Transaction for user ${cid} is VALID`);
    }
  }

  private async addTransactionToCache(cid: number, transaction: any) {
    await this.redis.incrementCounter(`user:${cid}:counter`);
    await this.redis.setExpiration(
      `user:${cid}:counter`,
      RECENT_TRANSACTIONS_INTERVAL_SECONDS
    );
    const reply = await this.redis.addListElement(
      `user:${cid}:transactions`,
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

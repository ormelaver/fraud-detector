import { BaseProcessor } from '../shared/baseProcessor';
import { Transaction } from '../models/transaction';

//think about indexing
class MongoTransactionProcessor extends BaseProcessor {
  public async process(transaction: any): Promise<void> {
    // console.log('\x1b[33m TRANSACTION \x1b[0m', transaction);
    await this.insertTransaction(transaction);
  }

  private async insertTransaction(transaction: any) {
    const transactionDoc = Transaction.build(
      JSON.parse(transaction.message.value)
    );
    await transactionDoc.save();
  }
}

export const mongoTransactionProcessor = new MongoTransactionProcessor();

import { BaseProcessor } from '../shared/baseProcessor';
import { Transaction } from '../models/transaction';

export class MongoTransactionProcessor extends BaseProcessor {
  public async process(transaction: any): Promise<void> {
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

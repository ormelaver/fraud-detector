import { BaseProcessor } from '../shared/baseProcessor';
import { Transaction } from '../models/transaction';

class MongoTransactionProcessor extends BaseProcessor {
  public async process(transaction: any): Promise<void> {
    // console.log('\x1b[33m TRANSACTION \x1b[0m', transaction);
    await this.insertTransaction(transaction);

    //insert to TA collection
    // update User collection (avg amount, location)
  }

  private async insertTransaction(transaction: any) {
    const transactionDoc = Transaction.build(
      JSON.parse(transaction.message.value)
    );
    console.log(transactionDoc.toJSON());
    console.log(transactionDoc);
    await transactionDoc.save();
  }
}

export const mongoTransactionProcessor = new MongoTransactionProcessor();

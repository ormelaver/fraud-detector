import { BaseProcessor } from '../shared/baseProcessor';
import { Card } from '../models/card';

class MongoCardProcessor extends BaseProcessor {
  public async process(transaction: any): Promise<void> {
    await this.updateCardCollection(transaction);
  }

  private async updateCardCollection(transaction: any) {
    const cardId = this.extractCid(transaction);
    const filter = { cid: cardId };
    const amount = this.extractValue(transaction, 'amount');
    const location = this.extractValue(transaction, 'location');
    const card = await Card.findOneAndUpdate(
      filter,
      {
        // Increment totalAmount and numOfTransactions
        // $inc: {
        //   totalAmount: amount,
        //   numOfTransactions: 1,
        // },
        $set: {
          averageTransaction: {
            $divide: [
              { $add: ['$totalAmount', amount] },
              { $add: ['$numOfTransactions', 1] },
            ],
          },
          totalAmount: { $inc: { $totalAmount: amount } },
          numOfTransactions: { $inc: { $numOfTransactions: 1 } },
        },
        // Conditionally set averageAmount (if card is found, we'll recalculate it after this operation)
        $setOnInsert: {
          cid: cardId,
          active: true,
          location,
          averageTransaction: amount,
          totalAmount: amount,
          numOfTransactions: 1,
        },
      },
      {
        upsert: true,
        new: true, // returns the updated document
        runValidators: true,
      }
    );
    console.log(card);

    //use query aggregation
    //add Card model?
    //if Card exists: update avg amount
    //decide how to implement location: coordinates or names?
  }

  private calculateAverageAmount() {}

  private extractValue(transaction: any, property: string) {
    const value = transaction.message.value;
    return JSON.parse(value)[property];
  }
  private extractCid(transaction: any) {
    const value = transaction.message.value;
    return JSON.parse(value).cid;
  }
}

export const mongoCardProcessor = new MongoCardProcessor();

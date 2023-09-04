import { BaseProcessor } from '../shared/baseProcessor';
import { Card } from '../models/card';

//decide how to implement location: coordinates or names?
//think about indexing
//replace the props in the this.extractValue() calls to TransactionType.prop
//move calculatAverage and extractValue to a separate utilities.ts module (from all classes).
class MongoCardProcessor extends BaseProcessor {
  public async process(transaction: any): Promise<void> {
    await this.updateCardCollection(transaction);
  }

  private async updateCardCollection(transaction: any) {
    const cardId = this.extractValue(transaction, 'cid');
    const filter = { cid: cardId };
    const amount = this.extractValue(transaction, 'amount');
    const location = this.extractValue(transaction, 'location');
    try {
      const currentCard = await Card.findOne(filter);
      if (!currentCard) {
        const newCard = await Card.build({
          cid: cardId,
          location,
          active: true,
          numOfTransactions: 1,
          totalAmount: amount,
          averageTransaction: amount,
        });
        await newCard.save();
      } else {
        const newNumOfTransactions = currentCard.numOfTransactions + 1;
        const newAmount = currentCard.totalAmount + amount;
        const newAverage = this.calculateAverageAmount(
          newAmount,
          newNumOfTransactions
        );
        currentCard.set({
          numOfTransactions: newNumOfTransactions,
          totalAmount: newAmount,
          averageTransaction: newAverage,
        });
        await currentCard.save();
      }
    } catch (error) {
      throw error;
    }
  }

  private calculateAverageAmount(sum: number, items: number) {
    return sum / items;
  }

  private extractValue(transaction: any, property: string) {
    const value = transaction.message.value;
    return JSON.parse(value)[property];
  }
}

export const mongoCardProcessor = new MongoCardProcessor();

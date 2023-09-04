import { KafkaConsumer } from '../services/kafkaConsumer';
import { recentTransactionsProcessor } from '../processors/recentTransactionsProcessor';
import { averageTransactionProcessor } from '../processors/averageTransactionProcessor';
import { mongoTransactionProcessor } from '../processors/mongoTransactionProcessor';
import { mongoCardProcessor } from '../processors/mongoCardProcessor';

const consumerList = [
  //add type
  {
    processor: recentTransactionsProcessor,
    groupId: 'detectors-recent-transaction',
    topic: 'transactions',
  },
  {
    processor: averageTransactionProcessor,
    groupId: 'detectors-average-transaction',
    topic: 'transactions',
  },
  {
    processor: mongoTransactionProcessor,
    groupId: 'database-transactions',
    topic: 'transactions',
  },
  {
    processor: mongoCardProcessor,
    groupId: 'database-cards',
    topic: 'transactions',
  },
  //TA amount processor: compare to user's median/average amount, which means also update the average on every transaction.
];

export const initConsumers = async () => {
  try {
    consumerList.forEach(async (elem) => {
      const consumer = new KafkaConsumer(elem.processor, elem.groupId);
      await consumer.connectSubscribe({
        topics: [elem.topic],
        fromBeginning: true,
      });
      await consumer.run();
    });
  } catch (error) {
    throw error;
  }
};

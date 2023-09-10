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
    batchSize: 1,
  },
  {
    processor: averageTransactionProcessor,
    groupId: 'detectors-average-transaction',
    topic: 'transactions',
    batchSize: 1,
  },
  {
    processor: mongoTransactionProcessor,
    groupId: 'database-transactions',
    topic: 'transactions',
    batchSize: 3,
  },
  {
    processor: mongoCardProcessor,
    groupId: 'database-cards',
    topic: 'transactions',
    batchSize: 1,
  },
];

export const initConsumers = async () => {
  try {
    consumerList.forEach(async (elem) => {
      const consumer = new KafkaConsumer(
        elem.processor,
        elem.groupId,
        elem.batchSize
      );
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

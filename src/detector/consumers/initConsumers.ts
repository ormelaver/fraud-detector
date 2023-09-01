import { KafkaConsumer } from '../services/kafkaConsumer';
import { recentTransactionsProcessor } from '../processors/recentTransactionsProcessor';
import { mongoTransactionProcessor } from '../processors/mongoTransactionProcessor';
import { mongoCardProcessor } from '../processors/mongoCardProcessor';

const consumerList = [
  //add type
  {
    processor: recentTransactionsProcessor,
    groupId: 'detectors',
    topic: 'transactions',
  },
  {
    processor: mongoTransactionProcessor,
    groupId: 'database',
    topic: 'transactions',
  },
  {
    processor: mongoCardProcessor,
    groupId: 'database',
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

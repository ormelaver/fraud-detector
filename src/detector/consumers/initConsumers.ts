import { KafkaConsumer } from '../services/kafkaConsumer';
import { consumerList } from './consumerList';
import { processorFactory } from '../shared/processorFactory';

export const initConsumers = async () => {
  try {
    consumerList.forEach(async (elem) => {
      const processor = processorFactory.createProcessor(elem.processor);
      const consumer = new KafkaConsumer(
        processor,
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

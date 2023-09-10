import {
  Kafka,
  Consumer,
  ConsumerSubscribeTopics,
  EachMessagePayload,
  EachBatchPayload,
} from 'kafkajs';

export class KafkaConsumer {
  private consumer: Consumer;
  private messageProcessor;
  private batchSize: number;

  constructor(messageProcessor: any, groupId: string, batchSize: number = 1) {
    //TODO: allow more configuration (i.e set partitionsConsumedConcurrently)
    const kafka = new Kafka({
      clientId: 'my-app',
      brokers: ['localhost:9092'],
    });

    this.consumer = kafka.consumer({
      groupId,
      // maxWaitTimeInMs: 2000,
      // // maxBytesPerPartition: 1000,
      // maxBytes: 1000,
      // minBytes: 10,
    });
    this.batchSize = batchSize;
    this.messageProcessor = messageProcessor;
  }

  public async connectSubscribe(
    topics: ConsumerSubscribeTopics
  ): Promise<void> {
    //separate connect and subscribe?
    try {
      await this.consumer.connect();
      await this.consumer.subscribe(topics);
    } catch (error) {
      throw error;
    }
  }

  public async run(): Promise<void> {
    try {
      await this.consumer.run({
        eachBatchAutoResolve: true,
        partitionsConsumedConcurrently: 2,
        eachBatch: async ({
          batch,
          resolveOffset,
          heartbeat,
          commitOffsetsIfNecessary,
          uncommittedOffsets,
          isRunning,
          isStale,
          pause,
        }) => {
          const totalMessages = batch.messages.length;
          for (let i = 0; i < totalMessages; i += this.batchSize) {
            const subset = batch.messages.slice(i, i + this.batchSize);
            const processingPromises = subset.map((message) =>
              this.messageProcessor
                .process({
                  // topic: batch.topic,
                  // partition: batch.partition,
                  // highWatermark: batch.highWatermark,
                  message: {
                    // offset: message.offset,
                    value: message.value!.toString(),
                    // headers: message.headers,
                  },
                })
                .then(() => {
                  // Resolve offset after processing each message
                  resolveOffset(message.offset);
                })
            );

            // Wait for all messages to be processed
            await Promise.all(processingPromises);

            // Commit the offsets after all messages in the batch have been processed
            await commitOffsetsIfNecessary();
            await heartbeat();
          }
        },
      });
    } catch (error) {
      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    await this.consumer.disconnect();
  }
}

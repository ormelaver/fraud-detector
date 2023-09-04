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

  constructor(messageProcessor: any, groupId: string) {
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
          for (let message of batch.messages) {
            await this.messageProcessor.process({
              topic: batch.topic,
              partition: batch.partition,
              highWatermark: batch.highWatermark,
              message: {
                offset: message.offset,
                // key: message.key!.toString(),
                value: message.value!.toString(),
                headers: message.headers,
              },
            });

            //read about these
            resolveOffset(message.offset);
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

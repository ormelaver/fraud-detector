import { Kafka } from 'kafkajs';

export class KafkaProducer {
  private static instances: { [topic: string]: KafkaProducer } = {};
  private producer; // Replace with the actual Kafka producer type
  private _isConnected = false;

  private constructor(private topic: string) {
    const kafka = new Kafka({
      clientId: 'my-app',
      brokers: ['localhost:9092'],
    });
    this.producer = kafka.producer();
  }

  public static getInstance(topic: string): KafkaProducer {
    if (!KafkaProducer.instances[topic]) {
      KafkaProducer.instances[topic] = new KafkaProducer(topic);
    }
    return KafkaProducer.instances[topic];
  }

  //consider using keys. Though order doesn't matter
  //TODO: decide on a fixed message structure
  public async sendMessage(messages: any) {
    if (!this.isConnected) {
      await this.connect();
    }

    const messagesToSend = messages.map((message: any) => {
      return { value: message };
    });

    await this.producer.send({
      topic: this.topic,
      messages: messagesToSend,
    });
  }

  public async disconnect() {
    await this.producer.disconnect();
  }

  public get isConnected() {
    return this._isConnected;
  }

  private async connect(): Promise<void> {
    try {
      if (!this._isConnected) {
        await this.producer.connect();
        this._isConnected = true;
      }
    } catch (err) {
      console.error(err);
    }
  }
}

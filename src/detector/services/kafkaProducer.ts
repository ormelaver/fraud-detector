import { Kafka, Message } from 'kafkajs';

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

// export class KafkaProducer {
//   private static instance: KafkaProducer;
//   private _producer;
//   private _isConnected = false;

//   private constructor() {
//     const kafka = new Kafka({
//       clientId: 'my-app',
//       brokers: ['localhost:9092'],
//     });
//     this._producer = kafka.producer();
//   }

//   public static getInstance(): KafkaProducer {
//     if (!KafkaProducer.instance) {
//       KafkaProducer.instance = new KafkaProducer();
//     }
//     return KafkaProducer.instance;
//   }

//   public async sendMessage(message: string) {
//     if (!this.isConnected) {
//       await this.connect();
//     }
//     // const values = messages.map((msg) => ({ value: msg }));
//     console.log('message', message);
//     await this._producer.send({
//       topic: 'test',
//       messages: [{ value: message }],
//     });
//   }

//   public async disconnect() {
//     await this._producer.disconnect();
//   }

//   public get isConnected() {
//     return this._isConnected;
//   }

//   private async connect(): Promise<void> {
//     try {
//       if (!this._isConnected) {
//         await this._producer.connect();
//         this._isConnected = true;
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   // get producer() {
//   //   return this._producer;
//   // }
// }

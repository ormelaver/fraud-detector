import { KafkaProducer } from '../services/kafkaProducer';

export abstract class BaseProcessor {
  abstract process(transaction: any): Promise<void>;

  async sendToAlertTopic(alert: { transaction: any; alertType: any }) {
    const kafkaProducer = KafkaProducer.getInstance('alerts');
    await kafkaProducer.sendMessage([JSON.stringify(alert)]);
    //add enum for alertType
    console.log(`sent to alert queue with type ${alert.alertType}`);
  }
}

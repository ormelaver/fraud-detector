export abstract class BaseProcessor {
  abstract process(transaction: any): Promise<void>;

  sendToAlertTopic(transaction: any, alertType: any) {
    //add enum for alertType
    console.log(`sent to alert queue with type ${alertType}`);
  }
}

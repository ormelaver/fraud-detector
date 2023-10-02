import { BaseProcessor } from '../shared/baseProcessor';
import { TwilioClient } from '../services/twilioClient';

export class SmsAlertProcessor extends BaseProcessor {
  public async process(transaction: any): Promise<void> {
    const twilioClient = TwilioClient.getInstance();
    await twilioClient.sendMessage({
      body: transaction.message.value,
      to: '+972544916911',
    });
  }
}

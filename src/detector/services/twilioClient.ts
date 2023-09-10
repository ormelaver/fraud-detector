import { Twilio } from 'twilio';

export class TwilioClient {
  private static instance: TwilioClient;
  private _client: Twilio;
  private twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  private twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  private twilioNumber = process.env.TWILIO_NUMBER;

  private constructor() {
    if (!this.twilioAccountSid || !this.twilioAuthToken || !this.twilioNumber) {
      throw new Error('missing twilio account credentials');
    }
    this._client = new Twilio(this.twilioAccountSid, this.twilioAuthToken);
  }

  public static getInstance(): TwilioClient {
    if (!TwilioClient.instance) {
      TwilioClient.instance = new TwilioClient();
    }
    return TwilioClient.instance;
  }

  public async sendMessage(message: {
    to: string;
    body: string;
    from?: string;
  }) {
    await this._client.messages.create({
      body: message.body,
      from: message.from || this.twilioNumber,
      to: message.to,
    });
  }
}

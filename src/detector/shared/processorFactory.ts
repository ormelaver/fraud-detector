import { ProcessorType, GroupId, Topics } from '../types/kafka';
import { BaseProcessor } from './baseProcessor';
import { AverageTransactionProcessor } from '../processors/averageTransactionProcessor';
import { RecentTransactionsProcessor } from '../processors/recentTransactionsProcessor';
import { MongoCardProcessor } from '../processors/mongoCardProcessor';
import { MongoTransactionProcessor } from '../processors/mongoTransactionProcessor';
import { SmsAlertProcessor } from '../processors/smsAlertProcessor';

class ProcessorFactory {
  public createProcessor(processor: ProcessorType): BaseProcessor {
    switch (processor) {
      case ProcessorType.AVERAGE_TRANSACTION:
        return new AverageTransactionProcessor();
      case ProcessorType.RECENT_TRANSACTION:
        return new RecentTransactionsProcessor();
      case ProcessorType.MONGO_CARD:
        return new MongoCardProcessor();
      case ProcessorType.MONGO_TRANSACTION:
        return new MongoTransactionProcessor();
      case ProcessorType.SMS_ALERT:
        return new SmsAlertProcessor();
    }
  }
}

export const processorFactory = new ProcessorFactory();

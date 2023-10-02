import { ProcessorType, GroupId, Topics } from '../types/kafka';

export const consumerList = [
  //add type
  {
    processor: ProcessorType.RECENT_TRANSACTION,
    groupId: GroupId.DETECTORS_RECENT_TRANSACTION,
    topic: Topics.TRANSACTIONS,
    batchSize: 1,
  },
  {
    processor: ProcessorType.AVERAGE_TRANSACTION,
    groupId: GroupId.DETECTORS_AVERAGE_TRANSACTION,
    topic: Topics.TRANSACTIONS,
    batchSize: 1,
  },
  {
    processor: ProcessorType.MONGO_TRANSACTION,
    groupId: GroupId.DATABASE_TRANSACTIONS,
    topic: Topics.TRANSACTIONS,
    batchSize: 3,
  },
  {
    processor: ProcessorType.MONGO_CARD,
    groupId: GroupId.DATABASE_CARDS,
    topic: Topics.TRANSACTIONS,
    batchSize: 1,
  },
  {
    processor: ProcessorType.SMS_ALERT,
    groupId: GroupId.ALERTS_SMS,
    topic: Topics.ALERTS,
    batchSize: 1,
  },
];

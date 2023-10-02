export enum ProcessorType {
  AVERAGE_TRANSACTION = 'AVERAGE_TRANSACTION',
  RECENT_TRANSACTION = 'RECENT_TRANSACTION',
  MONGO_CARD = 'MONGO_CARD',
  MONGO_TRANSACTION = 'MONGO_TRANSACTION',
  SMS_ALERT = 'SMS_ALERT',
}

export enum GroupId {
  DETECTORS_RECENT_TRANSACTION = 'detectors-recent-transaction',
  DETECTORS_AVERAGE_TRANSACTION = 'detectors-average-transaction',
  DATABASE_TRANSACTIONS = 'database-transactions',
  DATABASE_CARDS = 'database-cards',
  ALERTS_SMS = 'alerts-sms',
}

export enum Topics {
  TRANSACTIONS = 'transactions',
  ALERTS = 'alerts',
}

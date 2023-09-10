import { Request, Response, NextFunction } from 'express';
import { KafkaProducer } from '../services/kafkaProducer';

export const createProducerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const defaultTopic = 'transactions';

  if (!req.kafkaProducer) {
    req.kafkaProducer = KafkaProducer.getInstance(defaultTopic);
  }
  next();
};

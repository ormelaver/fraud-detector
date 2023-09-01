import { Request, Response, NextFunction } from 'express';
import { KafkaProducer } from '../services/kafkaProducer';

export const createProducerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const defaultTopic = 'transactions'; // Replace with your default topic

  if (!req.kafkaProducer) {
    req.kafkaProducer = KafkaProducer.getInstance(defaultTopic);
  }
  next();
};

import { KafkaProducer } from '../services/kafkaProducer';

// export {};

// declare global {
declare module 'express-serve-static-core' {
  export interface Request {
    kafkaProducer?: KafkaProducer; // Your KafkaProducer type
  }
}
// }

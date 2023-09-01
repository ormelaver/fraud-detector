import express, { Request, Response } from 'express';

const router = express.Router();

router.post('/api/detect', async (req: Request, res: Response) => {
  //TODO: validate request (look at the ticketing project)
  try {
    const message = JSON.stringify(req.body);
    await req.kafkaProducer!.sendMessage([message]);
    res.status(200).send(message);
  } catch (error) {
    throw error;
  }
});

export { router as detectFraud };

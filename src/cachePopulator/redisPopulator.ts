//in addition to this, write a service that goes over mongo transactions once a day and recalculates commonUsageTimes
import 'dotenv/config';
import mongoose from 'mongoose';

import { RedisClient } from '../detector/services/redisClient';
import { Card } from '../detector/models/card';

const redisClient = RedisClient.getInstance();
const populateRedis = async () => {
  const now = new Date();
  const hours = formatHours(now.getHours());
  const minutes = formatMinutes(now.getMinutes());
  const time = hours + minutes;
  const weekday = now.getDay();

  const cardsToCache = await Card.find(
    {
      commonUsageTimes: {
        $elemMatch: {
          weekday: { $eq: weekday },
          times: { $elemMatch: { from: { $lte: time }, to: { $gte: time } } },
        },
      },
    },
    {
      _id: 0,
      cid: 1,
      averageTransaction: 1,
    }
  );
  console.log(cardsToCache);

  cardsToCache.forEach((card: any) => {
    redisClient.setValue(
      `card:${card.cid}:averageTransaction`,
      card.averageTransaction
    );
  });

  //   console.log(today.toString());
  //   console.log(today.toISOString());
  //   console.log(today.toUTCString());
};

function formatMinutes(minutes: number) {
  let minutesStr = minutes.toString();
  if (minutesStr.length < 2) {
    return '0' + minutesStr;
  }
  return minutesStr;
}
function formatHours(hours: number) {
  let hoursStr = hours.toString();
  if (hoursStr.length < 2) {
    return '0' + hoursStr;
  }
  return hoursStr;
}
function formatDate(date: Date) {
  let month = '' + (date.getMonth() + 1),
    minutes = '' + date.getMinutes(),
    hours = '' + date.getHours(),
    day = '' + date.getDate(),
    year = date.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  if (hours.length < 2) hours = '0' + hours;
  if (minutes.length < 2) minutes = '0' + minutes;

  return [year, month, day, hours, minutes].join('');
}
const start = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI must be defined');
    }
    await mongoose.connect(process.env.MONGO_URI);

    console.log('connected to MongoDB');

    await redisClient.connect();
    console.log('connected to Redis');
    setInterval(populateRedis, 2000);
  } catch (error) {
    throw error;
  }
};

const cleanup = () => {
  const redisClient = RedisClient.getInstance();
  redisClient.shutdown();
  console.log('Disconnected from Redis');
};
process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

process.on('exit', (code) => {
  console.log(`Exiting with code: ${code}`);
  cleanup();
});
start();

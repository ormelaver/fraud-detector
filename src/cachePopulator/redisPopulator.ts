//in addition to this, write a service that goes over mongo transactions once a day and recalculates commonUsageTimes
import 'dotenv/config';
import mongoose from 'mongoose';

import { RedisClient } from '../detector/services/redisClient';
import { Card } from '../detector/models/card';

const redisClient = RedisClient.getInstance();
const CARD_CACHE_INSERT_INTERVAL_MILLIS = 30000; //30 minutes
const populateRedis = async () => {
  const now = new Date();
  const hoursRaw = now.getHours();
  const minutesRaw = now.getMinutes();
  const hours = formatHours(hoursRaw);
  const minutes = formatMinutes(minutesRaw);
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
      commonUsageTimes: { $elemMatch: { weekday: { $eq: weekday } } },
    }
  );

  cardsToCache.forEach((card: any) => {
    let relevantRange = getCurrentTimeRange(
      hoursRaw,
      card.commonUsageTimes[0].times
    );
    let ttl = calculateTTL(hoursRaw, minutesRaw, relevantRange);

    redisClient.setValue(
      `card:${card.cid}:averageTransaction`,
      card.averageTransaction,
      ttl
    );
  });
};

function getCurrentTimeRange(currentHour: number, ranges: any) {
  for (const range of ranges) {
    const fromHour = parseInt(range.from.slice(0, 2));
    const toHour = parseInt(range.to.slice(0, 2));

    if (currentHour >= fromHour && currentHour < toHour) {
      return range;
    }
  }
  return null;
}

function calculateTTL(
  currentHour: number,
  currentMinute: number,
  currentRange: any
) {
  const toHour = parseInt(currentRange.to.slice(0, 2));
  const toMinute = parseInt(currentRange.to.slice(2, 4));

  const differenceInMinutes =
    (toHour - currentHour) * 60 + (toMinute - currentMinute);
  return differenceInMinutes * 60; // Convert minutes to seconds
}

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

const start = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI must be defined');
    }
    await mongoose.connect(process.env.MONGO_URI);

    console.log('connected to MongoDB');

    await redisClient.connect();
    console.log('connected to Redis');
    setInterval(populateRedis, CARD_CACHE_INSERT_INTERVAL_MILLIS);
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

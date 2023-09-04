import mongoose, { ObjectId } from 'mongoose';

// an interface that describes the properties required to create a new Card
interface CardAttrs {
  cid: string;
  location: string;
  active: boolean;
  numOfTransactions: number;
  totalAmount: number;
  averageTransaction: number;
  commonUsageTimes?: object;
}

// an interface that describes the properties that a Card Model has
interface CardModel extends mongoose.Model<CardDoc> {
  build(attrs: CardAttrs): CardDoc;
}

// an interface that describes the properties that a Card Document has
interface CardDoc extends mongoose.Document {
  id: ObjectId;
  cid: string;
  location: string;
  active: boolean;
  numOfTransactions: number;
  totalAmount: number;
  averageTransaction: number;
  commonUsageTimes: object;
}
const CardSchema = new mongoose.Schema(
  {
    cid: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
    },
    numOfTransactions: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    averageTransaction: {
      type: Number,
      required: true,
    },
    commonUsageTimes: {
      type: Object,
    },
  },
  {
    toJSON: {
      transform(doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

CardSchema.statics.build = (attrs: CardAttrs) => {
  return new Card(attrs);
};

const Card = mongoose.model<CardDoc, CardModel>('Card', CardSchema);

export { Card };

import mongoose, { ObjectId } from 'mongoose';

// an interface that describes the properties required to create a new Transaction
interface TransactionAttrs {
  tid: string;
  cid: string;
  amount: number;
  location: string;
  timestamp: string;
}

// an interface that describes the properties that a Transaction Model has
interface TransactionModel extends mongoose.Model<TransactionDoc> {
  build(attrs: TransactionAttrs): TransactionDoc;
}

// an interface that describes the properties that a Transaction Document has
interface TransactionDoc extends mongoose.Document {
  id: ObjectId;
  tid: string;
  cid: string;
  amount: number;
  location: string;
  timestamp: string;
}
const TransactionSchema = new mongoose.Schema(
  {
    tid: {
      type: String,
      required: true,
    },
    cid: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    timestamp: {
      type: String,
      required: true,
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

TransactionSchema.statics.build = (attrs: TransactionAttrs) => {
  return new Transaction(attrs);
};

const Transaction = mongoose.model<TransactionDoc, TransactionModel>(
  'Transaction',
  TransactionSchema
);

export { Transaction };

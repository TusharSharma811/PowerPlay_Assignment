import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IInvoice extends Document {
  invoiceId: string;
  customerId: Types.ObjectId;
  amount: number;
  taxRate: number;
  tax: number;
  total: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Unpaid' | 'Overdue' | 'Void';
  issueDate: Date;
  dueDate: Date;
}

const invoiceSchema = new Schema<IInvoice>({
  invoiceId: {
    type: String,
    required: true,
    unique: true
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  taxRate: {
    type: Number,
    required: true,
    default: 0
  },
  tax: {
    type: Number,
    required: true,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Draft', 'Sent', 'Paid', 'Unpaid', 'Overdue', 'Void']
  },
  issueDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  }
}, { timestamps: true });

export default mongoose.model<IInvoice>('Invoice', invoiceSchema);

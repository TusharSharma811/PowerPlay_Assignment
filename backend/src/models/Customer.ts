import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  companyId: Types.ObjectId;
}

const customerSchema = new Schema<ICustomer>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  }
}, { timestamps: true });

export default mongoose.model<ICustomer>('Customer', customerSchema);

import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
  name: string;
}

const companySchema = new Schema<ICompany>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, { timestamps: true });

export default mongoose.model<ICompany>('Company', companySchema);

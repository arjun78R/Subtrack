import mongoose, { Document, Schema } from 'mongoose';

export interface IEvaluationRecord extends Document {
  userId: mongoose.Types.ObjectId;
  period: string;
  beforeUnwantedCharges: number;
  beforeUnusedSpend: number;
  afterUnwantedCharges: number;
  afterUnusedSpend: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const evaluationRecordSchema = new Schema<IEvaluationRecord>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    period: {
      type: String,
      required: true,
      trim: true,
      default: 'Semester Study',
    },
    beforeUnwantedCharges: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    beforeUnusedSpend: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    afterUnwantedCharges: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    afterUnusedSpend: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    notes: {
      type: String,
      default: 'User-entered evaluation data comparing unwanted charges and unused spend before vs after SubTrack.',
    },
  },
  {
    timestamps: true,
  }
);

export const EvaluationRecord = mongoose.model<IEvaluationRecord>('EvaluationRecord', evaluationRecordSchema);

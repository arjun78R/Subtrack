import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { EvaluationRecord } from '../models/evaluation.model';

export const getEvaluationData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;

    // Get latest evaluation record or return default initial academic dataset
    let record = await EvaluationRecord.findOne({ userId }).sort({ createdAt: -1 });

    if (!record) {
      // Create sensible default for project demo
      record = await EvaluationRecord.create({
        userId,
        period: 'MCA Semester Study',
        beforeUnwantedCharges: 4,
        beforeUnusedSpend: 8400,
        afterUnwantedCharges: 1,
        afterUnusedSpend: 1600,
        notes: 'Pre-study baseline vs 60-day post SubTrack adoption.',
      });
    }

    // Calculate percentage improvements
    const chargesReductionPercent =
      record.beforeUnwantedCharges > 0
        ? Math.round(
            ((record.beforeUnwantedCharges - record.afterUnwantedCharges) / record.beforeUnwantedCharges) *
              1000
          ) / 10
        : 0;

    const spendReductionPercent =
      record.beforeUnusedSpend > 0
        ? Math.round(
            ((record.beforeUnusedSpend - record.afterUnusedSpend) / record.beforeUnusedSpend) * 1000
          ) / 10
        : 0;

    res.status(200).json({
      evaluation: record,
      metrics: {
        chargesSaved: record.beforeUnwantedCharges - record.afterUnwantedCharges,
        chargesReductionPercent,
        spendSaved: record.beforeUnusedSpend - record.afterUnusedSpend,
        spendReductionPercent,
        currency: req.user!.preferredCurrency,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const saveEvaluationData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const {
      period,
      beforeUnwantedCharges,
      beforeUnusedSpend,
      afterUnwantedCharges,
      afterUnusedSpend,
      notes,
    } = req.body;

    const updated = await EvaluationRecord.findOneAndUpdate(
      { userId },
      {
        $set: {
          period: period || 'Semester Evaluation',
          beforeUnwantedCharges: Number(beforeUnwantedCharges) || 0,
          beforeUnusedSpend: Number(beforeUnusedSpend) || 0,
          afterUnwantedCharges: Number(afterUnwantedCharges) || 0,
          afterUnusedSpend: Number(afterUnusedSpend) || 0,
          notes: notes || 'User-entered project evaluation data.',
        },
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: 'Evaluation data saved successfully',
      evaluation: updated,
    });
  } catch (error) {
    next(error);
  }
};

import mongoose from 'mongoose';

const weightEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weight: {
    value: {
      type: Number,
      required: [true, 'Weight value is required'],
      min: [20, 'Weight must be at least 20kg']
    },
    unit: {
      type: String,
      default: 'kg',
      enum: ['kg', 'lbs']
    }
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Index for better performance
weightEntrySchema.index({ userId: 1, date: -1 });

export default mongoose.models.WeightEntry || mongoose.model('WeightEntry', weightEntrySchema);

import mongoose from 'mongoose';

const workoutTrackerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  completed: {
    type: Boolean,
    default: true
  },
  workoutType: {
    type: String,
    enum: ['strength', 'cardio', 'yoga', 'pilates', 'sports', 'other'],
    default: 'strength'
  },
  duration: {
    type: Number, // in minutes
    min: 1
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Index for better performance
workoutTrackerSchema.index({ userId: 1, date: -1 });
// Compound index to ensure one entry per user per day
workoutTrackerSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.WorkoutTracker || mongoose.model('WorkoutTracker', workoutTrackerSchema);

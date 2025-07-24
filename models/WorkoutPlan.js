import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'balance'],
    required: true
  },
  muscleGroups: [String],
  sets: Number,
  reps: String, // Can be "10-12" or "30 seconds"
  weight: String,
  duration: Number, // in seconds for cardio/timed exercises
  restTime: Number, // in seconds
  instructions: String,
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  }
});

const workoutPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  duration: Number, // in minutes
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  workoutType: {
    type: String,
    enum: ['strength', 'cardio', 'yoga', 'pilates', 'full_body', 'upper_body', 'lower_body', 'core'],
    required: true
  },
  exercises: [exerciseSchema],
  generatedBy: {
    type: String,
    enum: ['ai', 'manual'],
    default: 'ai'
  },
  personalizedFor: {
    goal: String,
    equipment: [String],
    location: String,
    level: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

workoutPlanSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.WorkoutPlan || mongoose.model('WorkoutPlan', workoutPlanSchema);

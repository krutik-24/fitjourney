import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  // Fitness Profile
  fitnessProfile: {
    age: {
      type: Number,
      min: [13, 'Must be at least 13 years old']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    height: {
      value: Number, // in cm
      unit: { type: String, default: 'cm' }
    },
    currentWeight: {
      value: Number, // in kg
      unit: { type: String, default: 'kg' }
    },
    targetWeight: {
      value: Number, // in kg
      unit: { type: String, default: 'kg' }
    },
    fitnessGoal: {
      type: String,
      enum: ['lose_weight', 'gain_muscle', 'maintain_weight', 'improve_endurance', 'general_fitness'],
      default: 'general_fitness'
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'],
      default: 'moderately_active'
    },
    workoutLocation: {
      type: String,
      enum: ['home', 'gym', 'outdoor', 'hybrid'],
      default: 'home'
    },
    availableEquipment: [{
      type: String,
      enum: ['dumbbells', 'barbells', 'resistance_bands', 'pull_up_bar', 'treadmill', 'stationary_bike', 'kettlebells', 'yoga_mat', 'bench', 'none']
    }],
    workoutFrequency: {
      type: Number,
      min: 1,
      max: 7,
      default: 3 // days per week
    },
    workoutDuration: {
      type: Number,
      min: 15,
      max: 180,
      default: 60 // minutes
    },
    dietaryPreferences: [{
      type: String,
      enum: ['vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean', 'low_carb', 'high_protein', 'none']
    }],
    allergies: [String],
    completedProfile: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model('User', userSchema);
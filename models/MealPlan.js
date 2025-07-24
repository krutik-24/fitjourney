import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  name: String,
  description: String,
  ingredients: [String],
  instructions: String,
  nutrition: {
    calories: Number,
    protein: Number, // in grams
    carbs: Number, // in grams
    fat: Number, // in grams
    fiber: Number, // in grams
    sugar: Number // in grams
  },
  prepTime: Number, // in minutes
  cookTime: Number, // in minutes
  servings: {
    type: Number,
    default: 1
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  dietaryTags: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean', 'low_carb', 'high_protein', 'gluten_free', 'dairy_free']
  }]
});

const mealPlanSchema = new mongoose.Schema({
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
  duration: {
    type: Number,
    default: 7 // days
  },
  targetCalories: Number,
  targetMacros: {
    protein: Number, // percentage
    carbs: Number, // percentage
    fat: Number // percentage
  },
  meals: {
    type: Map,
    of: {
      breakfast: mealSchema,
      lunch: mealSchema,
      dinner: mealSchema,
      snacks: [mealSchema]
    }
  },
  generatedBy: {
    type: String,
    enum: ['ai', 'manual'],
    default: 'ai'
  },
  personalizedFor: {
    goal: String,
    dietaryPreferences: [String],
    allergies: [String],
    calorieTarget: Number
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

mealPlanSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.MealPlan || mongoose.model('MealPlan', mealPlanSchema);

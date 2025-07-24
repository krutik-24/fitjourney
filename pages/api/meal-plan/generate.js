import { verifyToken } from '../../../lib/auth';
import User from '../../../models/User';
import MealPlan from '../../../models/MealPlan';
import connectMongo from '../../../lib/mongodb';
import { PerplexityAIService } from '../../../lib/perplexity-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    await connectMongo();

    const user = await User.findById(decoded.userId);
    if (!user || !user.fitnessProfile.completedProfile) {
      return res.status(400).json({ message: 'Complete fitness profile first' });
    }

    // Try to generate AI-powered meal plan using Perplexity AI
    let mealPlan;
    try {
      const aiService = new PerplexityAIService();
      mealPlan = await aiService.generateMealPlan(user.fitnessProfile);
      console.log('Successfully generated meal plan using Perplexity AI');
    } catch (aiError) {
      console.error('Perplexity AI failed, using fallback:', aiError);
      // Fallback to local generation if AI service fails
      mealPlan = generatePersonalizedMealPlan(user.fitnessProfile);
    }

    // Save the meal plan
    const newMealPlan = new MealPlan({
      userId: user._id,
      name: mealPlan.name,
      description: mealPlan.description,
      duration: mealPlan.duration,
      totalCalories: mealPlan.totalCalories,
      macros: mealPlan.macros,
      meals: mealPlan.meals,
      dietaryRestrictions: user.fitnessProfile.dietaryPreferences,
      createdAt: new Date()
    });

    await newMealPlan.save();

    res.status(201).json({
      message: 'Meal plan generated successfully',
      data: newMealPlan
    });
  } catch (error) {
    console.error('Meal plan generation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function generatePersonalizedMealPlan(profile) {
  const {
    age,
    gender,
    height,
    currentWeight,
    targetWeight,
    fitnessGoal,
    activityLevel,
    dietaryPreferences,
    allergies
  } = profile;

  // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
  let bmr;
  if (gender === 'male') {
    bmr = (10 * currentWeight.value) + (6.25 * height.value) - (5 * age) + 5;
  } else {
    bmr = (10 * currentWeight.value) + (6.25 * height.value) - (5 * age) - 161;
  }

  // Activity multipliers
  const activityMultipliers = {
    'sedentary': 1.2,
    'lightly_active': 1.375,
    'moderately_active': 1.55,
    'very_active': 1.725,
    'extremely_active': 1.9
  };

  // Calculate TDEE (Total Daily Energy Expenditure)
  const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

  // Adjust calories based on goal
  let targetCalories;
  if (fitnessGoal === 'lose_weight') {
    targetCalories = Math.round(tdee - 500); // 500 calorie deficit
  } else if (fitnessGoal === 'gain_muscle') {
    targetCalories = Math.round(tdee + 300); // 300 calorie surplus
  } else {
    targetCalories = Math.round(tdee); // Maintenance
  }

  // Calculate macros
  let proteinPercentage, carbPercentage, fatPercentage;
  
  if (fitnessGoal === 'gain_muscle') {
    proteinPercentage = 0.30;
    carbPercentage = 0.40;
    fatPercentage = 0.30;
  } else if (fitnessGoal === 'lose_weight') {
    proteinPercentage = 0.35;
    carbPercentage = 0.35;
    fatPercentage = 0.30;
  } else {
    proteinPercentage = 0.25;
    carbPercentage = 0.45;
    fatPercentage = 0.30;
  }

  const macros = {
    protein: Math.round((targetCalories * proteinPercentage) / 4), // 4 cal per gram
    carbs: Math.round((targetCalories * carbPercentage) / 4), // 4 cal per gram
    fat: Math.round((targetCalories * fatPercentage) / 9) // 9 cal per gram
  };

  // Generate meals
  const meals = generateMeals(targetCalories, macros, dietaryPreferences, allergies);

  return {
    name: `Personalized ${capitalizeFirst(fitnessGoal.replace('_', ' '))} Meal Plan`,
    description: `A personalized meal plan with ${targetCalories} daily calories designed for ${fitnessGoal.replace('_', ' ')}`,
    duration: '7 days',
    totalCalories: targetCalories,
    macros: macros,
    meals: meals
  };
}

function generateMeals(targetCalories, macros, dietaryPreferences, allergies) {
  const isVegetarian = dietaryPreferences.includes('vegetarian');
  const isVegan = dietaryPreferences.includes('vegan');
  const isKeto = dietaryPreferences.includes('keto');
  const isLowCarb = dietaryPreferences.includes('low_carb');
  const hasNutAllergy = allergies.some(allergy => 
    allergy.toLowerCase().includes('nut') || allergy.toLowerCase().includes('peanut')
  );

  // Meal distribution (% of daily calories)
  const mealDistribution = {
    breakfast: 0.25,
    lunch: 0.35,
    dinner: 0.30,
    snacks: 0.10
  };

  const meals = [];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  daysOfWeek.forEach(day => {
    // Breakfast
    meals.push({
      day: day,
      type: 'breakfast',
      name: selectMeal('breakfast', dietaryPreferences, hasNutAllergy),
      calories: Math.round(targetCalories * mealDistribution.breakfast),
      protein: Math.round(macros.protein * mealDistribution.breakfast),
      carbs: Math.round(macros.carbs * mealDistribution.breakfast),
      fat: Math.round(macros.fat * mealDistribution.breakfast),
      ingredients: getMealIngredients('breakfast', isVegetarian, isVegan, hasNutAllergy),
      instructions: 'Detailed cooking instructions would be provided here.'
    });

    // Lunch
    meals.push({
      day: day,
      type: 'lunch',
      name: selectMeal('lunch', dietaryPreferences, hasNutAllergy),
      calories: Math.round(targetCalories * mealDistribution.lunch),
      protein: Math.round(macros.protein * mealDistribution.lunch),
      carbs: Math.round(macros.carbs * mealDistribution.lunch),
      fat: Math.round(macros.fat * mealDistribution.lunch),
      ingredients: getMealIngredients('lunch', isVegetarian, isVegan, hasNutAllergy),
      instructions: 'Detailed cooking instructions would be provided here.'
    });

    // Dinner
    meals.push({
      day: day,
      type: 'dinner',
      name: selectMeal('dinner', dietaryPreferences, hasNutAllergy),
      calories: Math.round(targetCalories * mealDistribution.dinner),
      protein: Math.round(macros.protein * mealDistribution.dinner),
      carbs: Math.round(macros.carbs * mealDistribution.dinner),
      fat: Math.round(macros.fat * mealDistribution.dinner),
      ingredients: getMealIngredients('dinner', isVegetarian, isVegan, hasNutAllergy),
      instructions: 'Detailed cooking instructions would be provided here.'
    });

    // Snacks
    meals.push({
      day: day,
      type: 'snack',
      name: selectMeal('snack', dietaryPreferences, hasNutAllergy),
      calories: Math.round(targetCalories * mealDistribution.snacks),
      protein: Math.round(macros.protein * mealDistribution.snacks),
      carbs: Math.round(macros.carbs * mealDistribution.snacks),
      fat: Math.round(macros.fat * mealDistribution.snacks),
      ingredients: getMealIngredients('snack', isVegetarian, isVegan, hasNutAllergy),
      instructions: 'Simple preparation instructions.'
    });
  });

  return meals;
}

function selectMeal(mealType, dietaryPreferences, hasNutAllergy) {
  const meals = {
    breakfast: {
      regular: ['Oatmeal with Berries', 'Greek Yogurt Parfait', 'Scrambled Eggs with Toast', 'Smoothie Bowl'],
      vegetarian: ['Avocado Toast', 'Fruit Bowl with Yogurt', 'Veggie Omelet', 'Chia Pudding'],
      vegan: ['Oatmeal with Plant Milk', 'Fruit Smoothie', 'Tofu Scramble', 'Acai Bowl'],
      keto: ['Keto Scrambled Eggs', 'Avocado and Bacon', 'Cheese Omelet', 'Bulletproof Coffee']
    },
    lunch: {
      regular: ['Grilled Chicken Salad', 'Turkey Sandwich', 'Chicken Rice Bowl', 'Tuna Wrap'],
      vegetarian: ['Quinoa Salad', 'Veggie Burger', 'Caprese Sandwich', 'Buddha Bowl'],
      vegan: ['Lentil Soup', 'Veggie Wrap', 'Quinoa Buddha Bowl', 'Plant-Based Protein Bowl'],
      keto: ['Keto Caesar Salad', 'Lettuce Wrap Burger', 'Zucchini Noodles', 'Cauliflower Rice Bowl']
    },
    dinner: {
      regular: ['Grilled Salmon with Vegetables', 'Chicken Stir Fry', 'Beef with Sweet Potato', 'Pasta with Meat Sauce'],
      vegetarian: ['Vegetable Curry', 'Eggplant Parmesan', 'Stuffed Bell Peppers', 'Vegetarian Chili'],
      vegan: ['Lentil Curry', 'Vegan Stir Fry', 'Chickpea Curry', 'Quinoa Stuffed Peppers'],
      keto: ['Keto Beef Steak', 'Salmon with Asparagus', 'Chicken Thighs with Broccoli', 'Pork Chops with Cauliflower']
    },
    snack: {
      regular: ['Apple with Peanut Butter', 'Greek Yogurt', 'Trail Mix', 'Protein Bar'],
      vegetarian: ['Hummus with Veggies', 'Cheese and Crackers', 'Fruit and Nuts', 'Yogurt with Granola'],
      vegan: ['Almond Butter Toast', 'Fruit Smoothie', 'Vegetable Chips', 'Energy Balls'],
      keto: ['Cheese Cubes', 'Avocado', 'Keto Fat Bomb', 'Macadamia Nuts']
    }
  };

  let category = 'regular';
  if (dietaryPreferences.includes('vegan')) category = 'vegan';
  else if (dietaryPreferences.includes('vegetarian')) category = 'vegetarian';
  else if (dietaryPreferences.includes('keto')) category = 'keto';

  const mealOptions = meals[mealType][category] || meals[mealType].regular;
  
  // Filter out nut-containing meals if allergy present
  const filteredOptions = hasNutAllergy 
    ? mealOptions.filter(meal => !meal.toLowerCase().includes('nut') && !meal.toLowerCase().includes('peanut'))
    : mealOptions;

  return filteredOptions[Math.floor(Math.random() * filteredOptions.length)];
}

function getMealIngredients(mealType, isVegetarian, isVegan, hasNutAllergy) {
  // This is a simplified version - in a real app, you'd have a comprehensive ingredients database
  const baseIngredients = {
    breakfast: ['oats', 'berries', 'milk', 'honey'],
    lunch: ['chicken breast', 'mixed greens', 'quinoa', 'vegetables'],
    dinner: ['salmon', 'broccoli', 'sweet potato', 'olive oil'],
    snack: ['apple', 'yogurt', 'almonds']
  };

  let ingredients = baseIngredients[mealType] || [];

  if (isVegan) {
    ingredients = ingredients.map(ing => {
      if (['milk', 'yogurt', 'honey', 'chicken breast', 'salmon'].includes(ing)) {
        return ing.replace('milk', 'plant milk').replace('yogurt', 'coconut yogurt').replace('honey', 'maple syrup').replace('chicken breast', 'tofu').replace('salmon', 'tempeh');
      }
      return ing;
    });
  } else if (isVegetarian) {
    ingredients = ingredients.filter(ing => !['chicken breast', 'salmon'].includes(ing));
  }

  if (hasNutAllergy) {
    ingredients = ingredients.filter(ing => !ing.includes('almond') && !ing.includes('peanut'));
  }

  return ingredients;
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

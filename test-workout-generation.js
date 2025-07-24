// Test script for workout plan generation
const { PerplexityAIService } = require('./lib/perplexity-ai');

// Sample user profile for testing
const testProfile = {
  age: 28,
  gender: 'male',
  height: { value: 175, unit: 'cm' },
  currentWeight: { value: 75, unit: 'kg' },
  targetWeight: { value: 70, unit: 'kg' },
  fitnessGoal: 'lose_weight',
  activityLevel: 'moderately_active',
  workoutLocation: 'home',
  availableEquipment: ['dumbbells', 'yoga_mat'],
  workoutFrequency: 4,
  workoutDuration: 45,
  dietaryPreferences: ['high_protein'],
  allergies: [],
  completedProfile: true
};

// Test the fallback workout generation function
function generatePersonalizedWorkout(profile) {
  const { 
    fitnessGoal, 
    activityLevel, 
    workoutLocation, 
    availableEquipment, 
    workoutFrequency,
    workoutDuration 
  } = profile;

  // Base workout structure
  let workouts = [];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Define workout types based on goal
  let workoutTypes = {};
  
  if (fitnessGoal === 'lose_weight') {
    workoutTypes = {
      cardio: 0.5,
      strength: 0.3,
      hiit: 0.2
    };
  } else if (fitnessGoal === 'gain_muscle') {
    workoutTypes = {
      strength: 0.6,
      cardio: 0.2,
      functional: 0.2
    };
  } else if (fitnessGoal === 'improve_endurance') {
    workoutTypes = {
      cardio: 0.6,
      hiit: 0.2,
      strength: 0.2
    };
  } else {
    workoutTypes = {
      strength: 0.4,
      cardio: 0.3,
      functional: 0.3
    };
  }

  // Generate workouts for specified frequency
  for (let i = 0; i < workoutFrequency; i++) {
    const day = days[i];
    const workoutType = selectWorkoutType(workoutTypes, i);
    
    workouts.push({
      day: day,
      focus: workoutType.focus,
      duration: workoutDuration,
      exercises: generateExercises(workoutType.focus, availableEquipment, workoutLocation),
      intensity: getIntensityForLevel(activityLevel),
      restPeriods: getRestPeriods(workoutType.focus)
    });
  }

  // Determine difficulty based on activity level
  const difficulty = {
    'sedentary': 'beginner',
    'lightly_active': 'beginner',
    'moderately_active': 'intermediate',
    'very_active': 'advanced',
    'extremely_active': 'advanced'
  }[activityLevel] || 'beginner';

  return {
    name: `Personalized ${capitalizeFirst(fitnessGoal.replace('_', ' '))} Plan`,
    description: `A ${workoutFrequency} day per week plan designed for ${fitnessGoal.replace('_', ' ')} with ${workoutLocation} workouts`,
    duration: `${workoutFrequency} days/week`,
    difficulty: difficulty,
    workouts: workouts
  };
}

function selectWorkoutType(types, dayIndex) {
  const typeKeys = Object.keys(types);
  const focusTypes = {
    strength: { focus: 'Strength Training', exercises: 'strength' },
    cardio: { focus: 'Cardiovascular', exercises: 'cardio' },
    hiit: { focus: 'HIIT', exercises: 'hiit' },
    functional: { focus: 'Functional Training', exercises: 'functional' }
  };
  
  // Rotate through types based on day
  const selectedType = typeKeys[dayIndex % typeKeys.length];
  return focusTypes[selectedType];
}

function generateExercises(focus, equipment, location) {
  const exercises = {
    'Cardiovascular': {
      bodyweight: ['Jumping Jacks', 'High Knees', 'Butt Kicks', 'Running in Place', 'Mountain Climbers', 'Burpees'],
      dumbbells: ['Dumbbell Thrusters', 'Dumbbell Swings', 'Man Makers'],
      outdoor: ['Jogging', 'Hill Sprints', 'Stair Climbing'],
      bike: ['Cycling Intervals', 'Steady State Cycling']
    },
    'Strength Training': {
      bodyweight: ['Push-ups', 'Squats', 'Lunges', 'Plank', 'Pike Push-ups', 'Single Leg Glute Bridges'],
      dumbbells: ['Dumbbell Press', 'Dumbbell Rows', 'Goblet Squats', 'Dumbbell Lunges', 'Chest Press', 'Romanian Deadlifts'],
      barbells: ['Barbell Squats', 'Deadlifts', 'Bench Press', 'Barbell Rows'],
      gym: ['Lat Pulldowns', 'Leg Press', 'Chest Flys', 'Cable Rows']
    },
    'HIIT': {
      bodyweight: ['Burpees', 'Jump Squats', 'Push-up to T', 'Plank Jacks', 'High Knees', 'Jumping Lunges'],
      dumbbells: ['Dumbbell Snatches', 'Thrusters', 'Renegade Rows'],
      equipment: ['Kettlebell Swings', 'Battle Ropes', 'Medicine Ball Slams'],
      mixed: ['Circuit Training', 'Tabata Intervals', 'AMRAP Workouts']
    },
    'Functional Training': {
      bodyweight: ['Bear Crawls', 'Crab Walks', 'Single Leg Deadlifts', 'Lateral Lunges'],
      dumbbells: ['Farmers Walk', 'Turkish Get-ups', 'Single Arm Rows'],
      equipment: ['Resistance Band Rows', 'Band Pull-Aparts'],
      stability: ['Bosu Ball Squats', 'Stability Ball Exercises']
    }
  };

  // Select appropriate exercises based on equipment and location
  let availableExercises = exercises[focus]?.bodyweight || [];
  
  if (equipment.includes('dumbbells') && exercises[focus]?.dumbbells) {
    availableExercises = [...availableExercises, ...exercises[focus].dumbbells];
  }
  
  if (location === 'gym' && exercises[focus]?.gym) {
    availableExercises = [...availableExercises, ...exercises[focus].gym];
  }
  
  if (location === 'outdoor' && exercises[focus]?.outdoor) {
    availableExercises = [...availableExercises, ...exercises[focus].outdoor];
  }

  // Return 4-6 exercises
  return availableExercises.slice(0, Math.min(6, availableExercises.length))
    .map(exercise => ({
      name: exercise,
      sets: focus === 'Cardiovascular' ? 1 : 3,
      reps: focus === 'Cardiovascular' ? '30 seconds' : '8-12',
      rest: focus === 'Cardiovascular' ? '10s' : '60s'
    }));
}

function getIntensityForLevel(activityLevel) {
  const intensityMap = {
    'sedentary': 'low',
    'lightly_active': 'low-moderate',
    'moderately_active': 'moderate',
    'very_active': 'moderate-high',
    'extremely_active': 'high'
  };
  return intensityMap[activityLevel] || 'moderate';
}

function getRestPeriods(focus) {
  const restMap = {
    'Strength Training': '60-90 seconds between sets',
    'Cardiovascular': '30 seconds between exercises',
    'HIIT': '15-30 seconds work, 45-90 seconds rest',
    'Functional Training': '45-60 seconds between exercises'
  };
  return restMap[focus] || '60 seconds between sets';
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Run the test
async function runTest() {
  console.log('🏋️ Testing Workout Plan Generation...\n');
  
  console.log('📊 Test Profile:');
  console.log(JSON.stringify(testProfile, null, 2));
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test fallback generation
  console.log('⚡ Testing Fallback Generation...');
  const fallbackWorkout = generatePersonalizedWorkout(testProfile);
  console.log('✅ Fallback Workout Plan Generated:');
  console.log(JSON.stringify(fallbackWorkout, null, 2));
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test Perplexity AI generation
  console.log('🤖 Testing Perplexity AI Generation...');
  
  // Set API key manually for testing
  process.env.PERPLEXITY_API_KEY = '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';
  
  try {
    const aiService = new PerplexityAIService();
    const aiWorkout = await aiService.generateWorkoutPlan(testProfile);
    console.log('✅ AI Workout Plan Generated:');
    console.log(JSON.stringify(aiWorkout, null, 2));
  } catch (error) {
    console.log('❌ AI Generation Failed:', error.message);
    console.log('🔄 Would fallback to local generation in production');
  }
  
  console.log('\n🎉 Test completed!');
}

// Run the test
runTest().catch(console.error);

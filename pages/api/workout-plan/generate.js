import { verifyToken } from '../../../lib/auth';
import User from '../../../models/User';
import WorkoutPlan from '../../../models/WorkoutPlan';
import connectMongo from '../../../lib/mongodb';
import { PerplexityAIService } from '../../../lib/perplexity-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Starting workout plan generation...');
    
    // Check authentication - look for JWT token in cookies
    const token = req.cookies.token;
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('Invalid token');
      return res.status(401).json({ message: 'Invalid token' });
    }

    console.log('Token verified for user:', decoded.userId);

    await connectMongo();
    console.log('MongoDB connected');

    const user = await User.findById(decoded.userId);
    if (!user || !user.fitnessProfile.completedProfile) {
      console.log('User not found or profile incomplete');
      return res.status(400).json({ message: 'Complete fitness profile first' });
    }

    console.log('User profile loaded, attempting AI generation');

    // Try to generate AI-powered workout plan using Perplexity AI
    let workoutPlan;
    try {
      const aiService = new PerplexityAIService();
      workoutPlan = await aiService.generateWorkoutPlan(user.fitnessProfile);
      console.log('Successfully generated workout plan using Perplexity AI');
    } catch (aiError) {
      console.error('Perplexity AI failed, using fallback:', aiError);
      // Fallback to local generation if AI service fails
      workoutPlan = generatePersonalizedWorkout(user.fitnessProfile);
    }

    // Save the workout plan
    const newWorkoutPlan = new WorkoutPlan({
      userId: user._id,
      name: workoutPlan.name,
      description: workoutPlan.description,
      duration: workoutPlan.duration,
      difficulty: workoutPlan.difficulty,
      workouts: workoutPlan.workouts,
      targetGoal: user.fitnessProfile.fitnessGoal,
      createdAt: new Date()
    });

    await newWorkoutPlan.save();

    res.status(201).json({
      message: 'Workout plan generated successfully',
      data: newWorkoutPlan
    });
  } catch (error) {
    console.error('Workout plan generation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

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
    strength: {
      bodyweight: ['Push-ups', 'Squats', 'Lunges', 'Plank', 'Burpees', 'Mountain Climbers'],
      dumbbells: ['Dumbbell Press', 'Dumbbell Rows', 'Goblet Squats', 'Dumbbell Lunges'],
      barbells: ['Barbell Squats', 'Deadlifts', 'Bench Press', 'Barbell Rows'],
      gym: ['Lat Pulldowns', 'Leg Press', 'Chest Flys', 'Cable Rows']
    },
    cardio: {
      bodyweight: ['Jumping Jacks', 'High Knees', 'Butt Kicks', 'Running in Place'],
      treadmill: ['Interval Running', 'Incline Walking', 'Sprint Intervals'],
      outdoor: ['Jogging', 'Hill Sprints', 'Stair Climbing'],
      bike: ['Cycling Intervals', 'Steady State Cycling']
    },
    hiit: {
      bodyweight: ['Burpees', 'Jump Squats', 'Push-up to T', 'Plank Jacks'],
      equipment: ['Kettlebell Swings', 'Battle Ropes', 'Medicine Ball Slams'],
      mixed: ['Circuit Training', 'Tabata Intervals', 'AMRAP Workouts']
    },
    functional: {
      bodyweight: ['Bear Crawls', 'Crab Walks', 'Single Leg Deadlifts'],
      equipment: ['Farmers Walk', 'Turkish Get-ups', 'Resistance Band Rows'],
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
      sets: focus === 'cardio' ? 1 : 3,
      reps: focus === 'cardio' ? '30 seconds' : '8-12',
      rest: focus === 'cardio' ? '10s' : '60s'
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

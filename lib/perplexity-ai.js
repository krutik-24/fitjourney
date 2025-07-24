// Perplexity AI Integration for Enhanced Fitness Recommendations
// This service can be used to generate more intelligent workout and meal plans

export class PerplexityAIService {
  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY;
    this.baseUrl = 'https://api.perplexity.ai/chat/completions';
  }

  async generateWorkoutPlan(userProfile) {
    if (!this.apiKey) {
      console.error('Perplexity API key not configured');
      throw new Error('Perplexity API key not configured');
    }

    console.log('Generating workout plan with Perplexity AI...');
    const prompt = this.buildWorkoutPrompt(userProfile);
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Perplexity API error: ${response.status} - ${errorText}`);
        throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Successfully got response from Perplexity AI');
      return this.parseWorkoutResponse(data.choices[0].message.content);
    } catch (error) {
      console.error('Perplexity AI workout generation error:', error);
      // Fallback to default generation
      return this.generateDefaultWorkout(userProfile);
    }
  }

  async generateMealPlan(userProfile) {
    if (!this.apiKey) {
      throw new Error('Perplexity API key not configured');
    }

    const prompt = this.buildMealPrompt(userProfile);
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseMealResponse(data.choices[0].message.content);
    } catch (error) {
      console.error('Perplexity AI meal generation error:', error);
      // Fallback to default generation
      return this.generateDefaultMeal(userProfile);
    }
  }

  buildWorkoutPrompt(profile) {
    return `Create a personalized workout plan for someone with the following profile:
    - Age: ${profile.age}
    - Gender: ${profile.gender}
    - Fitness Goal: ${profile.fitnessGoal}
    - Activity Level: ${profile.activityLevel}
    - Workout Location: ${profile.workoutLocation}
    - Available Equipment: ${profile.availableEquipment?.join(', ') || 'none'}
    - Frequency: ${profile.workoutFrequency} days/week
    - Duration: ${profile.workoutDuration} minutes
    
    Please provide a structured 7-day workout plan with specific exercises, sets, reps, and rest periods. Format as JSON with days and exercises.`;
  }

  buildMealPrompt(profile) {
    return `Create a personalized meal plan for someone with the following profile:
    - Age: ${profile.age}
    - Gender: ${profile.gender}
    - Fitness Goal: ${profile.fitnessGoal}
    - Activity Level: ${profile.activityLevel}
    - Current Weight: ${profile.currentWeight?.value} ${profile.currentWeight?.unit}
    - Target Weight: ${profile.targetWeight?.value} ${profile.targetWeight?.unit}
    - Dietary Preferences: ${profile.dietaryPreferences?.join(', ') || 'none'}
    - Allergies: ${profile.allergies?.join(', ') || 'none'}
    
    Please provide a structured 7-day meal plan with breakfast, lunch, dinner, and snacks. Include calorie counts and macronutrients. Format as JSON.`;
  }

  parseWorkoutResponse(content) {
    // Parse AI response and structure it for the database
    // This is a simplified example - you'd want more robust parsing
    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch {
      // Fallback parsing for non-JSON responses
      return this.extractWorkoutFromText(content);
    }
  }

  parseMealResponse(content) {
    // Parse AI response and structure it for the database
    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch {
      // Fallback parsing for non-JSON responses
      return this.extractMealFromText(content);
    }
  }

  generateDefaultWorkout(profile) {
    // Fallback workout generation logic (existing code)
    return {
      name: `${profile.fitnessGoal} Workout Plan`,
      description: `Personalized ${profile.workoutFrequency}x/week routine`,
      workouts: [
        // Default workout structure
      ]
    };
  }

  generateDefaultMeal(profile) {
    // Fallback meal generation logic (existing code)
    return {
      name: `${profile.fitnessGoal} Meal Plan`,
      description: `Personalized nutrition plan`,
      meals: [
        // Default meal structure
      ]
    };
  }

  extractWorkoutFromText(content) {
    // Extract workout information from natural language response
    // Implementation depends on the response format
    return {
      name: 'AI Generated Workout Plan',
      description: 'Generated by Perplexity AI',
      workouts: []
    };
  }

  extractMealFromText(content) {
    // Extract meal information from natural language response
    // Implementation depends on the response format
    return {
      name: 'AI Generated Meal Plan',
      description: 'Generated by Perplexity AI',
      meals: []
    };
  }
}

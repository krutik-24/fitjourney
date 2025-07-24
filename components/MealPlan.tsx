import { useState } from 'react';
import axios from 'axios';

export default function MealPlan() {
  const [form, setForm] = useState({ goal: '', dietaryPreferences: '' });
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/meal-plan', form);
      setPlan(res.data.plan);
    } catch (error) {
      console.error('Error generating meal plan:', error);
    }
    setLoading(false);
  };

  return (
    <div className="card p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-primary mb-6">AI Meal Plan Generator</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <input 
          value={form.goal} 
          onChange={e => setForm({ ...form, goal: e.target.value })} 
          placeholder="Goal (e.g., gain muscle)" 
          className="input-field w-full" 
          required
        />
        <input 
          value={form.dietaryPreferences} 
          onChange={e => setForm({ ...form, dietaryPreferences: e.target.value })} 
          placeholder="Dietary Preferences (e.g., vegetarian, keto)" 
          className="input-field w-full" 
        />
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Meal Plan'}
        </button>
      </form>
      {loading && (
        <div className="text-center text-secondary">
          <p>Creating your personalized meal plan...</p>
        </div>
      )}
      {plan && (
        <div className="bg-accent/30 border border-accent rounded-lg p-4">
          <h3 className="font-semibold text-primary mb-3">Your Meal Plan:</h3>
          <pre className="whitespace-pre-wrap text-sm text-primary/80">{plan}</pre>
        </div>
      )}
    </div>
  );
}
// fitjourney - Next.js Starter Code (with Progress Chart + Workout Tracker + AI Workout Plan + AI Meal Plan + BMI + Deployment Ready)

// 1. Install required packages before deploying:
// npm install next-auth mongoose tailwindcss recharts axios openai
// npx tailwindcss init -p

// 2. Create folders: /pages, /pages/api, /components, /models, /lib, /styles

// ============================
// pages/api/workout-plan.ts
import { getToken } from 'next-auth/jwt';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  const token = await getToken({ req });
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  if (req.method === 'POST') {
    const { height, weight, goal, equipment } = req.body;

    const prompt = `Create a personalized 5-day workout plan for someone who is ${height} cm tall, weighs ${weight} kg, whose goal is to ${goal}. They have access to: ${equipment}. The plan should include warm-up, main workout, and cool-down each day.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a fitness expert.' },
          { role: 'user', content: prompt }
        ]
      });
      return res.status(200).json({ plan: completion.choices[0].message.content });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to generate plan' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

// ============================
// pages/api/meal-plan.ts
import { getToken } from 'next-auth/jwt';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  const token = await getToken({ req });
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  if (req.method === 'POST') {
    const { goal, dietaryPreferences } = req.body;

    const prompt = `Create a one-day meal plan with breakfast, lunch, snack, and dinner for someone whose goal is to ${goal}. Dietary preferences: ${dietaryPreferences}. Include macronutrients and total calories.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a certified nutritionist.' },
          { role: 'user', content: prompt }
        ]
      });
      return res.status(200).json({ plan: completion.choices[0].message.content });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to generate meal plan' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

// ============================
// components/MealPlan.tsx
import { useState } from 'react';
import axios from 'axios';

export default function MealPlan() {
  const [form, setForm] = useState({ goal: '', dietaryPreferences: '' });
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await axios.post('/api/meal-plan', form);
    setPlan(res.data.plan);
    setLoading(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">AI Meal Plan Generator</h2>
      <form onSubmit={handleSubmit} className="grid gap-2 mb-4">
        <input value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })} placeholder="Goal (e.g., gain muscle)" className="border p-2 rounded" />
        <input value={form.dietaryPreferences} onChange={e => setForm({ ...form, dietaryPreferences: e.target.value })} placeholder="Dietary Preferences (e.g., veg, keto)" className="border p-2 rounded" />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Generate Meal Plan</button>
      </form>
      {loading && <p>Loading meal plan...</p>}
      {plan && <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded text-sm">{plan}</pre>}
    </div>
  );
}

// ============================
// components/BMICalculator.tsx
import { useState } from 'react';

export default function BMICalculator() {
  const [form, setForm] = useState({ height: '', weight: '', age: '', gender: '' });
  const [bmi, setBmi] = useState(null);
  const [calories, setCalories] = useState(null);

  const calculate = () => {
    const heightM = parseFloat(form.height) / 100;
    const weight = parseFloat(form.weight);
    const age = parseInt(form.age);
    const gender = form.gender;

    if (!heightM || !weight || !age || !gender) return;

    const bmiValue = (weight / (heightM * heightM)).toFixed(1);
    setBmi(bmiValue);

    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * parseFloat(form.height) - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * parseFloat(form.height) - 5 * age - 161;
    }

    const dailyCalories = Math.round(bmr * 1.55); // Moderate activity
    setCalories(dailyCalories);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">BMI & Calorie Calculator</h2>
      <div className="grid gap-2 mb-4">
        <input placeholder="Height (cm)" value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} className="border p-2 rounded" />
        <input placeholder="Weight (kg)" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} className="border p-2 rounded" />
        <input placeholder="Age" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} className="border p-2 rounded" />
        <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="border p-2 rounded">
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <button onClick={calculate} className="bg-blue-600 text-white px-4 py-2 rounded">Calculate</button>
      </div>
      {bmi && <p>BMI: {bmi}</p>}
      {calories && <p>Recommended Daily Calories: {calories}</p>}
    </div>
  );
}

// ============================
// pages/dashboard.tsx
import { useSession } from 'next-auth/react';
import ProgressChart from '../components/ProgressChart';
import WorkoutTracker from '../components/WorkoutTracker';
import WorkoutPlan from '../components/WorkoutPlan';
import MealPlan from '../components/MealPlan';
import BMICalculator from '../components/BMICalculator';

export default function Dashboard() {
  const { data: session } = useSession();

  if (!session) return <p>Loading...</p>;

  return (
    <div className="p-4 max-w-3xl mx-auto grid gap-8">
      <h1 className="text-2xl font-bold">Welcome to FitJourney, {session.user.email}!</h1>
      <BMICalculator />
      <ProgressChart />
      <WorkoutTracker />
      <WorkoutPlan />
      <MealPlan />
    </div>
  );
}

// ============================
// .env.local
// MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fitjourney
// NEXTAUTH_SECRET=your_secret
// OPENAI_API_KEY=your_openai_key_here

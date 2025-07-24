import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function SignUp() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    fitnessGoal: 'maintain_weight'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          age: parseInt(form.age),
          fitnessGoal: form.fitnessGoal
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Something went wrong');
        return;
      }

      // Redirect to login page
      router.push('/login?message=Account created successfully');
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background-dark">
      <div className="card p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-primary text-center mb-6">Join FitJourney</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
            className="input-field w-full"
            required
          />
          
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
            className="input-field w-full"
            required
          />
          
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
            className="input-field w-full"
            required
            minLength={6}
          />
          
          <input
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={e => setForm({...form, confirmPassword: e.target.value})}
            className="input-field w-full"
            required
          />
          
          <input
            type="number"
            placeholder="Age"
            value={form.age}
            onChange={e => setForm({...form, age: e.target.value})}
            className="input-field w-full"
            required
            min={13}
          />
          
          <select
            value={form.fitnessGoal}
            onChange={e => setForm({...form, fitnessGoal: e.target.value})}
            className="input-field w-full"
          >
            <option value="lose_weight">Lose Weight</option>
            <option value="gain_muscle">Gain Muscle</option>
            <option value="maintain_weight">Maintain Weight</option>
            <option value="improve_endurance">Improve Endurance</option>
          </select>

          <button 
            type="submit" 
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-secondary mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-semibold">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
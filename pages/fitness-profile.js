import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function FitnessProfile() {
  const { user, checkAuth } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [sessionStatus, setSessionStatus] = useState('unknown');
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: { value: '', unit: 'cm' },
    currentWeight: { value: '', unit: 'kg' },
    targetWeight: { value: '', unit: 'kg' },
    fitnessGoal: '',
    activityLevel: '',
    workoutLocation: '',
    availableEquipment: [],
    workoutFrequency: 3,
    workoutDuration: 60,
    dietaryPreferences: [],
    allergies: []
  });

  useEffect(() => {
    const checkSessionStatus = async () => {
      if (user) {
        try {
          const response = await fetch('/api/auth/check', { credentials: 'include' });
          setSessionStatus(response.ok ? 'valid' : 'invalid');
        } catch {
          setSessionStatus('invalid');
        }
      }
    };
    
    checkSessionStatus();
    
    console.log('useEffect triggered:', { 
      user: !!user, 
      isComplete: user?.fitnessProfile?.completedProfile,
      saving 
    });
    
    if (!user) {
      console.log('No user, redirecting to login');
      router.push('/login');
      return;
    }

    // If profile is complete and we're not in the middle of saving, show option to go to dashboard
    if (user?.fitnessProfile?.completedProfile && !saving) {
      console.log('Profile already complete');
    }
  }, [user, router, saving]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleArrayChange = (field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit called, currentStep:', currentStep);
    
    // Only allow submission on step 4
    if (currentStep !== 4) {
      console.log('Form submitted but not on final step, preventing submission');
      return;
    }
    
    // Check if user is still authenticated
    if (!user || !user.id) {
      console.log('User not authenticated, redirecting to login');
      alert('Your session has expired. Please log in again.');
      router.push('/login');
      return;
    }
    
    setLoading(true);
    setSaving(true);

    // Refresh authentication before submitting
    console.log('Refreshing authentication before submission...');
    try {
      await checkAuth();
      console.log('Auth refresh completed');
      
      // Double-check authentication status
      const authCheck = await fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!authCheck.ok) {
        console.log('Auth check failed, redirecting to login');
        alert('Your session has expired. Please log in again.');
        router.push('/login');
        return;
      }
      
      const authData = await authCheck.json();
      console.log('Auth check result:', authData);
    } catch (error) {
      console.error('Auth refresh failed:', error);
      alert('Authentication failed. Please log in again.');
      router.push('/login');
      return;
    }

    // Validate all steps before submitting
    for (let step = 1; step <= 4; step++) {
      if (!validateStep(step)) {
        alert(`Please complete step ${step} before submitting.`);
        setCurrentStep(step);
        setLoading(false);
        setSaving(false);
        return;
      }
    }

    console.log('Submitting form data:', formData); // Debug log
    console.log('User state before submission:', { 
      hasUser: !!user, 
      userId: user?.id, 
      profileComplete: user?.fitnessProfile?.completedProfile 
    });

    try {
      const response = await fetch('/api/user/fitness-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('API Response:', response.status, data); // Debug log

      if (response.ok) {
        console.log('Profile saved successfully, refreshing auth...');
        // Show success message
        alert('Profile saved successfully!');
        
        // Refresh user data to include the updated fitness profile
        await checkAuth();
        console.log('Auth refreshed, redirecting to dashboard...');
        
        // Multiple redirect strategies
        setTimeout(() => {
          router.replace('/dashboard');
        }, 500);
        
        // Alternative: Set a flag to show manual dashboard button
        setLoading(false);
        setSaving(false);
        return;
      } else {
        console.error('API Error:', response.status, data);
        if (response.status === 401) {
          alert('Session expired. Please log in again.');
          router.push('/login');
        } else {
          alert(data.message || 'Failed to save profile. Please try again.');
        }
      }
    } catch (error) {
      console.error('Profile save error:', error);
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        alert('Authentication error. Please log in again.');
        router.push('/login');
      } else {
        alert('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    // Prevent Enter from submitting form unless we're on step 4
    if (e.key === 'Enter' && currentStep !== 4) {
      e.preventDefault();
      // Instead, move to next step if current step is valid
      if (validateStep(currentStep)) {
        nextStep();
      } else {
        alert('Please fill in all required fields before proceeding.');
      }
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return (
          formData.age && 
          formData.gender && 
          formData.height.value && 
          formData.currentWeight.value && 
          formData.targetWeight.value
        );
      case 2:
        return formData.fitnessGoal && formData.activityLevel;
      case 3:
        return formData.workoutLocation;
      case 4:
        return true; // Step 4 fields are optional
      default:
        return false;
    }
  };

  const nextStep = () => {
    console.log('nextStep called, currentStep:', currentStep);
    console.log('formData.workoutLocation:', formData.workoutLocation);
    console.log('validateStep result:', validateStep(currentStep));
    
    if (validateStep(currentStep)) {
      setCurrentStep(prev => {
        const newStep = Math.min(prev + 1, 4);
        console.log('Moving to step:', newStep);
        return newStep;
      });
    } else {
      alert('Please fill in all required fields before proceeding.');
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  if (!user) return <div className="flex items-center justify-center min-h-screen"><div className="text-lg">Loading...</div></div>;

  if (saving) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg mb-2">Saving your fitness profile...</div>
          <div className="text-sm text-gray-600">Please wait, you'll be redirected to your dashboard shortly.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      {user?.fitnessProfile?.completedProfile && (
        <div className="mb-4 p-4 bg-blue-100 border border-blue-400 rounded-md">
          <p className="text-blue-800">
            Your fitness profile is already complete! 
            <button 
              onClick={() => router.push('/dashboard')} 
              className="ml-2 text-blue-600 underline hover:text-blue-800"
            >
              Go to Dashboard
            </button>
          </p>
        </div>
      )}
      
      {/* Session Warning */}
      {sessionStatus === 'invalid' && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded-md">
          <p className="text-red-800">
            ⚠️ Your session may have expired. Please 
            <button 
              onClick={() => router.push('/login')} 
              className="ml-1 text-red-600 underline hover:text-red-800"
            >
              log in again
            </button>
            {' '}before completing your profile.
          </p>
        </div>
      )}
      
        <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Complete Your Fitness Profile</h1>
        <p className="text-gray-600">Help us personalize your fitness journey</p>
        
        {/* Session Status Indicator */}
        {user && (
          <div className="mt-2 text-sm">
            <span className="text-gray-500">Logged in as: {user.name}</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              sessionStatus === 'valid' ? 'bg-green-100 text-green-800' :
              sessionStatus === 'invalid' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              Session: {sessionStatus}
            </span>
            <br/>
            <button 
              onClick={async () => {
                console.log('Manual auth refresh triggered');
                setSessionStatus('checking...');
                await checkAuth();
                const response = await fetch('/api/auth/check', { credentials: 'include' });
                setSessionStatus(response.ok ? 'valid' : 'invalid');
                alert('Session refreshed!');
              }}
              className="mt-1 text-primary hover:underline text-xs"
            >
              Refresh Session
            </button>
            {' | '}
            <button 
              onClick={() => router.push('/login')}
              className="text-primary hover:underline text-xs"
            >
              Switch Account
            </button>
          </div>
        )}
        
        <div className="flex justify-center mt-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className={`w-8 h-8 rounded-full mx-2 flex items-center justify-center text-sm font-medium ${
              step <= currentStep ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step}
            </div>
          ))}
        </div>
      </div>      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="bg-white rounded-lg shadow-md p-6">
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Basic Information <span className="text-sm text-gray-600">(All fields required)</span></h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                <input
                  type="number"
                  min="13"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm) *</label>
                <input
                  type="number"
                  min="100"
                  max="250"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.height.value}
                  onChange={(e) => handleInputChange('height.value', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Weight (kg) *</label>
                <input
                  type="number"
                  min="30"
                  max="300"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.currentWeight.value}
                  onChange={(e) => handleInputChange('currentWeight.value', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Weight (kg) *</label>
              <input
                type="number"
                min="30"
                max="300"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.targetWeight.value}
                onChange={(e) => handleInputChange('targetWeight.value', e.target.value)}
                required
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Fitness Goals & Activity <span className="text-sm text-gray-600">(All fields required)</span></h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Fitness Goal *</label>
              <div className="space-y-2">
                {[
                  { value: 'lose_weight', label: 'Lose Weight' },
                  { value: 'gain_muscle', label: 'Gain Muscle' },
                  { value: 'maintain_weight', label: 'Maintain Weight' },
                  { value: 'improve_endurance', label: 'Improve Endurance' },
                  { value: 'general_fitness', label: 'General Fitness' }
                ].map((goal) => (
                  <label key={goal.value} className="flex items-center">
                    <input
                      type="radio"
                      name="fitnessGoal"
                      value={goal.value}
                      checked={formData.fitnessGoal === goal.value}
                      onChange={(e) => handleInputChange('fitnessGoal', e.target.value)}
                      className="mr-2"
                      required
                    />
                    {goal.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level *</label>
              <div className="space-y-2">
                {[
                  { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
                  { value: 'lightly_active', label: 'Lightly Active (light exercise 1-3 days/week)' },
                  { value: 'moderately_active', label: 'Moderately Active (moderate exercise 3-5 days/week)' },
                  { value: 'very_active', label: 'Very Active (hard exercise 6-7 days/week)' },
                  { value: 'extremely_active', label: 'Extremely Active (very hard exercise, physical job)' }
                ].map((level) => (
                  <label key={level.value} className="flex items-center">
                    <input
                      type="radio"
                      name="activityLevel"
                      value={level.value}
                      checked={formData.activityLevel === level.value}
                      onChange={(e) => handleInputChange('activityLevel', e.target.value)}
                      className="mr-2"
                      required
                    />
                    {level.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Workout Preferences</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Where do you prefer to workout? *</label>
              <div className="space-y-2">
                {[
                  { value: 'home', label: 'Home' },
                  { value: 'gym', label: 'Gym' },
                  { value: 'outdoor', label: 'Outdoor' },
                  { value: 'hybrid', label: 'Mix of Home/Gym/Outdoor' }
                ].map((location) => (
                  <label key={location.value} className="flex items-center">
                    <input
                      type="radio"
                      name="workoutLocation"
                      value={location.value}
                      checked={formData.workoutLocation === location.value}
                      onChange={(e) => handleInputChange('workoutLocation', e.target.value)}
                      className="mr-2"
                      required
                    />
                    {location.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Equipment (select all that apply)</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'dumbbells', 'barbells', 'resistance_bands', 'pull_up_bar', 
                  'treadmill', 'stationary_bike', 'kettlebells', 'yoga_mat', 'bench', 'none'
                ].map((equipment) => (
                  <label key={equipment} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.availableEquipment.includes(equipment)}
                      onChange={(e) => handleArrayChange('availableEquipment', equipment, e.target.checked)}
                      className="mr-2"
                    />
                    {equipment.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Workout Frequency (days per week)</label>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={formData.workoutFrequency}
                  onChange={(e) => handleInputChange('workoutFrequency', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600">{formData.workoutFrequency} days/week</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Workout Duration (minutes)</label>
                <input
                  type="range"
                  min="15"
                  max="120"
                  step="15"
                  value={formData.workoutDuration}
                  onChange={(e) => handleInputChange('workoutDuration', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600">{formData.workoutDuration} minutes</div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Dietary Preferences</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preferences (optional)</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean', 
                  'low_carb', 'high_protein', 'none'
                ].map((diet) => (
                  <label key={diet} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.dietaryPreferences.includes(diet)}
                      onChange={(e) => handleArrayChange('dietaryPreferences', diet, e.target.checked)}
                      className="mr-2"
                    />
                    {diet.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Food Allergies (optional)</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                rows="3"
                placeholder="List any food allergies separated by commas (e.g., nuts, shellfish, dairy)"
                value={formData.allergies.join(', ')}
                onChange={(e) => handleInputChange('allergies', e.target.value.split(',').map(item => item.trim()).filter(Boolean))}
              />
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-2 border border-primary text-primary rounded-md hover:bg-primary/5 transition-colors"
            >
              Previous
            </button>
          )}
          
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="ml-auto px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || saving}
              className="ml-auto px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading || saving ? 'Saving Profile...' : 'Complete Profile'}
            </button>
          )}
        </div>
      </form>
      
      {/* Show manual dashboard access if profile is complete */}
      {user?.fitnessProfile?.completedProfile && (
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
          <p className="text-green-800 mb-4">✅ Your fitness profile is complete!</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

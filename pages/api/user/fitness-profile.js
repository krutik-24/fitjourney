import { verifyToken } from '../../../lib/auth';
import User from '../../../models/User';
import connectMongo from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const token = req.cookies.token;
    console.log('Token received:', !!token); // Debug log
    
    if (!token) {
      console.log('No token provided in request'); // Debug log
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    console.log('Token decoded:', !!decoded, decoded?.userId); // Debug log
    
    if (!decoded) {
      console.log('Token verification failed'); // Debug log
      return res.status(401).json({ message: 'Invalid token' });
    }

    await connectMongo();

    const {
      age,
      gender,
      height,
      currentWeight,
      targetWeight,
      fitnessGoal,
      activityLevel,
      workoutLocation,
      availableEquipment,
      workoutFrequency,
      workoutDuration,
      dietaryPreferences,
      allergies
    } = req.body;

    // Update user with fitness profile
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      {
        $set: {
          'fitnessProfile.age': parseInt(age),
          'fitnessProfile.gender': gender,
          'fitnessProfile.height': {
            value: parseFloat(height.value),
            unit: height.unit || 'cm'
          },
          'fitnessProfile.currentWeight': {
            value: parseFloat(currentWeight.value),
            unit: currentWeight.unit || 'kg'
          },
          'fitnessProfile.targetWeight': {
            value: parseFloat(targetWeight.value),
            unit: targetWeight.unit || 'kg'
          },
          'fitnessProfile.fitnessGoal': fitnessGoal,
          'fitnessProfile.activityLevel': activityLevel,
          'fitnessProfile.workoutLocation': workoutLocation,
          'fitnessProfile.availableEquipment': availableEquipment || [],
          'fitnessProfile.workoutFrequency': parseInt(workoutFrequency),
          'fitnessProfile.workoutDuration': parseInt(workoutDuration),
          'fitnessProfile.dietaryPreferences': dietaryPreferences || [],
          'fitnessProfile.allergies': Array.isArray(allergies) ? allergies : [],
          'fitnessProfile.completedProfile': true,
          'fitnessProfile.updatedAt': new Date()
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ 
      message: 'Fitness profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Fitness profile update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

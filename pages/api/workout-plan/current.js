import { verifyToken } from '../../../lib/auth';
import WorkoutPlan from '../../../models/WorkoutPlan';
import connectMongo from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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

    // Get the most recent workout plan for the user
    const workoutPlan = await WorkoutPlan.findOne({ 
      userId: decoded.userId 
    }).sort({ createdAt: -1 });

    if (!workoutPlan) {
      return res.status(404).json({ message: 'No workout plan found' });
    }

    res.status(200).json({
      data: workoutPlan
    });
  } catch (error) {
    console.error('Current workout plan fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

import { verifyToken } from '../../../lib/auth';
import WorkoutTracker from '../../../models/WorkoutTracker';
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

    // Get recent workout entries (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const workoutEntries = await WorkoutTracker.find({ 
      userId: decoded.userId,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: -1 });

    res.status(200).json({
      data: workoutEntries
    });
  } catch (error) {
    console.error('Recent workout entries fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

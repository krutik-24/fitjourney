import { verifyToken } from '../../../lib/auth';
import MealPlan from '../../../models/MealPlan';
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

    // Get the most recent meal plan for the user
    const mealPlan = await MealPlan.findOne({ 
      userId: decoded.userId 
    }).sort({ createdAt: -1 });

    if (!mealPlan) {
      return res.status(404).json({ message: 'No meal plan found' });
    }

    res.status(200).json({
      data: mealPlan
    });
  } catch (error) {
    console.error('Current meal plan fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

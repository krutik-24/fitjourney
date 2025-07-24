import { verifyToken } from '../../../lib/auth';
import WeightEntry from '../../../models/WeightEntry';
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

    // Get recent weight entries (last 30 days by default)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const weightEntries = await WeightEntry.find({ 
      userId: decoded.userId,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: -1 });

    res.status(200).json({
      data: weightEntries
    });
  } catch (error) {
    console.error('Recent weight entries fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

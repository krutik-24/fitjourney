import connectMongo from '../../../lib/mongodb';
import User from '../../../models/User';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get token from cookie
    const token = req.cookies.token;
    console.log('Auth/me - Token received:', !!token); // Debug log
    console.log('Auth/me - All cookies:', Object.keys(req.cookies || {})); // Debug log
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    const decoded = verifyToken(token);
    console.log('Auth/me - Token decoded:', !!decoded, decoded?.userId); // Debug log
    
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Connect to database
    await connectMongo();

    // Find user by ID
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data including fitness profile
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      fitnessProfile: user.fitnessProfile || null
    };

    res.status(200).json({
      user: userResponse
    });

  } catch (error) {
    console.error('Me API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get token from cookie
    const token = req.cookies.token;
    console.log('Auth check - Token received:', !!token);
    console.log('Auth check - All cookies:', Object.keys(req.cookies || {}));
    
    if (!token) {
      return res.status(401).json({ 
        authenticated: false, 
        message: 'No token provided' 
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    console.log('Auth check - Token decoded:', !!decoded, decoded?.userId);
    
    if (!decoded) {
      return res.status(401).json({ 
        authenticated: false, 
        message: 'Invalid token' 
      });
    }

    res.status(200).json({
      authenticated: true,
      userId: decoded.userId
    });

  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ 
      authenticated: false,
      message: 'Internal server error' 
    });
  }
}

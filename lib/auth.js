import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined in environment variables');
}

// Hash password
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

// Compare password
export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Set auth cookie
export const setAuthCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = [
    `token=${token}`,
    'HttpOnly',
    'Path=/',
    `Max-Age=${7 * 24 * 60 * 60}`,
    'SameSite=Lax'
  ];
  
  if (isProduction) {
    cookieOptions.push('Secure');
  }
  
  res.setHeader('Set-Cookie', [cookieOptions.join('; ')]);
};

// Clear auth cookie
export const clearAuthCookie = (res) => {
  res.setHeader('Set-Cookie', [
    'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax;'
  ]);
};

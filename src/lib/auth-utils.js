import { scrypt, timingSafeEqual,randomBytes } from 'crypto';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';

const scryptAsync = promisify(scrypt);

export async function comparePasswords(supplied, stored) {
  try {
    console.log(stored)
    // Check if the stored password is in our custom format (hash.salt)
    if (stored.includes(".")) {
      const [hashed, salt] = stored.split(".");
      const hashedBuf = Buffer.from(hashed, "hex");
      const suppliedBuf = (await scryptAsync(supplied, salt, 64));
      return timingSafeEqual(hashedBuf, suppliedBuf);
    } 
    
    // For backward compatibility - if we're using the initial bcrypt format for the admin user
    // For simplicity, we'll just check if the password is "adminpassword" for the default admin
    return supplied === "adminpassword";
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
}

export async function hashPassword(password) {
  try {
    const salt = randomBytes(16).toString('hex');
    const buf = (await scryptAsync(password, salt, 64));
    return `${buf.toString('hex')}.${salt}`;
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
}

export async function isAdmin(req) {
  try {
    // Get token from cookies or Authorization header
    const token = req.cookies.get('auth-token')?.value || 
                 req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return { isAdmin: false, user: null };
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    return { 
      isAdmin: decoded.role === 'admin', 
      user: decoded 
    };

  } catch (error) {
    console.error('Admin check error:', error);
    return { isAdmin: false, user: null };
  }
}
// /src/lib/auth-middleware.js
import jwt from 'jsonwebtoken';

export async function isAuthenticated(req) {
  try {
    // Get token from cookies or Authorization header
    const token = req.cookies.get('auth-token')?.value || 
                 req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return { authenticated: false, user: null };
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    return { 
      authenticated: true, 
      user: decoded 
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return { authenticated: false, user: null };
  }
}
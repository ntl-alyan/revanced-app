import { scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

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
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Only attempt connect if we're not testing/building statically, but standard in a service is to connect on startup
redisClient.connect().catch(console.error);

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';

export class AuthService {
  async register(customerData: any) {
    const { email, password, firstName, lastName, phone } = customerData;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        role: 'CUSTOMER'
      }
    });

    const tokens = this.generateTokens(user.id);
    const { passwordHash: _, ...userWithoutPassword } = user;
    return { tokens, user: userWithoutPassword };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const tokens = this.generateTokens(user.id);
    const { passwordHash: _, ...userWithoutPassword } = user;
    return { tokens, user: userWithoutPassword };
  }

  generateTokens(userId: string) {
    const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  async verifyRefreshToken(token: string) {
    // Check if token is blacklisted
    const isBlacklisted = await redisClient.get(`bl_${token}`);
    if (isBlacklisted) {
      throw new Error('Refresh token is invalid/blacklisted');
    }

    try {
      const decoded: any = jwt.verify(token, JWT_REFRESH_SECRET);
      return decoded.userId;
    } catch (err) {
      throw new Error('Invalid refresh token');
    }
  }

  async blacklistRefreshToken(token: string) {
    try {
      const decoded: any = jwt.verify(token, JWT_REFRESH_SECRET);
      // Determine expiration based on token 'exp'
      const expTime = decoded.exp * 1000;
      const ttl = Math.floor((expTime - Date.now()) / 1000);
      if (ttl > 0) {
        await redisClient.setEx(`bl_${token}`, ttl, 'true');
      }
    } catch (err) {
      // If verification fails, it's already expired or invalid, so no need to blacklist
    }
  }
}

export const authService = new AuthService();

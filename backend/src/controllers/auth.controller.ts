import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Generate JWT tokens
const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, username, password } = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });
    
    if (existingUser) {
      res.status(400).json({ 
        error: 'User with this email or username already exists' 
      });
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash: hashedPassword,
        role: 'VIEWER', // Default role
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      }
    });
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    
  res.json({
      message: 'User registered successfully',
      user,
      tokens: {
        accessToken,
        refreshToken
      }
    });
  return;
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: 'Invalid input data',
        details: error.issues
      });
      return;
    }
    
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() }
    });
    
  res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });
  return;
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        error: 'Invalid input data',
        details: error.issues
      });
      return;
    }
    
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      res.status(401).json({ error: 'Refresh token required' });
      return;
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }
    
    // Generate new tokens
    const tokens = generateTokens(user.id, user.role);
    
  res.json({
      message: 'Token refreshed successfully',
      tokens
    });
  return;
  } catch (error) {
    console.error('Token refresh error:', error);
  res.status(401).json({ error: 'Invalid refresh token' });
  return;
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  try {
    // In a production app, you might want to blacklist the token
    // For now, we'll just return success
  res.json({ message: 'Logout successful' });
  return;
  } catch (error) {
    console.error('Logout error:', error);
  res.status(500).json({ error: 'Internal server error' });
  return;
  }
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
  res.json({ user });
  return;
  } catch (error) {
    console.error('Get profile error:', error);
  res.status(500).json({ error: 'Internal server error' });
  return;
  }
}
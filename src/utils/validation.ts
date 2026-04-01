import { z } from 'zod';

/**
 * Centralized validation schemas for all API inputs
 * Implements strict security best practices
 */

// Auth Schemas
export const registerSchema = z.object({
  email: z
    .string('Email must be a string')
    .email('Invalid email format')
    .toLowerCase()
    .trim()
    .max(255, 'Email too long'),
  password: z
    .string('Password must be a string')
    .min(12, 'Password must be at least 12 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain special character'),
  name: z
    .string()
    .min(2, 'Name must be 2+ characters')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  username: z
    .string()
    .min(3, 'Username must be 3+ characters')
    .max(30, 'Username too long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z.string().min(1, 'Password required')
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token required'),
  email: z.string().email('Invalid email'),
  newPassword: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase')
    .regex(/[a-z]/, 'Password must contain lowercase')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[!@#$%^&*()]/, 'Password must contain special character')
});

// Contact form schema
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be 2+ characters')
    .max(100, 'Name too long')
    .trim(),
  email: z
    .string()
    .email('Invalid email')
    .toLowerCase()
    .trim(),
  subject: z
    .string()
    .min(3, 'Subject must be 3+ characters')
    .max(200, 'Subject too long')
    .trim(),
  message: z
    .string()
    .min(10, 'Message must be 10+ characters')
    .max(5000, 'Message too long')
    .trim()
});

// Post/content schema
export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, 'Content required')
    .max(10000, 'Content too long')
    .trim(),
  image: z
    .string()
    .url('Invalid image URL')
    .optional(),
  visibility: z
    .enum(['public', 'private', 'followers'])
    .default('public')
});

// AI generation schema
export const aiGenerateSchema = z.object({
  userInput: z
    .string()
    .min(5, 'Input must be 5+ characters')
    .max(5000, 'Input too long'),
  contentType: z
    .enum(['story', 'script', 'caption', 'hooks', 'ideas', 'rewrite', 'video-description', 'image-prompt', 'voice-script'])
    .optional()
    .default('story'),
  platform: z
    .enum(['tiktok', 'youtube', 'instagram', 'twitter'])
    .optional(),
  tone: z
    .enum(['funny', 'dramatic', 'inspirational', 'educational', 'controversial'])
    .optional(),
  context: z
    .string()
    .max(2000, 'Context too long')
    .optional()
});

// User update schema
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be 2+ characters')
    .max(100, 'Name too long')
    .optional(),
  avatar: z
    .string()
    .url('Invalid avatar URL')
    .optional(),
  notificationSettings: z
    .object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      marketing: z.boolean().optional()
    })
    .optional(),
  privacySettings: z
    .object({
      profilePublic: z.boolean().optional(),
      showActivity: z.boolean().optional()
    })
    .optional()
});

// Admin schemas
export const updateUserRoleSchema = z.object({
  newRole: z.enum(['member', 'admin', 'owner'])
});

export const addCreditsSchema = z.object({
  amount: z
    .number()
    .int()
    .min(1, 'Amount must be positive'),
  reason: z
    .string()
    .min(5, 'Reason required')
    .max(500)
});

export const updatePricingSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  credits: z.number().int().min(0),
  features: z.array(z.string()).optional()
});

/**
 * Safe validation with detailed error messages
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { valid: true; data: T } | { valid: false; errors: z.ZodError['errors'] } {
  try {
    const validated = schema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.errors };
    }
    throw error;
  }
}

/**
 * Format validation errors for API response
 */
export function formatValidationErrors(errors: z.ZodError['errors']): Record<string, string> {
  return errors.reduce((acc, error) => {
    const field = error.path.join('.');
    acc[field] = error.message;
    return acc;
  }, {} as Record<string, string>);
}

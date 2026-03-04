import { describe, expect, it } from 'vitest';
import { loginValidationSchema } from './login.validation';

describe('loginValidationSchema', () => {
  it('accepts valid values', () => {
    const result = loginValidationSchema.safeParse({
      email: 'admin@eastcoastlubricant.com',
      password: 'password123',
      remember: true,
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid email and short password', () => {
    const result = loginValidationSchema.safeParse({
      email: 'invalid-email',
      password: '123',
      remember: false,
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const issues = result.error.issues.map(issue => issue.message);

      expect(issues).toContain('Please enter a valid email address');
      expect(issues).toContain('Password must be at least 8 characters');
    }
  });
});

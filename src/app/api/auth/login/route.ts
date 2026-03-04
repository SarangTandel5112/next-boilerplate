import { compare } from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { assertAccountNotLocked, clearLoginAttempts, registerFailedLoginAttempt } from '@/server/auth/login-attempts';
import { RBAC_ROLES } from '@/server/auth/rbac';
import { buildSessionPayload, createSessionToken, setSessionCookie } from '@/server/auth/session';
import { AppError } from '@/server/errors/app-error';
import { withRouteHandler } from '@/server/errors/error-handler';
import { assertRateLimit, getClientIp } from '@/server/security/rate-limit';
import { Env, getAuthAdminEmail, getAuthAdminPasswordHash } from '@/shared/config/env';

const loginRequestSchema = z.object({
  email: z.string().trim().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const getAdminUser = () => {
  return {
    id: 'admin-1',
    email: getAuthAdminEmail(),
    passwordHash: getAuthAdminPasswordHash(),
    role: RBAC_ROLES.admin,
  } as const;
};

export const POST = withRouteHandler(async (options) => {
  const clientIp = getClientIp(options.request);
  const body = await options.request.json().catch(() => {
    throw new AppError({
      code: 'INVALID_JSON',
      message: 'Invalid request payload',
      statusCode: 400,
    });
  });

  const parsed = loginRequestSchema.safeParse(body);

  if (!parsed.success) {
    throw new AppError({
      code: 'VALIDATION_ERROR',
      message: 'Invalid request payload',
      statusCode: 400,
      details: parsed.error.flatten(),
    });
  }

  await assertRateLimit({
    key: `auth:login:${clientIp}:${parsed.data.email.toLowerCase()}`,
    limit: Env.AUTH_LOGIN_RATE_LIMIT_MAX,
    windowMs: Env.AUTH_LOGIN_RATE_LIMIT_WINDOW_MS,
  });

  const normalizedEmail = parsed.data.email.toLowerCase();
  assertAccountNotLocked(normalizedEmail);

  const adminUser = getAdminUser();
  const user = adminUser.email.toLowerCase() === normalizedEmail ? adminUser : null;

  let isPasswordValid = false;

  if (user) {
    isPasswordValid = await compare(parsed.data.password, user.passwordHash).catch(() => {
      throw new AppError({
        code: 'AUTH_CONFIGURATION_INVALID',
        message: 'Authentication configuration invalid',
        statusCode: 500,
      });
    });
  }

  if (!user || !isPasswordValid) {
    const attempt = registerFailedLoginAttempt(normalizedEmail);

    if (attempt.isLocked) {
      throw new AppError({
        code: 'AUTH_ACCOUNT_LOCKED',
        message: 'Account temporarily locked',
        statusCode: 423,
        details: {
          retryAfterMs: attempt.retryAfterMs,
        },
      });
    }

    throw new AppError({
      code: 'AUTH_INVALID_CREDENTIALS',
      message: 'Invalid credentials',
      statusCode: 401,
    });
  }

  clearLoginAttempts(normalizedEmail);

  const sessionPayload = buildSessionPayload({
    userId: user.id,
    role: user.role,
  });

  const token = await createSessionToken(sessionPayload);

  options.logger.info({
    authUserId: user.id,
  }, 'Admin login succeeded');

  const response = NextResponse.json({
    success: true,
    data: {
      user: {
        id: user.id,
        role: user.role,
      },
    },
  });

  setSessionCookie(response, token);

  return response;
});

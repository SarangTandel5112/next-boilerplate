import type { z } from 'zod';
import type { loginValidationSchema } from '../schemas';

export type LoginFormValues = z.input<typeof loginValidationSchema>;

import type { z } from 'zod';
import type { loginValidationSchema } from '../validations';

export type LoginFormValues = z.input<typeof loginValidationSchema>;

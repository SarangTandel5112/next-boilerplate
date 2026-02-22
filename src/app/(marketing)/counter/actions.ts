'use server';

import { revalidatePath } from 'next/cache';
import { ROUTES } from '@/modules/common';
import { CounterService, CounterValidation } from '@/modules/counter';

/**
 * Server action to increment the counter.
 * Validates input and revalidates the counter page.
 * @param increment - Value to increment by (must be 1-3)
 * @returns Updated counter value or error
 */
export async function incrementCounterAction(increment: number) {
  try {
    const validated = CounterValidation.parse({ increment });
    const response = await CounterService.incrementCounter(validated.increment);
    revalidatePath(ROUTES.COUNTER);
    return { success: true as const, count: response.count };
  } catch (error) {
    console.error('Failed to increment counter:', error);
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : 'Failed to increment counter',
    };
  }
}

/**
 * Server action to reset the counter.
 * @returns Success status and count of 0
 */
export async function resetCounterAction() {
  try {
    const response = await CounterService.resetCounter();
    revalidatePath(ROUTES.COUNTER);
    return { success: true as const, count: response.count };
  } catch (error) {
    console.error('Failed to reset counter:', error);
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : 'Failed to reset counter',
    };
  }
}

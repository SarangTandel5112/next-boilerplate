'use client';

import { useState, useTransition } from 'react';
import {
  incrementCounterAction,
  resetCounterAction,
} from '@/app/(marketing)/counter/actions';
import { tracking } from '@/libs/monitoring';
import { getMessage, getSafeErrorMessage } from '@/modules/common';
import { CounterForm } from './CounterForm';

/**
 * Client component for counter interactions.
 * Uses Server Actions for mutations with optimistic updates.
 * @param props - Component props.
 * @param props.initialCount - Initial counter value from server.
 */
export const CounterWidget = (props: { initialCount: number }) => {
  const [count, setCount] = useState(props.initialCount);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleIncrement = async (value: number) => {
    setError(null);
    setCount(prev => prev + value);

    startTransition(async () => {
      const result = await incrementCounterAction(value);

      if (!result.success) {
        setCount(prev => prev - value);
        setError(
          getSafeErrorMessage(new Error(result.error ?? 'Failed to increment')),
        );
        tracking.counterIncrement(value, false);
      } else {
        setCount(result.count);
        tracking.counterIncrement(value, true);
      }
    });
  };

  const handleReset = () => {
    setError(null);
    startTransition(async () => {
      const result = await resetCounterAction();
      if (result.success) {
        setCount(result.count);
      } else {
        setError(
          getSafeErrorMessage(
            new Error(result.error ?? 'Failed to reset counter'),
          ),
        );
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-6xl font-bold">{count}</p>
        <p className="text-sm text-gray-600">
          {getMessage('CurrentCount', 'count', { count })}
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <CounterForm
        isLoading={isPending}
        onIncrement={handleIncrement}
        onReset={handleReset}
      />
    </div>
  );
};

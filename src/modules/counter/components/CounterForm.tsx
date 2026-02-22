'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { getMessage } from '@/modules/common';
import { CounterValidation } from '../validations/CounterValidation';

export const CounterForm = (props: {
  isLoading: boolean;
  onIncrement: (value: number) => Promise<void>;
  onReset?: () => void;
}) => {
  const form = useForm({
    resolver: zodResolver(CounterValidation),
    defaultValues: {
      increment: 1,
    },
  });

  const handleIncrement = form.handleSubmit(async (data) => {
    await props.onIncrement(data.increment);
  });

  return (
    <form onSubmit={handleIncrement}>
      <p>{getMessage('CounterForm', 'presentation')}</p>
      <div>
        <label className="text-sm font-bold text-gray-700" htmlFor="increment">
          {getMessage('CounterForm', 'label_increment')}
          <input
            id="increment"
            type="number"
            className="ml-2 w-32 appearance-none rounded-sm border border-gray-200 px-2 py-1 text-sm leading-tight text-gray-700 focus:ring-3 focus:ring-blue-300/50 focus:outline-hidden"
            {...form.register('increment', { valueAsNumber: true })}
          />
        </label>

        {form.formState.errors.increment && (
          <div className="my-2 text-xs text-red-500 italic">
            {getMessage('CounterForm', 'error_increment_range')}
          </div>
        )}
      </div>

      <div className="mt-2 flex gap-2">
        <button
          className="rounded-sm bg-blue-500 px-5 py-1 font-bold text-white hover:bg-blue-600 focus:ring-3 focus:ring-blue-300/50 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50"
          type="submit"
          disabled={form.formState.isSubmitting || props.isLoading}
        >
          {getMessage('CounterForm', 'button_increment')}
        </button>
        {props.onReset && (
          <button
            className="rounded-sm border border-gray-300 bg-white px-5 py-1 font-bold text-gray-700 hover:bg-gray-50 focus:ring-3 focus:ring-gray-200 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50"
            type="button"
            disabled={props.isLoading}
            onClick={props.onReset}
          >
            {getMessage('CounterForm', 'button_reset')}
          </button>
        )}
      </div>
    </form>
  );
};

import { describe, expect, it } from 'vitest';
import { CounterValidation } from './CounterValidation';

describe('CounterValidation', () => {
  it('accepts valid increment values', () => {
    expect(() => CounterValidation.parse({ increment: 1 })).not.toThrow();
    expect(() => CounterValidation.parse({ increment: 2 })).not.toThrow();
    expect(() => CounterValidation.parse({ increment: 3 })).not.toThrow();
  });

  it('rejects increment below minimum', () => {
    expect(() => CounterValidation.parse({ increment: 0 })).toThrow();
    expect(() => CounterValidation.parse({ increment: -1 })).toThrow();
  });

  it('rejects increment above maximum', () => {
    expect(() => CounterValidation.parse({ increment: 4 })).toThrow();
    expect(() => CounterValidation.parse({ increment: 100 })).toThrow();
  });

  it('rejects non-number values', () => {
    expect(() =>
      CounterValidation.parse({ increment: '1' as unknown as number }),
    ).toThrow();
    expect(() =>
      CounterValidation.parse({ increment: null as unknown as number }),
    ).toThrow();
  });
});

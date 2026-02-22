import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { CounterWidget } from './CounterWidget';

vi.mock('@/app/(marketing)/counter/actions', () => ({
  incrementCounterAction: vi.fn(),
}));

describe('CounterWidget', () => {
  beforeEach(async () => {
    const { incrementCounterAction } = await import(
      '@/app/(marketing)/counter/actions',
    );
    vi.mocked(incrementCounterAction).mockResolvedValue({
      success: true,
      count: 5,
    });
  });

  it('renders initial count', async () => {
    await render(<CounterWidget initialCount={3} />);

    expect(page.getByText('3')).toBeDefined();
    expect(page.getByText(/Count:/)).toBeDefined();
  });

  it('displays error message on failure', async () => {
    const { incrementCounterAction } = await import(
      '@/app/(marketing)/counter/actions',
    );
    vi.mocked(incrementCounterAction).mockResolvedValueOnce({
      success: false,
      error: 'Network error',
    });

    await render(<CounterWidget initialCount={5} />);

    const button = page.getByRole('button', { name: /Increment/i });
    await button.click();

    await new Promise(resolve => setTimeout(resolve, 500));

    expect(page.getByText(/error|unavailable|try again/i)).toBeDefined();
  });
});

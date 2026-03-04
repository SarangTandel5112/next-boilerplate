import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { cn } from './cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
        muted: 'border-neutral-700 bg-neutral-800 text-neutral-300',
        success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type BadgeProps = {
  variant?: VariantProps<typeof badgeVariants>['variant'];
} & React.HTMLAttributes<HTMLSpanElement>;

export const Badge = (props: BadgeProps) => {
  const { className, variant, ...rest } = props;
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...rest} />
  );
};

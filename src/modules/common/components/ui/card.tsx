import { cn } from './cn';

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = (props: CardProps) => {
  const { className, ...rest } = props;
  return (
    <div
      className={cn('rounded-lg border border-neutral-800 bg-neutral-900 shadow-sm', className)}
      {...rest}
    />
  );
};

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export const CardHeader = (props: CardHeaderProps) => {
  const { className, ...rest } = props;
  return (
    <div
      className={cn('border-b border-neutral-800 px-6 py-4', className)}
      {...rest}
    />
  );
};

export type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export const CardTitle = (props: CardTitleProps) => {
  const { className, children, ...rest } = props;
  return (
    <h3 className={cn('text-base font-semibold text-neutral-100', className)} {...rest}>
      {children}
    </h3>
  );
};

export type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export const CardDescription = (props: CardDescriptionProps) => {
  const { className, children, ...rest } = props;
  return (
    <p className={cn('text-sm text-neutral-400', className)} {...rest}>
      {children}
    </p>
  );
};

export type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

export const CardContent = (props: CardContentProps) => {
  const { className, ...rest } = props;
  return (
    <div className={cn('px-6 py-4', className)} {...rest} />
  );
};

export type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

export const CardFooter = (props: CardFooterProps) => {
  const { className, ...rest } = props;
  return (
    <div className={cn('border-t border-neutral-800 px-6 py-4', className)} {...rest} />
  );
};

import { cn } from './cn';

export type TableProps = React.TableHTMLAttributes<HTMLTableElement>;

export const Table = (props: TableProps) => {
  const { className, ...rest } = props;
  return (
    <div className="w-full overflow-hidden rounded-lg border border-neutral-800">
      <table className={cn('w-full text-sm text-neutral-200', className)} {...rest} />
    </div>
  );
};

export type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement>;

export const TableHeader = (props: TableHeaderProps) => {
  const { className, ...rest } = props;
  return (
    <thead
      className={cn('bg-neutral-900 text-left text-xs font-semibold uppercase text-neutral-400', className)}
      {...rest}
    />
  );
};

export type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>;

export const TableBody = (props: TableBodyProps) => {
  const { className, ...rest } = props;
  return (
    <tbody className={cn('divide-y divide-neutral-800', className)} {...rest} />
  );
};

export type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>;

export const TableRow = (props: TableRowProps) => {
  const { className, ...rest } = props;
  return (
    <tr className={cn('hover:bg-neutral-900', className)} {...rest} />
  );
};

export type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement>;

export const TableHead = (props: TableHeadProps) => {
  const { className, ...rest } = props;
  return (
    <th className={cn('px-4 py-3 font-semibold', className)} {...rest} />
  );
};

export type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>;

export const TableCell = (props: TableCellProps) => {
  const { className, ...rest } = props;
  return (
    <td className={cn('px-4 py-3 text-neutral-300', className)} {...rest} />
  );
};

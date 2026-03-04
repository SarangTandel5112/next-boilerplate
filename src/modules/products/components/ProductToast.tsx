export type ProductToastProps = {
  message: string;
  variant?: 'success' | 'error';
  onClose: () => void;
};

export const ProductToast = (props: ProductToastProps) => {
  const variantClassName = props.variant === 'error'
    ? 'border-red-500/30 bg-red-500/10 text-red-200'
    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200';

  return (
    <div className={`fixed top-4 right-4 z-50 rounded-md border px-4 py-3 text-sm shadow-lg ${variantClassName}`}>
      <div className="flex items-center gap-3">
        <span>{props.message}</span>
        <button type="button" className="opacity-80 hover:opacity-100" onClick={props.onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

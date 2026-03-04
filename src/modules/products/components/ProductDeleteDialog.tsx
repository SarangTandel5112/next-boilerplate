'use client';

import { Button } from '@/modules/common';

export type ProductDeleteDialogProps = {
  isOpen: boolean;
  productName: string;
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export const ProductDeleteDialog = (props: ProductDeleteDialogProps) => {
  if (!props.isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-900 p-5 shadow-lg">
        <h3 className="text-lg font-semibold text-neutral-100">Delete product</h3>
        <p className="mt-2 text-sm text-neutral-300">
          This will soft delete
          {' '}
          {props.productName}
          . You can restore it later from backend if required.
        </p>

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={props.onClose} disabled={props.isLoading}>Cancel</Button>
          <Button onClick={props.onConfirm} disabled={props.isLoading}>
            {props.isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
};

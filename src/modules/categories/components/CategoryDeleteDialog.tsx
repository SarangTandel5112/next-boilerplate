'use client';

import { Button } from '@/modules/common';

export type CategoryDeleteDialogProps = {
  isOpen: boolean;
  categoryName: string;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const CategoryDeleteDialog = (props: CategoryDeleteDialogProps) => {
  if (!props.isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-900 p-5">
        <h3 className="text-lg font-semibold text-neutral-100">Delete category</h3>
        <p className="mt-2 text-sm text-neutral-300">
          This will soft delete
          {' '}
          {props.categoryName}
          .
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" disabled={props.isLoading} onClick={props.onClose}>Cancel</Button>
          <Button disabled={props.isLoading} onClick={props.onConfirm}>{props.isLoading ? 'Deleting...' : 'Delete'}</Button>
        </div>
      </div>
    </div>
  );
};

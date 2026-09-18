import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from './Button';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  loading = false,
}) => {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-fadeIn my-auto z-10">
        {/* Top Accent Header */}
        <div className="bg-red-50 border-b border-red-100 p-5 flex items-start gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-xl shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1 pr-6">
            <h3 className="font-extrabold text-base text-slate-900">{title}</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors absolute top-4 right-4"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold gap-1.5 shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            {loading ? 'Deleting...' : confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

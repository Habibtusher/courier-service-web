import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  maxWidth = 'max-w-xl',
}) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm overflow-y-auto">
      {/* Background Backdrop Overlay Click Handler */}
      <div
        className="fixed inset-0 -z-10"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Container */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full ${maxWidth} overflow-hidden animate-fadeIn my-auto max-h-[90vh] flex flex-col z-10`}
      >
        {/* Header */}
        <div className="bg-primary text-white p-5 flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-bold text-lg leading-tight">{title}</h3>
            {description && <p className="text-xs text-sky-200 mt-0.5">{description}</p>}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Dialog;

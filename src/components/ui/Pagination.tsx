import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers
  const pages: number[] = [];
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
      {/* Item Range Info */}
      <div className="text-slate-600 font-medium">
        Showing <strong className="text-slate-900">{startItem}</strong> to{' '}
        <strong className="text-slate-900">{endItem}</strong> of{' '}
        <strong className="text-slate-900">{totalItems}</strong> entries
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}

        <div className="flex items-center gap-1">
          {/* Previous Button */}
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="h-8 px-2.5 text-slate-700 border-slate-300 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* Page Numbers */}
          {startPage > 1 && (
            <>
              <Button
                size="sm"
                variant={currentPage === 1 ? 'default' : 'outline'}
                onClick={() => onPageChange(1)}
                className={`h-8 w-8 p-0 font-bold ${
                  currentPage === 1 ? 'bg-primary text-white' : 'border-slate-300 text-slate-700'
                }`}
              >
                1
              </Button>
              {startPage > 2 && <span className="px-1 text-slate-400">...</span>}
            </>
          )}

          {pages.map((p) => (
            <Button
              key={p}
              size="sm"
              variant={currentPage === p ? 'default' : 'outline'}
              onClick={() => onPageChange(p)}
              className={`h-8 w-8 p-0 font-bold ${
                currentPage === p
                  ? 'bg-primary text-white shadow-sm'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {p}
            </Button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-1 text-slate-400">...</span>}
              <Button
                size="sm"
                variant={currentPage === totalPages ? 'default' : 'outline'}
                onClick={() => onPageChange(totalPages)}
                className={`h-8 w-8 p-0 font-bold ${
                  currentPage === totalPages ? 'bg-primary text-white' : 'border-slate-300 text-slate-700'
                }`}
              >
                {totalPages}
              </Button>
            </>
          )}

          {/* Next Button */}
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="h-8 px-2.5 text-slate-700 border-slate-300 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

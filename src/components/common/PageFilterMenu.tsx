import React, { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal, X, Check, RotateCcw } from 'lucide-react';

export type FilterFieldType = 'chips' | 'select' | 'date-range';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterFieldDefinition {
  id: string;
  label: string;
  type: FilterFieldType;
  options?: FilterOption[];
  placeholder?: string;
}

export interface PageFilterValues {
  [key: string]: any;
}

interface PageFilterMenuProps {
  fields: FilterFieldDefinition[];
  values: PageFilterValues;
  onApply: (values: PageFilterValues) => void;
  onReset: () => void;
  className?: string;
}

export const PageFilterMenu: React.FC<PageFilterMenuProps> = ({
  fields,
  values,
  onApply,
  onReset,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draftValues, setDraftValues] = useState<PageFilterValues>(values);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Sync draft values when values prop or modal open changes
  useEffect(() => {
    setDraftValues(values);
  }, [values, isOpen]);

  // Compute active filter count
  const activeCount = Object.entries(values).reduce((count, [key, val]) => {
    if (val === undefined || val === null || val === '' || val === 'ALL') {
      return count;
    }
    // For date range object or separate dates
    if (key.endsWith('From') || key.endsWith('To')) {
      return val ? count + 1 : count;
    }
    return count + 1;
  }, 0);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleChipSelect = (fieldId: string, value: string) => {
    setDraftValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSelectChange = (fieldId: string, value: string) => {
    setDraftValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleDateChange = (fieldId: string, value: string) => {
    setDraftValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleApply = () => {
    onApply(draftValues);
    setIsOpen(false);
  };

  const handleClear = () => {
    const resetObj: PageFilterValues = {};
    fields.forEach((f) => {
      if (f.type === 'chips' || f.type === 'select') {
        resetObj[f.id] = 'ALL';
      } else if (f.type === 'date-range') {
        resetObj[`${f.id}From`] = '';
        resetObj[`${f.id}To`] = '';
      }
    });
    setDraftValues(resetObj);
    onReset();
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Filter Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        id="page-filter-trigger-btn"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-9 px-3 rounded-lg border text-xs font-medium flex items-center gap-2 cursor-pointer select-none transition-all duration-150 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-500 ${
          activeCount > 0
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 font-semibold shadow-2xs'
            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-xs'
        }`}
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
        <span>Filter</span>
        {activeCount > 0 && (
          <span className="inline-flex items-center px-1.5 py-0.2 text-[11px] font-semibold rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
            {activeCount}
          </span>
        )}
      </button>

      {/* Popover on Desktop / Modal Drawer on Mobile */}
      {isOpen && (
        <>
          {/* Mobile Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-40 sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div
            role="dialog"
            aria-label="Filter options"
            className="fixed sm:absolute bottom-0 left-0 right-0 sm:bottom-auto sm:left-auto sm:right-0 sm:top-full sm:mt-2 w-full sm:w-[380px] max-h-[85vh] sm:max-h-[520px] bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 flex flex-col animate-in fade-in zoom-in-95 duration-150 overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Filters
                </h3>
                {activeCount > 0 && (
                  <span className="text-[11px] text-slate-500 font-medium">
                    ({activeCount} active)
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close filters"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scrollable Filters Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {fields.map((field) => {
                if (field.type === 'chips') {
                  const currentValue = draftValues[field.id] || 'ALL';
                  return (
                    <div key={field.id} className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        {field.label}
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {field.options?.map((opt) => {
                          const isSelected = currentValue === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleChipSelect(field.id, opt.value)}
                              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150 active:scale-95 cursor-pointer ${
                                isSelected
                                  ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold shadow-2xs'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-transparent'
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                if (field.type === 'select') {
                  const currentValue = draftValues[field.id] || 'ALL';
                  return (
                    <div key={field.id} className="space-y-1.5">
                      <label
                        htmlFor={`filter-${field.id}`}
                        className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block"
                      >
                        {field.label}
                      </label>
                      <select
                        id={`filter-${field.id}`}
                        value={currentValue}
                        onChange={(e) => handleSelectChange(field.id, e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
                      >
                        <option value="ALL">{field.placeholder || `All ${field.label}`}</option>
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                if (field.type === 'date-range') {
                  const fromVal = draftValues[`${field.id}From`] || '';
                  const toVal = draftValues[`${field.id}To`] || '';
                  return (
                    <div key={field.id} className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        {field.label}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-0.5">From</span>
                          <input
                            type="date"
                            value={fromVal}
                            onChange={(e) => handleDateChange(`${field.id}From`, e.target.value)}
                            className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-0.5">To</span>
                          <input
                            type="date"
                            value={toVal}
                            onChange={(e) => handleDateChange(`${field.id}To`, e.target.value)}
                            className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
                          />
                        </div>
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 active:scale-95 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

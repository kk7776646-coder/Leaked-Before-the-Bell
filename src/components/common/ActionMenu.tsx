import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export interface ActionMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger' | 'warning' | 'primary';
  disabled?: boolean;
  onClick: () => void;
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  ariaLabel?: string;
  align?: 'right' | 'left';
  className?: string;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  items,
  ariaLabel = 'More actions',
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

  const getItemStyle = (item: ActionMenuItem) => {
    if (item.disabled) {
      return 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-500';
    }
    if (item.variant === 'danger') {
      return 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 active:bg-rose-100 dark:active:bg-rose-900/60 cursor-pointer';
    }
    if (item.variant === 'warning') {
      return 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 active:bg-amber-100 dark:active:bg-amber-900/60 cursor-pointer';
    }
    if (item.variant === 'primary') {
      return 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 active:bg-blue-100 dark:active:bg-blue-900/60 cursor-pointer';
    }
    return 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200/70 dark:active:bg-slate-700 cursor-pointer';
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 cursor-pointer"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          className={`absolute z-30 mt-1.5 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 text-xs font-sans animate-in fade-in-50 zoom-in-95 duration-100 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          role="menu"
          aria-orientation="vertical"
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={item.disabled}
              onClick={(e) => {
                e.stopPropagation();
                if (!item.disabled) {
                  setIsOpen(false);
                  item.onClick();
                }
              }}
              className={`w-full text-left px-3.5 py-2 flex items-center gap-2.5 transition-all duration-150 font-medium ${getItemStyle(item)}`}
              role="menuitem"
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

'use client';

import * as React from 'react';
import { ChevronDown, Check, X, Search } from 'lucide-react';

// Enhanced className utility function with conditional logic
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  size?: 'sm' | 'md' | 'lg';
  error?: string;
  loading?: boolean;
  maxHeight?: number;
  children: React.ReactNode;
  className?: string;
}

export interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  description?: string;
  icon?: React.ReactNode;
}

export interface SelectGroupProps {
  label: string;
  children: React.ReactNode;
}

// Enhanced context with more features
interface SelectContextValue {
  value?: string | string[];
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchable: boolean;
  clearable: boolean;
  multiple: boolean;
  disabled: boolean;
  loading: boolean;
  error?: string;
  size: 'sm' | 'md' | 'lg';
}

const SelectContext = React.createContext<SelectContextValue>({
  open: false,
  setOpen: () => {},
  searchTerm: '',
  setSearchTerm: () => {},
  searchable: false,
  clearable: false,
  multiple: false,
  disabled: false,
  loading: false,
  size: 'md',
});

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ 
    value, 
    onValueChange, 
    placeholder, 
    disabled = false,
    searchable = false,
    clearable = false,
    multiple = false,
    size = 'md',
    error,
    loading = false,
    maxHeight = 300,
    children,
    className,
    ...props 
  }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');

  // Handle keyboard events and body scroll lock
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      
      // Prevent body scroll when dropdown is open on mobile
      const originalOverflow = document.body.style.overflow;
      if (window.innerWidth < 768) { // Only on mobile
        document.body.style.overflow = 'hidden';
      }
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = originalOverflow;
      };
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

    // Clear search when closing
    React.useEffect(() => {
      if (!open) {
        setSearchTerm('');
      }
    }, [open]);

    const contextValue: SelectContextValue = {
      value,
      onValueChange,
      open,
      setOpen,
      searchTerm,
      setSearchTerm,
      searchable,
      clearable,
      multiple,
      disabled,
      loading,
      error,
      size,
    };

    return (
      <SelectContext.Provider value={contextValue}>
        <div ref={ref} className={cn("relative", className)} {...props}>
          {children}
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
      </SelectContext.Provider>
    );
  }
);
Select.displayName = 'Select';

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    className?: string;
  }
>(({ className, children, ...props }, ref) => {
  const { 
    open, 
    setOpen, 
    value, 
    disabled, 
    loading, 
    error, 
    size, 
    clearable 
  } = React.useContext(SelectContext);

  const sizeClasses = {
    sm: 'h-8 px-2 text-xs',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base'
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle clear logic here if needed
  };

  return (
    <button
      ref={ref}
      type="button"
      aria-haspopup="listbox"
      aria-expanded={open}
      disabled={disabled || loading}
      onClick={() => !disabled && !loading && setOpen(!open)}
      className={cn(
        'flex w-full items-center justify-between rounded-md border bg-white py-2 ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 transition-colors',
        sizeClasses[size],
        error 
          ? 'border-red-300 focus:ring-red-500' 
          : 'border-slate-200 focus:ring-slate-950',
        disabled && 'cursor-not-allowed opacity-50',
        loading && 'cursor-wait',
        open && 'ring-2 ring-slate-950',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {children}
      </div>
      
      <div className="flex items-center gap-1 ml-2">
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-950"></div>
        )}
        {clearable && value && !disabled && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-full p-1 hover:bg-slate-100 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform",
          open ? "transform rotate-180" : "",
          disabled || loading ? "opacity-30" : "opacity-50"
        )} />
      </div>
    </button>
  );
});
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    placeholder?: string;
  }
>(({ className, placeholder, ...props }, ref) => {
  const { value } = React.useContext(SelectContext);
  
  // Find the selected item's display text
  const displayValue = React.useMemo(() => {
    if (!value) return placeholder;
    
    // For battle numbers, format them nicely
    if (value && !isNaN(Number(value))) {
      return `Battle #${value}`;
    }
    
    return value;
  }, [value, placeholder]);

  return (
    <span
      ref={ref}
      className={cn('block truncate text-left', className)}
      {...props}
    >
      {displayValue}
    </span>
  );
});
SelectValue.displayName = 'SelectValue';

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    maxHeight?: number;
  }
>(({ className, children, maxHeight = 300, ...props }, ref) => {
  const { 
    open, 
    setOpen, 
    searchable, 
    searchTerm, 
    setSearchTerm, 
    loading 
  } = React.useContext(SelectContext);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Close when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleScroll = (event: Event) => {
      // Prevent body scroll when dropdown is open and scrolling within dropdown
      if (open && contentRef.current && contentRef.current.contains(event.target as Node)) {
        event.stopPropagation();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('wheel', handleScroll, { passive: false });
      document.addEventListener('touchmove', handleScroll, { passive: false });
      
      // Focus search input if searchable
      if (searchable && searchInputRef.current) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 0);
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('wheel', handleScroll);
      document.removeEventListener('touchmove', handleScroll);
    };
  }, [open, setOpen, searchable]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className={cn(
        'absolute z-[60] mt-1 min-w-full w-max max-w-xs overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none',
        'animate-in slide-in-from-top-1 duration-150',
        className
      )}
      role="listbox"
      style={{
        transform: 'translateZ(0)', // Force hardware acceleration
        backfaceVisibility: 'hidden', // Prevent rendering issues
        opacity: 1,
        transition: 'opacity 0.15s ease-out'
      }}
      {...props}
    >
      {searchable && (
        <div className="p-2 border-b border-slate-100 bg-slate-50">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-950 focus:border-transparent"
            />
          </div>
        </div>
      )}
      
      <div 
        className="overflow-y-auto overflow-x-hidden py-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
        style={{ 
          maxHeight: `${maxHeight}px`,
          minHeight: 'auto'
        }}
        onScroll={(e) => e.stopPropagation()}
        onWheel={(e) => {
          // Allow scrolling within dropdown
          const element = e.currentTarget;
          const atTop = element.scrollTop === 0;
          const atBottom = element.scrollTop >= element.scrollHeight - element.clientHeight;
          
          if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
            e.preventDefault();
          }
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-950"></div>
            <span className="ml-2 text-sm text-slate-600">Loading...</span>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
});
SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & SelectItemProps
>(({ className, value, children, disabled, description, icon, ...props }, ref) => {
  const { 
    value: selectedValue, 
    onValueChange, 
    setOpen, 
    searchTerm 
  } = React.useContext(SelectContext);
  
  const isSelected = value === selectedValue;

  // Filter based on search term
  const isVisible = React.useMemo(() => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const valueText = typeof children === 'string' ? children : value;
    const descriptionText = description || '';
    
    return valueText.toLowerCase().includes(searchLower) ||
           descriptionText.toLowerCase().includes(searchLower) ||
           value.toLowerCase().includes(searchLower);
  }, [searchTerm, children, description, value]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!disabled && onValueChange) {
      onValueChange(value);
      setOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      handleClick(e as any);
    }
    
    // Handle arrow navigation
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      // Focus next/previous item logic could be added here
    }
  };

  if (!isVisible) return null;

  return (
    <div
      ref={ref}
      role="option"
      tabIndex={disabled ? -1 : 0}
      aria-selected={isSelected}
      aria-disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative flex items-start gap-3 cursor-pointer select-none py-3 pl-4 pr-12 transition-colors min-h-[48px]',
        'hover:bg-slate-100 focus:bg-slate-100 focus:outline-none',
        isSelected && 'bg-slate-100 font-medium',
        disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent',
        className
      )}
      {...props}
    >
      {icon && (
        <span className="flex-shrink-0 w-4 h-4 text-slate-500 mt-0.5">
          {icon}
        </span>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
        {description && (
          <p className="text-xs text-slate-500 mt-1 whitespace-nowrap leading-tight">
            {description}
          </p>
        )}
      </div>
      
      {isSelected && (
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-600">
          <Check className="h-4 w-4 flex-shrink-0" />
        </span>
      )}
    </div>
  );
});
SelectItem.displayName = 'SelectItem';

// SelectGroup for grouping options
const SelectGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & SelectGroupProps
>(({ className, label, children, ...props }, ref) => {
  return (
    <div ref={ref} className={className} {...props}>
      <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
        {label}
      </div>
      {children}
    </div>
  );
});
SelectGroup.displayName = 'SelectGroup';

// SelectSeparator for visual separation
const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('h-px bg-slate-200 mx-2 my-1', className)}
      {...props}
    />
  );
});
SelectSeparator.displayName = 'SelectSeparator';

export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectSeparator,
};

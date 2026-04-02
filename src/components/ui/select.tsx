import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, id, children, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            "block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent",
            className
          )}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  }
);

Select.displayName = "Select";

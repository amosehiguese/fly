import { useState, InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
interface MaterialInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

const MaterialInput = forwardRef<HTMLInputElement, MaterialInputProps>(
  ({ label, error, helperText, required, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(e.target.value.length > 0);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      props.onChange?.(e);
    };

    return (
      <div className="relative w-full">
        <div className="relative">
          <input
            {...props}
            ref={ref}
            required={required}
            className={cn(
              "peer w-full h-10 px-3 pt-3 border rounded bg-transparent text-sm text-gray-900 placeholder-transparent outline-none transition-all",
              error
                ? "border-red-500"
                : "border-gray-300 hover:border-gray-400",
              isFocused ? (error ? "border-red-500" : "border-blue-500") : "",
              "focus:border-2 focus:outline-none",
              className // Merge custom className from props
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            onChange={handleChange}
          />
          <label
            className={cn(
              "absolute left-3 transition-all pointer-events-none",
              isFocused || hasValue ? "text-xs top-1" : "text-sm top-3",
              error
                ? "text-red-500"
                : isFocused
                ? "text-blue-500"
                : "text-gray-500"
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
        {(error || helperText) && (
          <div
            className={`mt-1 text-xs ${
              error ? "text-red-500" : "text-gray-500"
            }`}
          >
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

MaterialInput.displayName = "MaterialInput";

export default MaterialInput;

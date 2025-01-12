import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import React from "react";

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
}

const inputVariants = cva(
  "block w-full rounded-md shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:pointer-events-none px-3 py-2",
  {
    variants: {
      variant: {
        default: "border-teal-600 text-teal-700",
        destructive: "border-red-500 text-red-700",
        outline: "border border-gray-300 hover:bg-teal-50 hover:text-teal-700",
        secondary: "border-teal-300 text-teal-600",
        ghost: "border-none",
        accent: "border-teal-600 text-teal-700",
      },
      inputSize: {
        default: "h-10",
        sm: "h-9 rounded-md",
        lg: "h-11 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
);

const Input: React.FC<InputProps> = ({
  label,
  variant,
  inputSize,
  className,
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium mb-1">{label}</label>
      )}
      <input
        {...props}
        className={cn(inputVariants({ variant, inputSize, className }))}
      />
    </div>
  );
};

export default Input;

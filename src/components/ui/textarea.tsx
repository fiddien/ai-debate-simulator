import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const textareaVariants = cva(
  "block w-full rounded-md shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:pointer-events-none px-3 py-2",
  {
    variants: {
      variant: {
        default: "border-teal-600 text-teal-700",
        destructive: "border-red-500 text-red-700",
        outline: "border border-gray-300 hover:bg-teal-100 hover:text-teal-700",
        secondary: "border-teal-300 text-teal-600",
        ghost: "border-none",
        accent: "border-teal-600 text-teal-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };

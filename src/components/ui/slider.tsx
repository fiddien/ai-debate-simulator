"use client"

import { cn } from "@/lib/utils";
import React from 'react';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onValueChange?: (value: number[]) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
    ({ className, onValueChange, onChange, ...props }, ref) => {
        const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            onChange?.(event);
            onValueChange?.([parseInt(event.target.value)]);
        };

        return (
            <input
                type="range"
                ref={ref}
                onChange={handleChange}
                className={cn(
                    "w-full h-2 bg-gray-500 rounded-full appearance-none cursor-pointer",
                    "accent-teal-600",
                    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5",
                    "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-600",
                    "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-teal-600",
                    className
                )}
                {...props}
            />
        );
    }
);

Slider.displayName = "Slider";

export { Slider };

import React, { type ButtonHTMLAttributes } from 'react';
import { cn } from '../utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    className,
    variant = 'primary',
    isLoading,
    children,
    disabled,
    ...props
}) => {
    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200",
        secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-red-200",
        ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
    };

    return (
        <button
            disabled={disabled || isLoading}
            className={cn(
                "cursor-pointer inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95",
                variants[variant],
                variant === 'primary' && "focus:ring-indigo-500",
                variant === 'danger' && "focus:ring-red-500",
                className
            )}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {children}
        </button>
    );
};

export default Button;

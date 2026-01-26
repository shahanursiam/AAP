import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {

    const variants = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm border-transparent',
        secondary: 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300 shadow-sm',
        ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 border-transparent shadow-none',
        danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm border-transparent',
        outline: 'bg-transparent text-indigo-600 border-indigo-600 hover:bg-indigo-50 shadow-sm'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
        icon: 'p-2'
    };

    return (
        <motion.button
            ref={ref}
            whileTap={{ scale: 0.98 }}
            className={cn(
                'relative inline-flex items-center justify-center font-medium rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {children}
        </motion.button>
    );
});

Button.displayName = "Button";
export { Button };

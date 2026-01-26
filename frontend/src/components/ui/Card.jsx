import React from 'react';
import { cn } from '../../lib/utils';

const Card = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});
Card.displayName = "Card";

const CardHeader = ({ className, children, ...props }) => (
    <div className={cn("px-6 py-4 border-b border-gray-100", className)} {...props}>
        {children}
    </div>
);

const CardTitle = ({ className, children, ...props }) => (
    <h3 className={cn("text-lg font-semibold text-gray-900", className)} {...props}>
        {children}
    </h3>
);

const CardContent = ({ className, children, ...props }) => (
    <div className={cn("p-6", className)} {...props}>
        {children}
    </div>
);

export { Card, CardHeader, CardTitle, CardContent };

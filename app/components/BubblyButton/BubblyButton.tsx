import React from 'react';

interface BubblyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    icon?: React.ReactNode;
    children: React.ReactNode;
}

export function BubblyButton({ children, variant = 'primary', className = '', icon, ...props }: BubblyButtonProps) {
    const variantClass = variant === 'secondary' ? 'secondary' : variant === 'outline' ? 'outline' : '';

    return (
        <button className={`clay-btn ${variantClass} ${className}`} {...props}>
            {icon && <span className="btn-icon">{icon}</span>}
            {children}
        </button>
    );
}

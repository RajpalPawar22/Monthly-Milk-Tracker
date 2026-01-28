import React from 'react';

interface ClayCardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

export function ClayCard({ children, className = '', title }: ClayCardProps) {
    return (
        <div className={`clay-card ${className}`}>
            {title && <h2 className="clay-text-large">{title}</h2>}
            {children}
        </div>
    );
}

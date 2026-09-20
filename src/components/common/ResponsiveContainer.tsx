import React from 'react';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  maxWidth = 'max-w-[2560px]',
}) => {
  return (
    <div className={`w-full ${maxWidth} mx-auto px-4 sm:px-6 md:px-8 xl:px-10 py-6 transition-all duration-200 ease-in-out ${className}`}>
      {children}
    </div>
  );
};


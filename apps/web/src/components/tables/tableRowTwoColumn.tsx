import React from 'react';

interface TwoColumnProps {
  col1: string;
  col2: string;
  col1Flex?: number;
  col2Flex?: number;
  className?: string;
}

export default function TableRowTwoColumn({
  col1,
  col2,
  col1Flex = 1,
  col2Flex = 1,
  className = '',
}: TwoColumnProps) {
  return (
    <div className={`flex w-full ${className}`}>
      <div
        className={`px-4 py-3 bg-grayscale-200 text-center border-r border-grayscale-300`}
        style={{ flex: col1Flex }}
      >
        {col1}
      </div>
      <div
        className="px-4 py-3 bg-grayscale-200 text-center"
        style={{ flex: col2Flex }}
      >
        {col2}
      </div>
    </div>
  );
}